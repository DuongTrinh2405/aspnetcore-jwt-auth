"use client";

import {
  JOB_STATUS_LABELS,
  SERVICE_TYPE_LABELS,
  isAdminRole,
  type Job,
  type JobStatus
} from "@cnl/shared";
import {
  Activity,
  Bell,
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  Crown,
  ImageIcon,
  Plus,
  TrendingUp,
  WalletCards,
  UsersRound,
  Wrench
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AdminGuard } from "../../components/AdminGuard";
import { AdminShell } from "../../components/AdminShell";
import { countJobsByStatus, fetchAdminDataset, getRecentJobs, type AdminDataset } from "../../lib/admin";

const statusColors: Partial<Record<JobStatus, string>> = {
  pending: "bg-amber-400",
  accepted: "bg-cyan-500",
  in_progress: "bg-blue-500",
  completed: "bg-emerald-500",
  cancelled: "bg-rose-500"
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export default function DashboardPage() {
  const [dataset, setDataset] = useState<AdminDataset | null>(null);
  const [error, setError] = useState("");
  const loadRequestRef = useRef(0);

  useEffect(() => {
    const requestId = loadRequestRef.current + 1;
    loadRequestRef.current = requestId;
    fetchAdminDataset()
      .then((nextDataset) => {
        if (loadRequestRef.current === requestId) {
          setDataset(nextDataset);
        }
      })
      .catch((nextError: Error) => {
        if (loadRequestRef.current === requestId) {
          setError(nextError.message);
        }
      });
  }, []);

  return (
    <AdminGuard allow={isAdminRole}>
      {(profile) => (
        <AdminShell profile={profile}>
          <main className="admin-page">
            <section className="admin-panel">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Operations center</p>
                  <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                    Điều phối dịch vụ kỹ thuật
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Xin chào {profile.fullName || "Admin"}. Theo dõi job, phân công kỹ thuật viên, kiểm tra ảnh và báo cáo vận hành trong một giao diện gọn hơn.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:flex">
                  <QuickAction href="/jobs?status=pending" icon={Clock3} label="Job đang chờ" />
                  <QuickAction href="/jobs?priority=urgent" icon={Crown} label="Job khẩn" />
                  <QuickAction href="/reports" icon={TrendingUp} label="Báo cáo" />
                </div>
              </div>
            </section>

            {error ? <p className="mt-4 rounded-2xl bg-rose-50 p-4 font-semibold text-rose-700">{error}</p> : null}

            <section className="mt-4 grid gap-3 xl:grid-cols-3">
              <AttentionCard
                description="Cần xem thông tin, ảnh hiện trạng và phân công người xử lý."
                href="/jobs?status=pending"
                icon={Clock3}
                label="Cần tiếp nhận"
                value={dataset?.stats.pendingJobs ?? 0}
              />
              <AttentionCard
                description="Nên ưu tiên điều phối trước để tránh trễ lịch khách hàng."
                href="/jobs?priority=urgent"
                icon={Crown}
                label="Job khẩn"
                value={dataset?.stats.urgentJobs ?? 0}
              />
              <AttentionCard
                description="Hoàn tất đối soát sau khi job đã xử lý xong."
                href="/jobs?status=completed&payment=unpaid"
                icon={WalletCards}
                label="Chưa thanh toán"
                value={dataset?.stats.unpaidCompletedJobs ?? 0}
              />
            </section>

            <section className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <KpiCard label="Tổng job" value={dataset?.stats.totalJobs ?? 0} icon={BriefcaseBusiness} tone="blue" />
              <KpiCard label="Đang chờ" value={dataset?.stats.pendingJobs ?? 0} icon={Clock3} tone="amber" />
              <KpiCard label="Đang xử lý" value={dataset?.stats.inProgressJobs ?? 0} icon={Wrench} tone="blue" />
              <KpiCard label="Hoàn thành" value={dataset?.stats.completedJobs ?? 0} icon={CheckCircle2} tone="green" />
              <KpiCard label="Chưa thanh toán" value={dataset?.stats.unpaidCompletedJobs ?? 0} icon={WalletCards} tone="rose" />
            </section>

            <section className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
              <MiniStat label="Hôm nay" value={dataset?.stats.jobsToday ?? 0} icon={TrendingUp} />
              <MiniStat label="Tuần này" value={dataset?.stats.jobsThisWeek ?? 0} icon={Activity} />
              <MiniStat label="Job khẩn" value={dataset?.stats.urgentJobs ?? 0} icon={Crown} />
              <MiniStat label="Có ảnh" value={dataset?.stats.jobsWithImages ?? 0} icon={ImageIcon} />
              <MiniStat label="Thông báo mới" value={dataset?.notifications.filter((item) => item.read_at === null).length ?? 0} icon={Bell} />
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.82fr]">
              <div className="admin-panel">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">Job pipeline</h2>
                    <p className="mt-1 text-sm text-slate-500">Tỷ trọng trạng thái của toàn bộ hệ thống.</p>
                  </div>
                  <Activity className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-4 space-y-3">
                  {dataset
                    ? Object.entries(countJobsByStatus(dataset.jobs)).map(([status, count]) => {
                        const percent = dataset.stats.totalJobs > 0 ? Math.round((count / dataset.stats.totalJobs) * 100) : 0;
                        return (
                          <div key={status}>
                            <div className="mb-2 flex justify-between text-sm font-semibold text-slate-600">
                              <span>{JOB_STATUS_LABELS[status as JobStatus]}</span>
                              <span>{count} job</span>
                            </div>
                            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                              <div className={`h-full rounded-full ${statusColors[status as JobStatus] ?? "bg-slate-400"}`} style={{ width: `${percent}%` }} />
                            </div>
                          </div>
                        );
                      })
                    : Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-10 animate-pulse rounded-2xl bg-slate-100" />)}
                </div>
              </div>

              <div className="admin-panel">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">Nhân sự</h2>
                    <p className="mt-1 text-sm text-slate-500">Tổng quan khách hàng và kỹ thuật viên.</p>
                  </div>
                  <UsersRound className="h-6 w-6 text-blue-600" />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2.5">
                  <WorkforceCard label="Khách thường" value={dataset?.stats.customers ?? 0} />
                  <WorkforceCard label="Khách VIP" value={dataset?.stats.vipCustomers ?? 0} />
                  <WorkforceCard label="Nhân viên" value={dataset?.stats.technicians ?? 0} />
                  <WorkforceCard label="NV VIP" value={dataset?.stats.vipTechnicians ?? 0} />
                </div>
              </div>
            </section>

            <section className="mt-4 grid gap-4 xl:grid-cols-[1fr_0.82fr]">
              <div className="admin-panel">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">Job mới nhất</h2>
                    <p className="mt-1 text-sm text-slate-500">5 yêu cầu gần nhất vừa vào hệ thống.</p>
                  </div>
                  <Link className="secondary-button min-h-10 px-4 py-2 text-sm" href="/jobs">
                    Xem job
                  </Link>
                </div>
                <div className="mt-4 grid gap-2.5">
                  {(dataset ? getRecentJobs(dataset.jobs) : []).map((job: Job) => (
                    <Link key={job.id} className="rounded-xl border border-slate-200 bg-white p-3 transition hover:border-blue-200 hover:bg-blue-50/40" href="/jobs">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold text-slate-950">{job.title}</h3>
                            {job.is_vip ? <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700">VIP</span> : null}
                          </div>
                          <p className="mt-1 text-sm text-slate-500">{SERVICE_TYPE_LABELS[job.service_type]} · {formatDate(job.created_at)}</p>
                        </div>
                        <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                          {JOB_STATUS_LABELS[job.status]}
                        </span>
                      </div>
                    </Link>
                  ))}
                  {dataset && getRecentJobs(dataset.jobs).length === 0 ? (
                    <p className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">Chưa có job mới.</p>
                  ) : null}
                </div>
              </div>

              <div className="admin-panel">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-950">Hoạt động gần đây</h2>
                    <p className="mt-1 text-sm text-slate-500">Thông báo vận hành mới.</p>
                  </div>
                  <Bell className="h-6 w-6 text-cyan-600" />
                </div>
                <div className="mt-4 grid gap-2.5">
                  {(dataset?.notifications ?? []).slice(0, 4).map((notification) => (
                    <div key={notification.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                      <div className="flex items-start gap-3">
                        <span className={`mt-1 h-2.5 w-2.5 rounded-full ${notification.read_at ? "bg-slate-300" : "bg-cyan-500"}`} />
                        <div>
                          <p className="font-semibold text-slate-950">{notification.title}</p>
                          <p className="mt-1 text-sm leading-5 text-slate-500">{notification.body}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {dataset && dataset.notifications.length === 0 ? (
                    <p className="rounded-2xl bg-slate-50 p-5 text-sm font-semibold text-slate-500">Chưa có thông báo vận hành.</p>
                  ) : null}
                </div>
              </div>
            </section>
          </main>
        </AdminShell>
      )}
    </AdminGuard>
  );
}

function QuickAction({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link className="secondary-button min-h-12 justify-start px-4 text-sm" href={href}>
      <Icon className="h-5 w-5 text-blue-600" />
      {label}
    </Link>
  );
}

function AttentionCard({ description, href, icon: Icon, label, value }: { description: string; href: string; icon: LucideIcon; label: string; value: number }) {
  return (
    <Link className="group rounded-2xl border border-blue-100 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-[0_18px_46px_rgba(37,99,235,0.12)]" href={href}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-50 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{description}</p>
    </Link>
  );
}

function KpiCard({ icon: Icon, label, tone, value }: { icon: LucideIcon; label: string; tone: "blue" | "amber" | "green" | "rose"; value: number }) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700",
    rose: "bg-rose-50 text-rose-700"
  }[tone];

  return (
    <div className="admin-kpi">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${toneClass}`}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/85 p-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate-500">{label}</p>
        <Icon className="h-5 w-5 text-cyan-600" />
      </div>
      <p className="mt-1.5 text-xl font-semibold text-slate-950">{value}</p>
    </div>
  );
}

function WorkforceCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-xl font-semibold text-slate-950">{value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-500">{label}</p>
    </div>
  );
}
