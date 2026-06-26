-- Test RLS visibility for technician roles.
-- Run this in Supabase SQL Editor after running supabase/seed.sql.

-- Expected:
-- - regular technician sees 3 pending non-VIP jobs and 0 VIP jobs.
-- - VIP technician sees 5 pending jobs, including 2 VIP jobs.

begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', true);
  select set_config('request.jwt.claim.role', 'authenticated', true);
  select set_config('request.jwt.claims', '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', true);

  select
    'regular_technician_visible_jobs' as test_name,
    count(*) as visible_jobs,
    count(*) filter (where is_vip) as visible_vip_jobs,
    count(*) filter (where not is_vip) as visible_regular_jobs
  from public.jobs
  where status = 'pending';

  select
    id,
    title,
    service_type,
    status,
    is_vip,
    created_at
  from public.jobs
  where status = 'pending'
  order by is_vip, created_at;
commit;

begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', '44444444-4444-4444-4444-444444444444', true);
  select set_config('request.jwt.claim.role', 'authenticated', true);
  select set_config('request.jwt.claims', '{"sub":"44444444-4444-4444-4444-444444444444","role":"authenticated"}', true);

  select
    'vip_technician_visible_jobs' as test_name,
    count(*) as visible_jobs,
    count(*) filter (where is_vip) as visible_vip_jobs,
    count(*) filter (where not is_vip) as visible_regular_jobs
  from public.jobs
  where status = 'pending';

  select
    id,
    title,
    service_type,
    status,
    is_vip,
    created_at
  from public.jobs
  where status = 'pending'
  order by is_vip, created_at;
commit;

begin;
  set local role authenticated;
  select set_config('request.jwt.claim.sub', '33333333-3333-3333-3333-333333333333', true);
  select set_config('request.jwt.claim.role', 'authenticated', true);
  select set_config('request.jwt.claims', '{"sub":"33333333-3333-3333-3333-333333333333","role":"authenticated"}', true);

  do $$
  begin
    begin
      perform public.accept_job('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1'::uuid);
      raise exception 'FAILED: regular technician unexpectedly accepted a VIP job';
    exception
      when others then
        if sqlerrm = 'VIP jobs require a VIP technician' then
          raise notice 'PASS: regular technician cannot accept VIP job (%)', sqlerrm;
        else
          raise exception 'FAILED: unexpected error while checking VIP accept rule: %', sqlerrm;
        end if;
    end;
  end $$;
rollback;
