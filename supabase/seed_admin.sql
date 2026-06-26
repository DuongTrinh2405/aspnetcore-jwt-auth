-- Optional quick seed for admin login.
-- Default password: Test@123456

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
) values (
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
) values (
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

update public.users
set role = 'admin',
    full_name = 'Admin CNL',
    phone = '0903000001',
    is_active = true,
    updated_at = now()
where id = '55555555-5555-5555-5555-555555555555';
