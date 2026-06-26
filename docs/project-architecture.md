# Project Architecture

This repo is a small npm workspace monorepo.

## Apps

- `apps/mobile`: Expo React Native app for both customers and technicians.
- `apps/web`: Next.js + Tailwind app for customers and technicians.
- `apps/admin`: Next.js + Tailwind app for admins/managers only.

## Shared Package

`packages/shared` contains:

- `types.ts`: shared domain types such as `UserRole`, `Job`, `JobStatus`.
- `constants.ts`: role, service type, status, and priority constants.
- `roles.ts`: role guard helper functions.
- `validation.ts`: shared validation for create-job payloads.
- `supabase.ts`: shared Supabase client factory and current profile loader.

## Routing Skeleton

Customer/technician web app:

- `/login`
- `/customer`
- `/customer/jobs`
- `/customer/jobs/new`
- `/technician`
- `/technician/jobs`

Admin web app:

- `/login`
- `/dashboard`
- `/jobs`
- `/customers`
- `/technicians`
- `/reports`

Mobile app:

- Login/register screen.
- Customer home shell.
- Technician home shell.
- Admin accounts are blocked with a message because admin only uses web admin.

## Role Guard Rules

- `apps/web` accepts `customer`, `customer_vip`, `technician`, `technician_vip`.
- `apps/admin` accepts only `admin`.
- `apps/mobile` accepts customers and technicians. Admin receives a message to use web admin.
- Supabase RLS still enforces data access. App role guards are UX and routing guards, not the security boundary.

## Vibe-Coding Hard Requirements

These requirements are mandatory for future coding/refinement work. They are more important than visual polish or new product features.

### Customer Submitted Time

The platform must correctly record when a customer submits/posts a job.

- Every new customer-created job must have a reliable `jobs.customer_submitted_at`.
- Prefer database/server timestamp, not client device time.
- If older jobs have `customer_submitted_at = null`, UI must safely fallback to `jobs.created_at`.
- Do not break existing `created_at` / `updated_at` behavior.
- Do not create duplicate timestamp fields unless a migration is explicitly justified.
- Do not expose internal technical wording such as `customer_submitted_at` to customer or technician UI.

Expected behavior:

- Customer submits a job.
- Database records exact submitted time.
- Admin can see when the job was submitted.
- Technician can see how long ago the job was submitted.

### Technician Job Age Visibility

Technicians must clearly see how long ago the customer submitted the job.

Use:

- `customer_submitted_at` if present.
- `created_at` fallback if `customer_submitted_at` is null.

Show relative Vietnamese copy such as:

- `Khach gui 5 phut truoc`
- `Khach gui 2 gio truoc`
- `Khach gui hom qua`
- `Khach gui 3 ngay truoc`

Required surfaces:

- `/technician`
- `/technician/jobs?tab=available`
- `/technician/jobs?tab=assigned`
- technician job detail sheet
- technician notifications when relevant

The UI should make fresh jobs easy to recognize and older pending jobs operationally visible without cluttering mobile cards.

### Technician Time Sorting / Filtering

Technicians must have a lightweight way to understand job age.

Do not add a complex analytics module. If missing, add only a small operational control, such as:

- sort by newest first
- sort by oldest pending first
- filter by today / yesterday / older
- compact segmented control if it fits the existing mobile UI

Available jobs should default to a useful operational order, and old pending jobs must not get buried.

### Admin Submitted-Time Visibility

Admin jobs/dispatch must clearly show:

- submitted time
- relative age
- sortable/filterable submission time when the existing table/filter system supports it

Do not overbuild. The goal is operational visibility, not analytics expansion.

### Validation Checklist

Before considering this requirement complete, verify:

- New customer job inserts `customer_submitted_at`.
- Missing `customer_submitted_at` falls back to `created_at` in UI.
- Technician job cards show relative submitted time.
- Technician detail sheet shows submitted time/age.
- Technician can sort/filter jobs by submitted time or age.
- Admin jobs screen displays submitted time/age.
- Relative time formatting does not cause hydration mismatch.
- TypeScript passes.
- RLS behavior remains unchanged.
- No duplicate timestamp fields.
- No fake data.
- No large feature expansion.
