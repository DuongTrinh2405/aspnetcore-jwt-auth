-- Staff/admin assignment helper.

create or replace function public.assign_job_to_technician(target_job_id uuid, target_technician_id uuid, assignment_note text default null)
returns public.jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  target_job public.jobs;
  technician_role public.user_role;
begin
  if not public.is_staff() then
    raise exception 'Only staff or admin can assign jobs';
  end if;

  select role into technician_role
  from public.users
  where id = target_technician_id and is_active = true;

  if technician_role not in ('technician', 'technician_vip') then
    raise exception 'Target user is not an active technician';
  end if;

  select *
  into target_job
  from public.jobs
  where id = target_job_id
  for update;

  if not found then
    raise exception 'Job not found';
  end if;

  if target_job.is_vip and technician_role <> 'technician_vip' then
    raise exception 'VIP jobs require a VIP technician';
  end if;

  update public.jobs
  set assigned_technician_id = target_technician_id,
      status = case when status = 'pending' then 'accepted'::public.job_status else status end,
      accepted_at = case when accepted_at is null then now() else accepted_at end,
      updated_at = now()
  where id = target_job_id
  returning * into target_job;

  insert into public.assignments (job_id, technician_id, assigned_by, note)
  values (target_job_id, target_technician_id, auth.uid(), assignment_note)
  on conflict (job_id, technician_id) do update
  set assigned_by = excluded.assigned_by,
      note = excluded.note,
      updated_at = now();

  insert into public.notifications (user_id, type, title, body, data)
  values (
    target_job.customer_id,
    'job_accepted',
    'Yêu cầu đã được phân công',
    'Trung tâm đã phân công kỹ thuật viên xử lý yêu cầu của bạn.',
    jsonb_build_object('job_id', target_job.id, 'technician_id', target_technician_id)
  );

  return target_job;
end;
$$;

grant execute on function public.assign_job_to_technician(uuid, uuid, text) to authenticated;

notify pgrst, 'reload schema';
