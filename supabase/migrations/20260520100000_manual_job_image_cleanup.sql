alter table public.job_images
  add column if not exists deleted_by uuid references public.users(id) on delete set null,
  add column if not exists storage_deleted boolean not null default false;

drop trigger if exists trg_apply_job_image_retention on public.jobs;
drop function if exists public.apply_job_image_retention();

comment on column public.job_images.expires_at is 'Deprecated for automatic cleanup. Images are removed only by manual admin cleanup.';
comment on column public.job_images.storage_deleted is 'True when the physical Storage object has been removed while metadata is retained.';
comment on column public.job_images.deleted_by is 'Admin user who manually removed the physical Storage object.';

create index if not exists job_images_manual_cleanup_idx
on public.job_images (created_at, storage_deleted, is_protected)
where storage_deleted = false;

notify pgrst, 'reload schema';
