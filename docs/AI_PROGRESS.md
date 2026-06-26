# AI Progress

## 2026-06-26 Git Repository Prep

- Confirmed `docs/AI_RULES.md` is not present; followed existing `docs/AI_PROGRESS.md`.
- Prepared initial Git hygiene before upload by ignoring local logs, Next dev output, TypeScript build info, browser perf profiles, and Supabase local temp metadata.
- No application behavior changed.
## 2026-06-07 PWA Install UX Enhancement

- Added a unified PWA install provider/state in `apps/web/hooks/usePwaInstallPrompt.ts` with HTTPS-only installability, standalone detection, safe browser API guards, iOS Add-to-Home-Screen handling, and `pwa-install-dismissed-at` 7-day dismiss persistence.
- Added reusable install UI components in `apps/web/components/pwa/`: `PwaInstallButton`, `PwaInstallBanner`, and `PwaInstallCard`.
- Moved install UI out of the global lifecycle banner and kept `PwaLifecycle` focused on service worker registration, offline/reconnect toasts, update prompt, and the iOS instruction dialog.
- Added a compact desktop `Install App` entry to `PublicNav`, a mobile guest/public install banner, and install entries in existing customer/technician account menus without changing bottom navigation.
- Added lightweight install cards near the top of customer and technician dashboards.
- Did not change service worker caching behavior; Supabase auth/storage/data requests and private routes remain uncached by the existing `sw.js` logic.
- Modified files: `apps/web/app/layout.tsx`, `apps/web/hooks/usePwaInstallPrompt.ts`, `apps/web/components/PwaLifecycle.tsx`, `apps/web/components/PublicNav.tsx`, `apps/web/components/AppShell.tsx`, `apps/web/components/TechnicianShell.tsx`, `apps/web/app/customer/page.tsx`, `apps/web/app/technician/page.tsx`, and new `apps/web/components/pwa/*`.
- Verified `npm.cmd run typecheck -w apps/web` and `npm.cmd run build -w apps/web`.

## Known Issues

- Lighthouse PWA and real install prompts still need verification on HTTPS production or HTTPS preview. Localhost and LAN IP are intentionally not valid proof because the web service worker is unregistered in local development.

## Next Recommended Tasks

- Validate Chrome DevTools Application > Manifest and Lighthouse > PWA on an HTTPS deployment, then test Android Chrome, Android Edge, Samsung Internet, and iPhone Safari.

## 2026-06-06 Admin Image Cleanup QA

- Reviewed the admin image cleanup flow across `apps/admin/app/api/image-cleanup/route.ts`, `apps/admin/components/ImageCleanupPanel.tsx`, `apps/admin/lib/admin.ts`, and related Supabase cleanup migrations.
- Verified `npm.cmd run typecheck -w apps/admin`, `npm.cmd run typecheck -w packages/shared`, and `npm.cmd run build -w apps/admin`.
- Runtime-tested the built admin route on local port `3101`: `/login` returned 200, unauthenticated `/api/image-cleanup` returned a controlled JSON error, invalid `beforeDate` was rejected for both GET and POST, and authenticated admin preview returned 200 with eligible completed/cancelled job images.
- Did not execute a valid destructive POST cleanup because the preview returned real eligible Storage files and POST would physically remove them.
- Fixed the cleanup preview API response contract so GET no longer exposes internal `rows`/Storage paths, and mapped missing bearer tokens to HTTP 401.

## Known Issues

- Valid destructive POST cleanup still has not been executed because it would remove real Supabase Storage files.

## Next Recommended Tasks

- Run a valid destructive cleanup only after selecting a safe test fixture or confirming the eligible production-like files can be removed.

## 2026-06-06 Full Project Technical Audit

- Added `docs/PROJECT_TECHNICAL_AUDIT.md` with a source-based Vietnamese technical audit covering product scope, architecture, source structure, database/ERD, business flows, auth/authorization, security, UI screens, state, realtime, performance, PWA, completed/missing features, technical debt, and overall readiness.
- Confirmed `docs/AI_RULES.md` is not present in the repo; proceeded from existing project evidence only.
- No application code, database migrations, or runtime behavior were changed.

## Known Issues

- The audit identifies missing realtime/push backend, missing public/admin API rate limiting, mobile app parity gaps, and no explicit `jobs.customer_submitted_at` index.

## Next Recommended Tasks

- Review and prioritize the audit findings before starting implementation work.

## 2026-05-19

