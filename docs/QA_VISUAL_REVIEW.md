# Visual QA Review

## Summary

- Overall status: FAIL / BLOCKED AFTER FALLBACKS
- Main risks:
  - Không có screenshot evidence, nên chưa thể xác nhận trực quan UI sau polish mới nhất.
  - Source-level inspection cho thấy footer/header/loading đã được wire vào code, nhưng chưa chứng minh được bằng trình duyệt thật.
  - Không nên tiếp tục patch UI dựa trên giả định cho đến khi visual QA chạy được.
- Recommended next action:
  - Khôi phục local process/browser tooling rồi chạy lại visual QA.
  - Khi chạy lại, lưu screenshot vào `docs/qa-screenshots/` theo checklist.

## QA Resilience Attempts

### Attempt 1: Existing running localhost

- Command attempted: kiểm tra port `3000` và `3001`.
- Evidence observed earlier:
  - `3000` từng listen bằng Next dev.
  - `3001` từng listen bằng Next dev.
- Result:
  - HTTP check qua shell không truy cập ổn định được.
  - Later shell process spawning failed before new checks could complete.

### Attempt 2: Non-escalated shell

- Command attempted: `Get-Date`
- Error:
  - `windows sandbox: runner error: CreateProcessAsUserW failed: 5`
- Impact:
  - Không thể dùng PowerShell để gọi `Invoke-WebRequest`, chạy Playwright, chụp screenshot, hoặc kiểm tra logs tiếp.

### Attempt 3: Escalated shell

- Command attempted: minimal escalated shell check.
- Error:
  - `Access is denied.`
- Impact:
  - Không thể fallback sang escalated shell.

### Attempt 4: In-app Browser automation

- Tool attempted: Browser plugin via Node runtime.
- Error:
  - `node_repl kernel exited unexpectedly`
  - `windows sandbox failed: spawn setup refresh`
- Impact:
  - Không thể mở page, inspect DOM, hoặc chụp screenshot bằng in-app browser.

### Attempt 5: Bundled runtime fallback

- Tooling checked:
  - `load_workspace_dependencies` succeeded and returned bundled Node/Python paths.
- Command attempted:
  - bundled Node smoke command.
- Error:
  - `windows sandbox: runner error: CreateProcessAsUserW failed: 5`
- Impact:
  - Không thể chạy Playwright/headless screenshot bằng bundled runtime.

### Attempt 6: Source / HTML / CSS inspection fallback

- Available evidence:
  - Source files were inspected before shell failure.
  - `packages/shared/src/constants.ts` contains updated company contact data.
  - `apps/web/components/PublicFooter.tsx` exists and is wired into public pages.
  - `apps/web/components/ui/AppSpinner.tsx` exists.
  - `apps/web/components/PublicNav.tsx` was updated for brand/hotline treatment.
  - `apps/web/app/page.tsx`, `/services`, `/booking`, `/report-issue`, `/track`, `/warranty` import and render `PublicFooter`.
  - `apps/web/app/login/page.tsx`, `ServiceRequestForm`, `/track`, `/warranty` use the new spinner/loading copy.
- Limitation:
  - This proves implementation wiring, not visual quality.
  - It does not prove layout, overflow, mobile behavior, clickable hierarchy, or actual loading UX.

## Screenshots Captured

No screenshots captured.

Reason: all reasonable browser/screenshot fallback paths failed due local sandbox/process-spawn failures.

## Public Website Review

### Routes Requested

- `/`
- `/services`
- `/booking`
- `/report-issue`
- `/track`
- `/warranty`
- `/login`

### Status

BLOCKED after fallback attempts.

### Source-Level Evidence

- Header component exists: `apps/web/components/PublicNav.tsx`
- Footer component exists: `apps/web/components/PublicFooter.tsx`
- Public pages render footer:
  - `apps/web/app/page.tsx`
  - `apps/web/app/services/page.tsx`
  - `apps/web/app/booking/page.tsx`
  - `apps/web/app/report-issue/page.tsx`
  - `apps/web/app/track/page.tsx`
  - `apps/web/app/warranty/page.tsx`
- Login page uses loading feedback:
  - `apps/web/app/login/page.tsx`

### Unknown Until Screenshot QA

- Whether public header is visually balanced on desktop.
- Whether mobile header is compact enough at ~390px.
- Whether footer is too tall/heavy.
- Whether floating hotline covers content.
- Whether footer columns wrap cleanly on mobile.
- Whether long address creates overflow.

