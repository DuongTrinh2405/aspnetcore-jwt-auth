# CNL Service Platform

MVP platform connecting customers with technicians for camera, Wi-Fi, internet networking, and low-voltage service jobs.

## Current Architecture

```text
apps/
  mobile/          Expo React Native app for customers and technicians
  web/             Next.js + Tailwind web app for customers and technicians
  admin/           Next.js + Tailwind web admin for managers
packages/
  shared/          Shared TypeScript types, constants, validation, role helpers, Supabase helpers
supabase/
  migrations/      SQL migrations for schema, functions, RLS
  seed.sql         Sample users and jobs
  tests/           SQL permission checks
docs/
  phase-1-database-auth-role.md
```

## Product Rules

- Customers can create jobs from mobile and web.
- Technicians can view and accept suitable jobs from mobile and web.
- Regular technicians cannot see VIP jobs.
- VIP technicians can see regular and VIP jobs.
- Admins use only `apps/admin`.
- Supabase database and RLS remain the source of truth.

## Local Setup

Install dependencies:

```bash
npm install
```

Create env files:

```bash
cp .env.example .env.local
cp .env.example apps/web/.env.local
cp .env.example apps/admin/.env.local
cp .env.example apps/mobile/.env
```

Run customer/technician web:

```bash
npm run dev:web
```

Run admin web:

```bash
npm run dev:admin
```

Run Expo mobile:

```bash
npm run dev:mobile
```

## Demo Accounts

After running `supabase/seed.sql`, use:

```text
customer.normal@example.com / Test@123456
customer.vip@example.com    / Test@123456
tech.normal@example.com     / Test@123456
tech.vip@example.com        / Test@123456
admin@example.com           / Test@123456
```

If your database was seeded before the admin account existed, run `supabase/seed_admin.sql` once in Supabase SQL Editor.

## Phases

1. **Phase 1:** Database, Auth, Role, RLS
2. **Phase 2:** Customer flows on mobile and web
3. **Phase 3:** Technician flows on mobile and web
4. **Phase 4:** Web admin dashboard
5. **Phase 5:** Notifications, reports, UI polish

Start with [Phase 1 setup](./docs/phase-1-database-auth-role.md).
