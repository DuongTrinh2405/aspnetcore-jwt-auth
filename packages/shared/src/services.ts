import type { SupabaseClient, User } from "@supabase/supabase-js";
import { MAX_UPLOAD_SIZE_BYTES } from "./constants";
import { prepareJobImageForUpload } from "./images";
import type {
  AppNotification,
  CreateJobInput,
  CreateServiceRequestInput,
  CustomerDashboardStats,
  Job,
  JobImage,
  JobStatus,
  JobStatusHistory,
  TrackingResult,
  WarrantyRecord
} from "./types";

export const JOB_PUBLIC_SELECT =
  "id, customer_id, assigned_technician_id, service_type, title, description, address, google_maps_url, tracking_code, service_category_slug, issue_type, desired_schedule_at, customer_submitted_at, preliminary_quote, scheduled_at, accepted_at, started_at, completed_at, cancelled_at, phone, priority, status, is_vip, created_at, updated_at" as const;

function withoutPaymentFields(job: Job): Job {
  const {
    is_paid: _isPaid,
    paid_at: _paidAt,
    paid_by: _paidBy,
    payment_status: _paymentStatus,
    payment_paid_at: _paymentPaidAt,
    payment_marked_by: _paymentMarkedBy,
    ...publicJob
  } = job;

  return publicJob;
}

function isMissingGoogleMapsColumnError(error: { message?: string; code?: string } | null): boolean {
  const message = error?.message?.toLowerCase() ?? "";
  return (
    error?.code === "PGRST204" ||
    (message.includes("google_maps_url") && message.includes("schema cache"))
  );
}

export async function getAuthenticatedUser(supabase: SupabaseClient): Promise<User> {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Bạn cần đăng nhập để tiếp tục.");
  }

  return user;
}

export async function fetchCustomerJobsForClient(supabase: SupabaseClient): Promise<Job[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select(JOB_PUBLIC_SELECT)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Job[];
}

export async function createCustomerJobForClient(
  supabase: SupabaseClient,
  input: CreateJobInput | CreateServiceRequestInput
): Promise<Job> {
  const user = await getAuthenticatedUser(supabase);
  const {
    image_files: imageFiles,
    service_category_slug,
    issue_type,
    desired_schedule_at,
    customer_submitted_at: _customerSubmittedAt,
    ...baseInput
  } = input as CreateServiceRequestInput;
  const payload = {
    ...baseInput,
    service_category_slug: service_category_slug ?? null,
    issue_type: issue_type ?? null,
    desired_schedule_at: desired_schedule_at ?? null,
    customer_id: user.id,
    status: "pending",
    assigned_technician_id: null
  };

  let { error } = await supabase.from("jobs").insert(payload);

  if (isMissingGoogleMapsColumnError(error)) {
    const { google_maps_url: _googleMapsUrl, ...payloadWithoutMaps } = payload;
    const retry = await supabase.from("jobs").insert(payloadWithoutMaps);
    error = retry.error;
  }

  if (error?.code === "PGRST204") {
    const {
      google_maps_url: _googleMapsUrl,
      service_category_slug: _serviceCategorySlug,
      issue_type: _issueType,
      desired_schedule_at: _desiredScheduleAt,
      ...minimalPayload
    } = payload;
    const retry = await supabase.from("jobs").insert(minimalPayload);
    error = retry.error;
  }

  if (error) {
    throw new Error(error.message);
  }

  const { data, error: fetchError } = await supabase
    .from("jobs")
    .select(JOB_PUBLIC_SELECT)
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (fetchError || !data) {
    throw new Error(fetchError?.message ?? "Không đọc được job vừa tạo.");
  }

  const job = data as Job;
  if (imageFiles?.length) {
    await uploadJobImagesForClient(supabase, job.id, user.id, imageFiles);
  }

  return job;
}

