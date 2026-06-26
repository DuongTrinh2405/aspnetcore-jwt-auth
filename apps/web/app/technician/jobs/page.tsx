"use client";

import {
  getGoogleMapsDirectionsUrl,
  isTechnicianRole,
  JOB_STATUS_LABELS,
  SERVICE_TYPE_LABELS,
  type Job,
  type JobStatus
} from "@cnl/shared";
import {
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ImageIcon,
  Loader2,
  MapPin,
  Phone,
  ShieldCheck,
  Wrench,
  X
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { JobImageGallery } from "../../../components/JobImageGallery";
import { RoleGuard } from "../../../components/RoleGuard";
import { PriorityBadge, StatusBadge } from "../../../components/StatusBadge";
import { TechnicianShell } from "../../../components/TechnicianShell";
import { AppButton, AppCard, AppEmptyState, AppPageContainer, AppSkeleton } from "../../../components/ui/AppPrimitives";
import {
  acceptJob,
  fetchAssignedJobs,
  fetchAvailableJobs,
  fetchTechnicianJobImages,
  primeAssignedJobs,
  primeAvailableJobs,
  type TechnicianJobWithImages,
  updateAssignedJobStatus
} from "../../../lib/technician";
import { formatRelativeSubmittedTime, formatSubmittedAt, getJobSubmittedAt } from "../../../lib/time";

type TabKey = "available" | "assigned";
type TimeSortKey = "newest" | "oldest";
type TechnicianJobForUi = Job & Pick<Partial<TechnicianJobWithImages>, "images">;
type PendingTechnicianAction =
  | { type: "accept"; job: TechnicianJobForUi; technicianId: string }
  | { type: "status"; job: TechnicianJobForUi; nextStatus: JobStatus };

export default function TechnicianJobsPage() {
  return (
      <Suspense fallback={<main className="min-h-screen bg-[#F6F9FC] p-6 text-slate-500">Đang tải danh sách việc...</main>}>
      <TechnicianJobsContent />
    </Suspense>
  );
}

function TechnicianJobsContent() {
  const [availableJobs, setAvailableJobs] = useState<Job[]>([]);
  const [assignedJobs, setAssignedJobs] = useState<TechnicianJobWithImages[]>([]);
  const [selectedJob, setSelectedJob] = useState<TechnicianJobForUi | null>(null);
  const [tab, setTab] = useState<TabKey>("available");
  const [timeSort, setTimeSort] = useState<TimeSortKey>("newest");
  const [loading, setLoading] = useState(true);
  const [busyJobId, setBusyJobId] = useState<string | null>(null);
  const [imageLoadingJobId, setImageLoadingJobId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingTechnicianAction | null>(null);
  const [message, setMessage] = useState("");
  const [loadError, setLoadError] = useState("");
  const jobsRequestRef = useRef(0);
  const searchParams = useSearchParams();
  const router = useRouter();

  async function loadJobs() {
    const requestId = jobsRequestRef.current + 1;
    jobsRequestRef.current = requestId;
    setLoading(true);
    setLoadError("");
    try {
      const [available, assigned] = await Promise.all([fetchAvailableJobs(), fetchAssignedJobs()]);
      if (jobsRequestRef.current === requestId) {
        setAvailableJobs(available);
        setAssignedJobs(assigned);
      }
    } catch (error) {
      if (jobsRequestRef.current === requestId) {
        setLoadError(error instanceof Error ? error.message : "Không tải được danh sách việc.");
      }
    } finally {
      if (jobsRequestRef.current === requestId) {
        setLoading(false);
      }
    }
  }

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    setTab(searchParams.get("tab") === "assigned" ? "assigned" : "available");
  }, [searchParams]);

  useEffect(() => {
    if (!selectedJob || selectedJob.images?.length) {
      return;
    }

    let cancelled = false;
    setImageLoadingJobId(selectedJob.id);
    fetchTechnicianJobImages(selectedJob.id)
      .then((images) => {
        if (cancelled) return;
        setSelectedJob((current) => (current?.id === selectedJob.id ? { ...current, images } : current));
        setAssignedJobs((current) => current.map((job) => (job.id === selectedJob.id ? { ...job, images } : job)));
      })
      .catch(() => {
        // Some visible jobs may not expose images until assignment. Keep the detail sheet responsive.
      })
      .finally(() => {
        if (!cancelled) {
          setImageLoadingJobId(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [selectedJob]);

  async function handleAccept(jobId: string, technicianId: string) {
    const targetJob = availableJobs.find((job) => job.id === jobId);
    const previousAvailable = availableJobs;
    const previousAssigned = assignedJobs;

    setBusyJobId(jobId);
    setMessage("");
    setTab("assigned");
    router.replace("/technician/jobs?tab=assigned", { scroll: false });

    if (targetJob) {
      const optimisticJob: TechnicianJobWithImages = {
        ...targetJob,
        images: [],
        assigned_technician_id: technicianId,
        status: "accepted",
        updated_at: new Date().toISOString()
      };
      const nextAvailable = previousAvailable.filter((job) => job.id !== jobId);
      const nextAssigned = [optimisticJob, ...previousAssigned.filter((job) => job.id !== jobId)];
      setAvailableJobs(nextAvailable);
      setAssignedJobs(nextAssigned);
      primeAvailableJobs(nextAvailable);
      primeAssignedJobs(nextAssigned);
    }

    try {
      const accepted = await acceptJob(jobId);
      setAssignedJobs((current) => current.map((job) => (job.id === jobId ? accepted : job)));
      setSelectedJob(accepted);
      setMessage("Đã nhận việc. Bạn có thể gọi khách hoặc mở chỉ đường ngay.");
      void loadJobs();
    } catch (error) {
      setAvailableJobs(previousAvailable);
      setAssignedJobs(previousAssigned);
      primeAvailableJobs(previousAvailable);
      primeAssignedJobs(previousAssigned);
      setTab("available");
      router.replace("/technician/jobs?tab=available", { scroll: false });
      setMessage(error instanceof Error ? error.message : "Không nhận được job.");
    } finally {
      setBusyJobId(null);
    }
  }

  function requestAccept(job: TechnicianJobForUi, technicianId: string) {
    setPendingAction({ type: "accept", job, technicianId });
  }

  function requestStatus(job: TechnicianJobForUi, nextStatus: JobStatus) {
    setPendingAction({ type: "status", job, nextStatus });
  }

  function executePendingAction() {
    if (!pendingAction || busyJobId) return;
    const action = pendingAction;
    setPendingAction(null);

    if (action.type === "accept") {
      void handleAccept(action.job.id, action.technicianId);
      return;
    }

    void handleStatus(action.job.id, action.nextStatus);
  }

  async function handleStatus(jobId: string, nextStatus: JobStatus) {
    const previousAssigned = assignedJobs;
    const now = new Date().toISOString();
    const nextAssigned = previousAssigned.map((job) =>
      job.id === jobId ? { ...job, status: nextStatus, updated_at: now } : job
    );

    setBusyJobId(jobId);
    setMessage("");
    setAssignedJobs(nextAssigned);
    setSelectedJob((current) => (current?.id === jobId ? { ...current, status: nextStatus, updated_at: now } : current));
    primeAssignedJobs(nextAssigned);

    try {
      const updated = await updateAssignedJobStatus(jobId, nextStatus);
      setAssignedJobs((current) => current.map((job) => (job.id === jobId ? updated : job)));
      setSelectedJob((current) => (current?.id === jobId ? updated : current));
      setMessage(`Đã cập nhật: ${JOB_STATUS_LABELS[nextStatus]}.`);
    } catch (error) {
      setAssignedJobs(previousAssigned);
      setSelectedJob((current) => {
        const previous = previousAssigned.find((job) => job.id === current?.id);
        return previous ?? current;
      });
      primeAssignedJobs(previousAssigned);
      setMessage(error instanceof Error ? error.message : "Không cập nhật được trạng thái.");
    } finally {
      setBusyJobId(null);
    }
  }

  const currentJobs: TechnicianJobForUi[] = useMemo(
    () =>
      [...(tab === "available" ? availableJobs : assignedJobs)].sort((a, b) => {
        const first = new Date(getJobSubmittedAt(a)).getTime();
        const second = new Date(getJobSubmittedAt(b)).getTime();
        return timeSort === "newest" ? second - first : first - second;
      }),
    [availableJobs, assignedJobs, tab, timeSort]
  );
  const urgentCount = useMemo(
    () => currentJobs.filter((job) => job.priority === "urgent" || job.priority === "high").length,
    [currentJobs]
  );

  return (
    <RoleGuard allow={isTechnicianRole}>
      {(profile) => (
        <TechnicianShell profile={profile}>
          <AppPageContainer className="max-w-4xl">
            <section className="rounded-[1.75rem] border border-blue-100 bg-white p-5 shadow-[0_20px_70px_rgba(37,99,235,0.09)]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Điều phối kỹ thuật</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Việc ngoài hiện trường</h1>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                    Nhận việc, gọi khách, mở chỉ đường và cập nhật tiến độ bằng các thao tác lớn, dễ bấm trên điện thoại.
                  </p>
                </div>
                <div className="hidden rounded-2xl bg-cyan-50 px-4 py-3 text-sm font-semibold text-cyan-700 ring-1 ring-cyan-100 sm:block">
                  {urgentCount} việc ưu tiên
                </div>
              </div>

              <div className="mt-5 grid gap-2 rounded-2xl bg-slate-50 p-2 sm:grid-cols-2">
                {[
                  { key: "available", label: "Có thể nhận", count: availableJobs.length },
                  { key: "assigned", label: "Việc của tôi", count: assignedJobs.length }
                ].map((item) => (
                  <button
                    key={item.key}
                    className={`min-h-12 rounded-xl px-4 text-sm font-semibold transition duration-200 active:scale-[0.98] ${
                      tab === item.key
                        ? "bg-blue-600 text-white shadow-[0_12px_30px_rgba(37,99,235,0.20)]"
                        : "text-slate-600 hover:bg-white hover:text-slate-950"
                    }`}
                    onClick={() => {
                      const nextTab = item.key as TabKey;
                      setTab(nextTab);
                      router.replace(`/technician/jobs?tab=${nextTab}`, { scroll: false });
                    }}
                    type="button"
                  >
                    {item.label} ({item.count})
                  </button>
                ))}
              </div>
            </section>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-white p-2 shadow-sm">
              <p className="px-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Thời gian khách gửi</p>
              <div className="grid flex-1 grid-cols-2 gap-1 sm:max-w-sm">
                {[
                  { key: "newest", label: "Mới nhất" },
                  { key: "oldest", label: "Cũ trước" }
                ].map((item) => (
                  <button
                    key={item.key}
                    className={`min-h-10 rounded-xl px-3 text-sm font-semibold transition active:scale-[0.98] ${
                      timeSort === item.key ? "bg-blue-600 text-white shadow-sm" : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                    }`}
                    type="button"
                    onClick={() => setTimeSort(item.key as TimeSortKey)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {message ? (
              <div className="fixed inset-x-4 bottom-24 z-40 rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-[0_18px_50px_rgba(15,23,42,0.18)] lg:bottom-6 lg:left-auto lg:right-6 lg:w-96">
                {message}
              </div>
            ) : null}
            {loadError ? <p className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{loadError}</p> : null}
            {loading && currentJobs.length > 0 ? (
              <p className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/80 px-4 py-3 text-sm font-semibold text-blue-700">
                Đang cập nhật danh sách việc, dữ liệu hiện tại vẫn được giữ nguyên.
              </p>
            ) : null}

            <section className="mt-5 grid gap-4">
              {loading && currentJobs.length === 0 ? (
                [1, 2, 3].map((item) => <AppSkeleton key={item} className="h-56 rounded-3xl" />)
              ) : currentJobs.length > 0 ? (
                currentJobs.map((job) => (
                  <TechnicianJobCard
                    key={job.id}
                    busy={busyJobId === job.id}
                    job={job}
                    mode={tab}
                    onAccept={() => requestAccept(job, profile.id)}
                    onOpenDetail={() => setSelectedJob(job)}
                    onStatus={(status) => requestStatus(job, status)}
                  />
                ))
              ) : (
                <AppEmptyState
                  title={tab === "available" ? "Chưa có việc phù hợp" : "Bạn chưa nhận việc nào"}
                  description={
                    tab === "available"
                      ? "Yêu cầu VIP chỉ hiện với kỹ thuật viên VIP. Khi có việc mới, danh sách này sẽ cập nhật sau khi tải lại."
                      : "Quay lại mục có thể nhận để chọn yêu cầu mới."
                  }
                  action={
                    tab === "assigned" ? (
                      <AppButton onClick={() => setTab("available")} type="button">
                        Xem việc có thể nhận
                      </AppButton>
                    ) : undefined
                  }
                />
              )}
            </section>

            <TechnicianJobDetailSheet
              busy={selectedJob ? busyJobId === selectedJob.id : false}
              imageLoading={selectedJob ? imageLoadingJobId === selectedJob.id : false}
              job={selectedJob}
              mode={tab}
              onAccept={selectedJob ? () => requestAccept(selectedJob, profile.id) : undefined}
              onClose={() => setSelectedJob(null)}
              onStatus={(status) => {
                if (selectedJob) {
                  requestStatus(selectedJob, status);
                }
              }}
            />
            <TechnicianActionConfirmDialog
              action={pendingAction}
              busy={pendingAction ? busyJobId === pendingAction.job.id : false}
              onCancel={() => setPendingAction(null)}
              onConfirm={executePendingAction}
            />
          </AppPageContainer>
        </TechnicianShell>
      )}
    </RoleGuard>
  );
}

function TechnicianJobCard({
  job,
  mode,
  busy,
  onAccept,
  onOpenDetail,
  onStatus
}: {
  job: TechnicianJobForUi;
  mode: TabKey;
  busy: boolean;
  onAccept: () => void;
  onOpenDetail: () => void;
  onStatus: (status: JobStatus) => void;
}) {
  const primaryAction = getPrimaryAction(job, mode, onAccept, onStatus);
  const nextStep = getTechnicianNextStep(job, mode);
  const submittedAt = getJobSubmittedAt(job);
  const postedTime = formatRelativeSubmittedTime(job);

  return (
    <AppCard className="overflow-hidden p-0 transition duration-200 hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-[0_20px_56px_rgba(37,99,235,0.13)] active:scale-[0.995]">
      {job.images?.length ? (
        <div className="border-b border-slate-100 bg-slate-50/70 px-4 pt-4">
          <JobImageGallery images={job.images} maxVisible={4} />
        </div>
      ) : null}

      <div className="p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">{SERVICE_TYPE_LABELS[job.service_type]}</p>
            <h2 className="mt-1 line-clamp-2 text-xl font-semibold tracking-tight text-slate-950">{job.title}</h2>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2">
            {job.is_vip ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold text-white">
                <ShieldCheck className="h-3.5 w-3.5" />
                VIP
              </span>
            ) : null}
            <StatusBadge status={job.status} />
            <PriorityBadge priority={job.priority} />
            <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 ring-1 ring-cyan-100">
              <CalendarClock className="h-3.5 w-3.5" />
              {postedTime}
            </span>
          </div>
        </div>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{job.description}</p>

        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-3">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Bước tiếp theo</p>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-800">{nextStep}</p>
        </div>

        <div className="mt-4 grid gap-2 text-sm text-slate-600">
          <InfoLine icon={MapPin} text={job.address} />
          <InfoLine icon={Phone} text={job.phone} />
          <InfoLine
            icon={CalendarClock}
            text={
              job.desired_schedule_at
                ? `Hẹn: ${new Date(job.desired_schedule_at).toLocaleString("vi-VN")}`
                : `${postedTime} · ${formatSubmittedAt(submittedAt)}`
            }
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <a
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-800 transition hover:border-blue-200 hover:bg-blue-50 active:scale-[0.98]"
            href={`tel:${job.phone}`}
          >
            <Phone className="h-4 w-4 text-cyan-600" />
            Gọi khách
          </a>
          <a
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-3 text-sm font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-white active:scale-[0.98]"
            href={getGoogleMapsDirectionsUrl(job)}
            rel="noreferrer"
            target="_blank"
          >
            <MapPin className="h-4 w-4 text-cyan-600" />
            Chỉ đường
          </a>
        </div>

        <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto]">
          {primaryAction ? (
            <AppButton disabled={busy} onClick={primaryAction.onClick} size="lg" type="button">
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : primaryAction.icon}
              {primaryAction.label}
            </AppButton>
          ) : (
            <AppButton disabled size="lg" type="button" variant="secondary">
              <CheckCircle2 className="h-5 w-5" />
              Đã xử lý
            </AppButton>
          )}
          <AppButton onClick={onOpenDetail} size="lg" type="button" variant="secondary">
            Chi tiết
            <ChevronRight className="h-5 w-5" />
          </AppButton>
        </div>
      </div>
    </AppCard>
  );
}

function TechnicianJobDetailSheet({
  job,
  mode,
  busy,
  imageLoading,
  onAccept,
  onClose,
  onStatus
}: {
  job: TechnicianJobForUi | null;
  mode: TabKey;
  busy: boolean;
  imageLoading: boolean;
  onAccept?: () => void;
  onClose: () => void;
  onStatus: (status: JobStatus) => void;
}) {
  if (!job) {
    return null;
  }

  const primaryAction = getPrimaryAction(job, mode, onAccept, onStatus);
  const nextStep = getTechnicianNextStep(job, mode);
  const submittedAt = getJobSubmittedAt(job);
  const postedTime = formatRelativeSubmittedTime(job);
  const steps: Array<{ status: JobStatus; label: string }> = [
    { status: "pending", label: "Đang chờ" },
    { status: "accepted", label: "Đã tiếp nhận" },
    { status: "in_progress", label: "Đang xử lý" },
    { status: "completed", label: "Hoàn thành" }
  ];
  const currentStep = Math.max(0, steps.findIndex((step) => step.status === normalizeStatus(job.status)));

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/40 backdrop-blur-sm lg:items-center lg:justify-center" role="dialog" aria-modal="true">
      <button className="absolute inset-0 cursor-default" onClick={onClose} type="button" aria-label="Đóng chi tiết việc" />
      <section className="relative max-h-[92vh] w-full overflow-hidden rounded-t-[2rem] bg-[#F6F9FC] shadow-2xl lg:max-w-2xl lg:rounded-[2rem]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
          <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition active:scale-95" onClick={onClose} type="button">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-600">{SERVICE_TYPE_LABELS[job.service_type]}</p>
            <p className="text-sm font-semibold text-slate-950">Chi tiết việc</p>
          </div>
          <button className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 transition active:scale-95" onClick={onClose} type="button">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[calc(92vh-9rem)] overflow-y-auto px-4 pb-32 pt-4">
          {job.images?.length ? (
            <AppCard className="p-3">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-950">Ảnh hiện trạng</p>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  <ImageIcon className="h-3.5 w-3.5" />
                  {job.images.length} ảnh
                </span>
              </div>
              <JobImageGallery images={job.images} maxVisible={6} />
            </AppCard>
          ) : imageLoading ? (
            <AppCard className="p-4">
              <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                Đang tải ảnh hiện trạng...
              </div>
            </AppCard>
          ) : null}

          <AppCard className="mt-3 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={job.status} />
              <PriorityBadge priority={job.priority} />
              <span className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700 ring-1 ring-cyan-100">
                <CalendarClock className="h-3.5 w-3.5" />
                {postedTime}
              </span>
            </div>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">{job.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{job.description}</p>
            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-3">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Bước tiếp theo</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-800">{nextStep}</p>
            </div>
          </AppCard>

          <AppCard className="mt-3 p-4">
            <h3 className="text-base font-semibold text-slate-950">Liên hệ và di chuyển</h3>
            <div className="mt-3 grid gap-2 text-sm text-slate-600">
              <InfoLine icon={Phone} text={job.phone} />
              <InfoLine icon={MapPin} text={job.address} />
              <InfoLine
                icon={CalendarClock}
                text={
                  job.desired_schedule_at
                    ? `Hẹn: ${new Date(job.desired_schedule_at).toLocaleString("vi-VN")}`
                    : `${postedTime} · ${formatSubmittedAt(submittedAt)}`
                }
              />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 active:scale-[0.98]" href={`tel:${job.phone}`}>
                <Phone className="h-4 w-4" />
                Gọi khách
              </a>
              <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-blue-100 bg-blue-50 px-3 text-sm font-semibold text-blue-700 active:scale-[0.98]" href={getGoogleMapsDirectionsUrl(job)} rel="noreferrer" target="_blank">
                <MapPin className="h-4 w-4" />
                Mở map
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </AppCard>

          <AppCard className="mt-3 p-4">
            <h3 className="text-base font-semibold text-slate-950">Tiến độ</h3>
            <div className="mt-4 grid gap-3">
              {steps.map((step, index) => {
                const done = index <= currentStep;
                return (
                  <div key={step.status} className="flex items-center gap-3">
                    <div className={`grid h-9 w-9 place-items-center rounded-full ${done ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                      {done ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${done ? "text-slate-950" : "text-slate-500"}`}>{step.label}</p>
                      <p className="text-xs text-slate-400">{step.status === job.status ? "Trạng thái hiện tại" : JOB_STATUS_LABELS[step.status]}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </AppCard>
        </div>

        <div className="absolute inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur">
          {job.status === "in_progress" ? (
            <p className="mb-3 rounded-2xl bg-amber-50 px-3 py-2 text-xs font-semibold leading-5 text-amber-800">
              Chỉ bấm hoàn thành khi đã xử lý xong và đã thống nhất kết quả với khách hàng.
            </p>
          ) : null}
          {primaryAction ? (
            <AppButton className="w-full" disabled={busy} onClick={primaryAction.onClick} size="lg" type="button">
              {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : primaryAction.icon}
              {primaryAction.label}
            </AppButton>
          ) : (
            <AppButton className="w-full" disabled size="lg" type="button" variant="secondary">
              <CheckCircle2 className="h-5 w-5" />
              Không còn thao tác chính
            </AppButton>
          )}
        </div>
      </section>
    </div>
  );
}

function TechnicianActionConfirmDialog({
  action,
  busy,
  onCancel,
  onConfirm
}: {
  action: PendingTechnicianAction | null;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!action) return null;

  const postedTime = formatRelativeSubmittedTime(action.job);
  const isAccept = action.type === "accept";
  const isComplete = action.type === "status" && action.nextStatus === "completed";
  const title = isAccept ? "Nhận việc này?" : isComplete ? "Xác nhận hoàn thành?" : "Cập nhật trạng thái?";
  const body = isAccept
    ? `Việc này ${postedTime.toLowerCase()}. Sau khi nhận, việc sẽ chuyển vào danh sách của bạn. Hãy chắc chắn khu vực và chuyên môn phù hợp.`
    : isComplete
      ? "Chỉ hoàn thành khi bạn đã xử lý xong, trao đổi với khách và không còn bước kỹ thuật cần làm."
      : "Hệ thống sẽ cập nhật tiến độ việc này để khách và điều phối theo dõi chính xác.";
  const primaryLabel = isAccept ? "Xác nhận nhận việc" : isComplete ? "Hoàn thành việc" : "Xác nhận cập nhật";

  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-slate-950/45 px-4 pb-4 backdrop-blur-sm sm:items-center sm:justify-center sm:pb-0" role="dialog" aria-modal="true">
      <button className="absolute inset-0 cursor-default" type="button" onClick={onCancel} aria-label="Đóng xác nhận" />
      <AppCard className="relative w-full max-w-md p-5">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-700">
          {isAccept ? <BriefcaseBusiness className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
        </div>
        <h2 className="mt-4 text-xl font-semibold tracking-tight text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">{body}</p>
        <div className="mt-4 rounded-2xl bg-slate-50 p-3">
          <p className="line-clamp-1 text-sm font-semibold text-slate-950">{action.job.title}</p>
          <p className="mt-1 text-xs font-semibold text-slate-500">{postedTime}</p>
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          <AppButton disabled={busy} variant="secondary" type="button" onClick={onCancel}>
            Quay lại
          </AppButton>
          <AppButton disabled={busy} type="button" onClick={onConfirm}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {primaryLabel}
          </AppButton>
        </div>
      </AppCard>
    </div>
  );
}

function getPrimaryAction(
  job: TechnicianJobForUi,
  mode: TabKey,
  onAccept: (() => void) | undefined,
  onStatus: (status: JobStatus) => void
): { label: string; icon: React.ReactNode; onClick: () => void } | null {
  if (mode === "available" && onAccept) {
    return { label: "Nhận việc", icon: <BriefcaseBusiness className="h-5 w-5" />, onClick: onAccept };
  }

  if (job.status === "accepted") {
    return { label: "Bắt đầu xử lý", icon: <Wrench className="h-5 w-5" />, onClick: () => onStatus("in_progress") };
  }

  if (job.status === "in_progress") {
    return { label: "Hoàn thành việc", icon: <CheckCircle2 className="h-5 w-5" />, onClick: () => onStatus("completed") };
  }

  return null;
}

function getTechnicianNextStep(job: TechnicianJobForUi, mode: TabKey) {
  if (mode === "available") {
    return "Nếu phù hợp khu vực và chuyên môn, hãy nhận việc rồi gọi khách hoặc mở chỉ đường.";
  }

  if (job.status === "accepted") {
    return "Gọi khách để xác nhận tình trạng và thời gian, sau đó bắt đầu xử lý khi đến nơi.";
  }

  if (job.status === "in_progress") {
    return "Hoàn tất kiểm tra/sửa chữa, trao đổi kết quả với khách rồi mới cập nhật hoàn thành.";
  }

  if (job.status === "completed") {
    return "Việc đã hoàn thành. Không còn thao tác chính trên job này.";
  }

  return "Xem thông tin khách, ảnh hiện trạng và chuẩn bị trước khi nhận hoặc xử lý.";
}

function normalizeStatus(status: JobStatus): JobStatus {
  if (status === "accepted" || status === "in_progress" || status === "completed") {
    return status;
  }
  return "pending";
}

function InfoLine({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <p className="flex min-w-0 items-start gap-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-600" />
      <span className="min-w-0 break-words">{text}</span>
    </p>
  );
}
