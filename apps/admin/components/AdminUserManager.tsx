"use client";

import { JOB_STATUS_LABELS, SERVICE_TYPE_LABELS, USER_ROLES, type Job, type UserRole } from "@cnl/shared";
import {
  Activity,
  BriefcaseBusiness,
  CalendarDays,
  Edit3,
  Eye,
  Lock,
  Mail,
  Phone,
  Plus,
  Save,
  Search,
  ShieldCheck,
  Star,
  UserRound,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { AdminConfirmDialog, AdminSelect } from "./AdminInteractions";
import {
  countAssignedJobs,
  countCustomerJobs,
  createAdminManagedUser,
  deactivateAdminManagedUser,
  updateAdminManagedUser,
  type AdminDataset,
  type AdminUser,
  type AdminUserPayload
} from "../lib/admin";

type AccountKind = "customer" | "technician";
type ActiveFilter = "all" | "active" | "inactive";
type ActivityFilter = "all" | "has_jobs" | "no_jobs" | "recent" | "busy" | "available";

type AdminUserManagerProps = {
  dataset: AdminDataset | null;
  kind: AccountKind;
  search: string;
  onSearchChange: (value: string) => void;
  onReload: () => Promise<void>;
  refreshing?: boolean;
};

const roleOptions: Record<AccountKind, UserRole[]> = {
  customer: ["customer", "customer_vip"],
  technician: ["technician", "technician_vip", "staff"]
};

const roleLabels: Record<UserRole, string> = {
  customer: "Khách thường",
  customer_vip: "Khách VIP",
  staff: "Nhân viên điều phối",
  technician: "Kỹ thuật viên",
  technician_vip: "Kỹ thuật viên VIP",
  admin: "Admin"
};

const emptyForm = (kind: AccountKind): AdminUserPayload => ({
  email: "",
  password: "",
  fullName: "",
  phone: "",
  role: kind === "customer" ? "customer" : "technician",
  isActive: true
});

function isManagedRole(role: UserRole): boolean {
  return USER_ROLES.includes(role) && role !== "admin";
}

function isOpenJob(job: Job): boolean {
  return job.status !== "completed" && job.status !== "cancelled";
}

function formatDate(value: string | null | undefined): string {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function isRecent(value: string | null | undefined): boolean {
  if (!value) return false;
  const createdTime = new Date(value).getTime();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  return Date.now() - createdTime <= thirtyDays;
}

function latestJobFor(jobs: Job[]): Job | null {
  return [...jobs].sort((a, b) => new Date(b.updated_at ?? b.created_at).getTime() - new Date(a.updated_at ?? a.created_at).getTime())[0] ?? null;
}

export function AdminUserManager({ dataset, kind, refreshing = false, search, onSearchChange, onReload }: AdminUserManagerProps) {
  const [roleFilter, setRoleFilter] = useState<UserRole | "all">("all");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [editing, setEditing] = useState<AdminUser | "new" | null>(null);
  const [pendingDeactivate, setPendingDeactivate] = useState<AdminUser | null>(null);
  const [form, setForm] = useState<AdminUserPayload>(() => emptyForm(kind));
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const userRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    const jobs = dataset?.jobs ?? [];

    return (dataset?.users ?? [])
      .filter((user) => roleOptions[kind].includes(user.role))
      .map((user) => {
        const relatedJobs = kind === "customer" ? jobs.filter((job) => job.customer_id === user.id) : jobs.filter((job) => job.assigned_technician_id === user.id);
        const latestJob = latestJobFor(relatedJobs);
        const activeJobs = relatedJobs.filter(isOpenJob).length;
        const completedJobs = relatedJobs.filter((job) => job.status === "completed").length;

        return {
          user,
          relatedJobs,
          latestJob,
          totalJobs: kind === "customer" ? countCustomerJobs(jobs, user.id) : countAssignedJobs(jobs, user.id),
          activeJobs,
          completedJobs
        };
      })
      .filter(({ user }) => roleFilter === "all" || user.role === roleFilter)
      .filter(({ user }) => activeFilter === "all" || (activeFilter === "active" ? user.is_active : !user.is_active))
      .filter(({ user }) => [user.full_name, user.phone, user.email, user.role].join(" ").toLowerCase().includes(keyword))
      .filter((row) => {
        if (activityFilter === "has_jobs") return row.totalJobs > 0;
        if (activityFilter === "no_jobs") return row.totalJobs === 0;
        if (activityFilter === "recent") return isRecent(row.latestJob?.created_at ?? row.user.updated_at);
        if (activityFilter === "busy") return row.activeJobs > 0;
        if (activityFilter === "available") return row.activeJobs === 0;
        return true;
      });
  }, [activeFilter, activityFilter, dataset, kind, roleFilter, search]);

  const totalPages = Math.max(1, Math.ceil(userRows.length / pageSize));
  const pagedRows = userRows.slice((page - 1) * pageSize, page * pageSize);
  const selectedRow = userRows.find((row) => row.user.id === selectedUserId) ?? userRows[0] ?? null;

  useEffect(() => {
    setPage(1);
  }, [activeFilter, activityFilter, kind, roleFilter, search]);

  useEffect(() => {
    if (!selectedUserId && userRows[0]) {
      setSelectedUserId(userRows[0].user.id);
      return;
    }

    if (selectedUserId && !userRows.some((row) => row.user.id === selectedUserId)) {
      setSelectedUserId(userRows[0]?.user.id ?? null);
    }
  }, [selectedUserId, userRows]);

  function startCreate() {
    setEditing("new");
    setForm(emptyForm(kind));
    setMessage("");
  }

  function startEdit(user: AdminUser) {
    setEditing(user);
    setForm({
      email: user.email ?? "",
      password: "",
      fullName: user.full_name,
      phone: user.phone ?? "",
      role: isManagedRole(user.role) ? user.role : roleOptions[kind][0],
      isActive: user.is_active
    });
    setMessage("");
  }

  function startVipToggle(user: AdminUser) {
    startEdit({
      ...user,
      role: user.role.includes("vip") ? (kind === "customer" ? "customer" : "technician") : (kind === "customer" ? "customer_vip" : "technician_vip")
    });
  }

  async function submitForm() {
    setBusy(true);
    setMessage("");
    try {
      if (editing === "new") {
        await createAdminManagedUser(form);
        setMessage("Đã tạo tài khoản mới.");
      } else if (editing) {
        await updateAdminManagedUser(editing.id, form);
        setMessage("Đã cập nhật tài khoản.");
      }
      setEditing(null);
      void onReload().catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : "Không tải lại được danh sách tài khoản.");
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không cập nhật được tài khoản.");
    } finally {
      setBusy(false);
    }
  }

  async function deactivate(user: AdminUser) {
    setBusy(true);
    setMessage("");
    try {
      await deactivateAdminManagedUser(user.id);
      setMessage("Đã khóa tài khoản.");
      setPendingDeactivate(null);
      void onReload().catch((error: unknown) => {
        setMessage(error instanceof Error ? error.message : "Không tải lại được danh sách tài khoản.");
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không khóa được tài khoản.");
    } finally {
      setBusy(false);
      setPendingDeactivate(null);
    }
  }

  function clearFilters() {
    onSearchChange("");
    setRoleFilter("all");
    setActiveFilter("all");
    setActivityFilter("all");
    setPageSize(10);
    setPage(1);
  }

  const activeFilterLabels = [
    search ? `Từ khóa: ${search}` : null,
    roleFilter !== "all" ? roleLabels[roleFilter] : null,
    activeFilter !== "all" ? (activeFilter === "active" ? "Đang hoạt động" : "Đã khóa") : null,
    activityFilter !== "all" ? activityLabel(activityFilter, kind) : null,
    pageSize !== 10 ? `${pageSize} / trang` : null
  ].filter((label): label is string => Boolean(label));

  return (
    <>
      <section className="mt-4 admin-toolbar">
        <div className="grid gap-2.5 xl:grid-cols-[1.15fr_0.68fr_0.68fr_0.74fr_auto_auto]">
          <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
              placeholder={kind === "customer" ? "Tìm tên, số điện thoại, email khách..." : "Tìm tên, số điện thoại, email nhân viên..."}
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
            />
          </label>
          <AdminSelect
            value={roleFilter}
            onChange={(value) => setRoleFilter(value as UserRole | "all")}
            options={[{ label: "Tất cả cấp", value: "all" }, ...roleOptions[kind].map((role) => ({ label: roleLabels[role], value: role }))]}
          />
          <AdminSelect
            value={activeFilter}
            onChange={(value) => setActiveFilter(value as ActiveFilter)}
            options={[
              { label: "Tất cả trạng thái", value: "all" },
              { label: "Đang hoạt động", value: "active" },
              { label: "Đã khóa", value: "inactive" }
            ]}
          />
          <AdminSelect
            value={activityFilter}
            onChange={(value) => setActivityFilter(value as ActivityFilter)}
            options={[
              { label: "Tất cả hoạt động", value: "all" },
              { label: "Có job", value: "has_jobs" },
              { label: "Chưa có job", value: "no_jobs" },
              { label: "Hoạt động gần đây", value: "recent" },
              ...(kind === "technician"
                ? [
                    { label: "Đang có việc", value: "busy" },
                    { label: "Đang rảnh", value: "available" }
                  ]
                : [])
            ]}
          />
          <AdminSelect
            value={pageSize}
            onChange={(value) => setPageSize(Number(value))}
            options={[
              { label: "10 / trang", value: "10" },
              { label: "20 / trang", value: "20" },
              { label: "50 / trang", value: "50" }
            ]}
          />
          <button className="premium-button" type="button" onClick={startCreate}>
            <Plus className="h-4 w-4" />
            Thêm tài khoản
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {activeFilterLabels.length > 0 ? activeFilterLabels.map((label) => <span key={label} className="admin-chip bg-blue-50 text-blue-700 ring-blue-100">{label}</span>) : <span className="text-sm font-medium text-slate-500">Đang hiển thị toàn bộ tài khoản phù hợp.</span>}
          </div>
          <button className="secondary-button min-h-10 px-3 py-2 text-sm" type="button" onClick={clearFilters}>Xóa lọc</button>
        </div>
      </section>

      {message ? <p className="mt-3 rounded-xl bg-cyan-50 p-3 text-sm font-semibold text-cyan-800">{message}</p> : null}
      {refreshing && dataset ? (
        <p className="mt-3 rounded-xl border border-blue-100 bg-blue-50/80 px-3 py-2 text-xs font-semibold text-blue-700">
          Đang cập nhật danh sách, dữ liệu hiện tại vẫn được giữ để thao tác không bị gián đoạn.
        </p>
      ) : null}

      <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0">
          {!dataset ? (
            <div className="grid gap-3">
              {Array.from({ length: 6 }).map((_, index) => <div key={index} className="skeleton-shimmer h-20 rounded-[1.15rem] bg-white shadow-sm" />)}
            </div>
          ) : userRows.length === 0 ? (
            <div className="admin-panel grid min-h-56 place-items-center text-center">
              <div>
                <UserRound className="mx-auto h-10 w-10 text-slate-400" />
                <h2 className="mt-4 text-xl font-semibold text-slate-950">Không có tài khoản phù hợp</h2>
                <p className="mt-2 text-sm text-slate-500">Thử đổi bộ lọc hoặc xóa lọc để xem lại danh sách.</p>
              </div>
            </div>
          ) : (
            <>
              <div className="hidden overflow-hidden rounded-[1.15rem] border border-slate-200 bg-white shadow-sm xl:block">
                <table className="w-full text-left text-sm">
                  <thead className="sticky top-0 z-10 bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                    <tr>
                      <th className="px-3 py-3">Tài khoản</th>
                      <th className="px-3 py-3">Liên hệ</th>
                  <th className="px-3 py-3">{kind === "customer" ? "Tổng job" : "Khối lượng việc"}</th>
                      <th className="px-3 py-3">Gần đây</th>
                      <th className="px-3 py-3">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedRows.map((row) => (
                      <tr
                        key={row.user.id}
                        className={`admin-row cursor-pointer ${selectedRow?.user.id === row.user.id ? "bg-blue-50/80 shadow-[inset_3px_0_0_#2563EB]" : ""}`}
                        onClick={() => setSelectedUserId(row.user.id)}
                      >
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-3">
                            <AvatarInitial name={row.user.full_name} />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-950">{row.user.full_name}</p>
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                <RoleBadge role={row.user.role} />
                                {row.user.role.includes("vip") ? <VipBadge /> : null}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-medium text-slate-800">{row.user.phone ?? "Chưa có SĐT"}</p>
                          <p className="mt-1 max-w-48 truncate text-slate-500">{row.user.email ?? "Chưa có email"}</p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="font-semibold text-slate-950">{row.totalJobs} job</p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">{kind === "customer" ? `${row.completedJobs} hoàn thành` : `${row.activeJobs} đang xử lý`}</p>
                        </td>
                        <td className="px-3 py-3">
                          <p className="max-w-48 truncate font-medium text-slate-800">{row.latestJob?.title ?? "Chưa có job"}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-400">{formatDate(row.latestJob?.created_at ?? row.user.updated_at)}</p>
                        </td>
                        <td className="px-3 py-3"><AccountStatus active={row.user.is_active} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 xl:hidden">
                {pagedRows.map((row) => (
                  <button
                    key={row.user.id}
                    className={`premium-card p-3.5 text-left ${selectedRow?.user.id === row.user.id ? "border-blue-300 bg-blue-50/70 ring-2 ring-blue-500/10" : ""}`}
                    type="button"
                    onClick={() => setSelectedUserId(row.user.id)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <AvatarInitial name={row.user.full_name} />
                        <div className="min-w-0">
                          <h2 className="truncate text-base font-semibold text-slate-950">{row.user.full_name}</h2>
                          <p className="mt-1 text-sm text-slate-500">{row.user.phone ?? row.user.email ?? "Chưa có liên hệ"}</p>
                        </div>
                      </div>
                      <AccountStatus active={row.user.is_active} />
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <RoleBadge role={row.user.role} />
                      {row.user.role.includes("vip") ? <VipBadge /> : null}
                      <span className="admin-chip bg-slate-50 text-slate-700 ring-slate-200">{row.totalJobs} job</span>
                      {kind === "technician" ? <span className="admin-chip bg-cyan-50 text-cyan-700 ring-cyan-100">{row.activeJobs} đang xử lý</span> : null}
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}

          <Pagination page={page} pageSize={pageSize} total={userRows.length} totalPages={totalPages} onPageChange={setPage} />
        </div>

        <aside className="admin-panel h-fit xl:sticky xl:top-5">
          {selectedRow ? (
            <UserDetailPanel
              busy={busy}
              kind={kind}
              row={selectedRow}
              onDeactivate={setPendingDeactivate}
              onEdit={startEdit}
              onVipToggle={startVipToggle}
            />
          ) : (
            <div className="grid min-h-80 place-items-center text-center">
              <div>
                <Eye className="mx-auto h-10 w-10 text-slate-400" />
                <h2 className="mt-4 text-xl font-semibold text-slate-950">Chọn tài khoản</h2>
                <p className="mt-2 text-sm text-slate-500">Thông tin chi tiết và thao tác nhanh sẽ hiển thị ở đây.</p>
              </div>
            </div>
          )}
        </aside>
      </section>

      {editing ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-[1.35rem] bg-white p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">{editing === "new" ? "Thêm tài khoản" : "Sửa tài khoản"}</h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">Quản lý tên, email, số điện thoại, cấp VIP và trạng thái hoạt động.</p>
              </div>
              <button className="secondary-button min-h-10 px-3 py-2" type="button" onClick={() => setEditing(null)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm font-bold text-slate-700">
                Họ tên
                <input className="premium-input mt-2" value={form.fullName} onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))} />
              </label>
              <label className="text-sm font-bold text-slate-700">
                Số điện thoại
                <input className="premium-input mt-2" value={form.phone ?? ""} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} />
              </label>
              <label className="text-sm font-bold text-slate-700">
                Email
                <input className="premium-input mt-2" type="email" value={form.email ?? ""} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
              </label>
              <label className="text-sm font-bold text-slate-700">
                Mật khẩu {editing === "new" ? "" : "mới nếu cần đổi"}
                <input className="premium-input mt-2" type="password" value={form.password ?? ""} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
              </label>
              <label className="text-sm font-bold text-slate-700">
                Cấp tài khoản
                <AdminSelect
                  className="mt-2"
                  value={form.role}
                  onChange={(value) => setForm((current) => ({ ...current, role: value as UserRole }))}
                  options={roleOptions[kind].map((role) => ({ label: roleLabels[role], value: role }))}
                />
              </label>
              <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-bold text-slate-700">
                <input checked={form.isActive} className="h-5 w-5 accent-[#2563EB]" type="checkbox" onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))} />
                Tài khoản đang hoạt động
              </label>
            </div>
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button className="secondary-button" disabled={busy} type="button" onClick={() => setEditing(null)}>Hủy</button>
              <button className="premium-button" disabled={busy} type="button" onClick={submitForm}>
                <Save className="h-5 w-5" />
                Lưu tài khoản
              </button>
            </div>
          </div>
        </div>
      ) : null}
      <AdminConfirmDialog
        danger
        confirmLabel="Khóa tài khoản"
        description={`Tài khoản ${pendingDeactivate?.full_name ?? ""} sẽ bị chuyển sang trạng thái không hoạt động. Lịch sử job và dữ liệu vận hành vẫn được giữ lại.`}
        icon={<Lock className="h-5 w-5" />}
        loading={busy}
        open={Boolean(pendingDeactivate)}
        title="Xác nhận khóa tài khoản"
        onCancel={() => setPendingDeactivate(null)}
        onConfirm={() => {
          if (pendingDeactivate) {
            void deactivate(pendingDeactivate);
          }
        }}
      />
    </>
  );
}

function activityLabel(filter: ActivityFilter, kind: AccountKind): string {
  const labels: Record<ActivityFilter, string> = {
    all: "Tất cả",
    has_jobs: "Có job",
    no_jobs: "Chưa có job",
    recent: "Hoạt động gần đây",
    busy: kind === "technician" ? "Đang có việc" : "Có job mở",
    available: kind === "technician" ? "Đang rảnh" : "Không có job mở"
  };
  return labels[filter];
}

function AvatarInitial({ name }: { name: string }) {
  return (
    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#2563EB] text-base font-semibold text-white shadow-[0_10px_22px_rgba(37,99,235,0.18)]">
      {name.slice(0, 1).toUpperCase() || "?"}
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  const isVip = role.includes("vip");
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${isVip ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-600"}`}>
      {roleLabels[role]}
    </span>
  );
}

function VipBadge() {
  return <span className="admin-chip bg-amber-50 text-amber-700 ring-amber-100"><Star className="h-3 w-3" />VIP</span>;
}

function AccountStatus({ active }: { active: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
      <ShieldCheck className="h-3.5 w-3.5" />
      {active ? "Hoạt động" : "Đã khóa"}
    </span>
  );
}

function UserDetailPanel({
  busy,
  kind,
  row,
  onDeactivate,
  onEdit,
  onVipToggle
}: {
  busy: boolean;
  kind: AccountKind;
  row: {
    user: AdminUser;
    relatedJobs: Job[];
    latestJob: Job | null;
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
  };
  onDeactivate: (user: AdminUser) => void;
  onEdit: (user: AdminUser) => void;
  onVipToggle: (user: AdminUser) => void;
}) {
  const recentJobs = row.relatedJobs
    .slice()
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <AvatarInitial name={row.user.full_name} />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-600">{kind === "customer" ? "Customer profile" : "Technician profile"}</p>
            <h2 className="mt-1.5 truncate text-xl font-semibold text-slate-950">{row.user.full_name}</h2>
          </div>
        </div>
        <AccountStatus active={row.user.is_active} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <RoleBadge role={row.user.role} />
        {row.user.role.includes("vip") ? <VipBadge /> : null}
        <span className="admin-chip bg-blue-50 text-blue-700 ring-blue-100">{row.totalJobs} job</span>
      </div>

      <div className="mt-4 grid gap-2.5 text-sm">
        <InfoBox icon={Phone} label="Số điện thoại" value={row.user.phone ?? "Chưa có số điện thoại"} />
        <InfoBox icon={Mail} label="Email" value={row.user.email ?? "Chưa có email"} />
        <InfoBox icon={CalendarDays} label="Cập nhật gần nhất" value={formatDate(row.user.updated_at)} />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2.5">
        <MetricBox label="Tổng job" value={row.totalJobs} />
        <MetricBox label={kind === "customer" ? "Hoàn thành" : "Đang xử lý"} value={kind === "customer" ? row.completedJobs : row.activeJobs} />
        <MetricBox label="Gần đây" value={row.latestJob ? formatDate(row.latestJob.created_at).slice(0, 5) : "--"} compact />
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-1">
        <button className="secondary-button justify-start min-h-10 px-3 py-2 text-sm" type="button" onClick={() => onEdit(row.user)}>
          <Edit3 className="h-4 w-4" />
          Sửa hồ sơ
        </button>
        <button className="secondary-button justify-start min-h-10 px-3 py-2 text-sm" type="button" onClick={() => onVipToggle(row.user)}>
          <Star className="h-4 w-4 text-amber-500" />
          {row.user.role.includes("vip") ? "Gỡ VIP" : "Cấp VIP"}
        </button>
        <button className="secondary-button justify-start min-h-10 px-3 py-2 text-sm text-rose-700" disabled={busy || !row.user.is_active} type="button" onClick={() => onDeactivate(row.user)}>
          <Lock className="h-4 w-4" />
          Khóa tài khoản
        </button>
      </div>

      <section className="mt-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-950">{kind === "customer" ? "Job gần đây" : "Việc được giao"}</h3>
          <BriefcaseBusiness className="h-4 w-4 text-slate-400" />
        </div>
        <div className="mt-3 space-y-2.5">
          {recentJobs.length > 0 ? recentJobs.map((job) => (
            <div key={job.id} className="rounded-xl bg-slate-50/80 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-950">{job.tracking_code ?? job.id.slice(0, 8)} · {job.title}</p>
                  <p className="mt-1 truncate text-xs font-medium text-slate-500">{SERVICE_TYPE_LABELS[job.service_type]}</p>
                </div>
                <span className="shrink-0 rounded-full border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-600">{JOB_STATUS_LABELS[job.status]}</span>
              </div>
              <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <Activity className="h-3.5 w-3.5" />
                {formatDate(job.created_at)}
              </p>
            </div>
          )) : (
            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm font-semibold text-slate-500">
              Chưa có job liên quan.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function InfoBox({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-2.5">
      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </p>
      <p className="mt-1 truncate font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function MetricBox({ compact = false, label, value }: { compact?: boolean; label: string; value: number | string }) {
  return (
    <div className="rounded-xl bg-blue-50/55 p-3">
      <p className={`${compact ? "text-base" : "text-xl"} font-semibold text-slate-950`}>{value}</p>
      <p className="mt-1 text-[11px] font-semibold text-slate-500">{label}</p>
    </div>
  );
}

function Pagination({
  onPageChange,
  page,
  pageSize,
  total,
  totalPages
}: {
  onPageChange: (page: number) => void;
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}) {
  if (total <= pageSize) {
    return <p className="mt-4 text-sm font-semibold text-slate-500">{total} tài khoản</p>;
  }

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">Trang {page}/{totalPages} · {total} tài khoản</p>
      <div className="flex gap-2">
        <button className="secondary-button min-h-10 px-3 py-2 text-sm" disabled={page <= 1} onClick={() => onPageChange(Math.max(1, page - 1))} type="button">Trước</button>
        <button className="secondary-button min-h-10 px-3 py-2 text-sm" disabled={page >= totalPages} onClick={() => onPageChange(Math.min(totalPages, page + 1))} type="button">Sau</button>
      </div>
    </div>
  );
}