- Added CNL public contact updates for web booking: primary hotline `090 567 87 59`, website `chaungoclong.vn`, and logo asset at `/brand/cnl-logo.jpg`.
- Added a top-level "Dịch vụ khác" service category for booking/report flows.
- Added `customer_submitted_at` support so the system records when the customer presses the booking submit button, separate from `desired_schedule_at`.
- Added Supabase migration `20260519112000_add_customer_submitted_at.sql`.
- Applied the migration to the linked Supabase project and verified it appears in local/remote migration history.
- Verified `npm run typecheck`, `npm run build:web`, and the `/booking` page in the browser.
- Refined the CNL logo treatment with a shared rounded wave/ring mark for a more professional brand feel.
- Added a service-center logo variant that preserves the original CNL logo and adds a "Lắp đặt & Sửa chữa" department badge.
- Refined the premium UI layer: softer background gradients, lighter typography hierarchy, rounded inputs/buttons, mobile sticky booking CTA, improved public header, service card consistency, and richer tracking empty/loading states.
- Lightly refined customer mobile visual styles for friendlier cards, typography, and primary actions.
- Increased public web contrast: stronger layered background, clearer borders, darker body/menu text, and active navigation state based on the current route.

## Known Issues

- None for this change.

## Next Recommended Tasks

- Verify the booking form visually on desktop and mobile after migration is applied.

## 2026-05-20

- Converted `apps/web` into the primary PWA shell with manifest, icons, service worker, offline fallback, install banner, iOS Add to Home Screen guidance, and safe-area-aware sticky CTA.
- Added conservative service worker caching: static assets use cache-first, public shell pages use network-first with offline fallback, Supabase/auth/storage requests and mutations are not cached.
- Added PWA-capable metadata, manifest, icons, offline fallback, and service worker registration for `apps/admin` without caching private admin data.
- Added online/offline UX for booking/report forms so users get immediate feedback and cannot submit/upload while offline.
- Added client-side job image compression before Supabase Storage upload: resize to max 1600px, prefer WebP where supported, fall back to compressed JPEG, and store compression metadata when the DB migration is applied.
- Added image retention migration and cleanup Edge Function skeleton to expire Storage files after completed/cancelled jobs while keeping image metadata/audit records.
- Added admin note explaining automatic old-image cleanup for Storage control.
- Verified `npm.cmd run typecheck`, `npm.cmd run build:web`, and `npm.cmd run build:admin`.

## 2026-05-20 Manual Image Cleanup

- Disabled automatic job image deletion by replacing the cleanup Edge Function with a `410 Gone` response and adding migration `20260520100000_manual_job_image_cleanup.sql` to drop the auto-retention trigger/function.
- Added admin-only manual cleanup API at `apps/admin/app/api/image-cleanup/route.ts`, validated with Zod, backed by Supabase service role, and protected by server-side JWT plus `users.role = admin` checks.
- Added manual “Dọn dẹp ảnh cũ” UI in admin jobs with age filters, closed-status filters, optional before-date filter, preview list, confirmation modal, loading/disabled states, and result summary.
- Cleanup now deletes only physical Storage files, keeps metadata rows, and marks `storage_deleted`, `storage_deleted_at`, `deleted_at`, `deleted_by`, and `delete_reason`.
- Updated deleted-image placeholders in admin/staff galleries to say images were removed by an administrator to save storage.
- Added `MIN_JOB_IMAGE_DELETE_AGE_DAYS=7` config example and `zod` dependency for admin API validation.
- Verified `npm.cmd run typecheck`, `npm.cmd run build:web`, and `npm.cmd run build:admin`.

## 2026-05-20 Manual Cleanup QA Hardening

- Reviewed manual admin image cleanup security conditions: Edge Function no longer deletes, admin API checks authenticated user against DB role, service role key is server-only, and PWA service workers do not cache Supabase/Auth/Storage data.
- Added migration `20260520101000_unschedule_auto_image_cleanup.sql` to unschedule pg_cron jobs matching cleanup-job-images/image cleanup if pg_cron is available.
- Hardened cleanup idempotency by updating metadata with `.select("id").single()` and skipping rows already marked deleted by a concurrent/repeated request.
- Added customer job detail image gallery so deleted-image placeholders are visible to customers as well as staff/admin.
- Verified `npm.cmd run typecheck`, `npm.cmd run build:web`, and `npm.cmd run build:admin`.

## 2026-05-20 Form Validation UX

- Added a mobile-friendly validation summary dialog to the shared booking/report issue form.
- Kept inline field errors while adding stronger invalid field border/ring states.
- Added friendly Vietnamese field-level validation summaries and focused/scrolled the first invalid field after closing the dialog.
- Verified `npm.cmd run typecheck` and `npm.cmd run build:web`.

## 2026-05-20 Logo Update

- Replaced the public CNL service logo asset with the latest provided PNG at `/brand/cnl-service-logo.png`.
- Updated the shared logo path and PWA service worker cached asset list to use the new logo.

## 2026-05-20 Admin Operations Dashboard

- Standardized the visible job workflow to four primary statuses: pending, accepted, in_progress, and completed. Legacy database statuses remain typed for backward compatibility but are no longer exposed in primary selectors.
- Added job payment metadata migration with `is_paid`, `paid_at`, and `paid_by` so admin payment tracking is separate from job status.
- Added admin payment toggle in the job detail panel.
- Expanded admin overview KPIs with in-progress jobs, unpaid completed jobs, jobs today, jobs this week, urgent jobs, and jobs with uploaded images.
- Simplified technician web actions to accepted -> in_progress -> completed.
- Applied migration `20260520113000_add_job_payment_fields.sql` to the linked Supabase project.
- Verified `npm.cmd run typecheck`, `npm.cmd run build:admin`, and `npm.cmd run build:web`.