export async function uploadJobImagesForClient(
  supabase: SupabaseClient,
  jobId: string,
  userId: string,
  files: readonly File[]
): Promise<void> {
  await Promise.all(
    files.map(async (file, index) => {
      const prepared = await prepareJobImageForUpload(file);
      if (prepared.compressedSizeBytes > MAX_UPLOAD_SIZE_BYTES) {
        throw new Error(`Ảnh ${prepared.originalFileName} vẫn vượt quá dung lượng cho phép sau khi nén.`);
      }

      const extension = prepared.mimeType === "image/webp" ? "webp" : "jpg";
      const path = `${userId}/${jobId}/${Date.now()}-${index}.${extension}`;
      const upload = await supabase.storage.from("job-images").upload(path, prepared.file, {
        cacheControl: "3600",
        upsert: false
      });

      if (upload.error) {
        throw new Error(upload.error.message);
      }

      const { error } = await supabase.from("job_images").insert({
        job_id: jobId,
        uploaded_by: userId,
        storage_bucket: "job-images",
        storage_path: path,
        file_name: prepared.file.name,
        mime_type: prepared.mimeType,
        size_bytes: prepared.compressedSizeBytes,
        original_file_name: prepared.originalFileName,
        original_size_bytes: prepared.originalSizeBytes,
        compressed_size_bytes: prepared.compressedSizeBytes,
        width: prepared.width,
        height: prepared.height
      });

      if (error?.code === "PGRST204") {
        const fallback = await supabase.from("job_images").insert({
          job_id: jobId,
          uploaded_by: userId,
          storage_bucket: "job-images",
          storage_path: path
        });
        if (fallback.error) {
          throw new Error(fallback.error.message);
        }
        return;
      }

      if (error) {
        throw new Error(error.message);
      }
    })
  );
}

export async function fetchJobImagesForClient(
  supabase: SupabaseClient,
  jobId: string
): Promise<JobImage[]> {
  const images = await fetchJobImageMetadataForClient(supabase, jobId);
  return hydrateJobImageSignedUrlsForClient(supabase, images);
}

export async function fetchJobImageMetadataForClient(
  supabase: SupabaseClient,
  jobId: string
): Promise<JobImage[]> {
  const { data, error } = await supabase
    .from("job_images")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as JobImage[];
}

type SignedUrlCacheEntry = {
  expiresAt: number;
  signedUrl: string | null;
};

const SIGNED_URL_TTL_SECONDS = 60 * 15;
const SIGNED_URL_CACHE_SAFETY_MS = 60_000;
const signedUrlCache = new Map<string, SignedUrlCacheEntry>();

function getSignedUrlCacheKey(image: Pick<JobImage, "storage_bucket" | "storage_path">): string {
  return `${image.storage_bucket}:${image.storage_path}`;
}

export async function getSignedJobImageUrlForClient(
  supabase: SupabaseClient,
  image: JobImage
): Promise<string | null> {
  if (image.storage_deleted || image.storage_deleted_at || image.deleted_at) {
    return null;
  }

  const cacheKey = getSignedUrlCacheKey(image);
  const cached = signedUrlCache.get(cacheKey);
  if (cached && cached.expiresAt - SIGNED_URL_CACHE_SAFETY_MS > Date.now()) {
    return cached.signedUrl;
  }

  const signed = await supabase.storage
    .from(image.storage_bucket)
    .createSignedUrl(image.storage_path, SIGNED_URL_TTL_SECONDS);
  const signedUrl = signed.data?.signedUrl ?? image.public_url ?? null;

  signedUrlCache.set(cacheKey, {
    expiresAt: Date.now() + SIGNED_URL_TTL_SECONDS * 1000,
    signedUrl
  });

  return signedUrl;
}

export async function hydrateJobImageSignedUrlsForClient(
  supabase: SupabaseClient,
  images: JobImage[]
): Promise<JobImage[]> {
  return Promise.all(
    images.map(async (image) => {
      return {
        ...image,
        signed_url: await getSignedJobImageUrlForClient(supabase, image)
      };
    })
  );
}

export async function fetchJobStatusHistoryForClient(
  supabase: SupabaseClient,
  jobId: string
): Promise<JobStatusHistory[]> {
  const { data, error } = await supabase
    .from("job_status_logs")
    .select("*")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as JobStatusHistory[];
}

