"use client";

import { isTechnicianRole, SERVICE_TYPE_LABELS, type Job } from "@cnl/shared";
import { ArrowRight, BriefcaseBusiness, Clock3, MapPinned, Navigation, Phone, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { RoleGuard } from "../../components/RoleGuard";
import { PriorityBadge, StatusBadge } from "../../components/StatusBadge";
import { TechnicianShell } from "../../components/TechnicianShell";
import { PwaInstallCard } from "../../components/pwa/PwaInstallCard";
import { AppCard, AppEmptyState, AppPageContainer, AppSkeleton } from "../../components/ui/AppPrimitives";
import { fetchAssignedJobs, fetchAvailableJobs } from "../../lib/technician";
import { formatRelativeSubmittedTime } from "../../lib/time";

export default function TechnicianHomePage() {
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [assignedJobs, setAssignedJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadRequestRef = useRef(0);

  useEffect(() => {
    async function load() {
      const requestId = loadRequestRef.current + 1;
      loadRequestRef.current = requestId;
      try {
        const [available, assigned] = await Promise.all([fetchAvailableJobs(), fetchAssignedJobs()]);
        if (loadRequestRef.current === requestId) {
          setAvailableJobs(available);
          setAssignedJobs(assigned);
        }
      } catch (nextError) {
        if (loadRequestRef.current === requestId) {
        setError(nextError instanceof Error ? nextError.message : "Không tải được dữ liệu kỹ thuật viên.");
        }
      } finally {
        if (loadRequestRef.current === requestId) {
          setLoading(false);
        }
      }
    }

    load();
  }, []);

  const activeJobs = useMemo(
    () => assignedJobs.filter((job) => job.status === "accepted" || job.status === "in_progress"),
    [assignedJobs]
  );
  const urgentJobs = useMemo(
    () => [...availableJobs, ...activeJobs].filter((job) => job.priority === "urgent" || job.priority === "high"),
    [activeJobs, availableJobs]
  );
  const focusJobs = urgentJobs.length > 0 ? urgentJobs : activeJobs.length > 0 ? activeJobs : availableJobs;

  return (
    <RoleGuard allow={isTechnicianRole}>
      {(profile) => (
        <TechnicianShell profile={profile}>
          <AppPageContainer className="max-w-4xl">
            <section className="relative overflow-hidden rounded-[1.75rem] border border-blue-100 bg-white p-5 shadow-[0_20px_70px_rgba(37,99,235,0.10)] sm:p-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_8%,rgba(59,130,246,0.16),transparent_18rem),radial-gradient(circle_at_92%_22%,rgba(6,182,212,0.16),transparent_16rem)]" />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Field service</p>
                    <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">
                      Xin chào, {profile.fullName || "kỹ thuật viên"}.
                    </h1>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                      Ưu tiên job gần nhất, xem vị trí, gọi khách và cập nhật tiến độ nhanh ngay tại hiện trường.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-blue-600 p-3 text-white shadow-lg shadow-blue-500/20">
                    <Navigation className="h-6 w-6" />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-3 gap-2">
                  <FieldStat icon={BriefcaseBusiness} label="Có thể nhận" value={loading ? "..." : availableJobs.length} tone="blue" />
                  <FieldStat icon={Clock3} label="Đang làm" value={loading ? "..." : activeJobs.length} tone="cyan" />
                  <FieldStat icon={ShieldAlert} label="Khẩn cấp" value={loading ? "..." : urgentJobs.length} tone="amber" />
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                  <Link className={primaryLinkClass} href="/technician/jobs">
                  Nhận việc
                      <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link className={secondaryLinkClass} href="/technician/jobs?tab=assigned">
                  Việc của tôi
                      <BriefcaseBusiness className="h-5 w-5" />
                  </Link>
                  <Link className={secondaryLinkClass} href="/technician/map">
                      Bản đồ
                      <MapPinned className="h-5 w-5" />
                  </Link>
                </div>
              </div>
            </section>

            <PwaInstallCard />

            <section className="mt-6">
              <div className="mb-3 flex items-end justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950">Cần xử lý trước</h2>
              <p className="mt-1 text-sm text-slate-500">Ưu tiên việc khẩn cấp, sau đó là việc đang phụ trách.</p>
                </div>
                <Link className="text-sm font-semibold text-blue-700" href="/technician/jobs">
                  Xem tất cả
                </Link>
              </div>

              {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}
              <div className="grid gap-3">
                {loading ? (
                  [1, 2, 3].map((item) => <AppSkeleton key={item} className="h-36 rounded-3xl" />)
                ) : focusJobs.length > 0 ? (
                  focusJobs.slice(0, 4).map((job) => <TechnicianFocusCard key={job.id} job={job} />)
                ) : (
                  <AppEmptyState
                title="Chưa có việc cần xử lý"
                description="Khi có yêu cầu phù hợp, việc sẽ xuất hiện tại đây để bạn nhận nhanh."
                action={<Link className={primaryLinkClass} href="/technician/jobs">Mở danh sách việc</Link>}
                  />
                )}
              </div>
            </section>
          </AppPageContainer>
        </TechnicianShell>
      )}
    </RoleGuard>
  );
}

function FieldStat({
  icon: Icon,
  label,
  value,
  tone
}: {
  icon: typeof BriefcaseBusiness;
  label: string;
  value: string | number;
  tone: "blue" | "cyan" | "amber";
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    cyan: "bg-cyan-50 text-cyan-700 ring-cyan-100",
    amber: "bg-amber-50 text-amber-700 ring-amber-100"
  }[tone];

  return (
    <div className={`rounded-2xl p-3 ring-1 ${toneClass}`}>
      <Icon className="h-5 w-5" />
      <p className="mt-3 text-2xl font-semibold text-slate-950">{value}</p>
      <p className="text-xs font-medium leading-4 text-slate-600">{label}</p>
    </div>
  );
}

function TechnicianFocusCard({ job }: { job: Job }) {
  return (
    <AppCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">{SERVICE_TYPE_LABELS[job.service_type]}</p>
          <h3 className="mt-1 line-clamp-2 text-lg font-semibold text-slate-950">{job.title}</h3>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusBadge status={job.status} />
          <PriorityBadge priority={job.priority} />
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 ring-1 ring-cyan-100">
            {formatRelativeSubmittedTime(job)}
          </span>
        </div>
      </div>
      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{job.description}</p>
      <div className="mt-4 grid gap-2 text-sm text-slate-600">
        <p className="flex items-center gap-2">
          <MapPinned className="h-4 w-4 shrink-0 text-cyan-600" />
          <span className="line-clamp-1">{job.address}</span>
        </p>
        <p className="flex items-center gap-2">
          <Phone className="h-4 w-4 shrink-0 text-cyan-600" />
          {job.phone}
        </p>
      </div>
      <div className="mt-4 flex gap-2">
        <Link className={`${primaryLinkClass} flex-1 justify-center`} href={`/technician/jobs?tab=${job.assigned_technician_id ? "assigned" : "available"}`}>Mở việc</Link>
        <Link className={`${secondaryLinkClass} flex-1 justify-center`} href={`tel:${job.phone}`}>Gọi khách</Link>
      </div>
    </AppCard>
  );
}

const primaryLinkClass =
  "inline-flex min-h-14 items-center justify-between gap-2 rounded-2xl bg-blue-600 px-6 text-base font-semibold text-white shadow-[0_14px_30px_rgba(37,99,235,0.20)] transition duration-200 hover:bg-blue-700 active:scale-[0.98]";

const secondaryLinkClass =
  "inline-flex min-h-14 items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white px-6 text-base font-semibold text-slate-800 shadow-sm transition duration-200 hover:border-blue-200 hover:bg-blue-50 active:scale-[0.98]";
