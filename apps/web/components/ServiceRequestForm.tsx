"use client";

import {
  ALLOWED_UPLOAD_MIME_TYPES,
  CNL_CONTACT,
  getGoogleMapsEmbedUrl,
  getGoogleMapsSearchUrl,
  JOB_PRIORITY_LABELS,
  MAX_JOB_IMAGE_COUNT,
  MAX_UPLOAD_SIZE_BYTES,
  SERVICE_CATALOG,
  validateServiceRequestInput,
  validateUploadFiles,
  type Job,
  type JobPriority,
  type ServiceCatalogItem
} from "@cnl/shared";
import {
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  ExternalLink,
  ImagePlus,
  MapPin,
  Navigation,
  Trash2,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { createCustomerJob } from "../lib/jobs";
import { AppSpinner } from "./ui/AppSpinner";
import { AppSelect } from "./ui/InteractionPrimitives";

type ServiceRequestFormProps = {
  mode: "booking" | "report";
};

type PreviewImage = {
  file: File;
  url: string;
};

type FieldKey =
  | "service_category_slug"
  | "issue_type"
  | "title"
  | "description"
  | "image_files"
  | "address"
  | "phone"
  | "google_maps_url"
  | "desired_schedule_at"
  | "priority";

const fieldLabels: Record<string, string> = {
  service_category_slug: "Dịch vụ",
  issue_type: "Loại yêu cầu",
  title: "Tiêu đề",
  description: "Mô tả vấn đề",
  image_files: "Ảnh hiện trạng",
  address: "Địa chỉ",
  phone: "Số điện thoại",
  google_maps_url: "Link Google Maps",
  desired_schedule_at: "Thời gian mong muốn",
  priority: "Mức ưu tiên"
};

const fieldOrder: FieldKey[] = [
  "service_category_slug",
  "issue_type",
  "title",
  "description",
  "image_files",
  "phone",
  "address",
  "google_maps_url",
  "desired_schedule_at",
  "priority"
];

const requestSteps = [
  "Dịch vụ",
  "Vấn đề",
  "Ảnh",
  "Vị trí",
  "Lịch hẹn",
  "Xác nhận"
] as const;

const fieldStepMap: Record<FieldKey, number> = {
  service_category_slug: 0,
  issue_type: 1,
  title: 1,
  description: 1,
  image_files: 2,
  phone: 3,
  address: 3,
  google_maps_url: 3,
  desired_schedule_at: 4,
  priority: 4
};

function getInitialService(searchService: string | null): ServiceCatalogItem {
  return SERVICE_CATALOG.find((service) => service.slug === searchService) ?? SERVICE_CATALOG[0];
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)}KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function getFriendlyErrorMessage(field: string, message: string): string {
  const friendlyMessages: Record<string, string> = {
    service_category_slug: "Chọn nhóm dịch vụ phù hợp.",
    issue_type: "Chọn loại yêu cầu hoặc sự cố.",
    title: "Nhập tiêu đề ngắn gọn, ít nhất 3 ký tự.",
    description: "Mô tả vấn đề rõ hơn, ít nhất 10 ký tự.",
    address: "Nhập địa chỉ rõ ràng hơn.",
    phone: "Nhập số điện thoại Việt Nam hợp lệ.",
    google_maps_url: "Dán link Google Maps hợp lệ.",
    desired_schedule_at: "Chọn thời gian mong muốn hợp lệ.",
    priority: "Chọn mức ưu tiên phù hợp.",
    image_files: message
      .replace("Toi da", "Tối đa")
      .replace("anh cho moi yeu cau.", "ảnh cho mỗi yêu cầu.")
      .replace("Chi chap nhan anh jpg, png hoac webp.", "Chỉ chấp nhận ảnh jpg, png hoặc webp.")
      .replace("Moi anh toi da 10MB.", "Mỗi ảnh tối đa 10MB.")
  };

  return friendlyMessages[field] ?? "Thông tin này chưa hợp lệ.";
}

function getErrorSummary(errors: Record<string, string>) {
  return fieldOrder
    .filter((field) => errors[field])
    .map((field) => ({
      field,
      label: fieldLabels[field],
      message: getFriendlyErrorMessage(field, errors[field])
    }));
}

