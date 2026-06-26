"use client";

import {
  JOB_PRIORITIES,
  JOB_PRIORITY_LABELS,
  JOB_STATUS_LABELS,
  JOB_STATUSES,
  SERVICE_CATALOG,
  SERVICE_TYPE_LABELS,
  getJobMapUrl,
  getJobSubmittedAt,
  formatRelativeSubmittedTime,
  isAdminRole,
  type JobImage,
  type PaymentStatus,
  type JobStatus
} from "@cnl/shared";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ExternalLink,
  Eye,
  FileText,
  ImageIcon,
  Loader2,
  MapPin,
  RefreshCcw,
  Search,
  X
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { AdminGuard } from "../../components/AdminGuard";
import { AdminConfirmDialog, AdminSelect } from "../../components/AdminInteractions";
import { AdminShell } from "../../components/AdminShell";
import {
  assignAdminJob,
  fetchAdminJobImagesWithSignedUrls,
  fetchAdminJobDetail,
  fetchAdminJobsPage,
  fetchAdminTechnicians,
  getJobPaymentPaidAt,
  getJobPaymentStatus,
  updateAdminJobPayment,
  updateAdminJobStatus,
  type AdminJobDetail,
  type AdminJobListItem,
  type AdminUser,
  type JobFilters
} from "../../lib/admin";

type AdminGalleryState = {
  images: JobImage[];
  index: number;
  loading: boolean;
};

const badgeClass: Partial<Record<JobStatus, string>> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  accepted: "bg-cyan-50 text-cyan-700 border-cyan-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200"
};

const paymentLabels: Record<PaymentStatus, string> = {
  unpaid: "Chưa thanh toán",
  paid: "Đã thanh toán"
};

const paymentBadgeClass: Record<PaymentStatus, string> = {
  unpaid: "border-slate-200 bg-slate-50 text-slate-600",
  paid: "border-emerald-200 bg-emerald-50 text-emerald-700"
};

