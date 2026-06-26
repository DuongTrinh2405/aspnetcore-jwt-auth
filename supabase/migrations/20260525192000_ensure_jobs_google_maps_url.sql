alter table public.jobs
add column if not exists google_maps_url text;

comment on column public.jobs.google_maps_url is
'Optional Google Maps place/share link pinned by the customer for technician navigation.';

notify pgrst, 'reload schema';
