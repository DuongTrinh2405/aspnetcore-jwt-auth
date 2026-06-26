-- Phase 1: Supabase database schema, auth user sync, RBAC, RLS policies.
-- Run with: supabase db push

create extension if not exists "pgcrypto";

create type public.user_role as enum (
  'customer',
  'customer_vip',
  'technician',
  'technician_vip',
  'admin'
);

create type public.service_type as enum (
  'camera_install',
  'camera_repair',
  'wifi_setup',
  'wifi_repair',
  'internet',
  'networking',
  'low_voltage',
  'other'
);

create type public.job_priority as enum (
  'low',
  'normal',
  'high',
  'urgent'
);

create type public.job_status as enum (
  'pending',
  'accepted',
  'in_progress',
  'completed',
  'cancelled'
);

create type public.technician_availability as enum (
  'available',
  'busy',
  'offline'
);

create type public.notification_type as enum (
  'job_created',
  'job_accepted',
  'job_status_changed',
  'rating_received',
  'system'
);

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'customer',
  full_name text not null default '',
  phone text,
  avatar_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_phone_length check (phone is null or length(phone) between 8 and 20)
);

create table public.customer_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  default_address text,
  vip_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.technician_profiles (
  user_id uuid primary key references public.users(id) on delete cascade,
  company_name text,
  skills public.service_type[] not null default '{}',
  service_area text,
  availability public.technician_availability not null default 'available',
  completed_jobs_count integer not null default 0 check (completed_jobs_count >= 0),
  average_rating numeric(3, 2) not null default 0 check (average_rating between 0 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.users(id) on delete restrict,
  assigned_technician_id uuid references public.users(id) on delete set null,
  service_type public.service_type not null,
  title text not null,
  description text not null,
  address text not null,
  phone text not null,
  priority public.job_priority not null default 'normal',
  status public.job_status not null default 'pending',
  is_vip boolean not null default false,
  scheduled_at timestamptz,
  accepted_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jobs_title_length check (length(title) between 3 and 120),
  constraint jobs_phone_length check (length(phone) between 8 and 20),
  constraint jobs_assignee_status_check check (
    (status = 'pending' and assigned_technician_id is null)
    or status in ('accepted', 'in_progress', 'completed', 'cancelled')
  )
);

create table public.job_images (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  uploaded_by uuid not null references public.users(id) on delete restrict,
  storage_bucket text not null default 'job-images',
  storage_path text not null,
  public_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (storage_bucket, storage_path)
);

create table public.job_status_logs (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  old_status public.job_status,
  new_status public.job_status not null,
  changed_by uuid references public.users(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create table public.ratings (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  customer_id uuid not null references public.users(id) on delete restrict,
  technician_id uuid not null references public.users(id) on delete restrict,
  score integer not null check (score between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id),
  unique (job_id, customer_id)
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text not null,
  data jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index users_role_idx on public.users(role);
create index jobs_customer_id_idx on public.jobs(customer_id);
create index jobs_assigned_technician_id_idx on public.jobs(assigned_technician_id);
create index jobs_status_idx on public.jobs(status);
create index jobs_is_vip_idx on public.jobs(is_vip);
create index jobs_created_at_idx on public.jobs(created_at desc);
create index jobs_status_vip_created_idx on public.jobs(status, is_vip, created_at desc);
create index job_images_job_id_idx on public.job_images(job_id);
create index job_status_logs_job_id_created_idx on public.job_status_logs(job_id, created_at desc);
create index ratings_technician_id_idx on public.ratings(technician_id);
create index notifications_user_id_read_idx on public.notifications(user_id, read_at, created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_users_updated_at
before update on public.users
for each row execute function public.set_updated_at();

create trigger set_customer_profiles_updated_at
before update on public.customer_profiles
for each row execute function public.set_updated_at();

create trigger set_technician_profiles_updated_at
before update on public.technician_profiles
for each row execute function public.set_updated_at();

create trigger set_jobs_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();

create trigger set_job_images_updated_at
before update on public.job_images
for each row execute function public.set_updated_at();

create trigger set_ratings_updated_at
before update on public.ratings
for each row execute function public.set_updated_at();

create trigger set_notifications_updated_at
before update on public.notifications
for each row execute function public.set_updated_at();

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.users where id = auth.uid() and is_active = true;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'admin', false);
$$;

create or replace function public.is_customer()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('customer', 'customer_vip'), false);
$$;

create or replace function public.is_technician()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() in ('technician', 'technician_vip'), false);
$$;

create or replace function public.is_vip_technician()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role() = 'technician_vip', false);
$$;

create or replace function public.user_can_view_job(target_job_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.jobs j
    where j.id = target_job_id
      and (
        public.is_admin()
        or j.customer_id = auth.uid()
        or j.assigned_technician_id = auth.uid()
        or (
          public.is_technician()
          and j.status = 'pending'
          and j.assigned_technician_id is null
          and (j.is_vip = false or public.is_vip_technician())
        )
      )
  );
$$;

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
    else 'customer'::public.user_role
  end;

  display_name := coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1), '');
  display_phone := nullif(new.raw_user_meta_data ->> 'phone', '');

  insert into public.users (id, role, full_name, phone)
  values (new.id, safe_role, display_name, display_phone);

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

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.ensure_role_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role in ('customer', 'customer_vip') then
    insert into public.customer_profiles (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  elsif new.role in ('technician', 'technician_vip') then
    insert into public.technician_profiles (user_id)
    values (new.id)
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$;

create trigger ensure_role_profile_after_user_update
after insert or update of role on public.users
for each row execute function public.ensure_role_profile();

create or replace function public.normalize_new_job()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owner_role public.user_role;
begin
  if not public.is_admin() then
    new.customer_id := auth.uid();
  end if;

  select role into owner_role
  from public.users
  where id = new.customer_id and is_active = true;

  if owner_role not in ('customer', 'customer_vip') then
    raise exception 'Only customers can own jobs';
  end if;

  new.is_vip := owner_role = 'customer_vip';
  new.status := 'pending';
  new.assigned_technician_id := null;
  new.accepted_at := null;
  new.started_at := null;
  new.completed_at := null;
  new.cancelled_at := null;

  return new;
end;
$$;

create trigger normalize_new_job_before_insert
before insert on public.jobs
for each row execute function public.normalize_new_job();

create or replace function public.log_job_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.job_status_logs (job_id, old_status, new_status, changed_by, note)
    values (new.id, null, new.status, auth.uid(), 'Job created');
    return new;
  end if;

  if old.status is distinct from new.status then
    insert into public.job_status_logs (job_id, old_status, new_status, changed_by)
    values (new.id, old.status, new.status, auth.uid());
  end if;

  return new;
end;
$$;

create trigger log_job_status_after_insert
after insert on public.jobs
for each row execute function public.log_job_status_change();

create trigger log_job_status_after_update
after update of status on public.jobs
for each row execute function public.log_job_status_change();

create or replace function public.accept_job(target_job_id uuid)
returns public.jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  target_job public.jobs;
begin
  if not public.is_technician() then
    raise exception 'Only technicians can accept jobs';
  end if;

  select *
  into target_job
  from public.jobs
  where id = target_job_id
  for update;

  if not found then
    raise exception 'Job not found';
  end if;

  if target_job.status <> 'pending' or target_job.assigned_technician_id is not null then
    raise exception 'Job is no longer available';
  end if;

  if target_job.is_vip and not public.is_vip_technician() then
    raise exception 'VIP jobs require a VIP technician';
  end if;

  update public.jobs
  set assigned_technician_id = auth.uid(),
      status = 'accepted',
      accepted_at = now(),
      updated_at = now()
  where id = target_job_id
  returning * into target_job;

  insert into public.notifications (user_id, type, title, body, data)
  values (
    target_job.customer_id,
    'job_accepted',
    'Yêu cầu đã có kỹ thuật viên nhận',
    'Kỹ thuật viên đã nhận yêu cầu của bạn.',
    jsonb_build_object('job_id', target_job.id)
  );

  return target_job;
end;
$$;

create or replace function public.update_job_status(target_job_id uuid, next_status public.job_status, status_note text default null)
returns public.jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  target_job public.jobs;
begin
  select *
  into target_job
  from public.jobs
  where id = target_job_id
  for update;

  if not found then
    raise exception 'Job not found';
  end if;

  if public.is_admin() then
    null;
  elsif target_job.assigned_technician_id = auth.uid() then
    if next_status not in ('in_progress', 'completed', 'cancelled') then
      raise exception 'Technicians can only move assigned jobs forward or cancel';
    end if;
  elsif target_job.customer_id = auth.uid() then
    if next_status <> 'cancelled' or target_job.status not in ('pending', 'accepted') then
      raise exception 'Customers can only cancel pending or accepted jobs';
    end if;
  else
    raise exception 'You cannot update this job';
  end if;

  if target_job.status = 'completed' and next_status <> 'completed' and not public.is_admin() then
    raise exception 'Completed jobs can only be changed by admin';
  end if;

  update public.jobs
  set status = next_status,
      started_at = case when next_status = 'in_progress' and started_at is null then now() else started_at end,
      completed_at = case when next_status = 'completed' and completed_at is null then now() else completed_at end,
      cancelled_at = case when next_status = 'cancelled' and cancelled_at is null then now() else cancelled_at end,
      updated_at = now()
  where id = target_job_id
  returning * into target_job;

  if status_note is not null then
    update public.job_status_logs
    set note = status_note
    where id = (
      select id
      from public.job_status_logs
      where job_id = target_job_id
      order by created_at desc
      limit 1
    );
  end if;

  insert into public.notifications (user_id, type, title, body, data)
  values (
    target_job.customer_id,
    'job_status_changed',
    'Trạng thái yêu cầu đã thay đổi',
    'Yêu cầu của bạn hiện là: ' || next_status::text,
    jsonb_build_object('job_id', target_job.id, 'status', next_status)
  );

  return target_job;
end;
$$;

create or replace function public.refresh_technician_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_technician_id uuid;
begin
  target_technician_id := case
    when tg_op = 'DELETE' then old.technician_id
    else new.technician_id
  end;

  update public.technician_profiles tp
  set average_rating = coalesce(stats.average_score, 0),
      completed_jobs_count = coalesce(stats.completed_count, 0),
      updated_at = now()
  from (
    select
      j.assigned_technician_id as technician_id,
      avg(r.score)::numeric(3, 2) as average_score,
      count(*) filter (where j.status = 'completed')::integer as completed_count
    from public.jobs j
    left join public.ratings r on r.job_id = j.id
    where j.assigned_technician_id = target_technician_id
    group by j.assigned_technician_id
  ) stats
  where tp.user_id = stats.technician_id;

  return coalesce(new, old);
end;
$$;

create trigger refresh_technician_rating_after_rating
after insert or update or delete on public.ratings
for each row execute function public.refresh_technician_rating();

alter table public.users enable row level security;
alter table public.customer_profiles enable row level security;
alter table public.technician_profiles enable row level security;
alter table public.jobs enable row level security;
alter table public.job_images enable row level security;
alter table public.job_status_logs enable row level security;
alter table public.ratings enable row level security;
alter table public.notifications enable row level security;

create policy "users_select_self_admin_or_related_job_users"
on public.users for select
to authenticated
using (
  id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.jobs j
    where public.user_can_view_job(j.id)
      and (j.customer_id = users.id or j.assigned_technician_id = users.id)
  )
);