## Mobile Review

### Status

BLOCKED.

### Unknown

- 390px viewport layout.
- Header/menu tap target clarity.
- Footer wrapping.
- Hotline floating CTA behavior.
- Service cards and form sections after footer addition.

## Header Review

### Status

SOURCE-WIRED, VISUALLY UNVERIFIED.

### Source-Level Notes

- Public header brand title was changed to `Châu Ngọc Long`.
- Hotline includes visible support sublabel `Tư vấn`.
- Existing role-based public/customer/technician logic appears preserved in source.

### Unknown

- Visual density on laptop.
- Whether hotline/action hierarchy competes with booking CTA.
- Whether mobile menu remains clean.

## Footer Review

### Status

SOURCE-WIRED, VISUALLY UNVERIFIED.

### Source-Level Notes

Footer includes:

- `CÔNG TY TNHH CHÂU NGỌC LONG`
- hotline `090 567 87 59`
- email `sam@chaungoclong.vn`
- website `chaungoclong.vn`
- Facebook page
- address
- developer credit `Dev by NguyenDuongTrinh · Dev`

### Unknown

- Footer height and visual weight.
- Mobile wrapping and spacing.
- Whether dev credit is subtle enough.
- Whether floating hotline is annoying or covers content.

## Loading Review

### Status

SOURCE-WIRED, VISUALLY UNVERIFIED.

### Source-Level Notes

- Reusable spinner exists: `apps/web/components/ui/AppSpinner.tsx`
- Spinner CSS exists in `apps/web/app/globals.css`.
- Loading copy is used in:
  - booking/report submit: `Đang gửi yêu cầu...`, `Đang tải ảnh...`
  - tracking/warranty: `Đang tra cứu...`
  - login/register: `Đang xử lý...`

### Unknown

- Actual click-to-feedback timing.
- Whether spinner color/size looks consistent.
- Whether disabled button state prevents double-submit visually.

## Authenticated Flow Review

### Customer

BLOCKED.

Routes not visually verified:

- `/customer`
- `/customer/jobs`
- `/customer/jobs/new`
- `/customer/notifications`

### Technician

BLOCKED.

Routes not visually verified:

- `/technician`
- `/technician/jobs?tab=available`
- `/technician/jobs?tab=assigned`
- `/technician/map`
- `/technician/notifications`

Unknown:

- Whether `Khách gửi ...` is visible in actual technician cards.
- Whether newest/oldest sort is visible and usable.
- Whether cards remain readable on mobile.

### Admin

BLOCKED.

Routes not visually verified:

- `/dashboard`
- `/jobs`
- `/customers`
- `/technicians`
- `/reports`
- `/image-cleanup`

Unknown:

- Whether admin dispatch still shows job submitted age clearly.
- Whether admin layout remains visually stable after web/public changes.

## Issues

### QA-001

- Severity: P0
- Route: all
- Screenshot: none
- Problem: Visual QA cannot produce screenshot evidence because every local render/screenshot path failed.
- Likely cause: Local Codex desktop sandbox/process-spawn failure, not confirmed application runtime failure.
- Recommended fix: Restart Codex desktop session or run QA from a shell/browser environment that can spawn processes.
- Fix now or later: Fix now, because visual acceptance cannot be completed without evidence.

### QA-002

- Severity: P1
- Route: public footer routes
- Screenshot: none
- Problem: Long address and new footer content may create mobile wrapping/height issues.
- Likely cause: New footer has full legal address and multiple columns.
- Recommended fix: Verify at 390px; if too tall, reduce copy density or collapse contact block spacing.
- Fix now or later: Fix after screenshot evidence.

### QA-003

- Severity: P2
- Route: public pages
- Screenshot: none
- Problem: Floating hotline CTA may cover lower-left content on shorter screens.
- Likely cause: Fixed bottom-left hotline button on desktop/tablet.
- Recommended fix: Verify real viewport; if intrusive, hide below large desktop or add bottom spacing.
- Fix now or later: Fix after screenshot evidence.

## Final Recommendation

- Fix immediately:
  - Restore functioning browser/shell QA path and rerun the full screenshot checklist.
- Can wait:
  - Any further UI polish until screenshots exist.
- Already good enough:
  - Source-level wiring for contact info, footer, and loading feedback is present.
  - Visual quality is not yet proven.

