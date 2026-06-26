"use client";

import { getGoogleMapsDirectionsUrl, isTechnicianRole, SERVICE_TYPE_LABELS, type Job } from "@cnl/shared";
import { ExternalLink, MapPinned, Phone } from "lucide-react";
import { useEffect, useState } from "react";
import { RoleGuard } from "../../../components/RoleGuard";
import { TechnicianShell } from "../../../components/TechnicianShell";
import { StatusBadge } from "../../../components/StatusBadge";
import { AppCard, AppEmptyState, AppPageContainer, AppPageHeader, AppSkeleton } from "../../../components/ui/AppPrimitives";
import { fetchAssignedJobs } from "../../../lib/technician";
import { formatRelativeSubmittedTime } from "../../../lib/time";

export default function TechnicianMapPage() {
  return (
    <RoleGuard allow={isTechnicianRole}>
      {(profile) => (
        <TechnicianShell profile={profile}>
          <TechnicianMapContent />
        </TechnicianShell>
      )}
    </RoleGuard>
  );
}

function TechnicianMapContent() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetchAssignedJobs()
      .then((items) => {
        if (!cancelled) setJobs(items);
      })
      .catch((nextError: Error) => {
        if (!cancelled) setError(nextError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AppPageContainer>
      <AppPageHeader
        eyebrow="Bản đồ & chỉ đường"
        title="Tuyến việc của tôi"
        description="Bản đồ tổng hợp sẽ được bật ở bước sau. Hiện tại bạn có thể mở Google Maps trong từng việc đang phụ trách."
      />
      {error ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}
      <div className="mt-6 grid gap-3">
        {loading ? (
          [1, 2, 3].map((item) => <AppSkeleton key={item} className="h-36" />)
        ) : jobs.length > 0 ? (
          jobs.map((job) => <MapJobCard key={job.id} job={job} />)
        ) : (
          <AppEmptyState
            icon={MapPinned}
            title="Chưa có việc cần chỉ đường"
            description="Khi bạn nhận việc, địa chỉ và nút mở Google Maps sẽ xuất hiện tại đây."
          />
        )}
      </div>
    </AppPageContainer>
  );
}

function MapJobCard({ job }: { job: Job }) {
  return (
    <AppCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">{SERVICE_TYPE_LABELS[job.service_type]}</p>
          <h2 className="mt-1 line-clamp-2 text-lg font-semibold text-slate-950">{job.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{job.address}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusBadge status={job.status} />
          <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 ring-1 ring-cyan-100">
            {formatRelativeSubmittedTime(job)}
          </span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 active:scale-[0.98]" href={`tel:${job.phone}`}>
          <Phone className="h-4 w-4 text-cyan-600" />
          Gọi khách
        </a>
        <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 active:scale-[0.98]" href={getGoogleMapsDirectionsUrl(job)} rel="noreferrer" target="_blank">
          <MapPinned className="h-4 w-4" />
          Mở Google Maps
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </AppCard>
  );
}