function ValidationSummaryDialog({
  buttonRef,
  items,
  onClose
}: {
  buttonRef: { current: HTMLButtonElement | null };
  items: Array<{ field: FieldKey; label: string; message: string }>;
  onClose: () => void;
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/55 p-3 backdrop-blur-sm sm:items-center" role="presentation" onMouseDown={onClose}>
      <section
        aria-describedby="validation-summary-description"
        aria-labelledby="validation-summary-title"
        aria-modal="true"
        className="w-full max-w-lg rounded-[1.75rem] border border-rose-100 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.24)] sm:p-6"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-rose-600">Cần bổ sung</p>
            <h2 id="validation-summary-title" className="mt-2 text-2xl font-semibold text-slate-950">
              Vui lòng kiểm tra lại thông tin
            </h2>
            <p id="validation-summary-description" className="mt-2 text-base leading-7 text-slate-600">
              Một số thông tin chưa hợp lệ hoặc còn thiếu.
            </p>
          </div>
          <button className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" type="button" onClick={onClose} aria-label="Đóng thông báo lỗi">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {items.map((item) => (
            <div key={item.field} className="rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3">
              <p className="font-semibold text-slate-950">{item.label}</p>
              <p className="mt-1 text-sm leading-6 text-rose-700">{item.message}</p>
            </div>
          ))}
        </div>

        <button ref={buttonRef} className="premium-button mt-5 w-full bg-rose-600 hover:bg-rose-700" type="button" onClick={onClose}>
          Kiểm tra lại
        </button>
      </section>
    </div>
  );
}

