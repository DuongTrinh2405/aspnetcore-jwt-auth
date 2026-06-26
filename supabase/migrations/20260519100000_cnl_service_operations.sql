-- CNL service operations extension.
-- Run after the Phase 1 schema. It keeps existing RLS behavior and adds operational metadata.

alter type public.user_role add value if not exists 'staff';

alter type public.service_type add value if not exists 'solar';
alter type public.service_type add value if not exists 'barrier';
alter type public.service_type add value if not exists 'time_attendance';
alter type public.service_type add value if not exists 'rack_cable';
alter type public.service_type add value if not exists 'smart_device';
alter type public.service_type add value if not exists 'guard_cabin';

alter type public.job_status add value if not exists 'received';
alter type public.job_status add value if not exists 'scheduled';
alter type public.job_status add value if not exists 'on_the_way';
alter type public.job_status add value if not exists 'inspecting';
alter type public.job_status add value if not exists 'quoted';
alter type public.job_status add value if not exists 'warranty_followup';

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(public.current_user_role()::text in ('staff', 'admin'), false);
$$;

create or replace function public.user_can_view_job(target_job_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.jobs j
    where j.id = target_job_id
      and (
        public.is_staff()
        or j.customer_id = auth.uid()
        or j.assigned_technician_id = auth.uid()
        or (
          public.is_technician()
          and j.status = 'pending'
          and j.assigned_technician_id is null
          and (j.is_vip = false or public.is_vip_technician())
        )
      )
  );
$$;

create or replace function public.update_job_status(target_job_id uuid, next_status public.job_status, status_note text default null)
returns public.jobs
language plpgsql
security definer
set search_path = public
as $$
declare
  target_job public.jobs;
  next_status_text text;
begin
  next_status_text := next_status::text;

  select *
  into target_job
  from public.jobs
  where id = target_job_id
  for update;

  if not found then
    raise exception 'Job not found';
  end if;

  if public.is_staff() then
    null;
  elsif target_job.assigned_technician_id = auth.uid() then
    if next_status_text not in ('on_the_way', 'inspecting', 'quoted', 'in_progress', 'completed', 'warranty_followup', 'cancelled') then
      raise exception 'Technicians can only update assigned field statuses';
    end if;
  elsif target_job.customer_id = auth.uid() then
    if next_status_text <> 'cancelled' or target_job.status::text not in ('pending', 'received', 'scheduled', 'accepted') then
      raise exception 'Customers can only cancel open jobs';
    end if;
  else
    raise exception 'You cannot update this job';
  end if;

  if target_job.status::text = 'completed' and next_status_text <> 'completed' and not public.is_staff() then
    raise exception 'Completed jobs can only be changed by staff or admin';
  end if;

  update public.jobs
  set status = next_status,
      started_at = case when next_status_text = 'in_progress' and started_at is null then now() else started_at end,
      completed_at = case when next_status_text = 'completed' and completed_at is null then now() else completed_at end,
      cancelled_at = case when next_status_text = 'cancelled' and cancelled_at is null then now() else cancelled_at end,
      updated_at = now()
  where id = target_job_id
  returning * into target_job;

  if status_note is not null then
    update public.job_status_logs
    set note = status_note
    where id = (
      select id
      from public.job_status_logs
      where job_id = target_job_id
      order by created_at desc
      limit 1
    );
  end if;

  insert into public.notifications (user_id, type, title, body, data)
  values (
    target_job.customer_id,
    'job_status_changed',
    'Trạng thái yêu cầu đã thay đổi',
    'Yêu cầu của bạn hiện là: ' || next_status_text,
    jsonb_build_object('job_id', target_job.id, 'status', next_status_text)
  );

  return target_job;
end;
$$;