## 2026-05-20 Admin Account Management And Reports

- Added admin-only account management API for creating, editing, role/VIP changes, and soft-deactivating customer, technician, and staff accounts.
- Added `users.email` migration and updated the auth user trigger so newly created accounts keep email metadata in the public admin profile table.
- Reworked customer and technician admin pages to use a shared account manager with search, role filters, active/inactive filters, create/edit modal, VIP upgrade/downgrade, and account lock action.
- Updated reports page with week, month, 3-month, 6-month, and yearly filters; KPI cards and charts now use the selected reporting window.
- Added payment filtering to the admin job list so admins can filter paid and unpaid jobs separately from job workflow status.
- Applied migration `20260520120000_add_user_email_for_admin_management.sql` to the linked Supabase project and restarted the admin dev server.
- Verified `npm.cmd run typecheck`, `npm.cmd run build:admin`, and `/jobs?payment=unpaid` in the browser.

## 2026-05-20 Image Cleanup Navigation

- Moved Image Cleanup out of the Jobs page into a dedicated admin route at `/image-cleanup`.
- Added the new "Don anh" item to the admin sidebar and mobile admin nav, ngang hang voi Jobs, Customers, Technicians, and Reports.
- Removed the image cleanup panel and related state from `/jobs` so job management remains focused on operations.
- Verified `npm.cmd run typecheck`, `npm.cmd run build:admin`, `/image-cleanup`, and `/jobs` in the browser.

## 2026-05-20 Web Local CSS Recovery

- Fixed local development PWA cache interference by unregistering service workers and clearing browser caches on `localhost`/`127.0.0.1` for `apps/web`.
- Bumped the web service worker cache version and disabled service worker fetch handling during local development.
- Restarted the web dev server on port `3000` after `next build` had replaced dev CSS assets.
- Verified `npm.cmd run typecheck`, `npm.cmd run build:web`, and `/booking` CSS loading in the browser.

## 2026-05-20 Booking Contact Field Order

- Moved the phone field above the address field in the shared booking/report issue form location section.
- Updated validation focus order so phone errors are prioritized before address errors in that section.
- Verified `npm.cmd run typecheck -w apps/web` and `/booking` field order in the browser.

## 2026-05-20 Upload UX Limit And Mobile Choice

- Marked job image upload as optional in the shared booking/report issue form.
- Reduced the maximum job image count from 8 to 5 via shared constants and validation.
- Split upload actions into "Chon anh tu thu vien" and "Chup anh" so mobile users can choose either gallery or camera.
- Confirmed existing image compression remains active before Supabase upload via `prepareJobImageForUpload`.
- Verified `npm.cmd run typecheck -w apps/web`, `npm.cmd run typecheck -w packages/shared`, `npm.cmd run build:web`, and `/booking` upload UI in the browser.

## 2026-05-20 Service Card Selected State

- Strengthened the selected service card state with blue/cyan tint, stronger border, ring glow, elevated shadow, subtle scale, and a top-right "Da chon" badge with check icon.
- Added `aria-pressed` for accessible selected state and kept transitions at `duration-200`.
- Verified `npm.cmd run typecheck -w apps/web` and selected-card computed styles on `/report-issue`.
- Increased selected-card contrast with deeper blue/cyan tint, stronger blue border/ring, darker selected badge, and higher selected shadow.

## 2026-05-26 Performance Bottleneck Patch

- Added admin profile sessionStorage cache and ignored duplicate `INITIAL_SESSION` auth refresh events to reduce repeated admin auth/profile checks on cold startup while keeping server validation authoritative.
- Changed admin Jobs loading so initial/filter/page fetches run immediately, keyword search remains debounced, and existing rows stay visible while refetching.
- Split job image metadata from signed URL hydration, added short-lived signed URL caching, and made admin gallery sign image URLs lazily only when opened.
- Reduced staff and technician job-list image waterfalls by removing list-time signed URL generation; technician detail now loads images lazily after the sheet opens.
- Verified `npm.cmd run typecheck -w apps/admin`, `npm.cmd run typecheck -w apps/web`, `npm.cmd run typecheck`, `npm.cmd run build:web`, and `npm.cmd run build:admin`.
- `npm.cmd run lint` is still blocked by interactive Next.js ESLint setup prompts in `apps/admin` and `apps/web`.

## 2026-05-26 Interaction Latency Patch

- Improved staff dispatch perceived speed: normal filters/pages fetch immediately, search typing is the only debounced interaction, existing rows stay visible while refetching, and selected detail fetches are cancellation-safe.
- Changed staff job detail image flow to load metadata first and generate signed image URLs only when the gallery opens, with a short loading state inside the gallery.
- Kept previous tracking/warranty lookup results visible while a new lookup is running, so submit actions show immediate feedback without blanking the result panel.
- Verified `npm.cmd run typecheck -w apps/web`, `npm.cmd run typecheck -w apps/admin`, `npm.cmd run typecheck`, `npm.cmd run build:web`, and `npm.cmd run build:admin`.