create policy "users_update_admin_only"
on public.users for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "customer_profiles_select_self_admin_or_related"
on public.customer_profiles for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.jobs j
    where j.customer_id = customer_profiles.user_id
      and public.user_can_view_job(j.id)
  )
);

create policy "customer_profiles_update_self_or_admin"
on public.customer_profiles for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "technician_profiles_select_self_admin_or_assigned_customer"
on public.technician_profiles for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_admin()
  or exists (
    select 1 from public.jobs j
    where j.assigned_technician_id = technician_profiles.user_id
      and public.user_can_view_job(j.id)
  )
);

create policy "technician_profiles_update_self_or_admin"
on public.technician_profiles for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "jobs_select_by_role"
on public.jobs for select
to authenticated
using (public.user_can_view_job(id));

create policy "jobs_insert_customers_or_admin"
on public.jobs for insert
to authenticated
with check (
  public.is_admin()
  or (
    public.is_customer()
    and customer_id = auth.uid()
    and assigned_technician_id is null
    and status = 'pending'
  )
);

create policy "jobs_update_admin"
on public.jobs for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

create policy "job_images_select_visible_job"
on public.job_images for select
to authenticated
using (public.user_can_view_job(job_id));

create policy "job_images_insert_customer_own_job"
on public.job_images for insert
to authenticated
with check (
  uploaded_by = auth.uid()
  and exists (
    select 1 from public.jobs j
    where j.id = job_images.job_id
      and j.customer_id = auth.uid()
  )
);

