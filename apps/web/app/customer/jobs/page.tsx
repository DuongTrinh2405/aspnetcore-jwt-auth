"use client";

import { isCustomerRole, type Job, type JobStatus } from "@cnl/shared";
import { BriefcaseBusiness, Clock3, Search, ShieldCheck, Wrench } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { JobCard } from "../../../components/JobCard";
import { ProductShell } from "../../../components/ProductShell";
import { RoleGuard } from "../../../components/RoleGuard";
import { AppEmptyState, AppPageContainer, AppPageHeader, AppSkeleton } from "../../../components/ui/AppPrimitives";
import { fetchCustomerJobs } from "../../../lib/jobs";

const statusTabs: Array<{ key: "all" | JobStatus; label: string }> = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Đang chờ" },
  { key: "accepted", label: "Tiếp nhận" },
  { key: "in_progress", label: "Đang xử lý" },
  { key: "completed", label: "Hoàn thành" }
];

export default function CustomerJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | JobStatus>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCustomerJobs()
      .then(setJobs)
      .catch((nextError: Error) => setError(nextError.message))
      .finally(() => setLoading(false));
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesStatus = status === "all" || job.status === status;
      const haystack = `${job.title} ${job.description} ${job.address}`.toLowerCase();
      return matchesStatus && haystack.includes(query.toLowerCase());
    });
  }, [jobs, query, status]);

  return (
    <RoleGuard allow={isCustomerRole}>
      {(profile) => (
        <ProductShell profile={profile}>
          <AppPageContainer>
            <AppPageHeader
              eyebrow="Requests"
              title="Yêu cầu của tôi"
              description="Theo dõi các yêu cầu lắp đặt, sửa chữa và bảo hành đang xử lý."
            />

            <section className="mt-5 rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-sm">
              <label className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  className="premium-input pl-12"
                  placeholder="Tìm theo tiêu đề, địa chỉ, mô tả..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </label>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {statusTabs.map((item) => (
                  <button
                    key={item.key}
                    className={`shrink-0 rounded-2xl px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98] ${
                      status === item.key ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-blue-50"
                    }`}
                    onClick={() => setStatus(item.key)}
                    type="button"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </section>

            <section className="mt-5 grid gap-3">
              {error ? <p className="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{error}</p> : null}
              {loading ? (
                [1, 2, 3].map((item) => <AppSkeleton key={item} className="h-40" />)
              ) : filteredJobs.length > 0 ? (
                filteredJobs.map((job) => <JobCard key={job.id} job={job} />)
              ) : (
                <AppEmptyState
                  icon={status === "completed" ? ShieldCheck : status === "pending" ? Clock3 : status === "in_progress" ? Wrench : BriefcaseBusiness}
                  title="Không có yêu cầu phù hợp"
                  description="Thử đổi bộ lọc hoặc tạo yêu cầu mới nếu bạn cần hỗ trợ kỹ thuật."
                />
              )}
            </section>
          </AppPageContainer>
        </ProductShell>
      )}
    </RoleGuard>
  );
}