export function ServiceRequestForm({ mode }: ServiceRequestFormProps) {
  const router = useRouter();
  const isOnline = useOnlineStatus();
  const initialService = getInitialService(null);
  const [serviceSlug, setServiceSlug] = useState(initialService.slug);
  const selectedService = SERVICE_CATALOG.find((service) => service.slug === serviceSlug) ?? SERVICE_CATALOG[0];
  const [issueType, setIssueType] = useState<string>(selectedService.options[0]);
  const [priority, setPriority] = useState<JobPriority>(mode === "report" ? "high" : "normal");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [googleMapsUrl, setGoogleMapsUrl] = useState("");
  const [phone, setPhone] = useState("");
  const [desiredScheduleAt, setDesiredScheduleAt] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<PreviewImage[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [validationModalOpen, setValidationModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [locationMessage, setLocationMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [submittedJob, setSubmittedJob] = useState<Job | null>(null);
  const validationButtonRef = useRef<HTMLButtonElement | null>(null);
  const fieldRefs = useRef<Partial<Record<FieldKey, HTMLElement | null>>>({});

  const trimmedAddress = address.trim();
  const mapQuery = trimmedAddress || "44 Trần Xuân Soạn, Khuê Trung, Cẩm Lệ, Đà Nẵng";
  const mapSearchUrl = useMemo(() => getGoogleMapsSearchUrl(mapQuery), [mapQuery]);
  const mapEmbedUrl = useMemo(() => getGoogleMapsEmbedUrl(mapQuery), [mapQuery]);
  const resolvedGoogleMapsUrl = googleMapsUrl.trim() || (trimmedAddress.length >= 5 ? mapSearchUrl : "");
  const errorSummary = useMemo(() => getErrorSummary(errors), [errors]);
  const lastStepIndex = requestSteps.length - 1;

  function stepClass(index: number) {
    return currentStep === index ? "block" : "hidden";
  }

  function setFieldRef(field: FieldKey) {
    return (element: HTMLElement | null) => {
      fieldRefs.current[field] = element;
    };
  }

  function fieldInputClass(field: FieldKey, extraClass = "") {
    return `premium-input ${errors[field] ? "border-rose-400 bg-rose-50/40 ring-4 ring-rose-500/15 focus:border-rose-500 focus:ring-rose-500/20" : ""} ${extraClass}`.trim();
  }

  function focusFirstInvalidField() {
    const firstInvalidField = fieldOrder.find((field) => errors[field]);
    const target = firstInvalidField ? fieldRefs.current[firstInvalidField] : null;

    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => target.focus({ preventScroll: true }), 220);
  }

  useEffect(() => {
    const requestedService = new URLSearchParams(window.location.search).get("service");
    const storedService = window.localStorage.getItem("cnl:last-service");
    const nextService = getInitialService(requestedService ?? storedService);
    setServiceSlug(nextService.slug);
    setIssueType(nextService.options[0]);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("cnl:last-service", serviceSlug);
  }, [serviceSlug]);

  useEffect(() => {
    const nextPreviews = files.map((file) => ({ file, url: URL.createObjectURL(file) }));
    setPreviews(nextPreviews);

    return () => {
      nextPreviews.forEach((preview) => URL.revokeObjectURL(preview.url));
    };
  }, [files]);

  useEffect(() => {
    if (!validationModalOpen) return;

    validationButtonRef.current?.focus();
    const firstInvalidField = fieldOrder.find((field) => errors[field]);
    fieldRefs.current[firstInvalidField ?? "address"]?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [errors, validationModalOpen]);

  function changeService(nextSlug: string) {
    const nextService = SERVICE_CATALOG.find((service) => service.slug === nextSlug) ?? SERVICE_CATALOG[0];
    setServiceSlug(nextService.slug);
    setIssueType(nextService.options[0]);
    setErrors((current) => {
      const { service_category_slug: _serviceCategorySlug, ...rest } = current;
      return rest;
    });
  }

  function addFiles(nextFiles: File[]) {
    if (files.length + nextFiles.length > MAX_JOB_IMAGE_COUNT) {
      setErrors((current) => ({ ...current, image_files: `Tối đa ${MAX_JOB_IMAGE_COUNT} ảnh cho mỗi yêu cầu.` }));
      return;
    }

    const merged = [...files, ...nextFiles];
    const validationMessage = validateUploadFiles(merged);

    if (validationMessage) {
      setErrors((current) => ({ ...current, image_files: validationMessage }));
      return;
    }

    setFiles(merged);
    setErrors((current) => {
      const { image_files: _imageFiles, ...rest } = current;
      return rest;
    });
  }

  function removeFile(index: number) {
    setFiles((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading || uploading) return;

    if (currentStep < lastStepIndex) {
      setCurrentStep((step) => Math.min(step + 1, lastStepIndex));
      return;
    }

    setErrors({});
    setMessage("");

    if (!isOnline) {
      setMessage("Bạn đang ngoại tuyến. Vui lòng kết nối mạng trước khi gửi yêu cầu hoặc upload ảnh.");
      return;
    }

    const result = validateServiceRequestInput({
      service_type: selectedService.serviceType,
      service_category_slug: selectedService.slug,
      issue_type: issueType,
      title: title || `${selectedService.shortTitle}: ${issueType}`,
      description,
      address,
      google_maps_url: resolvedGoogleMapsUrl,
      phone,
      priority,
      desired_schedule_at: desiredScheduleAt || null,
      image_files: files
    });

    if (!result.ok) {
      setErrors(result.errors);
      const firstInvalidField = fieldOrder.find((field) => result.errors[field]);
      if (firstInvalidField) {
        setCurrentStep(fieldStepMap[firstInvalidField]);
      }
      setValidationModalOpen(true);
      return;
    }

    setLoading(true);
    setUploading(files.length > 0);

    try {
      const job = await createCustomerJob(result.data);
      setSubmittedJob(job);
      setLoading(false);
      setUploading(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không gửi được yêu cầu. Vui lòng thử lại.");
      setLoading(false);
      setUploading(false);
    }
  }

  if (submittedJob) {
    const jobCode = submittedJob.tracking_code ?? submittedJob.id.slice(0, 8).toUpperCase();

    return (
      <section className="premium-card overflow-hidden p-5 sm:p-7">
        <div className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-500 text-white shadow-[0_14px_34px_rgba(16,185,129,0.24)]">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Đã gửi yêu cầu</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">
                Trung tâm đã ghi nhận yêu cầu của bạn.
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Mã yêu cầu của bạn là <span className="font-semibold text-slate-950">{jobCode}</span>. Hãy lưu mã này để tra cứu tiến độ khi cần.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["1", "Tiếp nhận", "Đội điều phối kiểm tra thông tin và ảnh hiện trạng."],
              ["2", "Phân công", "Kỹ thuật viên phù hợp sẽ được sắp lịch theo yêu cầu."],
              ["3", "Theo dõi", "Bạn có thể xem trạng thái bằng mã yêu cầu và số điện thoại."]
            ].map(([step, title, description]) => (
              <div key={step} className="rounded-2xl border border-white/80 bg-white/85 p-4 shadow-sm">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-blue-600 text-sm font-semibold text-white">{step}</span>
                <p className="mt-3 font-semibold text-slate-950">{title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <button className="premium-button w-full" type="button" onClick={() => router.push(`/customer/jobs/${submittedJob.id}`)}>
            Xem chi tiết yêu cầu
            <ArrowRight className="h-5 w-5" />
          </button>
          <button className="secondary-button w-full" type="button" onClick={() => router.push("/track")}>
            Tra cứu tiến độ
            <ExternalLink className="h-4 w-4" />
          </button>
        </div>
      </section>
    );
  }

  return (
    <form className="premium-card overflow-hidden p-5 sm:p-7" onSubmit={submit}>
      {validationModalOpen ? (
        <ValidationSummaryDialog
          buttonRef={validationButtonRef}
          items={errorSummary}
          onClose={() => {
            setValidationModalOpen(false);
            focusFirstInvalidField();
          }}
        />
      ) : null}

      <div className="mb-6">
        <div className="flex items-center justify-between gap-2">
          {requestSteps.map((step, index) => {
            const active = index === currentStep;
            const done = index < currentStep;
            return (
              <button
                key={step}
                className={`h-2 flex-1 rounded-full transition ${active || done ? "bg-blue-600" : "bg-slate-100"}`}
                type="button"
                onClick={() => setCurrentStep(index)}
                aria-label={`Bước ${index + 1}: ${step}`}
              />
            );
          })}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-blue-700">Bước {currentStep + 1}/{requestSteps.length}</p>
          <p className="text-sm font-semibold text-slate-600">{requestSteps[currentStep]}</p>
        </div>
      </div>

      <section className={stepClass(0)}>
        <div className="flex items-center gap-3" ref={setFieldRef("service_category_slug")} tabIndex={-1}>
          <span className="section-kicker">1</span>
          <div>
            <p className="text-base font-semibold text-slate-900">Chọn dịch vụ</p>
            <p className="text-sm leading-6 text-slate-500">Chọn nhóm gần đúng nhất, có mục khác nếu yêu cầu chưa nằm trong danh mục.</p>
          </div>
        </div>
        <div className="mt-3 flex flex-col gap-3 rounded-2xl border border-cyan-100 bg-gradient-to-r from-white to-cyan-50/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="cnl-logo-mark h-14 w-14">
              <img alt="Châu Ngọc Long" src={CNL_CONTACT.logoPath} />
            </span>
            <div>
              <p className="font-semibold text-slate-900">{CNL_CONTACT.brandName}</p>
              <p className="text-sm leading-6 text-slate-500">Hỗ trợ đặt lịch, báo lỗi và điều phối kỹ thuật.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-sm font-medium">
            <a className="rounded-xl bg-white px-3 py-2 text-blue-700 ring-1 ring-blue-100 transition hover:bg-blue-50" href={`tel:${CNL_CONTACT.hotline.replace(/\s+/g, "")}`}>
              {CNL_CONTACT.hotline}
            </a>
            <a className="rounded-xl bg-white px-3 py-2 text-cyan-700 ring-1 ring-cyan-100 transition hover:bg-cyan-50" href={CNL_CONTACT.website} rel="noreferrer" target="_blank">
              {CNL_CONTACT.websiteLabel}
            </a>
          </div>
        </div>
        <div className={`mt-4 grid gap-3 rounded-3xl transition ${errors.service_category_slug ? "ring-4 ring-rose-500/15" : ""} sm:grid-cols-2 xl:grid-cols-3`}>
          {SERVICE_CATALOG.map((service) => {
            const selected = serviceSlug === service.slug;

            return (
              <button
                key={service.slug}
                aria-pressed={selected}
                className={`selection-card relative overflow-hidden duration-200 ease-out ${
                  selected
                    ? "scale-[1.01] border-blue-600 bg-gradient-to-br from-blue-100 via-sky-50 to-cyan-100 text-slate-950 ring-4 ring-blue-500/25 shadow-[0_20px_54px_rgba(37,99,235,0.24)]"
                    : "border-slate-200 bg-white hover:border-cyan-300 hover:bg-sky-50/30 hover:shadow-[0_16px_40px_rgba(37,99,235,0.10)] active:scale-[0.99]"
                }`}
                type="button"
                onClick={() => changeService(service.slug)}
              >
                {selected ? (
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-blue-700 px-2.5 py-1 text-xs font-semibold text-white shadow-[0_8px_22px_rgba(37,99,235,0.30)]">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Đã chọn
                  </span>
                ) : null}
                <p className={`line-clamp-2 pr-20 font-semibold transition-colors duration-200 ${selected ? "text-blue-950" : "text-slate-900"}`}>{service.title}</p>
                <p className={`mt-2 line-clamp-3 text-sm leading-6 transition-colors duration-200 ${selected ? "text-slate-800" : "text-slate-500"}`}>{service.description}</p>
                <span className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-medium transition-colors duration-200 ${selected ? "bg-blue-700 text-white ring-1 ring-blue-700/20" : "bg-slate-50 text-slate-500 ring-1 ring-slate-200"}`}>
                  {service.options.length} lựa chọn
                </span>
              </button>
            );
          })}
        </div>
        {errors.service_category_slug ? <p className="mt-2 text-sm font-semibold text-rose-600">{errors.service_category_slug}</p> : null}

      {!isOnline ? (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
          Bạn đang ngoại tuyến. Form vẫn giữ nội dung đang nhập, nhưng cần có mạng để gửi yêu cầu và upload ảnh.
        </div>
      ) : null}

      </section>

      <section className={stepClass(1)}>
      <div className="mt-8 flex items-center gap-3">
        <span className="section-kicker">2</span>
        <div>
          <p className="text-base font-semibold text-slate-900">Thông tin yêu cầu</p>
          <p className="text-sm leading-6 text-slate-500">Mô tả ngắn gọn để đội kỹ thuật chuẩn bị đúng thiết bị.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <label className="form-label">
          Loại yêu cầu/sự cố
          <div ref={setFieldRef("issue_type")} className="mt-2">
            <AppSelect
              value={issueType}
              onChange={setIssueType}
              options={selectedService.options.map((option) => ({ label: option, value: option }))}
            />
          </div>
        </label>
        <label className="form-label">
          Tiêu đề
          <input ref={setFieldRef("title")} className={fieldInputClass("title", "mt-2")} placeholder={`${selectedService.shortTitle}: ${issueType}`} value={title} onChange={(event) => setTitle(event.target.value)} />
          {errors.title ? <span className="mt-2 block text-sm font-semibold text-rose-600">{errors.title}</span> : null}
        </label>
      </div>

      <label className="form-label mt-5">
        Mô tả vấn đề
        <textarea ref={setFieldRef("description")} className={fieldInputClass("description", "mt-2 min-h-32 resize-none")} placeholder="Mô tả ngắn gọn hiện trạng, số lượng thiết bị, lỗi đang gặp, thời gian tiện liên hệ..." value={description} onChange={(event) => setDescription(event.target.value)} />
        {errors.description ? <span className="mt-2 block text-sm font-semibold text-rose-600">{errors.description}</span> : null}
      </label>
      </section>

      <section className={stepClass(2)}>

      <div className="mt-8 flex items-center gap-3">
        <span className="section-kicker">3</span>
        <div>
          <p className="text-base font-semibold text-slate-900">Ảnh hiện trạng</p>
          <p className="text-sm leading-6 text-slate-500">Không bắt buộc. Nếu có ảnh, kỹ thuật viên sẽ chẩn đoán nhanh hơn trước khi đến nơi.</p>
        </div>
      </div>

      <div
        ref={setFieldRef("image_files")}
        tabIndex={-1}
        className={`mt-4 rounded-2xl border border-dashed p-4 transition ${
          errors.image_files ? "border-rose-400 bg-rose-50/40 ring-4 ring-rose-500/15" : dragActive ? "border-cyan-400 bg-cyan-50" : "border-blue-200 bg-blue-50/40"
        }`}
        onDragEnter={(event) => {
          event.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          setDragActive(false);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          setDragActive(false);
          addFiles(Array.from(event.dataTransfer.files));
        }}
      >
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white p-6 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
          <ImagePlus className="h-9 w-9 text-cyan-600" />
          <span className="mt-3 font-semibold text-slate-900">Thêm ảnh hiện trạng</span>
          <span className="mt-1 text-sm text-slate-500">
            Có thể bỏ qua nếu chưa có ảnh. Tối đa {MAX_JOB_IMAGE_COUNT} ảnh, mỗi ảnh {formatFileSize(MAX_UPLOAD_SIZE_BYTES)}.
          </span>
          <span className="mt-1 text-xs font-medium text-slate-400">
            Hỗ trợ {ALLOWED_UPLOAD_MIME_TYPES.map((type) => type.replace("image/", ".")).join(", ")}. Ảnh sẽ được nén trước khi upload để tiết kiệm dung lượng.
          </span>
          <div className="mt-5 flex w-full flex-col gap-3 sm:max-w-md sm:flex-row">
            <label className="secondary-button flex-1 cursor-pointer justify-center">
              Chọn ảnh từ thư viện
              <input
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                disabled={loading || !isOnline}
                onChange={(event) => {
                  addFiles(Array.from(event.target.files ?? []));
                  event.currentTarget.value = "";
                }}
              />
            </label>
            <label className="premium-button flex-1 cursor-pointer justify-center">
              Chụp ảnh
              <input
                className="sr-only"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="environment"
                multiple
                disabled={loading || !isOnline}
                onChange={(event) => {
                  addFiles(Array.from(event.target.files ?? []));
                  event.currentTarget.value = "";
                }}
              />
            </label>
          </div>
          <span className="mt-3 text-xs font-medium text-slate-400">Trên laptop vẫn có thể kéo thả ảnh vào khung này.</span>
        </div>

        {previews.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {previews.map((preview, index) => (
              <div key={`${preview.file.name}-${preview.file.size}-${index}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="relative aspect-[4/3] bg-slate-100">
                  <img alt={preview.file.name} className="h-full w-full object-cover" src={preview.url} />
                  <button
                    className="absolute right-2 top-2 grid h-8 w-8 place-items-center rounded-full bg-white/95 text-rose-600 shadow transition hover:scale-105"
                    type="button"
                    onClick={() => removeFile(index)}
                    disabled={loading}
                    aria-label={`Xóa ${preview.file.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-3">
                  <p className="truncate text-xs font-semibold text-slate-800">{preview.file.name}</p>
                  <p className="mt-1 text-xs font-semibold text-slate-400">{formatFileSize(preview.file.size)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {uploading ? (
          <div className="mt-4 rounded-2xl bg-white p-3 shadow-sm">
            <div className="flex items-center justify-between text-sm font-medium text-slate-600">
              <span>Đang nén và upload ảnh...</span>
              <span>{files.length} ảnh</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-cyan-500" />
            </div>
          </div>
        ) : null}

        {errors.image_files ? <p className="mt-2 text-sm font-semibold text-rose-600">{errors.image_files}</p> : null}
      </div>
      </section>

      <section className={stepClass(3)}>

      <div className="mt-8 flex items-center gap-3">
        <span className="section-kicker">4</span>
        <div>
          <p className="text-base font-semibold text-slate-900">Địa chỉ và vị trí</p>
          <p className="text-sm leading-6 text-slate-500">Bản đồ vệ tinh giúp xác định hẻm, cổng và mốc xung quanh rõ hơn.</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
        <div className="grid gap-5 lg:grid-cols-[0.8fr_1fr]">
          <label className="form-label">
            Số điện thoại
            <input ref={setFieldRef("phone")} className={fieldInputClass("phone", "mt-2")} placeholder="090..." value={phone} onChange={(event) => setPhone(event.target.value)} />
            {errors.phone ? <span className="mt-2 block text-sm font-semibold text-rose-600">{errors.phone}</span> : null}
          </label>
          <label className="form-label">
            Địa chỉ
            <input ref={setFieldRef("address")} className={fieldInputClass("address", "mt-2")} placeholder="Số nhà, đường, phường/xã, quận/huyện" value={address} onChange={(event) => setAddress(event.target.value)} />
            {errors.address ? <span className="mt-2 block text-sm font-semibold text-rose-600">{errors.address}</span> : null}
          </label>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-sm">
          <iframe className="h-80 w-full border-0 sm:h-96" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src={mapEmbedUrl} title="Google Maps satellite preview" />
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row">
          <a className="secondary-button flex-1" href={mapSearchUrl} rel="noreferrer" target="_blank">
            <MapPin className="h-5 w-5 text-cyan-600" />
            Mở bản đồ lớn
            <ExternalLink className="h-4 w-4" />
          </a>
          <button className="secondary-button flex-1" type="button" onClick={() => { setGoogleMapsUrl(mapSearchUrl); setLocationMessage("Đã lưu link Google Maps cho yêu cầu này."); }}>
            <Navigation className="h-5 w-5 text-cyan-600" />
            Dùng vị trí này
          </button>
        </div>
        {locationMessage ? <p className="mt-3 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{locationMessage}</p> : null}

        <details className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-4">
          <summary className="cursor-pointer text-sm font-medium text-slate-700">Có link Google Maps chính xác hơn?</summary>
          <label className="form-label mt-4">
            Link Google Maps tùy chọn
            <input ref={setFieldRef("google_maps_url")} className={fieldInputClass("google_maps_url", "mt-2")} placeholder="Ví dụ: https://maps.app.goo.gl/..." value={googleMapsUrl} onChange={(event) => setGoogleMapsUrl(event.target.value)} />
            {errors.google_maps_url ? <span className="mt-2 block text-sm font-semibold text-rose-600">{errors.google_maps_url}</span> : null}
          </label>
        </details>
      </div>
      </section>

      <section className={stepClass(4)}>

      <div className="mt-8 flex items-center gap-3">
        <span className="section-kicker">5</span>
        <div>
          <p className="text-base font-semibold text-slate-900">Thời gian và mức ưu tiên</p>
          <p className="text-sm leading-6 text-slate-500">Chọn thời gian mong muốn để đội điều phối sắp lịch phù hợp.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <label className="form-label">
          Thời gian mong muốn
          <div className="relative mt-2">
            <CalendarClock className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input ref={setFieldRef("desired_schedule_at")} className={fieldInputClass("desired_schedule_at", "pl-12")} type="datetime-local" value={desiredScheduleAt} onChange={(event) => setDesiredScheduleAt(event.target.value)} />
          </div>
          {errors.desired_schedule_at ? <span className="mt-2 block text-sm font-semibold text-rose-600">{errors.desired_schedule_at}</span> : null}
        </label>

        <div>
          <p className="form-label">Mức ưu tiên</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
            {(["low", "normal", "high", "urgent"] as JobPriority[]).map((item) => (
              <button
                key={item}
                className={`rounded-2xl px-4 py-3 text-sm font-medium transition active:scale-[0.98] ${
                  priority === item ? "bg-blue-600 text-white shadow-lg shadow-blue-500/15" : "bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:bg-white"
                }`}
                type="button"
                onClick={() => setPriority(item)}
              >
                {JOB_PRIORITY_LABELS[item]}
              </button>
            ))}
          </div>
        </div>
      </div>

      </section>

      <section className={stepClass(5)}>
        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
          <p className="text-base font-semibold text-slate-950">Kiểm tra lại yêu cầu</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            Sau khi gửi, hệ thống sẽ tạo mã yêu cầu để bạn theo dõi tiến độ và trung tâm điều phối kỹ thuật viên phù hợp.
          </p>
          <div className="mt-4 grid gap-3 text-sm text-slate-600">
            <p><span className="font-semibold text-slate-950">Dịch vụ:</span> {selectedService.title}</p>
            <p><span className="font-semibold text-slate-950">Loại yêu cầu:</span> {issueType}</p>
            <p><span className="font-semibold text-slate-950">Số điện thoại:</span> {phone || "Chưa nhập"}</p>
            <p><span className="font-semibold text-slate-950">Địa chỉ:</span> {address || "Chưa nhập"}</p>
            <p><span className="font-semibold text-slate-950">Ảnh:</span> {files.length} ảnh</p>
          </div>
        </div>
      </section>

      {message ? <p className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{message}</p> : null}

      <div className="mobile-sticky-cta flex gap-3">
        {currentStep > 0 ? (
          <button className="secondary-button shrink-0 px-4" type="button" disabled={loading || uploading} onClick={() => setCurrentStep((step) => Math.max(step - 1, 0))}>
            Quay lại
          </button>
        ) : null}
        <button className="premium-button flex-1 sm:flex-none" disabled={loading || uploading || !isOnline} type="submit">
          {loading || uploading ? <AppSpinner size="md" tone="subtle" /> : <CheckCircle2 className="h-5 w-5" />}
          {currentStep < lastStepIndex ? "Tiếp tục" : uploading ? "Đang tải ảnh..." : loading ? "Đang gửi yêu cầu..." : "Gửi yêu cầu"}
          {loading || uploading ? null : <ArrowRight className="h-5 w-5" />}
        </button>
      </div>
    </form>
  );
}
