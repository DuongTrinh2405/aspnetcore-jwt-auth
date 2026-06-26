alter table public.users
  add column if not exists email text;

create unique index if not exists users_email_unique_idx
on public.users(lower(email))
where email is not null;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
  safe_role public.user_role;
  display_name text;
  display_phone text;
begin
  requested_role := coalesce(new.raw_user_meta_data ->> 'role', 'customer');
  safe_role := case requested_role
    when 'technician' then 'technician'::public.user_role
    when 'technician_vip' then 'technician_vip'::public.user_role
    when 'customer_vip' then 'customer_vip'::public.user_role
    when 'staff' then 'staff'::public.user_role
    when 'admin' then 'admin'::public.user_role
    else 'customer'::public.user_role
  end;

  display_name := coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), '');
  display_phone := nullif(new.raw_user_meta_data ->> 'phone', '');

  insert into public.users (id, email, role, full_name, phone)
  values (new.id, new.email, safe_role, display_name, display_phone)
  on conflict (id) do update
  set email = excluded.email,
      role = excluded.role,
      full_name = excluded.full_name,
      phone = excluded.phone,
      updated_at = now();

  if safe_role in ('customer', 'customer_vip') then
    insert into public.customer_profiles (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  elsif safe_role in ('technician', 'technician_vip') then
    insert into public.technician_profiles (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;