## 2026-05-20 Staff Technician Dashboard UI

- Added shared `JobImageGallery` for job thumbnails and mobile-friendly lightbox with previous/next controls and deleted-image placeholder.
- Staff dashboard now uses a narrower customer-style container, softer blue/cyan hero card, polished job-card active state, image thumbnails, and payment status badge.
- Technician job feed now uses the brighter customer design system, compact max-width layout, stronger tab active state, assigned-job image thumbnails, payment badge, and created/scheduled time.
- Technician assigned jobs fetch signed job image URLs via the existing `fetchJobImagesForClient` helper; available-job business logic and RLS remain unchanged.
- Verified `npm.cmd run typecheck -w apps/web`, `npm.cmd run build:web`, and restarted the web dev server on port `3000`.

## 2026-05-20 Public Pages Role-Aware Nav And Typography

- Updated `PublicNav` to remain public while showing a role-aware dashboard/job-feed shortcut when a customer or technician is already logged in.
- Standardized `/report-issue` hero typography to use the same `page-shell`, `hero-title`, and `hero-copy` system as the other public pages.
- Standardized `/warranty` headings, labels, empty state, and form typography to match the customer-facing public page system.
- Verified `npm.cmd run typecheck -w apps/web`, cleaned stale `.next` after a Next cache build error, reran `npm.cmd run build:web`, and restarted the web dev server.

## 2026-05-20 Logged-In Customer Shell Navigation

- Added the five public service links (`/services`, `/booking`, `/report-issue`, `/track`, `/warranty`) into the logged-in customer `ProductShell` desktop sidebar and mobile header.
- Replaced the placeholder C mark in the customer shell with the CNL service logo and aligned the shell wording with the public service center brand.
- Refined the customer dashboard hero from a heavy blue block to a lighter blue/cyan card matching the public pages.
- Verified `npm.cmd run typecheck -w apps/web`, cleaned stale `.next`, reran `npm.cmd run build:web`, and restarted the web dev server.

## 2026-05-20 Logged-In App Bottom Navigation

- Updated the logged-in customer shell primary app navigation to exactly three items: `Ca nhan`, `Tong quan`, and `Lich su`; `Ca nhan` is a disabled placeholder UI.
- Added the same three-item navigation pattern to the technician jobs page: desktop left sidebar and mobile bottom navigation.
- Kept technician `Ca nhan` as a disabled placeholder and mapped `Tong quan` to `/technician`, `Lich su` to `/technician/jobs`.
- Verified `npm.cmd run typecheck -w apps/web`, cleaned stale `.next`, reran `npm.cmd run build:web`, and restarted the web dev server.

## 2026-05-21 PWA Shell Phase 1

- Added reusable web app primitives: `AppButton`, `AppCard`, `AppBadge`, `AppEmptyState`, `AppSkeleton`, `AppPageHeader`, and `AppPageContainer`.
- Added unified customer `AppShell` with sticky mobile header, fixed 5-item bottom navigation, safe-area spacing, desktop sidebar, and no dead tabs: Home, Jobs, Create, Alerts, Profile.
- Kept `ProductShell` as a compatibility wrapper around the new customer `AppShell`.
- Added unified `TechnicianShell` with 5-item field navigation: Available, My Jobs, Map, Alerts, Profile.
- Added lightweight placeholder routes for customer notifications/profile and technician map/notifications/profile.
- Standardized web-facing status badges into four display states while preserving backend status values.
- Wrapped the technician home and job feed in the new technician shell and synced job-feed tabs with URL query params.
- Verified `npm.cmd run typecheck -w apps/web`, `npm.cmd run typecheck`, `npm.cmd run build:web`, and restarted the web dev server on port `3000`.

## 2026-05-21 Customer PWA UX Phase 2

- Redesigned the customer home around active job progress, quick create CTA, warranty entry, service shortcuts, recent requests, and mobile-first cards.
- Reworked customer jobs into a card-first request list with status tabs, cleaner search, stronger empty/loading states, and no table/dashboard feel.
- Improved customer job detail with mobile-friendly hero, four-step progress timeline, image gallery reuse, and clearer contact/map section.
- Converted `ServiceRequestForm` into a progressive six-step flow with progress indicator, sticky back/continue/submit action, review step, and existing validation/API/Supabase behavior preserved.
- Kept image upload validation, compression, previews, camera/gallery actions, Google Maps, and final validation dialog intact.
- Verified `npm.cmd run typecheck -w apps/web`, `npm.cmd run typecheck`, `npm.cmd run build:web`, and restarted the web dev server on port `3000`.

## 2026-05-21 Technician PWA UX Phase 3