create policy "job_images_delete_uploader_or_admin"
on public.job_images for delete
to authenticated
using (uploaded_by = auth.uid() or public.is_admin());

create policy "job_status_logs_select_visible_job"
on public.job_status_logs for select
to authenticated
using (public.user_can_view_job(job_id));

create policy "job_status_logs_insert_admin_only"
on public.job_status_logs for insert
to authenticated
with check (public.is_admin());

create policy "ratings_select_visible_job"
on public.ratings for select
to authenticated
using (public.user_can_view_job(job_id));

create policy "ratings_insert_customer_completed_job"
on public.ratings for insert
to authenticated
with check (
  customer_id = auth.uid()
  and exists (
    select 1 from public.jobs j
    where j.id = ratings.job_id
      and j.customer_id = auth.uid()
      and j.assigned_technician_id = ratings.technician_id
      and j.status = 'completed'
  )
);

create policy "ratings_update_customer_own_rating"
on public.ratings for update
to authenticated
using (customer_id = auth.uid())
with check (customer_id = auth.uid());

create policy "notifications_select_own_or_admin"
on public.notifications for select
to authenticated
using (user_id = auth.uid() or public.is_admin());

create policy "notifications_update_own_read_state_or_admin"
on public.notifications for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "notifications_insert_admin_only"
on public.notifications for insert
to authenticated
with check (public.is_admin());

