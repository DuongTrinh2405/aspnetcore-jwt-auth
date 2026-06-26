alter table public.jobs
  add column if not exists is_paid boolean not null default false,
  add column if not exists paid_at timestamptz,
  add column if not exists paid_by uuid references public.users(id) on delete set null;

create index if not exists jobs_is_paid_idx on public.jobs(is_paid);

