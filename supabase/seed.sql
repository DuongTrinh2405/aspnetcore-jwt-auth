-- Sample data for Phase 1 permission testing.
-- Default password for all sample accounts: Test@123456

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) values
  (
    '11111111-1111-1111-1111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'customer.normal@example.com',
    crypt('Test@123456', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Khach Thuong","phone":"0901000001","role":"customer"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '22222222-2222-2222-2222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'customer.vip@example.com',
    crypt('Test@123456', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Khach VIP","phone":"0901000002","role":"customer"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '33333333-3333-3333-3333-333333333333',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'tech.normal@example.com',
    crypt('Test@123456', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Nhan Vien Thuong","phone":"0902000001","role":"technician"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'tech.vip@example.com',
    crypt('Test@123456', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Nhan Vien VIP","phone":"0902000002","role":"technician"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  ),
  (
    '55555555-5555-5555-5555-555555555555',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@example.com',
    crypt('Test@123456', gen_salt('bf')),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Admin CNL","phone":"0903000001","role":"customer"}'::jsonb,
    now(),
    now(),
    '',
    '',
    '',
    ''
  )
on conflict (id) do nothing;

insert into auth.identities (
  id,
  user_id,
  provider_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
) values
  (
    'aaaaaaaa-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'customer.normal@example.com',
    '{"sub":"11111111-1111-1111-1111-111111111111","email":"customer.normal@example.com"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  ),
  (
    'aaaaaaaa-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'customer.vip@example.com',
    '{"sub":"22222222-2222-2222-2222-222222222222","email":"customer.vip@example.com"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  ),
  (
    'aaaaaaaa-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    'tech.normal@example.com',
    '{"sub":"33333333-3333-3333-3333-333333333333","email":"tech.normal@example.com"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  ),
  (
    'aaaaaaaa-4444-4444-4444-444444444444',
    '44444444-4444-4444-4444-444444444444',
    'tech.vip@example.com',
    '{"sub":"44444444-4444-4444-4444-444444444444","email":"tech.vip@example.com"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  ),
  (
    'aaaaaaaa-5555-5555-5555-555555555555',
    '55555555-5555-5555-5555-555555555555',
    'admin@example.com',
    '{"sub":"55555555-5555-5555-5555-555555555555","email":"admin@example.com"}'::jsonb,
    'email',
    now(),
    now(),
    now()
  )
on conflict (provider_id, provider) do nothing;

insert into public.users (id, role, full_name, phone)
values
  ('11111111-1111-1111-1111-111111111111', 'customer', 'Khach Thuong', '0901000001'),
  ('22222222-2222-2222-2222-222222222222', 'customer_vip', 'Khach VIP', '0901000002'),
  ('33333333-3333-3333-3333-333333333333', 'technician', 'Nhan Vien Thuong', '0902000001'),
  ('44444444-4444-4444-4444-444444444444', 'technician_vip', 'Nhan Vien VIP', '0902000002'),
  ('55555555-5555-5555-5555-555555555555', 'admin', 'Admin CNL', '0903000001')
on conflict (id) do update
set role = excluded.role,
    full_name = excluded.full_name,
    phone = excluded.phone,
    is_active = true,
    updated_at = now();

insert into public.customer_profiles (user_id, default_address, vip_note)
values
  ('11111111-1111-1111-1111-111111111111', '12 Nguyen Trai, Quan 1, TP.HCM', null),
  ('22222222-2222-2222-2222-222222222222', '88 Le Loi, Quan 3, TP.HCM', 'Khach VIP uu tien trong ngay')
on conflict (user_id) do update
set default_address = excluded.default_address,
    vip_note = excluded.vip_note,
    updated_at = now();

insert into public.technician_profiles (user_id, company_name, skills, service_area, availability)
values
  (
    '33333333-3333-3333-3333-333333333333',
    'CNL Field Team',
    array['camera_install', 'wifi_setup', 'internet']::public.service_type[],
    'Quan 1, Quan 3, Quan 5',
    'available'
  ),
  (
    '44444444-4444-4444-4444-444444444444',
    'CNL VIP Field Team',
    array['camera_install', 'camera_repair', 'wifi_repair', 'networking', 'low_voltage']::public.service_type[],
    'Noi thanh TP.HCM',
    'available'
  )
on conflict (user_id) do update
set company_name = excluded.company_name,
    skills = excluded.skills,
    service_area = excluded.service_area,
    availability = excluded.availability,
    updated_at = now();

select set_config('request.jwt.claim.sub', '11111111-1111-1111-1111-111111111111', false);
select set_config('request.jwt.claim.role', 'authenticated', false);
select set_config('request.jwt.claims', '{"sub":"11111111-1111-1111-1111-111111111111","role":"authenticated"}', false);

insert into public.jobs (
  id,
  customer_id,
  service_type,
  title,
  description,
  address,
  phone,
  priority
) values
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa1',
    '11111111-1111-1111-1111-111111111111',
    'camera_install',
    'Lap camera cua hang',
    'Can lap 2 camera cho cua hang nho va cau hinh xem tu xa.',
    '12 Nguyen Trai, Quan 1, TP.HCM',
    '0901000001',
    'normal'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa2',
    '11111111-1111-1111-1111-111111111111',
    'wifi_setup',
    'Cau hinh wifi nha rieng',
    'Wifi yeu o tang 2, can tu van lap them mesh.',
    '22 Tran Hung Dao, Quan 5, TP.HCM',
    '0901000001',
    'high'
  ),
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaa3',
    '11111111-1111-1111-1111-111111111111',
    'internet',
    'Kiem tra mang internet',
    'Mang chap chon vao buoi toi, can kiem tra day va modem.',
    '45 Cach Mang Thang 8, Quan 3, TP.HCM',
    '0901000001',
    'normal'
  )
on conflict (id) do update
set service_type = excluded.service_type,
    title = excluded.title,
    description = excluded.description,
    address = excluded.address,
    phone = excluded.phone,
    priority = excluded.priority,
    status = 'pending',
    is_vip = false,
    assigned_technician_id = null,
    accepted_at = null,
    started_at = null,
    completed_at = null,
    cancelled_at = null,
    updated_at = now();

select set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', false);
select set_config('request.jwt.claim.role', 'authenticated', false);
select set_config('request.jwt.claims', '{"sub":"22222222-2222-2222-2222-222222222222","role":"authenticated"}', false);

insert into public.jobs (
  id,
  customer_id,
  service_type,
  title,
  description,
  address,
  phone,
  priority
) values
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb1',
    '22222222-2222-2222-2222-222222222222',
    'camera_repair',
    'Sua camera VIP biet thu',
    'He thong camera mat tin hieu 2 mat, can xu ly gap.',
    '88 Le Loi, Quan 3, TP.HCM',
    '0901000002',
    'urgent'
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbb2',
    '22222222-2222-2222-2222-222222222222',
    'low_voltage',
    'Kiem tra he thong dien nhe VIP',
    'Can kiem tra day tin hieu, tu rack va dau ghi tai van phong.',
    '99 Nam Ky Khoi Nghia, Quan 1, TP.HCM',
    '0901000002',
    'high'
  )
on conflict (id) do update
set service_type = excluded.service_type,
    title = excluded.title,
    description = excluded.description,
    address = excluded.address,
    phone = excluded.phone,
    priority = excluded.priority,
    status = 'pending',
    is_vip = true,
    assigned_technician_id = null,
    accepted_at = null,
    started_at = null,
    completed_at = null,
    cancelled_at = null,
    updated_at = now();

select set_config('request.jwt.claim.sub', '', false);
select set_config('request.jwt.claim.role', '', false);
select set_config('request.jwt.claims', '{}', false);