- Redesigned technician home into a field-service mobile screen focused on available jobs, active jobs, urgent jobs, quick job actions, and map shortcuts.
- Reworked technician job feed with touch-friendly job cards, stronger action hierarchy, call/map shortcuts, image visibility, loading skeletons, and app-like feedback toast.
- Added a mobile-first technician job detail sheet with image-first layout, customer contact section, four-step progress visibility, and sticky status action bar.
- Preserved existing Supabase/RLS/RPC business logic for fetching jobs, accepting jobs, and updating assigned job status.
- Verified `npm.cmd run typecheck -w apps/web`, `npm.cmd run typecheck`, and `npm.cmd run build:web`.

## 2026-05-21 Admin Operations UX Phase 4

- Simplified the admin shell with lighter sidebar/mobile navigation, clearer active states, and labels aligned to the public/customer visual system.
- Reworked admin overview into a calmer operations center with grouped KPI cards, lightweight quick actions, clearer job pipeline, workforce snapshot, recent jobs, and activity feed.
- Reworked jobs/dispatch UI with cleaner filter grouping, advanced filters section, responsive table/card layouts, clearer detail panel hierarchy, image gallery access, assignment, status, and payment controls preserved.
- Reworked reports page with cleaner period selector, readable KPI grouping, responsive chart rows, empty/loading states, and mobile-friendly spacing.
- Preserved existing admin data fetches, Supabase/RLS assumptions, assignment/status/payment mutations, pagination, filtering, image gallery, and reports logic.
- Verified `npm.cmd run typecheck -w apps/admin`, `npm.cmd run typecheck`, `npm.cmd run build:admin`, restarted admin dev server on port `3001`, and smoke-tested `/dashboard`, `/jobs`, and `/reports` in the browser.

## 2026-05-21 PWA Polish Phase 5

- Improved web PWA lifecycle with reconnect feedback, service-worker update-ready prompt, polished install banner transitions, and clearer offline messaging without caching private Supabase data.
- Improved admin PWA lifecycle with offline/reconnect banners and localhost service-worker cleanup to avoid stale development caches.
- Added shared motion/tap primitives: reduced-motion support, tap highlight removal, GPU-safe bottom nav hints, slide/fade micro animations, and shimmer skeleton styling.
- Improved shared web primitives with shimmer skeletons, stronger tap-target behavior, and smoother card/button transitions.
- Improved job image gallery with async image decoding, keyboard navigation, escape close, stable lightbox animation, and clearer deleted-image Vietnamese copy.
- Bumped web/admin service-worker cache versions; admin service worker now skips fetch handling on local development.
- Verified `npm.cmd run typecheck -w apps/web`, `npm.cmd run typecheck`, `npm.cmd run build:web`, `npm.cmd run build:admin`, and restarted web/admin dev servers on ports `3000`/`3001`.

## 2026-05-21 Admin Operations Density Polish

- Tightened the admin visual system with compact admin page/panel/toolbar/KPI/table utility classes while preserving the existing light SaaS style.
- Reworked the admin sidebar into grouped operational navigation with denser spacing, clearer active states, and a compact account/logout footer.
- Tightened `/dashboard`, `/jobs`, `/customers`, `/technicians`, `/reports`, and `/image-cleanup` spacing, card sizes, filter controls, tables, skeletons, and detail panels for faster admin scanning.
- Kept all Supabase data access, RLS assumptions, API routes, assignment/status/payment mutations, image cleanup behavior, pagination, and filters unchanged.
- Verified `npm.cmd run typecheck -w apps/admin`, `npm.cmd run typecheck`, and `npm.cmd run build:admin`.

## 2026-05-25 Admin Customers Technicians Operations UX

- Reworked the shared admin customer/technician manager from card-only CRUD into a list-first operations console with desktop table, mobile cards, selected row state, pagination, and right-side detail panel.
- Added denser filters for role, active/inactive state, job activity, technician workload, recent activity, and page size while preserving the existing admin user API and Supabase permissions.
- Added structured detail panels for customers and technicians showing contact, VIP/status, job totals, active/completed workload, recent jobs, and quick edit/VIP/lock actions.
- Updated `/customers` and `/technicians` page copy to align with the operations center language while keeping existing data loading and account management logic intact.
- Verified `npm.cmd run typecheck` and `npm.cmd run build:admin`.

## 2026-05-25 Admin Job Payment Workflow

- Added a new Supabase migration for separate `payment_status`, `payment_paid_at`, `payment_marked_by`, admin-only `job_payment_events`, and `update_job_payment_status` RPC using database `now()` for payment timestamps.
- Kept legacy `is_paid`, `paid_at`, and `paid_by` fields synchronized inside the RPC so existing reporting logic and older records remain compatible.
- Updated admin job management to show a dedicated payment badge in table/mobile cards, a structured payment section in the detail panel, confirmation before paid/unpaid changes, and admin-only payment timeline events.
- Updated admin stats/reports to read the new payment status with legacy fallback.
- Removed payment display from non-admin staff/technician web UI and changed shared/web non-admin job fetches to use a public job select list that excludes payment fields.
- Verified `npm.cmd run typecheck`, `npm.cmd run build:web`, and `npm.cmd run build:admin`.

