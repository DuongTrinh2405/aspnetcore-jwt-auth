"use client";

import {
  JOB_PRIORITIES,
  JOB_PRIORITY_LABELS,
  JOB_STATUS_LABELS,
  JOB_STATUSES,
  SERVICE_CATALOG,
  SERVICE_TYPE_LABELS,
  isStaffRole,
  type JobImage,
  type JobStatus
} from "@cnl/shared";
import { ChevronLeft, ChevronRight, FileText, ImageIcon, Loader2, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { RoleGuard } from "../../../components/RoleGuard";
import { JobImageGallery } from "../../../components/JobImageGallery";
import { AppSelect } from "../../../components/ui/InteractionPrimitives";
import {
  fetchStaffJobImagesWithSignedUrls,
  fetchStaffJobDetail,
  fetchStaffJobsPage,
  type StaffJobDetail,
  type StaffJobFilters,
  type StaffJobListItem
} from "../../../lib/staff";

const badgeClass: Record<JobStatus, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  received: "bg-sky-50 text-sky-700 border-sky-200",
  scheduled: "bg-indigo-50 text-indigo-700 border-indigo-200",
  on_the_way: "bg-cyan-50 text-cyan-700 border-cyan-200",
  inspecting: "bg-violet-50 text-violet-700 border-violet-200",
  quoted: "bg-orange-50 text-orange-700 border-orange-200",
  accepted: "bg-cyan-50 text-cyan-700 border-cyan-200",
  in_progress: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warranty_followup: "bg-teal-50 text-teal-700 border-teal-200",
  cancelled: "bg-rose-50 text-rose-700 border-rose-200"
};

type StaffGalleryState = {
  images: JobImage[];
  index: number;
  loading: boolean;
};

function formatDate(value: string | null | undefined) {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(value));
}