revoke all on public.users from anon, authenticated;
revoke all on public.customer_profiles from anon, authenticated;
revoke all on public.technician_profiles from anon, authenticated;
revoke all on public.jobs from anon, authenticated;
revoke all on public.job_images from anon, authenticated;
revoke all on public.job_status_logs from anon, authenticated;
revoke all on public.ratings from anon, authenticated;
revoke all on public.notifications from anon, authenticated;

grant select on public.users to authenticated;
grant update (role, full_name, phone, avatar_url, is_active, updated_at) on public.users to authenticated;

grant select, update on public.customer_profiles to authenticated;
grant select, update on public.technician_profiles to authenticated;

grant select, insert on public.jobs to authenticated;
grant update (
  status,
  priority,
  scheduled_at,
  started_at,
  completed_at,
  cancelled_at,
  updated_at
) on public.jobs to authenticated;

grant select, insert, delete on public.job_images to authenticated;
grant select, insert on public.job_status_logs to authenticated;
grant select, insert on public.ratings to authenticated;
grant update (score, comment, updated_at) on public.ratings to authenticated;
grant select, insert on public.notifications to authenticated;
grant update (read_at, updated_at) on public.notifications to authenticated;

grant usage on schema public to anon, authenticated;
grant usage on all sequences in schema public to authenticated;
grant execute on function public.accept_job(uuid) to authenticated;
grant execute on function public.update_job_status(uuid, public.job_status, text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'job-images',
  'job-images',
  false,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
on conflict (id) do nothing;

create policy "storage_job_images_select_visible_job"
on storage.objects for select
to authenticated
using (
  bucket_id = 'job-images'
  and exists (
    select 1
    from public.job_images ji
    where ji.storage_bucket = storage.objects.bucket_id
      and ji.storage_path = storage.objects.name
      and public.user_can_view_job(ji.job_id)
  )
);

create policy "storage_job_images_insert_customer_path"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'job-images'
  and name like auth.uid()::text || '/%'
);

create policy "storage_job_images_delete_owner_or_admin"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'job-images'
  and (
    name like auth.uid()::text || '/%'
    or public.is_admin()
  )
);