## 2026-05-25 Admin Auth Loading Guard Fix

- Fixed admin `AuthProvider` to defer Supabase profile refresh from `onAuthStateChange` with `setTimeout`, avoiding auth callback deadlock/stuck loading behavior.
- Added a 7-second loading failsafe so admin pages do not remain indefinitely on the permission-checking fallback.
- Verified `npm.cmd run typecheck -w apps/admin` and `npm.cmd run build:admin`.

## 2026-05-25 Admin Interaction Surface Polish

- Added reusable admin interaction primitives: `AdminSelect` for product-grade dropdowns and `AdminConfirmDialog` for branded confirmation flows.
- Replaced native browser `confirm()` in admin payment and account lock flows with custom accessible dialogs.
- Replaced native `<select>` controls in admin Jobs, Customers/Technicians manager, and Image Cleanup with consistent custom dropdown surfaces.
- Restarted admin dev server on port `3001` after clearing `.next`; verified `/jobs?status=completed` returns HTTP 200.
- Verified `npm.cmd run typecheck -w apps/admin` and `npm.cmd run build:admin`.

## 2026-05-25 Admin Select Portal Fix

- Updated `AdminSelect` menus to render through a fixed portal attached to `document.body`, preventing dropdowns from being clipped by admin panels or table containers with overflow styling.
- Added viewport/scroll repositioning and outside-click handling that accounts for both the trigger and the portal menu.
- Verified `npm.cmd run typecheck -w apps/admin`, `npm.cmd run build:admin`, restarted admin dev server on port `3001`, and confirmed `/jobs?priority=normal` returns HTTP 200.

## 2026-05-25 Unified Interaction System Pass

- Added web `AppSelect` primitive using the same premium dropdown language as admin: custom trigger, portal menu, selected indicator, soft shadow, rounded surface, outside-click handling, and scroll/resize repositioning.
- Replaced remaining browser-native selects in the web staff dispatch dashboard and service request issue-type picker.
- Confirmed no remaining arbitrary `confirm`, `alert`, `prompt`, or native `<select>` usages in `apps/web`/`apps/admin`; the remaining `installPrompt.prompt()` is the required browser PWA install API.
- Verified `npm.cmd run typecheck -w apps/web`, `npm.cmd run typecheck -w apps/admin`, `npm.cmd run build:web`, and `npm.cmd run build:admin`.
- Restarted web/admin dev servers on ports `3000`/`3001`; confirmed `/booking` and `/jobs` both return HTTP 200.

## 2026-05-25 Supabase Google Maps Column Repair

- Added `20260525192000_ensure_jobs_google_maps_url.sql` to defensively ensure `public.jobs.google_maps_url` exists even if the earlier migration history was out of sync with the remote database.
- Pushed the migration to Supabase with `npx.cmd supabase db push`; PostgREST schema reload notification is included in the migration.

## 2026-05-26 Perceived Performance Follow-up

- Added request-id guards and cached-data-preserving refresh behavior to admin dashboard, reports, customers, technicians, and admin jobs so stale requests cannot overwrite newer UI and existing lists stay visible while refetching.
- Added immediate refresh feedback for admin customers, technicians, reports, and shared admin user management instead of silent network waits.
- Changed admin job status/assignment updates to optimistic local updates with rollback on failure and background list refresh.
- Changed technician job feed refresh after accepting a job to keep the current list visible, show inline updating state, and avoid holding the primary action until the background refresh finishes.
- Added web auth `INITIAL_SESSION` skip and loading failsafe to reduce duplicate profile refreshes and avoid indefinite blank permission gates.
- Added a double-submit guard to the customer booking/report request form while preserving existing validation, upload, and Supabase job creation logic.
- Verified `npm.cmd run typecheck -w apps/admin`, `npm.cmd run typecheck -w apps/web`, `npm.cmd run typecheck`, `npm.cmd run build:web`, and `npm.cmd run build:admin`.

## 2026-05-26 UI-First Image Detail Patch

- Changed customer job detail to render the job shell from `JOB_PUBLIC_SELECT` before loading image metadata, avoiding payment-field overfetch and signed-image blocking.
- Updated the shared job image gallery so opening the lightbox is immediate; signed URLs can be resolved after the modal is already visible with an inline loading state.
- Cleared stale admin job detail data immediately when selecting a different job so the detail panel shows the new shell and local skeletons instead of old timeline/images.

## 2026-05-26 Product Language Consistency Phase 2

