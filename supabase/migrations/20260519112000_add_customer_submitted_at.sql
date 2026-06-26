alter table public.jobs
  add column if not exists customer_submitted_at timestamptz;

update public.jobs
set customer_submitted_at = created_at
where customer_submitted_at is null;

comment on column public.jobs.customer_submitted_at is
  'Client-side timestamp captured when the customer presses the booking submit button.';

notify pgrst, 'reload schema';