export default function StaffDashboardPage() {
  const [filters, setFilters] = useState<StaffJobFilters>({ status: "all", search: "", serviceCategory: "all", priority: "all", hasImages: "all" });
  const [searchDraft, setSearchDraft] = useState("");
  const [page, setPage] = useState(1);
  const [jobs, setJobs] = useState<StaffJobListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedJob, setSelectedJob] = useState<StaffJobListItem | null>(null);
  const [detail, setDetail] = useState<StaffJobDetail | null>(null);
  const [gallery, setGallery] = useState<StaffGalleryState | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [message, setMessage] = useState("");
  const pageSize = 10;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      setFilters((current) => (current.search === searchDraft ? current : { ...current, search: searchDraft }));
    }, 250);

    return () => window.clearTimeout(timer);
  }, [searchDraft]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchStaffJobsPage(filters, page, pageSize)
      .then((result) => {
        if (cancelled) return;
        setJobs(result.jobs);
        setTotal(result.total);
        setSelectedJob((current) => {
          if (!current) return result.jobs[0] ?? null;
          return result.jobs.find((job) => job.id === current.id) ?? result.jobs[0] ?? null;
        });
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Không tải được danh sách job.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [filters, page]);

  useEffect(() => {
    if (!selectedJob) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setDetailLoading(true);
    fetchStaffJobDetail(selectedJob)
      .then((nextDetail) => {
        if (!cancelled) {
          setDetail(nextDetail);
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : "Không tải được chi tiết job.");
        }
      })
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
    fetchStaffJobImagesWithSignedUrls(images)
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

  const activeFilters = useMemo(() => {
    const labels: string[] = [];
    if (filters.search) labels.push(filters.search);
    if (filters.status !== "all") labels.push(JOB_STATUS_LABELS[filters.status]);
    if (filters.serviceCategory !== "all") labels.push(SERVICE_CATALOG.find((service) => service.slug === filters.serviceCategory)?.shortTitle ?? filters.serviceCategory);
    if (filters.priority !== "all") labels.push(JOB_PRIORITY_LABELS[filters.priority]);
    if (filters.hasImages !== "all") labels.push(filters.hasImages === "yes" ? "Có ảnh" : "Chưa có ảnh");
    return labels;
  }, [filters]);

  return (
    <RoleGuard allow={isStaffRole}>
      {() => (
        <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-6xl">
          <section className="overflow-hidden rounded-[2rem] border border-blue-100 bg-gradient-to-br from-white via-sky-50/70 to-cyan-50/70 p-5 shadow-[0_20px_60px_rgba(37,99,235,0.12)] sm:p-6">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Staff dispatch</p>
            <h1 className="mt-2 text-4xl font-black text-slate-950">Điều phối job</h1>
            <p className="mt-3 max-w-2xl text-slate-500">Staff xem job, ảnh hiện trạng, timeline và lọc nhanh theo trạng thái/dịch vụ/độ khẩn.</p>

            <div className="mt-5 grid gap-3 xl:grid-cols-[1.4fr_repeat(4,0.8fr)]">
              <label className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm">
                <Search className="h-5 w-5 text-slate-400" />
                <input className="w-full bg-transparent text-sm font-semibold outline-none" placeholder="Tìm mã, tên, SĐT, địa chỉ..." value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} />
              </label>
              <AppSelect
                value={filters.status}
                onChange={(value) => { setPage(1); setFilters((current) => ({ ...current, status: value as StaffJobFilters["status"] })); }}
                options={[{ label: "Tất cả trạng thái", value: "all" }, ...JOB_STATUSES.map((status) => ({ label: JOB_STATUS_LABELS[status], value: status }))]}
              />
              <AppSelect
                value={filters.serviceCategory}
                onChange={(value) => { setPage(1); setFilters((current) => ({ ...current, serviceCategory: value })); }}
                options={[{ label: "Tất cả dịch vụ", value: "all" }, ...SERVICE_CATALOG.map((service) => ({ label: service.shortTitle, value: service.slug }))]}
              />
              <AppSelect
                value={filters.priority}
                onChange={(value) => { setPage(1); setFilters((current) => ({ ...current, priority: value as StaffJobFilters["priority"] })); }}
                options={[{ label: "Tất cả độ khẩn", value: "all" }, ...JOB_PRIORITIES.map((priority) => ({ label: JOB_PRIORITY_LABELS[priority], value: priority }))]}
              />
              <AppSelect
                value={filters.hasImages}
                onChange={(value) => { setPage(1); setFilters((current) => ({ ...current, hasImages: value as StaffJobFilters["hasImages"] })); }}
                options={[
                  { label: "Tất cả ảnh", value: "all" },
                  { label: "Có ảnh", value: "yes" },
                  { label: "Chưa có ảnh", value: "no" }
                ]}
              />
            </div>
            {activeFilters.length > 0 ? <div className="mt-4 flex flex-wrap gap-2">{activeFilters.map((item) => <span key={item} className="rounded-full bg-blue-50 px-3 py-1 text-xs font-black text-blue-700">{item}</span>)}</div> : null}
          </section>

          {message ? <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{message}</p> : null}
          {loading && jobs.length > 0 ? (
            <p className="mt-4 rounded-xl border border-blue-100 bg-blue-50/80 px-3 py-2 text-xs font-semibold text-blue-700">
              Đang cập nhật danh sách, dữ liệu hiện tại vẫn được giữ để thao tác liên tục.
            </p>
          ) : null}

          <section className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="min-w-0">
              {loading && jobs.length === 0 ? (
                <div className="grid gap-3">{Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-2xl bg-white" />)}</div>
              ) : jobs.length === 0 ? (
                <div className="premium-card p-10 text-center">
                  <FileText className="mx-auto h-10 w-10 text-slate-400" />
                  <h2 className="mt-4 text-2xl font-black text-slate-950">Chưa có job phù hợp</h2>
                  <p className="mt-2 text-slate-500">Thử đổi bộ lọc hoặc từ khóa tìm kiếm.</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {jobs.map((job) => (
                    <article key={job.id} className={`premium-card cursor-pointer p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-[0_18px_48px_rgba(37,99,235,0.12)] active:scale-[0.99] ${selectedJob?.id === job.id ? "border-blue-400 bg-blue-50/70 ring-4 ring-blue-500/10 shadow-[0_18px_48px_rgba(37,99,235,0.14)]" : ""}`} role="button" tabIndex={0} onClick={() => setSelectedJob(job)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedJob(job); }}>
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-600">{job.tracking_code ?? job.id.slice(0, 8)}</p>
                          <h2 className="mt-2 text-xl font-black text-slate-950">{job.title}</h2>
                          <p className="mt-1 text-sm text-slate-500">{job.customer?.full_name || "Khách hàng"} · {job.phone}</p>
                        </div>
                        <span className={`rounded-full border px-3 py-1 text-xs font-black ${badgeClass[job.status]}`}>{JOB_STATUS_LABELS[job.status]}</span>
                      </div>
                      <p className="mt-3 text-sm text-slate-500">{SERVICE_TYPE_LABELS[job.service_type]} · {job.address}</p>
                      {job.images?.length ? <JobImageGallery images={job.images} maxVisible={3} /> : null}
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">{job.imageCount} ảnh</span>
                        <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">{JOB_PRIORITY_LABELS[job.priority]}</span>
                        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-black text-slate-500">{formatDate(job.created_at)}</span>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              <div className="mt-5 flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
                <p className="text-sm font-bold text-slate-500">Trang {page}/{totalPages} · {total} job</p>
                <div className="flex gap-2">
                  <button className="secondary-button px-3 py-2" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} type="button"><ChevronLeft className="h-4 w-4" /></button>
                  <button className="secondary-button px-3 py-2" disabled={page >= totalPages || loading} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} type="button"><ChevronRight className="h-4 w-4" /></button>
                </div>
              </div>
            </div>

            <aside className="premium-card h-fit p-5 xl:sticky xl:top-6">
              {!selectedJob ? (
                <div className="grid min-h-80 place-items-center text-center text-slate-500">Chọn một job để xem chi tiết.</div>
              ) : (
                <StaffDetailPanel detail={detail} detailLoading={detailLoading} job={selectedJob} onOpenGallery={openGallery} />
              )}
            </aside>
          </section>

          {gallery ? <GalleryModal gallery={gallery} onClose={() => setGallery(null)} onMove={(index) => setGallery((current) => current ? { ...current, index } : current)} /> : null}
          </div>
        </main>
      )}
    </RoleGuard>
  );
}

function StaffDetailPanel({ job, detail, detailLoading, onOpenGallery }: { job: StaffJobListItem; detail: StaffJobDetail | null; detailLoading: boolean; onOpenGallery: (images: JobImage[], index: number) => void }) {
  const images = detail?.images ?? [];

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-cyan-600">{job.tracking_code ?? job.id.slice(0, 8)}</p>
      <h2 className="mt-2 text-2xl font-black text-slate-950">{job.title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{job.description}</p>
      <div className="mt-4 grid gap-2 text-sm">
        <p><span className="font-black text-slate-800">Khách:</span> {job.customer?.full_name || "Khách hàng"} · {job.phone}</p>
        <p><span className="font-black text-slate-800">Địa chỉ:</span> {job.address}</p>
        <p><span className="font-black text-slate-800">Kỹ thuật viên:</span> {job.technician?.full_name || "Chưa phân công"}</p>
      </div>

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h3 className="font-black text-slate-950">Ảnh hiện trạng</h3>
          {detailLoading ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">{images.length} ảnh</span>}
        </div>
        {detailLoading ? (
          <div className="mt-3 grid grid-cols-3 gap-2">{[1, 2, 3].map((item) => <div key={item} className="aspect-square animate-pulse rounded-xl bg-slate-100" />)}</div>
        ) : images.length > 0 ? (
          <div className="mt-3 grid grid-cols-3 gap-2">
            {images.map((image, index) => (
              <button key={image.id} className="aspect-square overflow-hidden rounded-xl bg-slate-100" type="button" onClick={() => onOpenGallery(images, index)}>
                {image.signed_url ? <img alt={image.file_name ?? "Ảnh job"} className="h-full w-full object-cover" loading="lazy" src={image.signed_url} /> : <ExpiredImageNotice compact={true} expired={Boolean(image.storage_deleted || image.storage_deleted_at || image.deleted_at)} />}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-3 rounded-2xl border border-dashed border-slate-200 p-5 text-center text-sm font-semibold text-slate-500">Job này chưa có ảnh upload.</div>
        )}
      </section>

      <section className="mt-6">
        <h3 className="font-black text-slate-950">Timeline</h3>
        <div className="mt-3 space-y-3">
          {(detail?.statusHistory.length ? detail.statusHistory : [{ id: "current", new_status: job.status, created_at: job.created_at, note: null }]).map((item) => (
            <div key={item.id} className="flex gap-3">
              <div className="mt-1 h-3 w-3 rounded-full bg-cyan-500" />
              <div>
                <p className="text-sm font-black text-slate-950">{JOB_STATUS_LABELS[item.new_status]}</p>
                <p className="text-xs font-semibold text-slate-400">{formatDate(item.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function ExpiredImageNotice({ compact = false, expired = false }: { compact?: boolean; expired?: boolean }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-3 text-center text-slate-400">
      <ImageIcon className={compact ? "h-6 w-6" : "h-10 w-10"} />
      {expired ? <span className="mt-2 text-xs font-semibold text-slate-500">Ảnh đã được quản trị viên xóa để tiết kiệm dung lượng lưu trữ.</span> : null}
    </div>
  );
}

function GalleryModal({ gallery, onClose, onMove }: { gallery: StaffGalleryState; onClose: () => void; onMove: (index: number) => void }) {
  const image = gallery.images[gallery.index];
  const previousIndex = gallery.index === 0 ? gallery.images.length - 1 : gallery.index - 1;
  const nextIndex = gallery.index === gallery.images.length - 1 ? 0 : gallery.index + 1;
  const imageUnavailable = Boolean(image.storage_deleted || image.storage_deleted_at || image.deleted_at);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-5xl overflow-hidden rounded-[2rem] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 p-4">
          <div>
            <p className="font-black text-slate-950">{image.file_name ?? "Ảnh job"}</p>
            <p className="text-sm font-semibold text-slate-400">{gallery.index + 1}/{gallery.images.length}</p>
          </div>
          <button className="secondary-button px-3 py-2" type="button" onClick={onClose}><X className="h-5 w-5" /></button>
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
            <ExpiredImageNotice expired={imageUnavailable} />
          )}
          {gallery.images.length > 1 ? (
            <>
              <button className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lg" type="button" onClick={() => onMove(previousIndex)}><ChevronLeft className="h-5 w-5" /></button>
              <button className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white shadow-lg" type="button" onClick={() => onMove(nextIndex)}><ChevronRight className="h-5 w-5" /></button>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
