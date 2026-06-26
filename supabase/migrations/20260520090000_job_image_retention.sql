alter table public.job_images
  add column if not exists original_file_name text,
  add column if not exists original_size_bytes integer check (original_size_bytes is null or original_size_bytes >= 0),
  add column if not exists compressed_size_bytes integer check (compressed_size_bytes is null or compressed_size_bytes >= 0),
  add column if not exists width integer check (width is null or width >= 0),
  add column if not exists height integer check (height is null or height >= 0),
  add column if not exists expires_at timestamptz,
  add column if not exists deleted_at timestamptz,
  add column if not exists storage_deleted_at timestamptz,
  add column if not exists delete_reason text,
  add column if not exists is_protected boolean not null default false,
  add column if not exists protected_until timestamptz;

create index if not exists job_images_retention_idx
on public.job_images (expires_at, storage_deleted_at)
where expires_at is not null and storage_deleted_at is null;

create or replace function public.apply_job_image_retention()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  retention_days integer := coalesce(nullif(current_setting('app.job_image_retention_days', true), '')::integer, 60);
  completed_time timestamptz;
begin
  if new.status in ('completed', 'cancelled') and (old.status is distinct from new.status) then
    completed_time := coalesce(new.completed_at, new.cancelled_at, now());

    update public.job_images
    set
      expires_at = completed_time + make_interval(days => retention_days),
      updated_at = now()
    where job_id = new.id
      and storage_deleted_at is null
      and is_protected = false
      and (protected_until is null or protected_until < now())
      and expires_at is null;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_apply_job_image_retention on public.jobs;

create trigger trg_apply_job_image_retention
after update of status, completed_at, cancelled_at on public.jobs
for each row
execute function public.apply_job_image_retention();

notify pgrst, 'reload schema';
