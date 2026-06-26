"use client";

import {
  fetchJobImageMetadataForClient,
  getJobMapUrl,
  hydrateJobImageSignedUrlsForClient,
  isCustomerRole,
  JOB_PUBLIC_SELECT,
  SERVICE_TYPE_LABELS,
  type Job,
  type JobImage,
  type JobStatus
} from "@cnl/shared";
import { CalendarClock, Check, Circle, ExternalLink, ImageIcon, MapPin, Phone } from "lucide-react";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { JobImageGallery } from "../../../../components/JobImageGallery";
import { ProductShell } from "../../../../components/ProductShell";
import { RoleGuard } from "../../../../components/RoleGuard";
import { PriorityBadge, StatusBadge } from "../../../../components/StatusBadge";
import { AppCard, AppEmptyState, AppPageContainer, AppSkeleton } from "../../../../components/ui/AppPrimitives";
import { supabase } from "../../../../lib/supabase";
import { formatRelativeSubmittedTime, formatSubmittedAt, getJobSubmittedAt } from "../../../../lib/time";

const timeline: Array<{ status: JobStatus; label: string; description: string }> = [
  { status: "pending", label: "Đang chờ tiếp nhận", description: "Yêu cầu đã được ghi nhận và chờ điều phối." },
  { status: "accepted", label: "Đã tiếp nhận", description: "Kỹ thuật viên hoặc điều phối viên đã nhận thông tin." },
  { status: "in_progress", label: "Đang xử lý", description: "Yêu cầu đang được xử lý hoặc chuẩn bị thi công." },
  { status: "completed", label: "Hoàn thành", description: "Job đã hoàn tất và sẵn sàng theo dõi bảo hành nếu có." }
];

function getCustomerNextStep(status: JobStatus) {
  if (status === "pending") {
    return "Trung tâm đang kiểm tra thông tin và sẽ điều phối kỹ thuật viên phù hợp.";
  }

  if (status === "accepted") {
    return "Yêu cầu đã được tiếp nhận. Bạn nên giữ điện thoại sẵn sàng để kỹ thuật viên liên hệ.";
  }

  if (status === "in_progress") {
    return "Kỹ thuật viên đang xử lý. Tiến độ mới nhất sẽ được cập nhật trong timeline.";
  }

  if (status === "completed") {
    return "Yêu cầu đã hoàn thành. Hãy lưu mã yêu cầu để tra cứu lại hoặc hỗ trợ bảo hành khi cần.";
  }

  return "Yêu cầu đã dừng xử lý. Liên hệ trung tâm nếu bạn cần hỗ trợ thêm.";
}

export default function CustomerJobDetailPage() {
  const params = useParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [images, setImages] = useState<JobImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [imageLoading, setImageLoading] = useState(false);

  useEffect(() => {
    async function loadJob() {
      setLoading(true);
      const { data } = await supabase.from("jobs").select(JOB_PUBLIC_SELECT).eq("id", params.id).single();
      const nextJob = (data as Job) ?? null;
      setJob(nextJob);
      setLoading(false);
      if (nextJob) {
        setImageLoading(true);
        fetchJobImageMetadataForClient(supabase, nextJob.id)
          .then(setImages)
          .finally(() => setImageLoading(false));
      }
    }

    loadJob();
  }, [params.id]);

  function resolveImages(nextImages: JobImage[]) {
    setImageLoading(true);
    return hydrateJobImageSignedUrlsForClient(supabase, nextImages).then((signedImages) => {
      setImages(signedImages);
      setImageLoading(false);
      return signedImages;
    }).catch((error: unknown) => {
      setImageLoading(false);
      throw error;
    });
  }

  const activeIndex = useMemo(() => {
    if (!job) return 0;
    return Math.max(0, timeline.findIndex((item) => item.status === job.status));
  }, [job]);

  return (
    <RoleGuard allow={isCustomerRole}>
      {(profile) => (
        <ProductShell profile={profile}>
          <AppPageContainer>
            {loading ? (
              <div className="grid gap-4">
                <AppSkeleton className="h-52" />
                <AppSkeleton className="h-80" />
              </div>
            ) : job ? (
              <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
                <section className="space-y-5">
                  <AppCard className="overflow-hidden">
                    <div className="bg-gradient-to-br from-white via-sky-50/90 to-cyan-50 p-5 sm:p-7">
                      <div className="flex flex-wrap items-center gap-2">
                        <StatusBadge status={job.status} />
                        <PriorityBadge priority={job.priority} />
                        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 ring-1 ring-cyan-100">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {formatRelativeSubmittedTime(job)}
                        </span>
                      </div>
                      <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">{SERVICE_TYPE_LABELS[job.service_type]}</p>
                      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{job.title}</h1>
                      <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">{job.description}</p>
                      <div className="mt-5 rounded-2xl border border-white/80 bg-white/85 p-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-cyan-600">Bước tiếp theo</p>
                        <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">{getCustomerNextStep(job.status)}</p>
                        <p className="mt-2 text-xs font-semibold text-slate-500">
                          Mã yêu cầu: {job.tracking_code ?? job.id.slice(0, 8).toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </AppCard>

                  <AppCard className="p-5 sm:p-6">
                    <h2 className="text-xl font-semibold text-slate-950">Tiến độ xử lý</h2>
                    <div className="mt-5 space-y-5">
                      {timeline.map((item, index) => {
                        const done = job.status !== "cancelled" && index <= activeIndex;
                        return (
                          <div key={item.status} className="flex gap-4">
                            <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full ${done ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                              {done ? <Check className="h-5 w-5" /> : <Circle className="h-4 w-4" />}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-950">{item.label}</p>
                              <p className="mt-1 text-sm leading-6 text-slate-500">{item.description}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AppCard>

                  <AppCard className="p-5 sm:p-6">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-xl font-semibold text-slate-950">Ảnh hiện trạng</h2>
                      <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">{images.length} ảnh</span>
                    </div>
                    {images.length > 0 ? (
                      <JobImageGallery images={images} maxVisible={6} onResolveImages={resolveImages} />
                    ) : imageLoading ? (
                      <div className="mt-4 grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map((item) => <AppSkeleton key={item} className="aspect-square" />)}
                      </div>
                    ) : (
                      <div className="mt-4">
                        <AppEmptyState icon={ImageIcon} title="Chưa có ảnh" description="Job này chưa có ảnh hiện trạng được upload." />
                      </div>
                    )}
                  </AppCard>
                </section>

                <aside className="space-y-4">
                  <AppCard className="p-5">
                    <h2 className="text-lg font-semibold text-slate-950">Thông tin liên hệ</h2>
                    <div className="mt-4 space-y-3 text-sm text-slate-600">
                      <p className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-cyan-600" />{job.address}</p>
                      <a className="secondary-button w-full" href={getJobMapUrl(job)} rel="noreferrer" target="_blank">
                        <MapPin className="h-5 w-5 text-cyan-600" />
                        Mở Google Maps
                        <ExternalLink className="h-4 w-4" />
                      </a>
                      <p className="flex gap-3"><Phone className="h-5 w-5 text-cyan-600" />{job.phone}</p>
                      <p className="flex gap-3"><CalendarClock className="h-5 w-5 text-cyan-600" />Đã gửi lúc {formatSubmittedAt(getJobSubmittedAt(job))}</p>
                    </div>
                  </AppCard>
                </aside>
              </div>
            ) : (
              <AppEmptyState title="Không tìm thấy job" description="Yêu cầu này không tồn tại hoặc bạn không có quyền xem." />
            )}
          </AppPageContainer>
        </ProductShell>
      )}
    </RoleGuard>
  );
}
