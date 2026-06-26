import {
  acceptJobForClient,
  fetchAssignedJobsForClient,
  fetchAvailableJobsForClient,
  updateJobStatusForClient,
  type Job,
  type JobStatus
} from "@cnl/shared";
import { cached, invalidateCache, setCachedValue } from "./cache";
import { supabase } from "./supabase";

const AVAILABLE_JOBS_KEY = "technician:available";
const ASSIGNED_JOBS_KEY = "technician:assigned";

export function fetchAvailableJobs(): Promise<Job[]> {
  return cached(AVAILABLE_JOBS_KEY, () => fetchAvailableJobsForClient(supabase), 10_000);
}

export function fetchAssignedJobs(): Promise<Job[]> {
  return cached(ASSIGNED_JOBS_KEY, () => fetchAssignedJobsForClient(supabase), 10_000);
}

export async function acceptJob(jobId: string): Promise<Job> {
  const job = await acceptJobForClient(supabase, jobId);
  invalidateTechnicianJobs();
  return job;
}

export async function updateAssignedJobStatus(jobId: string, nextStatus: JobStatus, note?: string): Promise<Job> {
  const job = await updateJobStatusForClient(supabase, jobId, nextStatus, note);
  invalidateTechnicianJobs();
  return job;
}

export function primeAvailableJobs(jobs: Job[]): void {
  setCachedValue(AVAILABLE_JOBS_KEY, jobs);
}

export function primeAssignedJobs(jobs: Job[]): void {
  setCachedValue(ASSIGNED_JOBS_KEY, jobs);
}

export function invalidateTechnicianJobs(): void {
  invalidateCache("technician:");
}
