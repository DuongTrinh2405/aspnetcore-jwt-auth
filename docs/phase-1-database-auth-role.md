# Phase 1: Database + Auth + Role

Phase này tạo nền Supabase đầy đủ cho MVP: schema PostgreSQL, Auth user sync, role-based access control, RLS policy, RPC nhận job/cập nhật trạng thái, và storage bucket cho hình ảnh job.

## 1. Kiến trúc dữ liệu

Các bảng chính:

- `users`: bản mở rộng của `auth.users`, lưu `role`, tên, số điện thoại, trạng thái active.
- `customer_profiles`: hồ sơ khách hàng.
- `technician_profiles`: hồ sơ kỹ thuật viên, kỹ năng, khu vực, rating.
- `jobs`: yêu cầu lắp đặt/sửa chữa.
- `job_images`: metadata hình ảnh job, trỏ đến Supabase Storage bucket `job-images`.
- `job_status_logs`: lịch sử đổi trạng thái.
- `ratings`: khách hàng đánh giá kỹ thuật viên sau khi job hoàn thành.
- `notifications`: thông báo trong app.

Role đang dùng:

- `customer`: khách thường.
- `customer_vip`: khách VIP.
- `technician`: nhân viên thường.
- `technician_vip`: nhân viên VIP.
- `admin`: admin/quản lý.

Trạng thái job:

- `pending`
- `accepted`
- `in_progress`
- `completed`
- `cancelled`

## 2. Luật quyền quan trọng

- Khách chỉ thấy job của chính mình.
- Nhân viên thường chỉ thấy job `pending` không VIP và job đã được giao cho chính mình.
- Nhân viên VIP thấy job `pending` thường và VIP, cộng với job đã được giao cho chính mình.
- Job VIP chỉ có thể được nhận bởi `technician_vip`.
- Mỗi job chỉ một nhân viên nhận, được bảo vệ bằng RPC `accept_job()` có `for update`.
- Admin xem và quản lý toàn bộ dữ liệu.
- Client không nên update trực tiếp trạng thái job. Dùng RPC:
  - `accept_job(target_job_id uuid)`
  - `update_job_status(target_job_id uuid, next_status job_status, status_note text default null)`

## 3. Cài Supabase CLI

Nếu chưa cài:

```bash
npm install -g supabase
```

Đăng nhập:

```bash
supabase login
```

## 4. Chạy local Supabase

Khởi tạo project Supabase local nếu cần:

```bash
supabase init
```

Chạy local stack:

```bash
supabase start
```

Apply migration:

```bash
supabase db reset
```

Hoặc nếu không muốn reset database:

```bash
supabase db push
```

Sau khi chạy xong, Supabase CLI sẽ in ra local URL và anon key. Copy vào `.env`.

## 5. Chạy trên Supabase cloud

Tạo project trên Supabase, sau đó link project:

```bash
supabase link --project-ref your-project-ref
```

Push migration lên cloud:

```bash
supabase db push
```

Lấy keys trong Supabase Dashboard:

- Project Settings -> API -> Project URL
- Project Settings -> API -> anon public key
- Project Settings -> API -> service_role key

Điền vào `.env` dựa theo `.env.example`.

## 6. Cách tạo user và role

Khi user đăng ký qua Supabase Auth, trigger `handle_new_auth_user()` tự tạo dòng trong `public.users`.

Metadata đăng ký được phép dùng:

```json
{
  "full_name": "Nguyen Van A",
  "phone": "0900000000",
  "role": "customer"
}
```

Hoặc kỹ thuật viên thường:

```json
{
  "full_name": "Ky Thuat Vien A",
  "phone": "0900000001",
  "role": "technician"
}
```

Vì lý do bảo mật, user tự đăng ký chỉ có thể thành `customer` hoặc `technician`. Role `customer_vip`, `technician_vip`, `admin` phải được admin cập nhật sau.

Ví dụ nâng quyền admin đầu tiên trong SQL Editor:

```sql
update public.users
set role = 'admin'
where id = 'AUTH_USER_UUID_HERE';
```

Ví dụ nâng khách VIP:

```sql
update public.users
set role = 'customer_vip'
where id = 'CUSTOMER_UUID_HERE';
```

Ví dụ nâng kỹ thuật viên VIP:

```sql
update public.users
set role = 'technician_vip'
where id = 'TECHNICIAN_UUID_HERE';
```

## 7. Tạo job từ client

Client insert vào `jobs`, database tự ép `customer_id = auth.uid()`, `status = pending`, `assigned_technician_id = null`, và `is_vip` theo role của khách.

Ví dụ:

```ts
await supabase.from("jobs").insert({
  service_type: "camera_install",
  title: "Lắp 2 camera trước nhà",
  description: "Cần lắp camera và cấu hình xem qua điện thoại",
  address: "123 Nguyễn Trãi, Quận 1",
  phone: "0900000000",
  priority: "normal"
});
```

## 8. Nhân viên lấy danh sách job phù hợp

RLS tự lọc theo role, nên client chỉ cần query:

```ts
await supabase
  .from("jobs")
  .select("*")
  .eq("status", "pending")
  .order("created_at", { ascending: false });
```

Nhân viên thường sẽ không thấy job VIP. Nhân viên VIP sẽ thấy cả hai loại.

## 9. Nhân viên nhận job

Dùng RPC:

