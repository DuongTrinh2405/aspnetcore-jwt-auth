alter table public.jobs
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists payment_paid_at timestamptz,
  add column if not exists payment_marked_by uuid references public.users(id) on delete set null;

alter table public.jobs
  drop constraint if exists jobs_payment_status_check;

alter table public.jobs
  add constraint jobs_payment_status_check
  check (payment_status in ('unpaid', 'paid'));

update public.jobs
set
  payment_status = case when coalesce(is_paid, false) then 'paid' else 'unpaid' end,
  payment_paid_at = case
    when coalesce(is_paid, false) then coalesce(payment_paid_at, paid_at, updated_at, now())
    else null
  end,
  payment_marked_by = case
    when coalesce(is_paid, false) then coalesce(payment_marked_by, paid_by)
    else null
  end
where payment_status is distinct from case when coalesce(is_paid, false) then 'paid' else 'unpaid' end
   or payment_paid_at is distinct from case
        when coalesce(is_paid, false) then coalesce(payment_paid_at, paid_at, updated_at, now())
        else null
      end;

create index if not exists jobs_payment_status_idx on public.jobs(payment_status);
create index if not exists jobs_payment_paid_at_idx on public.jobs(payment_paid_at desc);

create table if not exists public.job_payment_events (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  old_payment_status text,
  new_payment_status text not null check (new_payment_status in ('unpaid', 'paid')),
  changed_by uuid references public.users(id) on delete set null,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists job_payment_events_job_id_created_idx
  on public.job_payment_events(job_id, created_at desc);

alter table public.job_payment_events enable row level security;

drop policy if exists "job_payment_events_admin_select" on public.job_payment_events;
create policy "job_payment_events_admin_select"
on public.job_payment_events for select
to authenticated
using (public.is_admin());

drop policy if exists "job_payment_events_admin_insert" on public.job_payment_events;
create policy "job_payment_events_admin_insert"
on public.job_payment_events for insert
to authenticated
with check (public.is_admin());

grant select, insert on public.job_payment_events to authenticated;

create or replace function public.update_job_payment_status(
  target_job_id uuid,
  next_payment_status text
)
returns public.jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  target_job public.jobs;
  normalized_status text;
  previous_status text;
begin
  if not public.is_admin() then
    raise exception 'Only admin can update payment status';
  end if;

  normalized_status := lower(trim(next_payment_status));

  if normalized_status not in ('unpaid', 'paid') then
    raise exception 'Invalid payment status';
  end if;

  select *
  into target_job
  from public.jobs
  where id = target_job_id
  for update;

  if not found then
    raise exception 'Job not found';
  end if;

  previous_status := coalesce(
    target_job.payment_status,
    case when coalesce(target_job.is_paid, false) then 'paid' else 'unpaid' end
  );

  update public.jobs
  set
    payment_status = normalized_status,
    payment_paid_at = case when normalized_status = 'paid' then now() else null end,
    payment_marked_by = case when normalized_status = 'paid' then auth.uid() else null end,
    is_paid = normalized_status = 'paid',
    paid_at = case when normalized_status = 'paid' then now() else null end,
    paid_by = case when normalized_status = 'paid' then auth.uid() else null end,
    updated_at = now()
  where id = target_job_id
  returning * into target_job;

  insert into public.job_payment_events (
    job_id,
    old_payment_status,
    new_payment_status,
    changed_by,
    note
  )
  values (
    target_job_id,
    previous_status,
    normalized_status,
    auth.uid(),
    case
      when normalized_status = 'paid' then 'Admin ghi nhận thanh toán'
      else 'Admin đánh dấu chưa thanh toán'
    end
  );

  return target_job;
end;
$$;

revoke all on function public.update_job_payment_status(uuid, text) from public;
grant execute on function public.update_job_payment_status(uuid, text) to authenticated;
