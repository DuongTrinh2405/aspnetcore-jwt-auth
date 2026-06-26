import {
  createCustomerJobForClient,
  fetchTrackingByCodeForClient,
  fetchWarrantyByCodeForClient,
  fetchCustomerJobsForClient,
  getCustomerStats,
  type CreateJobInput,
  type CreateServiceRequestInput,
  type Job
} from "@cnl/shared";
import { cached, getCachedValue, invalidateCache, setCachedValue } from "./cache";
import { supabase } from "./supabase";

export { getCustomerStats };

const CUSTOMER_JOBS_KEY = "customer:jobs";

export function fetchCustomerJobs(): Promise<Job[]> {
  return cached(CUSTOMER_JOBS_KEY, () => fetchCustomerJobsForClient(supabase), 20_000);
}

export async function createCustomerJob(input: CreateJobInput | CreateServiceRequestInput): Promise<Job> {
  const job = await createCustomerJobForClient(supabase, input);
  const current = getCachedValue<Job[]>(CUSTOMER_JOBS_KEY, 60_000);

  if (current) {
    setCachedValue(CUSTOMER_JOBS_KEY, [job, ...current.filter((item) => item.id !== job.id)]);
  } else {
    invalidateCache(CUSTOMER_JOBS_KEY);
  }

  return job;
}

export function trackJob(trackingCode: string, phone: string) {
  return fetchTrackingByCodeForClient(supabase, trackingCode, phone);
}

export function findWarranty(warrantyCode: string, phone: string) {
  return fetchWarrantyByCodeForClient(supabase, warrantyCode, phone);
}

export function primeCustomerJobs(jobs: Job[]): void {
  setCachedValue(CUSTOMER_JOBS_KEY, jobs);
}
