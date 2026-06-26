import {
  JOB_PUBLIC_SELECT,
  fetchJobImageMetadataForClient,
  fetchJobStatusHistoryForClient,
  hydrateJobImageSignedUrlsForClient,
  type Job,
  type JobImage,
  type JobPriority,
  type JobStatus,
  type JobStatusHistory,
  type UserRole
} from "@cnl/shared";
import { supabase } from "./supabase";

export type StaffUser = {
  id: string;
  role: UserRole;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type StaffJobFilters = {
  status: JobStatus | "all";
  search: string;
  serviceCategory: string;
  priority: JobPriority | "all";
  hasImages: "all" | "yes" | "no";
};

export type StaffJobListItem = Job & {
  customer?: StaffUser | null;
  technician?: StaffUser | null;
  imageCount: number;
  images?: JobImage[];
};

export type StaffJobPage = {
  jobs: StaffJobListItem[];
  total: number;
};

export type StaffJobDetail = {
  job: StaffJobListItem;
  images: JobImage[];
  statusHistory: JobStatusHistory[];
};

export async function fetchStaffJobsPage(
  filters: StaffJobFilters,
  page = 1,
  pageSize = 10
): Promise<StaffJobPage> {
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  let query = supabase
    .from("jobs")
    .select(JOB_PUBLIC_SELECT, { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters.status !== "all") {
    query = query.eq("status", filters.status);
  }

  if (filters.serviceCategory !== "all") {
    query = query.eq("service_category_slug", filters.serviceCategory);
  }

  if (filters.priority !== "all") {
    query = query.eq("priority", filters.priority);
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
      ? supabase.from("users").select("id, role, full_name, phone, avatar_url, is_active, created_at, updated_at").in("id", userIds)
      : Promise.resolve({ data: [], error: null }),
    jobIds.length ? supabase.from("job_images").select("id, job_id").in("job_id", jobIds) : Promise.resolve({ data: [], error: null })
  ]);

  if (usersResult.error) {
    throw new Error(usersResult.error.message);
  }

  if (imagesResult.error) {
    throw new Error(imagesResult.error.message);
  }

  const users = (usersResult.data ?? []) as StaffUser[];
  const imageCounts = (imagesResult.data ?? []).reduce<Record<string, number>>((acc, image) => {
    const jobId = String(image.job_id);
    acc[jobId] = (acc[jobId] ?? 0) + 1;
    return acc;
  }, {});

  let enrichedJobs = jobs.map((job) => ({
    ...job,
    customer: users.find((user) => user.id === job.customer_id) ?? null,
    technician: users.find((user) => user.id === job.assigned_technician_id) ?? null,
    imageCount: imageCounts[job.id] ?? 0,
    images: []
  }));

  if (filters.hasImages === "yes") {
    enrichedJobs = enrichedJobs.filter((job) => job.imageCount > 0);
  }

  if (filters.hasImages === "no") {
    enrichedJobs = enrichedJobs.filter((job) => job.imageCount === 0);
  }

  return { jobs: enrichedJobs, total: count ?? enrichedJobs.length };
}

export async function fetchStaffJobDetail(job: StaffJobListItem): Promise<StaffJobDetail> {
  const [images, statusHistory] = await Promise.all([
    fetchJobImageMetadataForClient(supabase, job.id),
    fetchJobStatusHistoryForClient(supabase, job.id)
  ]);

  return { job, images, statusHistory };
}

export function fetchStaffJobImagesWithSignedUrls(images: JobImage[]): Promise<JobImage[]> {
  return hydrateJobImageSignedUrlsForClient(supabase, images);
}
