import { createClient } from "@supabase/supabase-js";
import { MIN_JOB_IMAGE_DELETE_AGE_DAYS, type JobStatus } from "@cnl/shared";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const CLOSED_STATUSES = ["completed", "cancelled"] as const;

const cleanupQuerySchema = z.object({
  ageDays: z.coerce.number().int().min(MIN_JOB_IMAGE_DELETE_AGE_DAYS).max(365).default(30),
  status: z.enum(["all", ...CLOSED_STATUSES]).default("all"),
  beforeDate: z.string().date().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50)
});

type CleanupQuery = z.infer<typeof cleanupQuerySchema>;

type CleanupJob = {
  id: string;
  status: JobStatus;
  title: string | null;
  tracking_code: string | null;
};

type CleanupImageRow = {
  id: string;
  job_id: string;
  storage_bucket: string;
  storage_path: string;
  file_name: string | null;
  mime_type: string | null;
  size_bytes: number | null;
  compressed_size_bytes: number | null;
  created_at: string;
  protected_until: string | null;
  jobs: CleanupJob | CleanupJob[] | null;
};

type CleanupPreviewItem = {
  id: string;
  jobId: string;
  jobTitle: string;
  trackingCode: string | null;
  fileName: string | null;
  sizeBytes: number;
  createdAt: string;
};

type FailedCleanupItem = {
  id: string;
  storagePath: string;
  error: string;
};

function getErrorStatus(message: string): number {
  if (message === "Unauthorized." || message === "Missing authorization token.") {
    return 401;
  }

  if (message === "Forbidden.") {
    return 403;
  }

  return 400;
}

function getSupabaseServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

function getBearerToken(request: NextRequest): string {
  const header = request.headers.get("authorization");
  const token = header?.replace(/^Bearer\s+/i, "").trim();

  if (!token) {
    throw new Error("Missing authorization token.");
  }

  return token;
}

async function requireAdmin(request: NextRequest): Promise<{ adminId: string; supabase: ReturnType<typeof getSupabaseServerClient> }> {
  const supabase = getSupabaseServerClient();
  const token = getBearerToken(request);
  const { data: authData, error: authError } = await supabase.auth.getUser(token);

  if (authError || !authData.user) {
    throw new Error("Unauthorized.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("users")
    .select("id, role, is_active")
    .eq("id", authData.user.id)
    .single();

  if (profileError || !profile || profile.role !== "admin" || profile.is_active === false) {
    throw new Error("Forbidden.");
  }

  return { adminId: authData.user.id, supabase };
}

function getCutoffDate(query: CleanupQuery): Date {
  const minimumCutoff = new Date();
  minimumCutoff.setDate(minimumCutoff.getDate() - MIN_JOB_IMAGE_DELETE_AGE_DAYS);

  if (query.beforeDate) {
    const requestedCutoff = new Date(`${query.beforeDate}T23:59:59.999Z`);
    if (requestedCutoff > minimumCutoff) {
      throw new Error(`Chỉ được xóa ảnh cũ ít nhất ${MIN_JOB_IMAGE_DELETE_AGE_DAYS} ngày.`);
    }
    return requestedCutoff;
  }

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - query.ageDays);
  return cutoff;
}

function getJob(row: CleanupImageRow): CleanupJob | null {
  if (Array.isArray(row.jobs)) {
    return row.jobs[0] ?? null;
  }

  return row.jobs;
}

function toPreviewItem(row: CleanupImageRow): CleanupPreviewItem | null {
  const job = getJob(row);
  if (!job) return null;

  return {
    id: row.id,
    jobId: row.job_id,
    jobTitle: job.title ?? "Job dịch vụ",
    trackingCode: job.tracking_code,
    fileName: row.file_name,
    sizeBytes: row.compressed_size_bytes ?? row.size_bytes ?? 0,
    createdAt: row.created_at
  };
}

function isMissingStorageObjectError(message: string): boolean {
  const normalized = message.toLowerCase();
  return normalized.includes("not found") || normalized.includes("does not exist") || normalized.includes("no such");
}

async function fetchEligibleImages(supabase: ReturnType<typeof getSupabaseServerClient>, query: CleanupQuery) {
  const cutoffDate = getCutoffDate(query);
  const statusFilter = query.status === "all" ? [...CLOSED_STATUSES] : [query.status];
  const nowIso = new Date().toISOString();

  const { data, error, count } = await supabase
    .from("job_images")
    .select("id, job_id, storage_bucket, storage_path, file_name, mime_type, size_bytes, compressed_size_bytes, created_at, protected_until, jobs!inner(id, status, title, tracking_code)", { count: "exact" })
    .lte("created_at", cutoffDate.toISOString())
    .eq("storage_deleted", false)
    .is("storage_deleted_at", null)
    .eq("is_protected", false)
    .or(`protected_until.is.null,protected_until.lt.${nowIso}`)
    .in("jobs.status", statusFilter)
    .order("created_at", { ascending: true })
    .limit(query.limit);

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as CleanupImageRow[];
  const previewItems = rows.map(toPreviewItem).filter((item): item is CleanupPreviewItem => item !== null);
  const previewBytes = previewItems.reduce((sum, item) => sum + item.sizeBytes, 0);

  return {
    rows,
    totalEligible: count ?? previewItems.length,
    estimatedFreedBytes: previewBytes,
    previewItems
  };
}

function parseQuery(request: NextRequest): CleanupQuery {
  return cleanupQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams.entries()));
}

export async function GET(request: NextRequest) {
  try {
    const { supabase } = await requireAdmin(request);
    const query = parseQuery(request);
    const preview = await fetchEligibleImages(supabase, query);
    const { rows: _rows, ...safePreview } = preview;

    return NextResponse.json({
      ok: true,
      ...safePreview
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể tải preview dọn dẹp ảnh.";
    return NextResponse.json({ ok: false, error: message }, { status: getErrorStatus(message) });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { adminId, supabase } = await requireAdmin(request);
    const body = await request.json();
    const query = cleanupQuerySchema.parse(body);
    const { rows } = await fetchEligibleImages(supabase, query);
    const failedItems: FailedCleanupItem[] = [];
    let deletedCount = 0;
    let freedBytes = 0;

    for (const row of rows) {
      const deletion = await supabase.storage.from(row.storage_bucket).remove([row.storage_path]);
      const deletionError = deletion.error?.message;

      if (deletionError && !isMissingStorageObjectError(deletionError)) {
        failedItems.push({ id: row.id, storagePath: row.storage_path, error: deletionError });
        continue;
      }

      const deletedAt = new Date().toISOString();
      const update = await supabase
        .from("job_images")
        .update({
          deleted_at: deletedAt,
          deleted_by: adminId,
          delete_reason: "manual_admin_cleanup",
          storage_deleted: true,
          storage_deleted_at: deletedAt
        })
        .eq("id", row.id)
        .eq("storage_deleted", false)
        .select("id")
        .single();

      if (update.error) {
        if (update.error.code === "PGRST116") {
          continue;
        }

        failedItems.push({ id: row.id, storagePath: row.storage_path, error: update.error.message });
        continue;
      }

      deletedCount += 1;
      freedBytes += row.compressed_size_bytes ?? row.size_bytes ?? 0;
    }

    return NextResponse.json({
      ok: true,
      deletedCount,
      freedBytes,
      failedItems
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Không thể dọn dẹp ảnh.";
    return NextResponse.json({ ok: false, error: message }, { status: getErrorStatus(message) });
  }
}
