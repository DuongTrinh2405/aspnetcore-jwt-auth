import {
  fetchJobImageMetadataForClient,
  fetchJobStatusHistoryForClient,
  hydrateJobImageSignedUrlsForClient,
  JOB_IMAGE_CLEANUP_AGE_OPTIONS,
  JOB_STATUSES,
  MIN_JOB_IMAGE_DELETE_AGE_DAYS,
  type AppNotification,
  type Job,
  type JobImage,
  type JobPaymentEvent,
  type PaymentStatus,
  type JobStatus,
  type JobStatusHistory,
  type JobPriority,
  type UserRole
} from "@cnl/shared";
import { cached, invalidateCache } from "./cache";
import { supabase } from "./supabase";

export type AdminUser = {
  id: string;
  email: string | null;
  role: UserRole;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminUserPayload = {
  email?: string;
  password?: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
};

export type AdminStats = {
  totalJobs: number;
  pendingJobs: number;
  inProgressJobs: number;
  completedJobs: number;
  cancelledJobs: number;
  jobsToday: number;
  jobsThisWeek: number;
  urgentJobs: number;
  jobsWithImages: number;
  paidJobs: number;
  unpaidCompletedJobs: number;
  vipJobs: number;
  customers: number;
  vipCustomers: number;
  technicians: number;
  vipTechnicians: number;
  completionRate: number;
};

export type AdminDataset = {
  jobs: Job[];
  notifications: AppNotification[];
  users: AdminUser[];
  stats: AdminStats;
};

export type JobFilters = {
  status: JobStatus | "all";
  vip: "all" | "vip" | "regular";
  search: string;
  serviceCategory?: string;
  assignedTechnicianId?: string;
  priority?: JobPriority | "all";
  hasImages?: "all" | "yes" | "no";
  payment?: "all" | "paid" | "unpaid";
  submittedSort?: "newest" | "oldest";
  fromDate?: string;
  toDate?: string;
};

export type AdminJobListItem = Job & {
  customer?: AdminUser | null;
  technician?: AdminUser | null;
  imageCount: number;
};

export type AdminJobListResult = {
  jobs: AdminJobListItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type AdminJobDetail = {
  job: AdminJobListItem;
  images: JobImage[];
  paymentEvents: JobPaymentEvent[];
  statusHistory: JobStatusHistory[];
};

export type ImageCleanupStatusFilter = "all" | "completed" | "cancelled";

export type ImageCleanupQuery = {
  ageDays: (typeof JOB_IMAGE_CLEANUP_AGE_OPTIONS)[number];
  status: ImageCleanupStatusFilter;
  beforeDate?: string;
};

export type ImageCleanupPreviewItem = {
  id: string;
  jobId: string;
  jobTitle: string;
  trackingCode: string | null;
  fileName: string | null;
  sizeBytes: number;
  createdAt: string;
};

export type ImageCleanupPreview = {
  ok: true;
  totalEligible: number;
  estimatedFreedBytes: number;
  previewItems: ImageCleanupPreviewItem[];
};

export type ImageCleanupResult = {
  ok: true;
  deletedCount: number;
  freedBytes: number;
  failedItems: Array<{
    id: string;
    storagePath: string;
    error: string;
  }>;
};

function sortNewest<T extends { created_at: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}

export function getJobPaymentStatus(job: Pick<Job, "is_paid" | "payment_status">): PaymentStatus {
  return job.payment_status ?? (job.is_paid ? "paid" : "unpaid");
}

export function getJobPaymentPaidAt(job: Pick<Job, "paid_at" | "payment_paid_at">): string | null {
  return job.payment_paid_at ?? job.paid_at ?? null;
}

export function buildAdminStats(jobs: Job[], users: AdminUser[], imageJobIds: string[] = []): AdminStats {
  const totalJobs = jobs.length;
  const completedJobs = jobs.filter((job) => job.status === "completed").length;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - 6);
  const imageJobSet = new Set(imageJobIds);

  return {
    totalJobs,
    pendingJobs: jobs.filter((job) => job.status === "pending").length,
    inProgressJobs: jobs.filter((job) => job.status === "in_progress").length,
    completedJobs,
    cancelledJobs: jobs.filter((job) => job.status === "cancelled").length,
    jobsToday: jobs.filter((job) => new Date(job.created_at) >= today).length,
    jobsThisWeek: jobs.filter((job) => new Date(job.created_at) >= weekStart).length,
    urgentJobs: jobs.filter((job) => job.priority === "urgent").length,
    jobsWithImages: jobs.filter((job) => imageJobSet.has(job.id)).length,
    paidJobs: jobs.filter((job) => getJobPaymentStatus(job) === "paid").length,
    unpaidCompletedJobs: jobs.filter((job) => job.status === "completed" && getJobPaymentStatus(job) === "unpaid").length,
    vipJobs: jobs.filter((job) => job.is_vip).length,
    customers: users.filter((user) => user.role === "customer").length,
    vipCustomers: users.filter((user) => user.role === "customer_vip").length,
    technicians: users.filter((user) => user.role === "technician").length,
    vipTechnicians: users.filter((user) => user.role === "technician_vip").length,
    completionRate: totalJobs > 0 ? Math.round((completedJobs / totalJobs) * 100) : 0
  };
}

async function loadJobImageJobIds(): Promise<string[]> {
  const { data, error } = await supabase
    .from("job_images")
    .select("job_id");

  if (error) {
    throw new Error(error.message);
  }

  return Array.from(new Set((data ?? []).map((image) => String(image.job_id))));
}

async function loadAdminJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from("jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as Job[];
}

export function fetchAdminJobs(): Promise<Job[]> {
  return cached("admin:jobs", loadAdminJobs, 10_000);
}

export async function fetchAdminJobsPage(
  filters: JobFilters,
  page = 1,
  pageSize = 10
): Promise<AdminJobListResult> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = supabase
    .from("jobs")
    .select("*", { count: "exact" })
    .order("customer_submitted_at", { ascending: filters.submittedSort === "oldest" })
    .order("created_at", { ascending: filters.submittedSort === "oldest" });

  if (filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.vip === "vip") {
    query = query.eq("is_vip", true);
  }

  if (filters.vip === "regular") {
    query = query.eq("is_vip", false);
  }

  if (filters.serviceCategory && filters.serviceCategory !== "all") {
    query = query.eq("service_category_slug", filters.serviceCategory);
  }

  if (filters.assignedTechnicianId && filters.assignedTechnicianId !== "all") {
    query = query.eq("assigned_technician_id", filters.assignedTechnicianId);
  }

  if (filters.priority && filters.priority !== "all") {
    query = query.eq("priority", filters.priority);
  }

  if (filters.fromDate) {
    query = query.gte("customer_submitted_at", `${filters.fromDate}T00:00:00`);
  }

  if (filters.toDate) {
    query = query.lte("customer_submitted_at", `${filters.toDate}T23:59:59`);
  }

  if (filters.payment === "paid" || filters.payment === "unpaid") {
    query = query.eq("payment_status", filters.payment);
  }

  const keyword = filters.search.trim();
  if (keyword) {
    query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%,address.ilike.%${keyword}%,phone.ilike.%${keyword}%`);
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  const jobs = (data ?? []) as Job[];
  const jobIds = jobs.map((job) => job.id);
  const userIds = Array.from(new Set(jobs.flatMap((job) => [job.customer_id, job.assigned_technician_id]).filter(Boolean))) as string[];

  const [usersResult, imagesResult] = await Promise.all([
    userIds.length
      ? supabase.from("users").select("id, email, role, full_name, phone, avatar_url, is_active, created_at, updated_at").in("id", userIds)
      : Promise.resolve({ data: [], error: null }),
    jobIds.length
      ? supabase.from("job_images").select("id, job_id").in("job_id", jobIds)
      : Promise.resolve({ data: [], error: null })
  ]);

  if (usersResult.error) {
    throw new Error(usersResult.error.message);
  }

  if (imagesResult.error) {
    throw new Error(imagesResult.error.message);
  }

  const users = (usersResult.data ?? []) as AdminUser[];
  const imageCounts = (imagesResult.data ?? []).reduce<Record<string, number>>((acc, image) => {
    const jobId = String(image.job_id);
    acc[jobId] = (acc[jobId] ?? 0) + 1;
    return acc;
  }, {});

  let enrichedJobs = jobs.map((job) => ({
    ...job,
    customer: users.find((user) => user.id === job.customer_id) ?? null,
    technician: users.find((user) => user.id === job.assigned_technician_id) ?? null,
    imageCount: imageCounts[job.id] ?? 0
  }));

  if (filters.hasImages === "yes") {
    enrichedJobs = enrichedJobs.filter((job) => job.imageCount > 0);
  }

  if (filters.hasImages === "no") {
    enrichedJobs = enrichedJobs.filter((job) => job.imageCount === 0);
  }

  return {
    jobs: enrichedJobs,
    total: count ?? enrichedJobs.length,
    page,
    pageSize
  };
}

export async function fetchAdminJobDetail(job: AdminJobListItem): Promise<AdminJobDetail> {
  const [images, statusHistory, paymentEventsResult] = await Promise.all([
    fetchJobImageMetadataForClient(supabase, job.id),
    fetchJobStatusHistoryForClient(supabase, job.id),
    supabase
      .from("job_payment_events")
      .select("*")
      .eq("job_id", job.id)
      .order("created_at", { ascending: false })
  ]);

  if (paymentEventsResult.error) {
    throw new Error(paymentEventsResult.error.message);
  }

  return {
    job,
    images,
    paymentEvents: (paymentEventsResult.data ?? []) as JobPaymentEvent[],
    statusHistory
  };
}

export function fetchAdminJobImagesWithSignedUrls(images: JobImage[]): Promise<JobImage[]> {
  return hydrateJobImageSignedUrlsForClient(supabase, images);
}

async function getAdminAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();

  if (error || !data.session?.access_token) {
    throw new Error("Bạn cần đăng nhập admin để dọn dẹp ảnh.");
  }

  return data.session.access_token;
}

function buildCleanupSearchParams(query: ImageCleanupQuery): URLSearchParams {
  const params = new URLSearchParams({
    ageDays: String(Math.max(query.ageDays, MIN_JOB_IMAGE_DELETE_AGE_DAYS)),
    status: query.status,
    limit: "50"
  });

  if (query.beforeDate) {
    params.set("beforeDate", query.beforeDate);
  }

  return params;
}

async function parseCleanupResponse<T>(response: Response): Promise<T> {
  const payload = (await response.json()) as { ok?: boolean; error?: string };

  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error ?? "Không thể dọn dẹp ảnh.");
  }

  return payload as T;
}

export async function fetchImageCleanupPreview(query: ImageCleanupQuery): Promise<ImageCleanupPreview> {
  const token = await getAdminAccessToken();
  const params = buildCleanupSearchParams(query);
  const response = await fetch(`/api/image-cleanup?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  return parseCleanupResponse<ImageCleanupPreview>(response);
}

export async function runImageCleanup(query: ImageCleanupQuery): Promise<ImageCleanupResult> {
  const token = await getAdminAccessToken();
  const response = await fetch("/api/image-cleanup", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(query)
  });

  invalidateCache("admin:");
  return parseCleanupResponse<ImageCleanupResult>(response);
}

