do $$
declare
  cleanup_job record;
begin
  if exists (select 1 from pg_namespace where nspname = 'cron') then
    for cleanup_job in
      execute $query$
        select jobid
        from cron.job
        where command ilike '%cleanup-job-images%'
           or jobname ilike '%cleanup%image%'
           or jobname ilike '%job%image%'
      $query$
    loop
      execute 'select cron.unschedule($1)' using cleanup_job.jobid;
    end loop;
  end if;
exception
  when undefined_table or undefined_function or insufficient_privilege then
    null;
end;
$$;