create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  short_title text not null,
  description text not null,
  service_type text not null,
  options text[] not null default '{}',
  product_groups text[] not null default '{}',
  warranty_eligible boolean not null default true,
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_lines (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid references public.product_brands(id) on delete set null,
  service_category_id uuid references public.service_categories(id) on delete set null,
  name text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.jobs add column if not exists tracking_code text;
alter table public.jobs add column if not exists service_category_slug text references public.service_categories(slug);
alter table public.jobs add column if not exists issue_type text;
alter table public.jobs add column if not exists desired_schedule_at timestamptz;
alter table public.jobs add column if not exists preliminary_quote numeric(12, 0);

create unique index if not exists jobs_tracking_code_idx on public.jobs(tracking_code);
create index if not exists jobs_service_category_slug_idx on public.jobs(service_category_slug);
create index if not exists jobs_desired_schedule_at_idx on public.jobs(desired_schedule_at);

create or replace function public.set_job_tracking_code()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.tracking_code is null or length(trim(new.tracking_code)) = 0 then
    new.tracking_code := 'CNL-' || upper(substr(replace(new.id::text, '-', ''), 1, 8));
  end if;

  return new;
end;
$$;

drop trigger if exists set_job_tracking_code_before_insert on public.jobs;
create trigger set_job_tracking_code_before_insert
before insert on public.jobs
for each row execute function public.set_job_tracking_code();

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  technician_id uuid not null references public.users(id) on delete restrict,
  assigned_by uuid references public.users(id) on delete set null,
  scheduled_at timestamptz,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(job_id, technician_id)
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  created_by uuid references public.users(id) on delete set null,
  subtotal numeric(12, 0) not null default 0,
  discount numeric(12, 0) not null default 0,
  total numeric(12, 0) not null default 0,
  status text not null default 'draft' check (status in ('draft', 'sent', 'accepted', 'rejected')),
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references public.quotes(id) on delete cascade,
  name text not null,
  quantity numeric(10, 2) not null default 1,
  unit_price numeric(12, 0) not null default 0,
  total numeric(12, 0) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.warranty_records (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  customer_id uuid not null references public.users(id) on delete restrict,
  service_category_slug text references public.service_categories(slug),
  warranty_code text not null unique,
  title text not null,
  starts_at date not null default current_date,
  ends_at date not null,
  status text not null default 'active' check (status in ('active', 'expired', 'void')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.maintenance_schedules (
  id uuid primary key default gen_random_uuid(),
  job_id uuid references public.jobs(id) on delete set null,
  customer_id uuid not null references public.users(id) on delete restrict,
  service_category_slug text references public.service_categories(slug),
  title text not null,
  scheduled_at timestamptz not null,
  recurrence text,
  status text not null default 'scheduled' check (status in ('scheduled', 'done', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.technician_notes (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  technician_id uuid not null references public.users(id) on delete restrict,
  note text not null,
  materials_used text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.customer_reviews (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.jobs(id) on delete cascade,
  customer_id uuid not null references public.users(id) on delete restrict,
  technician_id uuid references public.users(id) on delete set null,
  score integer not null check (score between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(job_id, customer_id)
);

create trigger set_service_categories_updated_at
before update on public.service_categories
for each row execute function public.set_updated_at();

create trigger set_product_brands_updated_at
before update on public.product_brands
for each row execute function public.set_updated_at();

create trigger set_product_lines_updated_at
before update on public.product_lines
for each row execute function public.set_updated_at();

create trigger set_assignments_updated_at
before update on public.assignments
for each row execute function public.set_updated_at();

create trigger set_quotes_updated_at
before update on public.quotes
for each row execute function public.set_updated_at();

create trigger set_warranty_records_updated_at
before update on public.warranty_records
for each row execute function public.set_updated_at();

create trigger set_maintenance_schedules_updated_at
before update on public.maintenance_schedules
for each row execute function public.set_updated_at();

create trigger set_technician_notes_updated_at
before update on public.technician_notes
for each row execute function public.set_updated_at();

create trigger set_customer_reviews_updated_at
before update on public.customer_reviews
for each row execute function public.set_updated_at();

insert into public.service_categories (slug, title, short_title, description, service_type, options, product_groups, warranty_eligible, sort_order)
values
('camera-an-ninh', 'Camera an ninh', 'Camera', 'Lắp mới, sửa mất hình, cấu hình xem từ xa, thay đầu ghi/camera và bảo trì định kỳ.', 'camera_install', array['Lắp mới','Sửa lỗi mất hình','Cấu hình xem từ xa','Thay đầu ghi/camera','Bảo trì định kỳ'], array['Camera IP','Đầu ghi','Ổ cứng lưu trữ','Nguồn và phụ kiện'], true, 10),
('dien-nang-luong-mat-troi', 'Điện năng lượng mặt trời', 'Solar', 'Khảo sát lắp đặt, bảo trì inverter, vệ sinh tấm pin, kiểm tra sản lượng và xử lý lỗi hệ thống.', 'solar', array['Khảo sát lắp đặt','Bảo trì inverter','Vệ sinh tấm pin','Kiểm tra sản lượng','Xử lý lỗi hệ thống'], array['Inverter','Tấm pin','Tủ điện','Giám sát sản lượng'], true, 20),
('barie-tu-dong-bai-xe', 'Barie tự động/bãi xe', 'Barie', 'Lắp đặt và sửa barie cho bãi xe, tòa nhà, khu công nghiệp.', 'barrier', array['Lắp đặt barie','Sửa barie không nâng/hạ','Bảo trì motor','Tích hợp hệ thống giữ xe','Kiểm tra cảm biến'], array['Barie tự động','Motor','Cảm biến','Thiết bị giữ xe'], true, 30),
('may-cham-cong-kiem-soat-ra-vao', 'Máy chấm công/kiểm soát ra vào', 'Chấm công', 'Lắp đặt máy chấm công, kết nối phần mềm, xử lý lỗi nhận diện và xuất dữ liệu.', 'time_attendance', array['Lắp đặt máy chấm công','Kết nối phần mềm','Lỗi nhận diện vân tay/khuôn mặt','Xuất dữ liệu chấm công','Bảo trì thiết bị'], array['Máy chấm công','Đầu đọc kiểm soát','Khóa cửa','Phần mềm chấm công'], true, 40),
('he-thong-mang-wifi-switch-router', 'Hệ thống mạng/WiFi/switch/router', 'Mạng/Wi-Fi', 'Thiết kế mạng văn phòng, xử lý mạng yếu, cấu hình switch/router và mạng vòng ring.', 'networking', array['Thiết kế mạng văn phòng','Xử lý mạng yếu/chập chờn','Cấu hình switch/router','Kéo dây mạng','Mạng vòng ring cho resort/khu công nghiệp'], array['Switch H3C','Router','Access point','Cáp mạng'], true, 50),
('tu-rack-thang-mang-cap', 'Tủ rack/thang máng cáp', 'Rack/Cáp', 'Tư vấn kích thước, đặt sản xuất theo yêu cầu, lắp đặt tủ rack và đi dây trong tủ.', 'rack_cable', array['Tư vấn kích thước','Đặt sản xuất theo yêu cầu','Lắp đặt tủ rack','Đi dây trong tủ','Bảo trì hệ thống rack'], array['Tủ rack treo tường','Tủ rack đứng','Tủ rack ngoài trời','Thang máng cáp'], true, 60),
('nha-thong-minh-thiet-bi-thong-minh-robot', 'Nhà thông minh/thiết bị thông minh/robot', 'Smart/Robot', 'Lắp đặt thiết bị thông minh, robot/robotics, cấu hình app điều khiển và xử lý lỗi kết nối.', 'smart_device', array['Lắp đặt thiết bị thông minh','Robot hút bụi/robotics','Cấu hình app điều khiển','Xử lý lỗi kết nối'], array['Thiết bị thông minh','Robot','Gateway','Cảm biến'], true, 70),
('cabin-bao-ve-ha-tang-phu-tro', 'Cabin bảo vệ/hạ tầng phụ trợ', 'Cabin', 'Tư vấn mẫu, khảo sát vị trí, lắp đặt và bảo trì cabin/hạ tầng phụ trợ.', 'guard_cabin', array['Tư vấn mẫu','Khảo sát vị trí','Lắp đặt','Bảo trì'], array['Cabin bảo vệ','Hạ tầng phụ trợ','Vật tư lắp đặt'], true, 80),
('mang-doanh-nghiep-resort-khu-cong-nghiep', 'Hệ thống mạng doanh nghiệp/resort/khu công nghiệp', 'Mạng DN', 'Khảo sát, thiết kế, triển khai và bảo trì mạng lõi, mạng vòng ring, switch/router cho quy mô lớn.', 'networking', array['Khảo sát hiện trạng','Thiết kế mạng vòng ring','Cấu hình switch/router','Bảo trì mạng lõi','Tối ưu hạ tầng resort/khu công nghiệp'], array['Switch lõi','Router','Access point outdoor','Tủ mạng'], true, 90)
on conflict (slug) do update
set title = excluded.title,
    short_title = excluded.short_title,
    description = excluded.description,
    service_type = excluded.service_type,
    options = excluded.options,
    product_groups = excluded.product_groups,
    warranty_eligible = excluded.warranty_eligible,
    sort_order = excluded.sort_order,
    updated_at = now();

alter table public.service_categories enable row level security;
alter table public.product_brands enable row level security;
alter table public.product_lines enable row level security;
alter table public.assignments enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.warranty_records enable row level security;
alter table public.maintenance_schedules enable row level security;
alter table public.technician_notes enable row level security;
alter table public.customer_reviews enable row level security;

create policy "service_categories_public_read" on public.service_categories for select to anon, authenticated using (is_active = true);
create policy "service_categories_admin_write" on public.service_categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "product_brands_public_read" on public.product_brands for select to anon, authenticated using (true);
create policy "product_lines_public_read" on public.product_lines for select to anon, authenticated using (true);

create policy "assignments_admin_select" on public.assignments for select to authenticated using (public.is_admin() or technician_id = auth.uid());
create policy "assignments_admin_write" on public.assignments for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "quotes_visible_job" on public.quotes for select to authenticated using (public.user_can_view_job(job_id));
create policy "quotes_admin_write" on public.quotes for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "quote_items_visible_quote" on public.quote_items for select to authenticated using (exists(select 1 from public.quotes q where q.id = quote_items.quote_id and public.user_can_view_job(q.job_id)));
create policy "quote_items_admin_write" on public.quote_items for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "warranty_visible_owner_admin" on public.warranty_records for select to authenticated using (customer_id = auth.uid() or public.is_admin());
create policy "warranty_admin_write" on public.warranty_records for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "maintenance_visible_owner_admin" on public.maintenance_schedules for select to authenticated using (customer_id = auth.uid() or public.is_admin());
create policy "maintenance_admin_write" on public.maintenance_schedules for all to authenticated using (public.is_admin()) with check (public.is_admin());

create policy "technician_notes_visible_job" on public.technician_notes for select to authenticated using (public.user_can_view_job(job_id));
create policy "technician_notes_assigned_insert" on public.technician_notes for insert to authenticated with check (
  technician_id = auth.uid()
  and exists(select 1 from public.jobs j where j.id = technician_notes.job_id and j.assigned_technician_id = auth.uid())
);

create policy "customer_reviews_visible_job" on public.customer_reviews for select to authenticated using (public.user_can_view_job(job_id));
create policy "customer_reviews_owner_insert" on public.customer_reviews for insert to authenticated with check (customer_id = auth.uid());

create or replace function public.lookup_job_tracking(input_tracking_code text, input_phone text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'job', to_jsonb(j),
    'statusHistory', coalesce(
      (
        select jsonb_agg(to_jsonb(l) order by l.created_at asc)
        from public.job_status_logs l
        where l.job_id = j.id
      ),
      '[]'::jsonb
    )
  )
  from public.jobs j
  where j.tracking_code = upper(trim(input_tracking_code))
    and j.phone = trim(input_phone)
  limit 1;
$$;

create or replace function public.lookup_warranty(input_warranty_code text, input_phone text)
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select to_jsonb(w)
  from public.warranty_records w
  join public.jobs j on j.id = w.job_id
  where w.warranty_code = upper(trim(input_warranty_code))
    and j.phone = trim(input_phone)
  limit 1;
$$;

grant select on public.service_categories to anon, authenticated;
grant select on public.product_brands to anon, authenticated;
grant select on public.product_lines to anon, authenticated;
grant select, insert, update on public.assignments to authenticated;
grant select, insert, update on public.quotes to authenticated;
grant select, insert, update on public.quote_items to authenticated;
grant select, insert, update on public.warranty_records to authenticated;
grant select, insert, update on public.maintenance_schedules to authenticated;
grant select, insert, update on public.technician_notes to authenticated;
grant select, insert, update on public.customer_reviews to authenticated;
grant execute on function public.is_staff() to authenticated;
grant execute on function public.lookup_job_tracking(text, text) to anon, authenticated;
grant execute on function public.lookup_warranty(text, text) to anon, authenticated;

notify pgrst, 'reload schema';