- Unified customer and technician shell navigation from mixed English labels to Vietnamese-first product language: customer uses `Tổng quan`, `Yêu cầu`, `Tạo mới`, `Thông báo`, `Cá nhân`; technician uses `Có thể nhận`, `Việc của tôi`, `Bản đồ`, `Thông báo`, `Cá nhân`.
- Replaced generic shell wording like `Customer PWA`, `Technician PWA`, `Dashboard`, and `Operations center` with CNL service/field/operations language.
- Standardized user-facing job/request wording: public/customer pages use `yêu cầu`, technician pages use `việc`, admin keeps intentional `job dịch vụ` operations terminology.
- Replaced remaining public-page English eyebrows/copy such as `Service catalog`, `Booking`, `Tracking`, `Warranty`, and `Operations center` with Vietnamese-first CNL service language.
- Polished Vietnamese loading/error/success copy across web tracking, warranty, image gallery, staff dashboard, admin jobs, reports, image cleanup, account management, and admin API errors.
- Updated shared status labels so `pending` reads `Đang chờ tiếp nhận` and `accepted` reads `Đã tiếp nhận` consistently across customer, technician, and admin surfaces.
- Verified `npm.cmd run typecheck -w apps/web`, `npm.cmd run typecheck -w apps/admin`, `npm.cmd run build:web`, and `npm.cmd run build:admin`.


## 2026-05-26 Flow Closure Hierarchy Phase 3

- Added a customer post-submit success state in the booking/report form with a prominent request code, clear next steps, and direct actions to view detail or track progress instead of an abrupt redirect.
- Added next-step guidance to customer job detail, tracking results, and warranty lookup states so customers understand the current status and what happens next.
- Added action-first attention cards to the admin dashboard for pending jobs, urgent jobs, and completed/unpaid jobs using existing admin stats and filters.
- Added an operational priority block to the admin job detail panel that clarifies whether the next action is assignment, status update, completion review, payment reconciliation, or no further action.
- Added technician next-step guidance on job cards and detail sheets, including a deliberate completion reminder before marking an in-progress job complete.
- Preserved existing Supabase schema, RLS, API calls, routes, mutations, and data loading behavior.
- Verified `npm.cmd run typecheck -w apps/web`, `npm.cmd run typecheck -w apps/admin`, `npm.cmd run build:web`, and `npm.cmd run build:admin`.


## 2026-05-26 Local PWA Cache Stability

- Disabled web service worker registration and cleared Cache Storage automatically in development/local/LAN hosts, including localhost, 127.0.0.1, and private Wi-Fi IP ranges.
- Updated the service worker to unregister itself and clear caches on local/LAN hosts so stale PWA HTML/CSS/chunks do not keep breaking dev pages after code changes.
- Added `dev:lan` script for `apps/web`: `next dev -p 3000 -H 0.0.0.0`, giving a stable command for customer/technician PWA testing from phones on the same Wi-Fi.
- Verified `npm.cmd run typecheck -w apps/web` and opened a visible PowerShell dev server for `apps/web` so port 3000 remains available.

## 2026-05-27 Phase 4 Auth Entry Role Transition Polish

- Added clear guest auth actions to the public web header: secondary `Đăng nhập` and primary `Đăng ký`, while authenticated users now see a role-aware workspace entry instead of guest auth CTAs.
- Updated the web login page into a combined login/register entry with clearer role-transition messaging and customer registration through the existing Supabase auth trigger/profile flow.
- Changed successful web authentication to route customers/staff/technicians into their existing workspace paths and redirect admins to the admin app URL via `NEXT_PUBLIC_ADMIN_URL` fallbacking to `http://localhost:3001/dashboard`.
- Standardized customer and technician app shells with clean Vietnamese navigation/profile copy and a clearer permission-check loading state.
- Added `NEXT_PUBLIC_ADMIN_URL` to `.env.example`.
- Verified `npm.cmd run typecheck -w apps/web` and `npm.cmd run build:web`.

## 2026-05-27 Role Separation Logout Logo Consistency

- Tightened public header role visibility: guests see only public navigation plus login/register; customers see customer workspace/logout without technician entry; technicians see a technician workspace header instead of public/customer navigation.
- Added shared `signOutAndRedirect` helper that clears the cached web auth profile before Supabase sign-out and redirects consistently.
- Reused the shared logout helper in customer and technician shells.
- Added shared `BrandLogo` component for consistent CNL logo mark sizing, spacing, title, and subtitle across public/customer/technician shell headers.
- Verified `npm.cmd run typecheck -w apps/web` and `npm.cmd run build:web`.

## 2026-05-27 Authenticated Header Restoration

- Restored full navigation hierarchy for authenticated public headers: customers keep public service navigation and account/logout actions, while technicians receive technician workspace navigation instead of a collapsed logo/logout-only header.
- Added customer app-shell header links for `Dịch vụ`, `Đặt lịch`, `Báo lỗi`, `Tra cứu`, and `Bảo hành` on both desktop and mobile while preserving the existing customer sidebar/bottom app navigation.
- Added technician app-shell header links for `Có thể nhận`, `Việc của tôi`, `Bản đồ`, `Thông báo`, and `Cá nhân` on both desktop and mobile while preserving the existing technician sidebar/bottom app navigation.
- Kept existing logout helper and route/auth behavior unchanged.
- Verified `npm.cmd run typecheck -w apps/web` and `npm.cmd run build:web`.

