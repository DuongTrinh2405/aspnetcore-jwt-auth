import { SERVICE_TYPE_LABELS, type Job } from "@cnl/shared";
import { CalendarClock, ChevronRight, MapPin, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { memo } from "react";
import { PriorityBadge, StatusBadge } from "./StatusBadge";

export const JobCard = memo(function JobCard({ job }: { job: Job }) {
  const createdAt = new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(job.created_at));

  return (
    <Link
      className="group block rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_34px_rgba(15,23,42,0.055)] transition active:scale-[0.99] hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-[0_20px_60px_rgba(37,99,235,0.12)] sm:p-5"
      href={`/customer/jobs/${job.id}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2563EB]">
              {SERVICE_TYPE_LABELS[job.service_type]}
            </p>
            {job.is_vip ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-2.5 py-1 text-xs font-bold text-white">
                <ShieldCheck className="h-3.5 w-3.5" />
                VIP
              </span>
            ) : null}
          </div>
          <h3 className="mt-2 line-clamp-2 text-lg font-semibold text-slate-950 transition group-hover:text-[#2563EB]">{job.title}</h3>
        </div>
        <ChevronRight className="mt-1 h-5 w-5 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-600" />
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{job.description}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <StatusBadge status={job.status} />
        <PriorityBadge priority={job.priority} />
      </div>

      <div className="mt-4 grid gap-2 text-sm text-slate-500">
        <span className="flex min-w-0 items-center gap-2">
          <MapPin className="h-4 w-4 text-cyan-600" />
          <span className="line-clamp-1">{job.address}</span>
          {job.google_maps_url ? <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-black text-cyan-700">Maps</span> : null}
        </span>
        <span className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-cyan-600" />
          {createdAt}
        </span>
      </div>
    </Link>
  );
});
