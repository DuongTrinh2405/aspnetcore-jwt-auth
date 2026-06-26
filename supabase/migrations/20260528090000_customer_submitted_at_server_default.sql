alter table public.jobs
  alter column customer_submitted_at set default now();

update public.jobs
set customer_submitted_at = created_at
where customer_submitted_at is null;

comment on column public.jobs.customer_submitted_at is
  'Server/database timestamp recorded when the customer submits the job.';

notify pgrst, 'reload schema';