## 2026-05-27 Mobile Compact App Bar

- Reworked mobile public header into a compact app bar with brand plus menu/action controls instead of always rendering a tall horizontal chip navigation row.
- Moved mobile public/technician navigation into a compact menu on public pages, while preserving full desktop navigation.
- Reduced authenticated customer and technician mobile app-shell headers to brand, notification, and account menu only; existing bottom navigation remains the primary mobile navigation.
- Added mobile account menus for customer and technician with `Cá nhân` and `Đăng xuất` without changing auth or routing logic.
- Verified `npm.cmd run typecheck -w apps/web` and `npm.cmd run build:web`.

## 2026-05-27 Technician Flow Cleanup

- Removed `Cá nhân` from authenticated customer mobile bottom navigation and kept profile/logout in the header account menu.
- Changed technician navigation to focus on `Tổng quan`, `Nhận việc`, `Việc của tôi`, `Bản đồ`, and `Thông báo`, with profile/logout remaining in the header account menu.
- Added reusable relative posted-time helpers and surfaced `Đăng X phút trước` on technician job cards, detail sheet, technician overview, map/list view, and customer job detail.
- Added mobile-first confirmation dialogs for technician accept/status-changing actions, including a specific completion confirmation.
- Replaced placeholder technician notification and map pages with derived job-based notifications and a practical `Bản đồ & chỉ đường` list using existing assigned jobs and Google Maps links.
- Updated the header notification badge to reflect visible derived notifications instead of hardcoded or unreliable unread counts.
- Verified `npm.cmd run typecheck -w apps/web` and `npm.cmd run build:web`.
## 2026-05-27 Phase 6 Mobile QA Hardening

- Fixed technician/public navigation consistency by removing the stale `Cá nhân` technician link from public header navigation and aligning it with the technician shell workflow links.
- Fixed `/technician/jobs` default-tab active state so `Nhận việc` highlights correctly when no `tab` query is present.
- Hardened derived notification loading with safe empty-state fallback instead of unhandled request failures.
- Hardened booking/report image selection so selecting more than 5 images shows a clear validation error instead of silently dropping extra files.
- Verified guest/protected route behavior in browser: `/booking` renders, protected `/customer` and `/technician/*` redirect to `/login` when unauthenticated, and mobile viewport had no horizontal overflow at 390px.
- Verified authenticated role smoke in browser: `customer.normal@example.com` lands on `/customer` without technician UI; `tech.normal@example.com` lands on `/technician` without customer create-request UI.
- Verified `npm.cmd run typecheck -w apps/web`, `npm.cmd run build:web`, `npm.cmd run typecheck`, and `npm.cmd run build:admin`.

## 2026-05-27 Customer Submitted Time Hard Requirement

- Added mandatory product/engineering requirements to `docs/project-architecture.md` for reliable customer job submission timestamp handling.
- Locked the expected source order for job age UI: use `jobs.customer_submitted_at` first, fallback to `jobs.created_at` for older records.
- Documented required technician/admin visibility, lightweight time sorting/filtering expectations, and validation checklist.
- No code or database changes were made in this pass.

## 2026-05-28 Customer Submitted Time Implementation

- Added Supabase migration `20260528090000_customer_submitted_at_server_default.sql` so `jobs.customer_submitted_at` defaults to database `now()` and old null rows are backfilled from `created_at`.
- Removed client-device timestamp submission from the customer booking/report flow; job creation now omits `customer_submitted_at` and lets the database record it.
- Added shared time helpers for `customer_submitted_at || created_at` fallback and Vietnamese relative submitted-time copy.
- Updated technician overview, job feed, detail sheet, map/list, and derived notifications to show job age from `customer_submitted_at` with `created_at` fallback.
- Added a lightweight technician sort control for `Mới nhất` / `Cũ trước`.
- Updated admin dispatch list, mobile cards, detail panel, date filtering, and sort control to use submitted time operationally.
- Pushed the migration to linked Supabase project `mkklqqyhvhnkqwziales` and verified it appears in remote migration list.
- Verified `npm.cmd run typecheck -w packages/shared`, `npm.cmd run typecheck -w apps/web`, `npm.cmd run typecheck -w apps/admin`, `npm.cmd run typecheck`, `npm.cmd run build:web`, and `npm.cmd run build:admin`.

## 2026-05-31 Public Shell Contact + Loading Polish

- Updated shared company contact data with the current address, support email, Facebook page, and formal company name.
- Added a reusable public footer for public pages with company identity, service links, quick links, contact details, trust badges, hotline CTA, and subtle developer credit.
- Polished the public header brand and hotline treatment while preserving existing guest/auth role navigation behavior.
- Added a reusable lightweight spinner primitive and applied clearer loading copy to booking/report submit, login, tracking, and warranty lookup buttons.
- Verified `npm.cmd run typecheck -w apps/web` and `npm.cmd run build:web`.

