-- Add image metadata for operations dashboards and gallery UX.

alter table public.job_images add column if not exists file_name text;
alter table public.job_images add column if not exists mime_type text;
alter table public.job_images add column if not exists size_bytes integer check (size_bytes is null or size_bytes >= 0);

create index if not exists job_images_job_created_idx on public.job_images(job_id, created_at desc);

notify pgrst, 'reload schema';
