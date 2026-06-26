"use client";

import { isCustomerRole, SERVICE_CATALOG, type Job } from "@cnl/shared";
import { ArrowRight, BriefcaseBusiness, Clock3, Headphones, Plus, ShieldCheck, Sparkles, Wrench } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { JobCard } from "../../components/JobCard";
import { ProductShell } from "../../components/ProductShell";
import { RoleGuard } from "../../components/RoleGuard";
import { StatusBadge } from "../../components/StatusBadge";
import { PwaInstallCard } from "../../components/pwa/PwaInstallCard";
import { AppButton, AppCard, AppEmptyState, AppPageContainer, AppSkeleton } from "../../components/ui/AppPrimitives";
import { fetchCustomerJobs, getCustomerStats } from "../../lib/jobs";

function isActiveJob(job: Job) {
  return job.status === "pending" || job.status === "accepted" || job.status === "in_progress";
}

export default function CustomerHomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCustomerJobs()
      .then(setJobs)
      .catch((nextError: Error) => setError(nextError.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => getCustomerStats(jobs), [jobs]);
  const activeJobs = useMemo(() => jobs.filter(isActiveJob), [jobs]);
  const currentJob = activeJobs[0] ?? jobs[0];
  const recentJobs = jobs.slice(0, 3);
  const shortcuts = SERVICE_CATALOG.slice(0, 6);

  return (
    <RoleGuard allow={isCustomerRole}>
      {(profile) => (
        <ProductShell profile={profile}>
          <AppPageContainer>
            <section className="relative overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-white via-sky-50/90 to-cyan-50 p-5 shadow-[0_20px_60px_rgba(37,99,235,0.10)] sm:p-7">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_8%,rgba(6,182,212,0.30),transparent_22rem)]" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/85 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
                  <Sparkles className="h-4 w-4 text-cyan-600" />
                  {profile.role === "customer_vip" ? "Ưu tiên VIP" : "Trung tâm dịch vụ"}
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
                  Xin chào, {profile.fullName || "khách hàng"}.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                  Đặt lịch, báo lỗi và theo dõi kỹ thuật viên trong một ứng dụng nhẹ, rõ ràng, dùng tốt trên điện thoại.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <Link href="/customer/jobs/new">
                    <AppButton className="w-full justify-between" size="lg">
                      <span className="inline-flex items-center gap-2"><Plus className="h-5 w-5" /> Tạo yêu cầu</span>
                      <ArrowRight className="h-5 w-5" />
                    </AppButton>
                  </Link>
                  <Link href="/warranty">
                    <AppButton className="w-full justify-between" size="lg" variant="secondary">
                      <span className="inline-flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-600" /> Bảo hành</span>
                      <ArrowRight className="h-5 w-5" />
                    </AppButton>
                  </Link>
                </div>
              </div>
            </section>

            <section className="mt-5 grid grid-cols-3 gap-3">
              {[
                { label: "Đang xử lý", value: activeJobs.length, icon: Clock3 },
                { label: "Tổng yêu cầu", value: stats.total, icon: BriefcaseBusiness },
                { label: "Hoàn thành", value: stats.completed, icon: ShieldCheck }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <AppCard key={item.label} className="p-4">
                    <Icon className="h-5 w-5 text-cyan-600" />
                    <p className="mt-3 text-2xl font-semibold text-slate-950">{item.value}</p>
                    <p className="mt-1 text-xs font-medium leading-5 text-slate-500">{item.label}</p>
                  </AppCard>
                );
              })}
            </section>

            <PwaInstallCard />

            <section className="mt-6">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-950">Yêu cầu đang theo dõi</h2>
                <Link className="text-sm font-semibold text-blue-700" href="/customer/jobs">Tất cả</Link>
              </div>
              {error ? <p className="mb-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}
              {loading ? (
                <AppSkeleton className="h-40" />
              ) : currentJob ? (
                <AppCard className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">Current progress</p>
                      <h3 className="mt-2 text-lg font-semibold text-slate-950">{currentJob.title}</h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{currentJob.description}</p>
                    </div>
                    <StatusBadge status={currentJob.status} />
                  </div>
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {["pending", "accepted", "in_progress", "completed"].map((status, index) => {
                      const currentIndex = ["pending", "accepted", "in_progress", "completed"].indexOf(currentJob.status);
                      const active = index <= Math.max(0, currentIndex);
                      return <span key={status} className={`h-2 rounded-full ${active ? "bg-blue-600" : "bg-slate-100"}`} />;
                    })}
                  </div>
                  <Link className="secondary-button mt-5 w-full justify-between" href={`/customer/jobs/${currentJob.id}`}>
                    Xem chi tiết
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </AppCard>
              ) : (
                <AppEmptyState
                  icon={Wrench}
                  title="Chưa có yêu cầu nào"
                  description="Tạo yêu cầu đầu tiên để trung tâm tiếp nhận và điều phối kỹ thuật viên phù hợp."
                  action={<Link className="premium-button" href="/customer/jobs/new"><Plus className="h-5 w-5" /> Tạo yêu cầu</Link>}
                />
              )}
            </section>

            <section className="mt-7">
              <h2 className="text-xl font-semibold text-slate-950">Dịch vụ nhanh</h2>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {shortcuts.map((service) => (
                  <Link key={service.slug} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition active:scale-[0.98] hover:border-blue-200 hover:bg-blue-50" href={`/customer/jobs/new?service=${service.slug}`}>
                    <Wrench className="h-5 w-5 text-cyan-600" />
                    <p className="mt-3 text-sm font-semibold leading-5 text-slate-950">{service.shortTitle}</p>
                  </Link>
                ))}
              </div>
            </section>

            <section className="mt-7">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-slate-950">Gần đây</h2>
                <Link className="text-sm font-semibold text-blue-700" href="/customer/jobs">Xem tất cả</Link>
              </div>
              {loading ? (
                <div className="grid gap-3">{[1, 2].map((item) => <AppSkeleton key={item} className="h-36" />)}</div>
              ) : recentJobs.length > 0 ? (
                <div className="grid gap-3">{recentJobs.map((job) => <JobCard key={job.id} job={job} />)}</div>
              ) : (
                <AppCard className="flex items-center gap-3 p-4">
                  <Headphones className="h-6 w-6 text-cyan-600" />
                  <p className="text-sm leading-6 text-slate-600">Hotline và bảo hành luôn sẵn sàng khi bạn cần hỗ trợ.</p>
                </AppCard>
              )}
            </section>
          </AppPageContainer>
        </ProductShell>
      )}
    </RoleGuard>
  );
}
