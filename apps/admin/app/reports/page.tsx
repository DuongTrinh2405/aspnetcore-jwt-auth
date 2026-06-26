"use client";

import { JOB_STATUS_LABELS, SERVICE_TYPE_LABELS, isAdminRole, type Job, type JobStatus, type ServiceType } from "@cnl/shared";
import { BarChart3, Crown, RefreshCcw, TrendingUp, UsersRound, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AdminGuard } from "../../components/AdminGuard";
import { AdminShell } from "../../components/AdminShell";
import { countJobsByStatus, fetchAdminDataset, getJobPaymentStatus, type AdminDataset } from "../../lib/admin";

type ReportPeriod = "week" | "month" | "quarter" | "six_months" | "year";

const periodLabels: Record<ReportPeriod, string> = {
  week: "Tuần",
  month: "Tháng",
  quarter: "3 tháng",
  six_months: "6 tháng",
  year: "Năm"
};

const statusColors: Partial<Record<JobStatus, string>> = {
  pending: "bg-amber-400",
  accepted: "bg-cyan-500",
  in_progress: "bg-blue-500",
  completed: "bg-emerald-500",
  cancelled: "bg-rose-500"
};

function getPeriodStart(period: ReportPeriod): Date {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  if (period === "week") start.setDate(start.getDate() - 6);
  if (period === "month") start.setMonth(start.getMonth() - 1);
  if (period === "quarter") start.setMonth(start.getMonth() - 3);
  if (period === "six_months") start.setMonth(start.getMonth() - 6);
  if (period === "year") start.setFullYear(start.getFullYear() - 1);
  return start;
}

function countByService(jobs: Job[]): Array<{ service: ServiceType; count: number }> {
  const map = jobs.reduce((acc, job) => {
    acc[job.service_type] = (acc[job.service_type] ?? 0) + 1;
    return acc;
  }, {} as Record<ServiceType, number>);

  return Object.entries(map)
    .map(([service, count]) => ({ service: service as ServiceType, count }))
    .sort((a, b) => b.count - a.count);
}