export function getCustomerStats(jobs: Job[]): CustomerDashboardStats {
  return {
    total: jobs.length,
    pending: jobs.filter((job) => job.status === "pending").length,
    inProgress: jobs.filter((job) => job.status === "accepted" || job.status === "in_progress").length,
    completed: jobs.filter((job) => job.status === "completed").length
  };
}

export async function fetchAvailableJobsForClient(supabase: SupabaseClient): Promise<Job[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select(JOB_PUBLIC_SELECT)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Job[];
}

export async function fetchAssignedJobsForClient(supabase: SupabaseClient): Promise<Job[]> {
  const user = await getAuthenticatedUser(supabase);

  const { data, error } = await supabase
    .from("jobs")
    .select(JOB_PUBLIC_SELECT)
    .eq("assigned_technician_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Job[];
}

export async function fetchTrackingByCodeForClient(
  supabase: SupabaseClient,
  trackingCode: string,
  phone: string
): Promise<TrackingResult | null> {
  const rpc = await supabase.rpc("lookup_job_tracking", {
    input_tracking_code: trackingCode,
    input_phone: phone
  });

  if (!rpc.error) {
    const result = (rpc.data as TrackingResult | null) ?? null;
    return result ? { ...result, job: withoutPaymentFields(result.job) } : null;
  }

  if (rpc.error && !["PGRST202", "42883"].includes(rpc.error.code ?? "")) {
    throw new Error(rpc.error.message);
  }

  const { data: job, error } = await supabase
    .from("jobs")
    .select(JOB_PUBLIC_SELECT)
    .eq("tracking_code", trackingCode.trim().toUpperCase())
    .eq("phone", phone.trim())
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!job) {
    return null;
  }

  const { data: statusHistory, error: historyError } = await supabase
    .from("job_status_logs")
    .select("*")
    .eq("job_id", job.id)
    .order("created_at", { ascending: true });

  if (historyError) {
    throw new Error(historyError.message);
  }

  return {
    job: job as Job,
    statusHistory: (statusHistory ?? []) as JobStatusHistory[]
  };
}

export async function fetchWarrantyByCodeForClient(
  supabase: SupabaseClient,
  warrantyCode: string,
  phone: string
): Promise<WarrantyRecord | null> {
  const rpc = await supabase.rpc("lookup_warranty", {
    input_warranty_code: warrantyCode,
    input_phone: phone
  });

  if (!rpc.error) {
    return rpc.data as WarrantyRecord | null;
  }

  if (rpc.error && !["PGRST202", "42883"].includes(rpc.error.code ?? "")) {
    throw new Error(rpc.error.message);
  }

  const { data, error } = await supabase
    .from("warranty_records")
    .select("*, jobs!inner(phone)")
    .eq("warranty_code", warrantyCode.trim().toUpperCase())
    .eq("jobs.phone", phone.trim())
    .maybeSingle();

  if (error) {
    if (error.code === "42P01" || error.code === "PGRST205") {
      return null;
    }
    throw new Error(error.message);
  }

  return data as WarrantyRecord | null;
}

export async function acceptJobForClient(supabase: SupabaseClient, jobId: string): Promise<Job> {
  const { data, error } = await supabase.rpc("accept_job", {
    target_job_id: jobId
  });

  if (error) {
    throw new Error(error.message);
  }

  return withoutPaymentFields(data as Job);
}

export async function updateJobStatusForClient(
  supabase: SupabaseClient,
  jobId: string,
  nextStatus: JobStatus,
  note?: string
): Promise<Job> {
  const { data, error } = await supabase.rpc("update_job_status", {
    target_job_id: jobId,
    next_status: nextStatus,
    status_note: note ?? null
  });

  if (error) {
    throw new Error(error.message);
  }

  return withoutPaymentFields(data as Job);
}

export async function fetchNotificationsForClient(
  supabase: SupabaseClient,
  limit = 8
): Promise<AppNotification[]> {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AppNotification[];
}

export async function markNotificationReadForClient(
  supabase: SupabaseClient,
  notificationId: string
): Promise<void> {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq("id", notificationId);

  if (error) {
    throw new Error(error.message);
  }
}

export function countUnreadNotifications(notifications: AppNotification[]): number {
  return notifications.filter((notification) => notification.read_at === null).length;
}