```ts
await supabase.rpc("accept_job", {
  target_job_id: jobId
});
```

RPC này kiểm tra:

- User hiện tại là kỹ thuật viên.
- Job còn `pending`.
- Job chưa có `assigned_technician_id`.
- Job VIP chỉ được nhận bởi `technician_vip`.
- Dùng `for update` để tránh hai người nhận cùng một job.

## 10. Cập nhật trạng thái job

Dùng RPC:

```ts
await supabase.rpc("update_job_status", {
  target_job_id: jobId,
  next_status: "in_progress",
  status_note: "Đã đến địa chỉ khách hàng"
});
```

Luật hiện tại:

- Kỹ thuật viên được giao job có thể chuyển sang `in_progress`, `completed`, `cancelled`.
- Khách hàng có thể hủy job của mình khi job đang `pending` hoặc `accepted`.
- Admin có thể cập nhật toàn bộ trạng thái.

## 11. Upload hình ảnh job

Upload file vào bucket `job-images`, nên đặt path theo user:

```text
{auth_user_id}/{job_id}/{file_name}
```

Sau khi upload storage thành công, insert metadata:

```ts
await supabase.from("job_images").insert({
  job_id: jobId,
  uploaded_by: user.id,
  storage_path: `${user.id}/${jobId}/photo-1.jpg`
});
```

RLS chỉ cho người được xem job truy cập metadata ảnh.

## 12. Filter admin dashboard

Admin có thể query toàn bộ:

```ts
await supabase
  .from("jobs")
  .select("*, customer:users!jobs_customer_id_fkey(*), technician:users!jobs_assigned_technician_id_fkey(*)")
  .eq("status", "pending")
  .eq("is_vip", true)
  .gte("created_at", "2026-05-01")
  .lte("created_at", "2026-05-31")
  .order("created_at", { ascending: false });
```

Dashboard counters:

```ts
const totalJobs = await supabase.from("jobs").select("id", { count: "exact", head: true });
const pendingJobs = await supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "pending");
const completedJobs = await supabase.from("jobs").select("id", { count: "exact", head: true }).eq("status", "completed");
```

## 13. Deploy web apps lên Vercel

Customer/technician web app nằm trong `apps/web`. Admin app nằm trong `apps/admin`.

Build web khách hàng/nhân viên:

```bash
cd apps/web
npm install
npm run build
```

Build web admin:

```bash
cd apps/admin
npm install
npm run build
```

Trên Vercel:

- Import repo.
- Root Directory cho web khách/nhân viên: `apps/web`.
- Root Directory cho admin: `apps/admin`.
- Thêm env:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Deploy.

## 14. Build mobile bằng Expo EAS

Phase 2 và 3 sẽ dùng app Expo trong `apps/mobile` cho cả khách hàng và nhân viên. Quy trình build dự kiến:

```bash
cd apps/mobile
npm install
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android
eas build --platform ios
```

Env mobile:

- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## 15. File migration

Migration Phase 1 nằm tại:

```text
supabase/migrations/20260518100000_phase_1_schema_auth_roles.sql
```

## 16. Seed dữ liệu mẫu

File seed nằm tại:

```text
supabase/seed.sql
```

Dữ liệu mẫu gồm:

- `customer.normal@example.com`: khách thường.
- `customer.vip@example.com`: khách VIP.
- `tech.normal@example.com`: nhân viên thường.
- `tech.vip@example.com`: nhân viên VIP.
- 3 job thường.
- 2 job VIP.

Mật khẩu mặc định cho tất cả tài khoản mẫu:

```text
Test@123456
```

Chạy seed trên local Supabase:

```bash
supabase db reset
```

Lệnh này sẽ chạy migrations rồi tự chạy `supabase/seed.sql`.

Nếu database cloud đã có migration và bạn chỉ muốn chạy seed, mở Supabase Dashboard -> SQL Editor, copy nội dung `supabase/seed.sql`, rồi bấm **Run**.

## 17. Test quyền nhân viên thường và nhân viên VIP

Script test nằm tại:

```text
supabase/tests/test_role_permissions.sql
```

Cách chạy:

1. Mở Supabase Dashboard.
2. Vào **SQL Editor**.
3. Copy nội dung `supabase/tests/test_role_permissions.sql`.
4. Bấm **Run**.

Kết quả mong đợi:

- Block `regular_technician_visible_jobs` trả về:
  - `visible_jobs = 3`
  - `visible_vip_jobs = 0`
  - `visible_regular_jobs = 3`
- Danh sách job ngay sau đó chỉ có `is_vip = false`.
- Block `vip_technician_visible_jobs` trả về:
  - `visible_jobs = 5`
  - `visible_vip_jobs = 2`
  - `visible_regular_jobs = 3`
- Danh sách job ngay sau đó có cả `is_vip = false` và `is_vip = true`.
- Test cuối phải in notice:
  - `PASS: regular technician cannot accept VIP job (VIP jobs require a VIP technician)`

Script test dùng cả hai dạng claim để tương thích Supabase SQL Editor:

```sql
set local role authenticated;
select set_config('request.jwt.claim.sub', 'USER_UUID', true);
select set_config('request.jwt.claims', '{"sub":"USER_UUID","role":"authenticated"}', true);
```

Cách này giả lập request của từng user để RLS chạy như khi mobile/web gọi Supabase bằng JWT thật.