async function loadAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, role, full_name, phone, avatar_url, is_active, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AdminUser[];
}

export function fetchAdminUsers(): Promise<AdminUser[]> {
  return cached("admin:users", loadAdminUsers, 20_000);
}

async function loadAdminTechnicians(): Promise<AdminUser[]> {
  const { data, error } = await supabase
    .from("users")
    .select("id, email, role, full_name, phone, avatar_url, is_active, created_at, updated_at")
    .in("role", ["technician", "technician_vip"])
    .order("full_name", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as AdminUser[];
}

export function fetchAdminTechnicians(): Promise<AdminUser[]> {
  return cached("admin:technicians", loadAdminTechnicians, 20_000);
}

async function requestAdminUsersApi<T>(method: "POST" | "PATCH" | "DELETE", body: unknown): Promise<T> {
  const token = await getAdminAccessToken();
  const response = await fetch("/api/admin-users", {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  const payload = (await response.json()) as { ok?: boolean; error?: string };

  if (!response.ok || payload.ok === false) {
    throw new Error(payload.error ?? "Không cập nhật được tài khoản.");
  }

  invalidateCache("admin:");
  return payload as T;
}

export async function createAdminManagedUser(payload: AdminUserPayload): Promise<{ ok: true; user: AdminUser }> {
  return requestAdminUsersApi("POST", payload);
}

export async function updateAdminManagedUser(id: string, payload: AdminUserPayload): Promise<{ ok: true; user: AdminUser }> {
  return requestAdminUsersApi("PATCH", { id, ...payload });
}

export async function deactivateAdminManagedUser(id: string): Promise<{ ok: true; user: AdminUser }> {
  return requestAdminUsersApi("DELETE", { id });
}

async function loadAdminNotifications(limit = 50): Promise<AppNotification[]> {
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

export function fetchAdminNotifications(limit = 50): Promise<AppNotification[]> {
  return cached(`admin:notifications:${limit}`, () => loadAdminNotifications(limit), 8_000);
}

async function loadAdminDataset(): Promise<AdminDataset> {
  const [jobs, users, notifications, imageJobIds] = await Promise.all([
    fetchAdminJobs(),
    fetchAdminUsers(),
    fetchAdminNotifications(),
    cached("admin:image-job-ids", loadJobImageJobIds, 20_000)
  ]);

  return {
    jobs,
    notifications,
    users,
    stats: buildAdminStats(jobs, users, imageJobIds)
  };
}

export function fetchAdminDataset(): Promise<AdminDataset> {
  return cached("admin:dataset", loadAdminDataset, 10_000);
}

export async function updateAdminJobStatus(jobId: string, nextStatus: JobStatus): Promise<Job> {
  const { data, error } = await supabase.rpc("update_job_status", {
    target_job_id: jobId,
    next_status: nextStatus,
    status_note: "Admin cập nhật trạng thái"
  });

  if (error) {
    throw new Error(error.message);
  }

  invalidateCache("admin:");
  return data as Job;
}

export async function assignAdminJob(jobId: string, technicianId: string): Promise<Job> {
  const { data, error } = await supabase.rpc("assign_job_to_technician", {
    target_job_id: jobId,
    target_technician_id: technicianId,
    assignment_note: "Admin phân công từ dashboard"
  });

  if (error) {
    throw new Error(error.message);
  }

  invalidateCache("admin:");
  return data as Job;
}

export async function updateAdminJobPayment(jobId: string, paymentStatus: PaymentStatus): Promise<Job> {
  const { data, error } = await supabase.rpc("update_job_payment_status", {
    target_job_id: jobId,
    next_payment_status: paymentStatus
  });

  if (error) {
    throw new Error(error.message);
  }

  invalidateCache("admin:");
  return data as Job;
}

export function filterJobs(jobs: Job[], filters: JobFilters): Job[] {
  const search = filters.search.trim().toLowerCase();

  return jobs.filter((job) => {
    const matchesStatus = filters.status === "all" || job.status === filters.status;
    const matchesVip =
      filters.vip === "all" ||
      (filters.vip === "vip" && job.is_vip) ||
      (filters.vip === "regular" && !job.is_vip);
    const matchesSearch =
      search.length === 0 ||
      [job.title, job.description, job.address, job.phone, job.service_type]
        .join(" ")
        .toLowerCase()
        .includes(search);

    return matchesStatus && matchesVip && matchesSearch;
  });
}

export function countJobsByStatus(jobs: Job[]): Record<JobStatus, number> {
  return JOB_STATUSES.reduce(
    (acc, status) => ({ ...acc, [status]: jobs.filter((job) => job.status === status).length }),
    {} as Record<JobStatus, number>
  );
}

export function countAssignedJobs(jobs: Job[], technicianId: string): number {
  return jobs.filter((job) => job.assigned_technician_id === technicianId).length;
}

export function countCustomerJobs(jobs: Job[], customerId: string): number {
  return jobs.filter((job) => job.customer_id === customerId).length;
}

export function getRecentJobs(jobs: Job[], limit = 5): Job[] {
  return sortNewest(jobs).slice(0, limit);
}