function formatDate(value: string | null | undefined) {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function readFilters(searchParams: URLSearchParams): JobFilters {
  return {
    status: (searchParams.get("status") as JobFilters["status"]) || "all",
    vip: (searchParams.get("vip") as JobFilters["vip"]) || "all",
    search: searchParams.get("q") || "",
    serviceCategory: searchParams.get("service") || "all",
    assignedTechnicianId: searchParams.get("technician") || "all",
    priority: (searchParams.get("priority") as JobFilters["priority"]) || "all",
    hasImages: (searchParams.get("images") as JobFilters["hasImages"]) || "all",
    payment: (searchParams.get("payment") as JobFilters["payment"]) || "all",
    submittedSort: (searchParams.get("submittedSort") as JobFilters["submittedSort"]) || "newest",
    fromDate: searchParams.get("from") || "",
    toDate: searchParams.get("to") || ""
  };
}

export default function AdminJobsPage() {
  return (
    <Suspense fallback={<main className="p-6 text-slate-500">Đang tải quản lý job...</main>}>
      <AdminJobsPageContent />
    </Suspense>
  );
}

function AdminJobsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<JobFilters>(() => readFilters(searchParams));
  const [searchDraft, setSearchDraft] = useState(() => searchParams.get("q") || "");
  const [page, setPage] = useState(Number(searchParams.get("page") || 1));
  const [pageSize, setPageSize] = useState(Number(searchParams.get("pageSize") || 10));
  const [jobs, setJobs] = useState<AdminJobListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [technicians, setTechnicians] = useState<AdminUser[]>([]);
  const [selectedJob, setSelectedJob] = useState<AdminJobListItem | null>(null);
  const [detail, setDetail] = useState<AdminJobDetail | null>(null);
  const [gallery, setGallery] = useState<AdminGalleryState | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [busyJobId, setBusyJobId] = useState<string | null>(null);
  const [pendingPayment, setPendingPayment] = useState<{ jobId: string; status: PaymentStatus } | null>(null);
  const jobsRequestRef = useRef(0);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  function syncUrl(nextFilters: JobFilters, nextPage = page, nextPageSize = pageSize) {
    const params = new URLSearchParams();
    if (nextFilters.search) params.set("q", nextFilters.search);
    if (nextFilters.status !== "all") params.set("status", nextFilters.status);
    if (nextFilters.vip !== "all") params.set("vip", nextFilters.vip);
    if (nextFilters.serviceCategory && nextFilters.serviceCategory !== "all") params.set("service", nextFilters.serviceCategory);
    if (nextFilters.assignedTechnicianId && nextFilters.assignedTechnicianId !== "all") params.set("technician", nextFilters.assignedTechnicianId);
    if (nextFilters.priority && nextFilters.priority !== "all") params.set("priority", nextFilters.priority);
    if (nextFilters.hasImages && nextFilters.hasImages !== "all") params.set("images", nextFilters.hasImages);
    if (nextFilters.payment && nextFilters.payment !== "all") params.set("payment", nextFilters.payment);
    if (nextFilters.submittedSort && nextFilters.submittedSort !== "newest") params.set("submittedSort", nextFilters.submittedSort);
    if (nextFilters.fromDate) params.set("from", nextFilters.fromDate);
    if (nextFilters.toDate) params.set("to", nextFilters.toDate);
    if (nextPage > 1) params.set("page", String(nextPage));
    if (nextPageSize !== 10) params.set("pageSize", String(nextPageSize));
    router.replace(`/jobs?${params.toString()}`, { scroll: false });
  }

  async function loadJobs(nextFilters = filters, nextPage = page, nextPageSize = pageSize, clearMessage = true) {
    const requestId = jobsRequestRef.current + 1;
    jobsRequestRef.current = requestId;
    setLoading(true);
    if (clearMessage) setMessage("");
    try {
      const [jobPage, technicianUsers] = await Promise.all([
        fetchAdminJobsPage(nextFilters, nextPage, nextPageSize),
        fetchAdminTechnicians()
      ]);
      if (jobsRequestRef.current !== requestId) return;
      setJobs(jobPage.jobs);
      setTotal(jobPage.total);
      setTechnicians(technicianUsers);
      setSelectedJob((current) => {
        if (!current) return jobPage.jobs[0] ?? null;
        return jobPage.jobs.find((job) => job.id === current.id) ?? jobPage.jobs[0] ?? null;
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không tải được danh sách job.");
    } finally {
      if (jobsRequestRef.current === requestId) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setFilters((current) => (current.search === searchDraft ? current : { ...current, search: searchDraft }));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [searchDraft]);

  useEffect(() => {
    syncUrl(filters, page, pageSize);
    void loadJobs(filters, page, pageSize);
  }, [filters, page, pageSize]);

  useEffect(() => {
    if (!selectedJob) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setDetail(null);
    setDetailLoading(true);
    fetchAdminJobDetail(selectedJob)
      .then((nextDetail) => {
        if (!cancelled) {
          setDetail(nextDetail);
        }
      })
      .catch((error: unknown) => setMessage(error instanceof Error ? error.message : "Không tải được chi tiết job."))
      .finally(() => {
        if (!cancelled) {
          setDetailLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedJob]);

  function openGallery(images: JobImage[], index: number) {
    const imageIds = images.map((image) => image.id).join(",");
    setGallery({ images, index, loading: true });
    fetchAdminJobImagesWithSignedUrls(images)
      .then((nextImages) => {
        setGallery((current) => {
          if (!current || current.images.map((image) => image.id).join(",") !== imageIds) {
            return current;
          }
          return { ...current, images: nextImages, loading: false };
        });
      })
      .catch((error: unknown) => {
      setMessage(error instanceof Error ? error.message : "Không tải được ảnh.");
        setGallery((current) => (current ? { ...current, loading: false } : current));
      });
  }

  const activeFilterLabels = useMemo(() => {
    const labels: string[] = [];
    if (filters.search) labels.push(`Từ khóa: ${filters.search}`);
    if (filters.status !== "all") labels.push(JOB_STATUS_LABELS[filters.status]);
    if (filters.vip !== "all") labels.push(filters.vip === "vip" ? "VIP" : "Thường");
    if (filters.serviceCategory && filters.serviceCategory !== "all") {
      labels.push(SERVICE_CATALOG.find((service) => service.slug === filters.serviceCategory)?.shortTitle ?? filters.serviceCategory);
    }
    if (filters.priority && filters.priority !== "all") labels.push(JOB_PRIORITY_LABELS[filters.priority]);
    if (filters.hasImages && filters.hasImages !== "all") labels.push(filters.hasImages === "yes" ? "Có ảnh" : "Chưa có ảnh");
    if (filters.payment && filters.payment !== "all") labels.push(filters.payment === "paid" ? "Đã thanh toán" : "Chưa thanh toán");
    if (filters.submittedSort === "oldest") labels.push("Cũ trước");
    return labels;
  }, [filters]);

  async function changeStatus(jobId: string, status: JobStatus) {
    const previousJobs = jobs;
    const previousSelectedJob = selectedJob;
    const previousDetail = detail;
    const now = new Date().toISOString();

    setBusyJobId(jobId);
    setMessage("");
    setJobs((current) => current.map((job) => (job.id === jobId ? { ...job, status, updated_at: now } : job)));
    setSelectedJob((current) => (current?.id === jobId ? { ...current, status, updated_at: now } : current));
    setDetail((current) => (current?.job.id === jobId ? { ...current, job: { ...current.job, status, updated_at: now } } : current));

    try {
      await updateAdminJobStatus(jobId, status);
      setMessage("Đã cập nhật trạng thái job.");
      void loadJobs(filters, page, pageSize, false);
    } catch (error) {
      setJobs(previousJobs);
      setSelectedJob(previousSelectedJob);
      setDetail(previousDetail);
      setMessage(error instanceof Error ? error.message : "Không cập nhật được job.");
    } finally {
      setBusyJobId(null);
    }
  }

  async function assignJob(jobId: string, technicianId: string) {
    if (!technicianId) return;
    const previousJobs = jobs;
    const previousSelectedJob = selectedJob;
    const previousDetail = detail;
    const assignedTechnician = technicians.find((technician) => technician.id === technicianId) ?? null;
    const now = new Date().toISOString();

    setBusyJobId(jobId);
    setMessage("");
    setJobs((current) =>
      current.map((job) =>
        job.id === jobId
          ? { ...job, assigned_technician_id: technicianId, technician: assignedTechnician, updated_at: now }
          : job
      )
    );
    setSelectedJob((current) =>
      current?.id === jobId ? { ...current, assigned_technician_id: technicianId, technician: assignedTechnician, updated_at: now } : current
    );
    setDetail((current) =>
      current?.job.id === jobId
        ? { ...current, job: { ...current.job, assigned_technician_id: technicianId, technician: assignedTechnician, updated_at: now } }
        : current
    );

    try {
      await assignAdminJob(jobId, technicianId);
      setMessage("Đã phân công kỹ thuật viên.");
      void loadJobs(filters, page, pageSize, false);
    } catch (error) {
      setJobs(previousJobs);
      setSelectedJob(previousSelectedJob);
      setDetail(previousDetail);
      setMessage(error instanceof Error ? error.message : "Không phân công được kỹ thuật viên.");
    } finally {
      setBusyJobId(null);
    }
  }

  async function togglePayment(jobId: string, paymentStatus: PaymentStatus) {
    setBusyJobId(jobId);
    setMessage("");
    try {
      const updatedJob = await updateAdminJobPayment(jobId, paymentStatus);
      setJobs((current) => current.map((job) => (job.id === jobId ? { ...job, ...updatedJob } : job)));
      setSelectedJob((current) => (current?.id === jobId ? { ...current, ...updatedJob } : current));
      setDetail((current) => (current?.job.id === jobId ? null : current));
      setMessage(paymentStatus === "paid" ? "Đã ghi nhận job đã thanh toán." : "Đã đánh dấu job chưa thanh toán.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không cập nhật được trạng thái thanh toán.");
    } finally {
      setBusyJobId(null);
      setPendingPayment(null);
    }
  }

  function clearFilters() {
    const nextFilters: JobFilters = {
      status: "all",
      vip: "all",
      search: "",
      serviceCategory: "all",
      assignedTechnicianId: "all",
      priority: "all",
      hasImages: "all",
      payment: "all",
      submittedSort: "newest",
      fromDate: "",
      toDate: ""
    };
    setFilters(nextFilters);
    setSearchDraft("");
    setPage(1);
    syncUrl(nextFilters, 1, pageSize);
  }

  return (
    <AdminGuard allow={isAdminRole}>
      {(profile) => (
        <AdminShell profile={profile}>
          <main className="admin-page">
            <section className="admin-panel">
              <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Dispatch queue</p>
                  <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Quản lý job dịch vụ</h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                    Lọc, phân công, xem ảnh hiện trạng, cập nhật trạng thái và xác nhận thanh toán trong một màn hình điều phối.
                  </p>
                </div>
                <button className="secondary-button px-4 text-sm" onClick={() => loadJobs()} type="button">
                  <RefreshCcw className="h-4 w-4 text-blue-600" />
                  Làm mới
                </button>
              </div>

              <div className="mt-4 grid gap-2.5 xl:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr]">
                <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400"
                    placeholder="Tìm mã job, tên, SĐT, địa chỉ..."
                    value={searchDraft}
                    onChange={(event) => setSearchDraft(event.target.value)}
                  />
                </label>
                <FilterSelect value={filters.status} onChange={(value) => { setPage(1); setFilters((current) => ({ ...current, status: value as JobFilters["status"] })); }}>
                  <option value="all">Tất cả trạng thái</option>
                  {JOB_STATUSES.map((status) => <option key={status} value={status}>{JOB_STATUS_LABELS[status]}</option>)}
                </FilterSelect>
                <FilterSelect value={filters.serviceCategory} onChange={(value) => { setPage(1); setFilters((current) => ({ ...current, serviceCategory: value })); }}>
                  <option value="all">Tất cả dịch vụ</option>
                  {SERVICE_CATALOG.map((service) => <option key={service.slug} value={service.slug}>{service.shortTitle}</option>)}
                </FilterSelect>
                <FilterSelect value={filters.assignedTechnicianId} onChange={(value) => { setPage(1); setFilters((current) => ({ ...current, assignedTechnicianId: value })); }}>
                  <option value="all">Tất cả kỹ thuật viên</option>
                  {technicians.map((user) => <option key={user.id} value={user.id}>{user.full_name || user.phone || user.id.slice(0, 8)}</option>)}
                </FilterSelect>
              </div>

              <details className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3" open>
                <summary className="cursor-pointer select-none px-1 text-sm font-semibold text-slate-700">Bộ lọc nâng cao</summary>
                <div className="mt-3 grid gap-2.5 sm:grid-cols-2 xl:grid-cols-6">
                  <FilterSelect value={filters.priority} onChange={(value) => { setPage(1); setFilters((current) => ({ ...current, priority: value as JobFilters["priority"] })); }}>
                    <option value="all">Tất cả độ khẩn</option>
                    {JOB_PRIORITIES.map((priority) => <option key={priority} value={priority}>{JOB_PRIORITY_LABELS[priority]}</option>)}
                  </FilterSelect>
                  <FilterSelect value={filters.hasImages} onChange={(value) => { setPage(1); setFilters((current) => ({ ...current, hasImages: value as JobFilters["hasImages"] })); }}>
                    <option value="all">Tất cả ảnh</option>
                    <option value="yes">Có ảnh</option>
                    <option value="no">Chưa có ảnh</option>
                  </FilterSelect>
                  <FilterSelect value={filters.payment} onChange={(value) => { setPage(1); setFilters((current) => ({ ...current, payment: value as JobFilters["payment"] })); }}>
                    <option value="all">Tất cả thanh toán</option>
                    <option value="paid">Đã thanh toán</option>
                    <option value="unpaid">Chưa thanh toán</option>
                  </FilterSelect>
                  <FilterSelect value={filters.submittedSort ?? "newest"} onChange={(value) => { setPage(1); setFilters((current) => ({ ...current, submittedSort: value as JobFilters["submittedSort"] })); }}>
                    <option value="newest">Mới gửi trước</option>
                    <option value="oldest">Cũ trước</option>
                  </FilterSelect>
                  <FilterSelect value={filters.vip} onChange={(value) => { setPage(1); setFilters((current) => ({ ...current, vip: value as JobFilters["vip"] })); }}>
                    <option value="all">Tất cả cấp</option>
                    <option value="regular">Job thường</option>
                    <option value="vip">Job VIP</option>
                  </FilterSelect>
                  <DateFilter value={filters.fromDate} onChange={(value) => { setPage(1); setFilters((current) => ({ ...current, fromDate: value })); }} />
                  <DateFilter value={filters.toDate} onChange={(value) => { setPage(1); setFilters((current) => ({ ...current, toDate: value })); }} />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2.5">
                  <FilterSelect className="max-w-40" value={String(pageSize)} onChange={(value) => { setPage(1); setPageSize(Number(value)); }}>
                    <option value={10}>10 / trang</option>
                    <option value={20}>20 / trang</option>
                  </FilterSelect>
                  <button className="secondary-button min-h-10 px-4 py-2 text-sm" type="button" onClick={clearFilters}>Xóa lọc</button>
                </div>
              </details>

              {activeFilterLabels.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {activeFilterLabels.map((label) => (
                    <span key={label} className="admin-chip bg-blue-50 text-blue-700 ring-blue-100">{label}</span>
                  ))}
                </div>
              ) : null}
            </section>

            {message ? <p className="mt-3 rounded-xl bg-cyan-50 p-3 text-sm font-semibold text-cyan-800">{message}</p> : null}
            {loading && jobs.length > 0 ? (
              <p className="mt-3 rounded-xl border border-blue-100 bg-blue-50/80 px-3 py-2 text-xs font-semibold text-blue-700">
                Đang cập nhật danh sách, dữ liệu hiện tại vẫn được giữ để thao tác không bị gián đoạn.
              </p>
            ) : null}

            <section className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
              <div className="min-w-0">
                {loading && jobs.length === 0 ? (
                  <div className="grid gap-3">
                    {Array.from({ length: Math.min(pageSize, 8) }).map((_, index) => <div key={index} className="skeleton-shimmer h-24 rounded-[1.15rem] bg-white shadow-sm" />)}
                  </div>
                ) : jobs.length === 0 ? (
                  <div className="admin-panel grid min-h-56 place-items-center text-center">
                    <div>
                      <FileText className="mx-auto h-10 w-10 text-slate-400" />
                      <h2 className="mt-4 text-xl font-semibold text-slate-950">Không có job phù hợp</h2>
                      <p className="mt-2 text-slate-500">Thử đổi bộ lọc hoặc xóa lọc.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="hidden overflow-hidden rounded-[1.15rem] border border-slate-200 bg-white shadow-sm xl:block">
                      <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 z-10 bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                          <tr>
                            <th className="px-3 py-3">Job</th>
                            <th className="px-3 py-3">Khách</th>
                            <th className="px-3 py-3">Dịch vụ</th>
                            <th className="px-3 py-3">Lịch</th>
                            <th className="px-3 py-3">Ảnh</th>
                            <th className="px-3 py-3">Trạng thái</th>
                            <th className="px-3 py-3">Thanh toán</th>
                          </tr>
                        </thead>
                        <tbody>
                          {jobs.map((job) => (
                            <tr key={job.id} className={`admin-row cursor-pointer ${selectedJob?.id === job.id ? "bg-blue-50/80 shadow-[inset_3px_0_0_#2563EB]" : ""}`} onClick={() => setSelectedJob(job)}>
                              <td className="px-3 py-3">
                                <p className="font-semibold text-slate-950">{job.tracking_code ?? job.id.slice(0, 8)}</p>
                                <p className="mt-1 max-w-56 truncate text-slate-500">{job.title}</p>
                                <p className="mt-1 text-xs font-semibold text-cyan-700" suppressHydrationWarning>{formatRelativeSubmittedTime(job)}</p>
                                <p className="mt-1 text-xs font-semibold text-slate-400">{formatDate(getJobSubmittedAt(job))}</p>
                              </td>
                              <td className="px-3 py-3">
                                <p className="font-semibold text-slate-800">{job.customer?.full_name || "Khách hàng"}</p>
                                <p className="mt-1 text-slate-500">{job.phone}</p>
                              </td>
                              <td className="px-3 py-3">
                                <p className="font-semibold text-slate-800">{SERVICE_TYPE_LABELS[job.service_type]}</p>
                                <p className="mt-1 max-w-56 truncate text-slate-500">{job.address}</p>
                              </td>
                              <td className="px-3 py-3 text-slate-600">{formatDate(job.desired_schedule_at ?? job.scheduled_at)}</td>
                              <td className="px-3 py-3"><ImageCount count={job.imageCount} /></td>
                              <td className="px-3 py-3"><StatusPill status={job.status} /></td>
                              <td className="px-3 py-3"><PaymentPill status={getJobPaymentStatus(job)} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="grid gap-3 xl:hidden">
                      {jobs.map((job) => (
                        <button key={job.id} className={`premium-card p-3.5 text-left ${selectedJob?.id === job.id ? "border-blue-300 bg-blue-50/70 ring-2 ring-blue-500/10" : ""}`} type="button" onClick={() => setSelectedJob(job)}>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-600">{job.tracking_code ?? job.id.slice(0, 8)}</p>
                              <h2 className="mt-2 text-lg font-semibold text-slate-950">{job.title}</h2>
                              <p className="mt-1 text-sm text-slate-500">{job.customer?.full_name || "Khách hàng"} · {job.phone}</p>
                            </div>
                            <StatusPill status={job.status} />
                          </div>
                          <p className="mt-3 line-clamp-2 text-sm text-slate-500">{job.address}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <ImageCount count={job.imageCount} />
                            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700" suppressHydrationWarning>{formatRelativeSubmittedTime(job)}</span>
                            <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{JOB_PRIORITY_LABELS[job.priority]}</span>
                            <PaymentPill status={getJobPaymentStatus(job)} />
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                <Pagination loading={loading} page={page} setPage={setPage} total={total} totalPages={totalPages} />
              </div>

              <aside className="admin-panel h-fit xl:sticky xl:top-5">
                {!selectedJob ? (
                  <div className="grid min-h-80 place-items-center text-center">
                    <div>
                      <Eye className="mx-auto h-10 w-10 text-slate-400" />
                      <h2 className="mt-4 text-xl font-semibold text-slate-950">Chọn một job</h2>
                      <p className="mt-2 text-sm text-slate-500">Chi tiết, ảnh và timeline sẽ hiển thị ở đây.</p>
                    </div>
                  </div>
                ) : (
                  <JobDetailPanel
                    busy={busyJobId === selectedJob.id}
                    detail={detail}
                    detailLoading={detailLoading}
                    job={selectedJob}
                    technicians={technicians}
                    onAssign={assignJob}
                    onOpenGallery={openGallery}
                    onPayment={(jobId, paymentStatus) => setPendingPayment({ jobId, status: paymentStatus })}
                    onStatus={changeStatus}
                  />
                )}
              </aside>
            </section>

            {gallery ? (
              <GalleryModal gallery={gallery} onClose={() => setGallery(null)} onMove={(index) => setGallery((current) => current ? { ...current, index } : current)} />
            ) : null}
            <AdminConfirmDialog
              confirmLabel={pendingPayment?.status === "paid" ? "Xác nhận" : "Đánh dấu chưa thanh toán"}
              description={
                pendingPayment?.status === "paid"
                  ? "Hệ thống sẽ ghi nhận job này đã thanh toán và lưu thời gian xác nhận bằng thời gian máy chủ."
                  : "Hệ thống sẽ chuyển job này về chưa thanh toán và xóa thời gian thanh toán đã ghi nhận."
              }
              icon={<CreditCard className="h-5 w-5" />}
              loading={Boolean(pendingPayment && busyJobId === pendingPayment.jobId)}
              open={Boolean(pendingPayment)}
              title={pendingPayment?.status === "paid" ? "Xác nhận thanh toán" : "Xác nhận bỏ thanh toán"}
              onCancel={() => setPendingPayment(null)}
              onConfirm={() => {
                if (pendingPayment) {
                  void togglePayment(pendingPayment.jobId, pendingPayment.status);
                }
              }}
            />
          </main>
        </AdminShell>
      )}
    </AdminGuard>
  );
}

function JobDetailPanel({
  job,
  detail,
  detailLoading,
  technicians,
  busy,
  onAssign,
  onPayment,
  onStatus,
  onOpenGallery
}: {
  job: AdminJobListItem;
  detail: AdminJobDetail | null;
  detailLoading: boolean;
  technicians: AdminUser[];
  busy: boolean;
  onAssign: (jobId: string, technicianId: string) => void;
  onPayment: (jobId: string, paymentStatus: PaymentStatus) => void;
  onStatus: (jobId: string, status: JobStatus) => void;
  onOpenGallery: (images: JobImage[], index: number) => void;
}) {
  const images = detail?.images ?? [];
  const paymentStatus = getJobPaymentStatus(job);
  const paymentPaidAt = getJobPaymentPaidAt(job);
  const nextAction = getAdminNextAction(job, paymentStatus);
  const timelineItems = [
    ...(detail?.statusHistory.length
      ? detail.statusHistory.map((item) => ({
          id: `status-${item.id}`,
          kind: "status" as const,
          created_at: item.created_at,
          label: JOB_STATUS_LABELS[item.new_status],
          note: item.note
        }))
      : [{
          id: "status-current",
          kind: "status" as const,
          created_at: job.created_at,
          label: JOB_STATUS_LABELS[job.status],
          note: null
        }]),
    ...((detail?.paymentEvents ?? []).map((item) => ({
      id: `payment-${item.id}`,
      kind: "payment" as const,
      created_at: item.created_at,
      label: item.note ?? (item.new_payment_status === "paid" ? "Admin ghi nhận thanh toán" : "Admin đánh dấu chưa thanh toán"),
      note: paymentLabels[item.new_payment_status]
    })))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-600">{job.tracking_code ?? job.id.slice(0, 8)}</p>
          <h2 className="mt-1.5 text-xl font-semibold text-slate-950">{job.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{job.description}</p>
        </div>
        <StatusPill status={job.status} />
      </div>

      <div className="mt-4 grid gap-2.5 text-sm">
        <InfoRow label="Khách hàng" value={`${job.customer?.full_name || "Khách hàng"} · ${job.phone}`} />
        <InfoRow label="Dịch vụ" value={SERVICE_TYPE_LABELS[job.service_type]} />
        <InfoRow label="Địa chỉ" value={job.address} />
        <InfoRow label="Khách gửi" value={`${formatRelativeSubmittedTime(job)} · ${formatDate(getJobSubmittedAt(job))}`} />
        <InfoRow label="Lịch mong muốn" value={formatDate(job.desired_schedule_at ?? job.scheduled_at)} />
        <InfoRow label="Kỹ thuật viên" value={job.technician?.full_name || "Chưa phân công"} />
      </div>

      <section className="mt-4 rounded-xl border border-blue-100 bg-blue-50/70 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700">Cần ưu tiên</p>
        <p className="mt-1 text-sm font-semibold leading-6 text-slate-900">{nextAction.title}</p>
        <p className="mt-1 text-xs font-medium leading-5 text-slate-600">{nextAction.description}</p>
      </section>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <a className="secondary-button min-h-11 px-3 py-2 text-sm" href={getJobMapUrl(job)} rel="noreferrer" target="_blank">
          <MapPin className="h-4 w-4 text-cyan-600" />
          Maps
          <ExternalLink className="h-4 w-4" />
        </a>
        <button className="secondary-button min-h-11 px-3 py-2 text-sm" disabled={images.length === 0} type="button" onClick={() => onOpenGallery(images, 0)}>
          <ImageIcon className="h-4 w-4 text-cyan-600" />
          Gallery ({images.length})
        </button>
      </div>

      <div className="mt-4 grid gap-2.5">
        <label className="block text-sm font-semibold text-slate-800">
          Phân công kỹ thuật viên
          <FilterSelect className="mt-2" disabled={busy} value={job.assigned_technician_id ?? ""} onChange={(value) => onAssign(job.id, value)}>
            <option value="">Chọn kỹ thuật viên</option>
            {technicians.map((technician) => (
              <option key={technician.id} value={technician.id}>{technician.full_name || technician.phone || technician.id.slice(0, 8)}</option>
            ))}
          </FilterSelect>
        </label>
        <label className="block text-sm font-semibold text-slate-800">
          Cập nhật trạng thái
          <FilterSelect className="mt-2" disabled={busy} value={job.status} onChange={(value) => onStatus(job.id, value as JobStatus)}>
            {JOB_STATUSES.map((status) => <option key={status} value={status}>{JOB_STATUS_LABELS[status]}</option>)}
          </FilterSelect>
        </label>
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">Thanh toán</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">{paymentLabels[paymentStatus]}</p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {paymentStatus === "paid" && paymentPaidAt
                  ? `Thanh toán lúc: ${formatDate(paymentPaidAt)}`
                  : "Chưa ghi nhận thanh toán"}
              </p>
            </div>
            <PaymentPill status={paymentStatus} />
          </div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <button
              className="secondary-button min-h-10 px-3 py-2 text-xs"
              disabled={busy || paymentStatus === "paid"}
              type="button"
              onClick={() => onPayment(job.id, "paid")}
            >
              Ghi nhận đã thanh toán
            </button>
            <button
              className="secondary-button min-h-10 px-3 py-2 text-xs"
              disabled={busy || paymentStatus === "unpaid"}
              type="button"
              onClick={() => onPayment(job.id, "unpaid")}
            >
              Đánh dấu chưa thanh toán
            </button>
          </div>
        </section>
      </div>

      <section className="mt-5">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-950">Ảnh hiện trạng</h3>
          {detailLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : <ImageCount count={images.length} />}
        </div>
        {detailLoading ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {[1, 2, 3].map((item) => <div key={item} className="aspect-square animate-pulse rounded-xl bg-slate-100" />)}
          </div>
        ) : images.length > 0 ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {images.map((image, index) => (
              <button key={image.id} className="group relative aspect-square overflow-hidden rounded-xl bg-slate-100" type="button" onClick={() => onOpenGallery(images, index)}>
                {image.signed_url ? <img alt={image.file_name ?? "Ảnh job"} className="h-full w-full object-cover transition group-hover:scale-105" loading="lazy" src={image.signed_url} /> : <BrokenImage expired={Boolean(image.storage_deleted || image.storage_deleted_at || image.deleted_at)} />}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm font-semibold text-slate-500">
            Job này chưa có ảnh upload.
          </div>
        )}
      </section>

      <section className="mt-5">
        <h3 className="font-semibold text-slate-950">Timeline</h3>
        <div className="mt-3 space-y-3">
          {timelineItems.map((item) => (
            <div key={item.id} className="flex gap-3 rounded-xl bg-slate-50/70 p-2.5">
              <div className={`mt-1 h-3 w-3 rounded-full shadow-[0_0_0_5px_rgba(6,182,212,0.12)] ${item.kind === "payment" ? "bg-emerald-500" : "bg-cyan-500"}`} />
              <div>
                <p className="text-sm font-semibold text-slate-950">{item.label}</p>
                <p className="text-xs font-semibold text-slate-400">{formatDate(item.created_at)}</p>
                {item.note ? <p className="mt-1 text-sm text-slate-500">{item.note}</p> : null}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function FilterSelect({
  children,
  className = "",
  disabled = false,
  onChange,
  value
}: {
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  value: string | number | undefined;
}) {
  const options = React.Children.toArray(children).flatMap((child) => {
    if (!React.isValidElement<{ children?: React.ReactNode; value?: string | number }>(child)) return [];
    const optionValue = child.props.value;
    if (optionValue === undefined) return [];
    return [{ label: String(child.props.children ?? optionValue), value: String(optionValue) }];
  });

  return <AdminSelect className={className} disabled={disabled} onChange={onChange} options={options} value={value ?? "all"} />;
}

function DateFilter({ onChange, value }: { onChange: (value: string) => void; value: string | undefined }) {
  return (
    <label className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 bg-white px-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.035)]">
      <CalendarDays className="h-4 w-4 text-slate-400" />
      <input className="w-full bg-transparent text-sm font-semibold outline-none" type="date" value={value ?? ""} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function StatusPill({ status }: { status: JobStatus }) {
  return (
    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badgeClass[status] ?? "border-slate-200 bg-slate-50 text-slate-700"}`}>
      {JOB_STATUS_LABELS[status]}
    </span>
  );
}

function PaymentPill({ status }: { status: PaymentStatus }) {
  return (
    <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${paymentBadgeClass[status]}`}>
      {paymentLabels[status]}
    </span>
  );
}

function ImageCount({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold text-cyan-700">
      <ImageIcon className="h-3.5 w-3.5" />
      {count}
    </span>
  );
}

function Pagination({ loading, page, setPage, total, totalPages }: { loading: boolean; page: number; setPage: React.Dispatch<React.SetStateAction<number>>; total: number; totalPages: number }) {
  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-2.5 shadow-sm">
      <p className="text-sm font-semibold text-slate-500">Trang {page}/{totalPages} · {total} job</p>
      <div className="flex gap-2">
        <button className="secondary-button min-h-10 px-3 py-2 text-sm" disabled={page <= 1 || loading} onClick={() => setPage(1)} type="button">Đầu</button>
        <button className="secondary-button min-h-10 px-3 py-2 text-sm" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button"><ChevronLeft className="h-4 w-4" /></button>
        <button className="secondary-button min-h-10 px-3 py-2 text-sm" disabled={page >= totalPages || loading} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} type="button"><ChevronRight className="h-4 w-4" /></button>
        <button className="secondary-button min-h-10 px-3 py-2 text-sm" disabled={page >= totalPages || loading} onClick={() => setPage(totalPages)} type="button">Cuối</button>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</p>
      <p className="mt-1 font-semibold text-slate-800">{value}</p>
    </div>
  );
}

function getAdminNextAction(job: AdminJobListItem, paymentStatus: PaymentStatus) {
  if (!job.assigned_technician_id && job.status !== "completed" && job.status !== "cancelled") {
    return {
      title: "Phân công kỹ thuật viên",
      description: "Job chưa có người phụ trách. Chọn kỹ thuật viên trước khi cập nhật tiến độ tiếp theo."
    };
  }

  if (job.status === "pending") {
    return {
      title: "Xác nhận tiếp nhận",
      description: "Kiểm tra thông tin khách, ảnh hiện trạng và chuyển job sang Đã tiếp nhận khi đã đủ dữ liệu."
    };
  }

  if (job.status === "accepted") {
    return {
      title: "Theo dõi bắt đầu xử lý",
      description: "Job đã được tiếp nhận. Khi kỹ thuật viên bắt đầu làm, cập nhật sang Đang xử lý."
    };
  }

  if (job.status === "in_progress") {
    return {
      title: "Chờ xác nhận hoàn thành",
      description: "Theo dõi kết quả xử lý và chỉ chuyển Hoàn thành khi kỹ thuật viên đã kết thúc công việc."
    };
  }

  if (job.status === "completed" && paymentStatus === "unpaid") {
    return {
      title: "Đối soát thanh toán",
      description: "Job đã hoàn thành nhưng chưa ghi nhận thanh toán. Xác nhận thanh toán sau khi đối chiếu."
    };
  }

  return {
    title: "Hồ sơ đã ổn định",
    description: "Job không còn thao tác vận hành chính. Chỉ cập nhật nếu có điều chỉnh từ quản trị."
  };
}

function BrokenImage({ expired = false }: { expired?: boolean }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center text-slate-400">
      <ImageIcon className="h-6 w-6" />
      {expired ? <span className="mt-2 text-xs font-semibold text-slate-500">Ảnh đã được quản trị viên xóa để tiết kiệm dung lượng lưu trữ.</span> : null}
    </div>
  );
}

function GalleryModal({
  gallery,
  onClose,
  onMove
}: {
  gallery: AdminGalleryState;
  onClose: () => void;
  onMove: (index: number) => void;
}) {
  const image = gallery.images[gallery.index];
  const previousIndex = gallery.index === 0 ? gallery.images.length - 1 : gallery.index - 1;
  const nextIndex = gallery.index === gallery.images.length - 1 ? 0 : gallery.index + 1;
  const imageUnavailable = Boolean(image.storage_deleted || image.storage_deleted_at || image.deleted_at);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <p className="font-semibold text-slate-950">{image.file_name ?? "Ảnh job"}</p>
            <p className="text-sm font-semibold text-slate-400">{gallery.index + 1}/{gallery.images.length}</p>
          </div>
          <button className="secondary-button min-h-10 px-3 py-2" type="button" onClick={onClose}><X className="h-5 w-5" /></button>
        </div>
        <div className="relative grid min-h-[60vh] place-items-center bg-slate-50 p-4">
          {image.signed_url ? (
            <img alt={image.file_name ?? "Ảnh job"} className="max-h-[70vh] max-w-full rounded-2xl object-contain" src={image.signed_url} />
          ) : gallery.loading && !imageUnavailable ? (
            <div className="grid place-items-center gap-3 text-sm font-semibold text-slate-500">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              Đang tải ảnh bảo mật...
            </div>
          ) : (
            <BrokenImage expired={imageUnavailable} />
          )}
          {gallery.images.length > 1 ? (
            <>
              <button className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lg" type="button" onClick={() => onMove(previousIndex)}><ChevronLeft className="h-5 w-5" /></button>
              <button className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lg" type="button" onClick={() => onMove(nextIndex)}><ChevronRight className="h-5 w-5" /></button>
            </>
          ) : null}
        </div>
        <div className="flex justify-end gap-2 p-4">
          {image.signed_url ? <a className="premium-button" href={image.signed_url} rel="noreferrer" target="_blank">Mở ảnh gốc</a> : null}
        </div>
      </div>
    </div>
  );
}