export default function AdminReportsPage() {
  const [dataset, setDataset] = useState<AdminDataset | null>(null);
  const [period, setPeriod] = useState<ReportPeriod>("month");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const loadRequestRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = loadRequestRef.current + 1;
    loadRequestRef.current = requestId;
    setLoading(true);
    setError("");
    try {
      const nextDataset = await fetchAdminDataset();
      if (loadRequestRef.current === requestId) {
        setDataset(nextDataset);
      }
    } catch (nextError) {
      if (loadRequestRef.current === requestId) {
        setError(nextError instanceof Error ? nextError.message : "Không tải được báo cáo.");
      }
    } finally {
      if (loadRequestRef.current === requestId) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredJobs = useMemo(() => {
    const start = getPeriodStart(period);
    return (dataset?.jobs ?? []).filter((job) => new Date(job.created_at) >= start);
  }, [dataset, period]);
  const statusRows = useMemo(() => countJobsByStatus(filteredJobs), [filteredJobs]);
  const serviceRows = useMemo(() => countByService(filteredJobs), [filteredJobs]);
  const maxServiceCount = Math.max(1, ...serviceRows.map((row) => row.count));
  const completedJobs = filteredJobs.filter((job) => job.status === "completed").length;
  const cancelledJobs = filteredJobs.filter((job) => job.status === "cancelled").length;
  const completionRate = filteredJobs.length > 0 ? Math.round((completedJobs / filteredJobs.length) * 100) : 0;

  return (
    <AdminGuard allow={isAdminRole}>
      {(profile) => (
        <AdminShell profile={profile}>
          <main className="admin-page">
            <section className="admin-panel">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Reports</p>
                  <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Báo cáo vận hành</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Xem tình hình job theo tuần, tháng, 3 tháng, 6 tháng và năm. Ưu tiên biểu đồ dễ đọc trên mobile.
                  </p>
                </div>
                <button className="secondary-button px-4 text-sm" disabled={loading} onClick={load} type="button">
                  <RefreshCcw className={`h-4 w-4 text-blue-600 ${loading ? "animate-spin" : ""}`} />
                  Làm mới
                </button>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                {(Object.keys(periodLabels) as ReportPeriod[]).map((item) => (
                  <button
                    key={item}
                    className={`min-h-10 rounded-xl px-3.5 text-sm font-semibold transition duration-200 active:scale-[0.98] ${
                      period === item ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-50 text-slate-700 hover:bg-blue-50"
                    }`}
                    type="button"
                    onClick={() => setPeriod(item)}
                  >
                    {periodLabels[item]}
                  </button>
                ))}
              </div>
            </section>

            {error ? <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p> : null}
            {loading && dataset ? (
              <p className="mt-3 rounded-xl border border-blue-100 bg-blue-50/80 px-3 py-2 text-xs font-semibold text-blue-700">
                Đang cập nhật báo cáo, biểu đồ hiện tại vẫn được giữ nguyên.
              </p>
            ) : null}

            <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <ReportKpi label="Tổng job" value={filteredJobs.length} icon={BarChart3} tone="blue" />
              <ReportKpi label="Tỷ lệ hoàn thành" value={`${completionRate}%`} icon={TrendingUp} tone="green" />
              <ReportKpi label="Job VIP" value={filteredJobs.filter((job) => job.is_vip).length} icon={Crown} tone="amber" />
              <ReportKpi label="Chưa thanh toán" value={filteredJobs.filter((job) => job.status === "completed" && getJobPaymentStatus(job) === "unpaid").length} icon={UsersRound} tone="rose" />
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.72fr]">
              <div className="admin-panel">
                <h2 className="text-lg font-semibold text-slate-950">Tóm tắt kỳ báo cáo</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <SummaryBox label="Hoàn thành" value={completedJobs} tone="green" />
                  <SummaryBox label="Đang chờ" value={statusRows.pending ?? 0} tone="amber" />
                  <SummaryBox label="Đã hủy" value={cancelledJobs} tone="rose" />
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-500">
                  Dữ liệu được lọc theo kỳ đang chọn. Các biểu đồ dùng dữ liệu Supabase hiện có, không gọi thêm API nhạy cảm.
                </p>
              </div>

              <div className="admin-panel">
                <h2 className="text-lg font-semibold text-slate-950">Nhân sự</h2>
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <PeopleBox label="Khách hàng" value={(dataset?.stats.customers ?? 0) + (dataset?.stats.vipCustomers ?? 0)} icon={UsersRound} />
                  <PeopleBox label="Nhân viên" value={(dataset?.stats.technicians ?? 0) + (dataset?.stats.vipTechnicians ?? 0)} icon={Wrench} />
                </div>
              </div>
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-2">
              <ChartCard title="Trạng thái job" description="Phân bổ trong kỳ báo cáo." icon={BarChart3}>
                {dataset ? (
                  Object.entries(statusRows).map(([status, count]) => {
                    const percent = filteredJobs.length > 0 ? Math.round((count / filteredJobs.length) * 100) : 0;
                    return (
                      <BarRow
                        key={status}
                        label={JOB_STATUS_LABELS[status as JobStatus]}
                        value={`${percent}%`}
                        barClassName={statusColors[status as JobStatus] ?? "bg-slate-400"}
                        percent={percent}
                      />
                    );
                  })
                ) : (
                  <LoadingBars />
                )}
              </ChartCard>

              <ChartCard title="Nhu cầu theo dịch vụ" description="Dịch vụ tạo nhiều job nhất trong kỳ." icon={BarChart3}>
                {serviceRows.length > 0 ? (
                  serviceRows.map((row) => (
                    <BarRow
                      key={row.service}
                      label={SERVICE_TYPE_LABELS[row.service]}
                      value={`${row.count} job`}
                      barClassName="bg-blue-600"
                      percent={Math.round((row.count / maxServiceCount) * 100)}
                    />
                  ))
                ) : (
                  <p className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">Chưa có dữ liệu trong kỳ này.</p>
                )}
              </ChartCard>
            </section>
          </main>
        </AdminShell>
      )}
    </AdminGuard>
  );
}

function ReportKpi({ icon: Icon, label, tone, value }: { icon: LucideIcon; label: string; tone: "blue" | "green" | "amber" | "rose"; value: number | string }) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700"
  }[tone];

  return (
    <div className="admin-kpi">
      <span className={`grid h-9 w-9 place-items-center rounded-xl ${toneClass}`}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-sm font-semibold text-slate-500">{label}</p>
    </div>
  );
}

function SummaryBox({ label, tone, value }: { label: string; tone: "green" | "amber" | "rose"; value: number }) {
  const toneClass = {
    green: "bg-emerald-50 text-emerald-900",
    amber: "bg-amber-50 text-amber-900",
    rose: "bg-rose-50 text-rose-900"
  }[tone];

  return (
    <div className={`rounded-xl p-3 ${toneClass}`}>
      <p className="text-sm font-semibold opacity-80">{label}</p>
      <p className="mt-1.5 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function PeopleBox({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <Icon className="h-5 w-5 text-blue-600" />
      <p className="mt-2 text-xl font-semibold text-slate-950">{value}</p>
      <p className="text-xs font-semibold text-slate-500">{label}</p>
    </div>
  );
}

function ChartCard({ children, description, icon: Icon, title }: { children: React.ReactNode; description: string; icon: LucideIcon; title: string }) {
  return (
    <div className="admin-panel">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <Icon className="h-5 w-5 text-blue-600" />
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function BarRow({ barClassName, label, percent, value }: { barClassName: string; label: string; percent: number; value: string }) {
  return (
    <div>
      <div className="mb-2 flex justify-between gap-4 text-sm font-semibold text-slate-600">
        <span className="line-clamp-1">{label}</span>
        <span className="shrink-0">{value}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${barClassName}`} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function LoadingBars() {
  return (
    <>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="skeleton-shimmer h-10 rounded-xl bg-slate-100" />
      ))}
    </>
  );
}
