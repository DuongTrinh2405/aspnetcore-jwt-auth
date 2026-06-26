"use client";

import { JOB_IMAGE_CLEANUP_AGE_OPTIONS, MIN_JOB_IMAGE_DELETE_AGE_DAYS } from "@cnl/shared";
import { Loader2, Search, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  fetchImageCleanupPreview,
  runImageCleanup,
  type ImageCleanupPreview,
  type ImageCleanupQuery,
  type ImageCleanupResult
} from "../lib/admin";
import { AdminSelect } from "./AdminInteractions";

function formatDate(value: string | null | undefined) {
  if (!value) return "Chưa có";
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImageCleanupPanel() {
  const [query, setQuery] = useState<ImageCleanupQuery>({ ageDays: 30, status: "all" });
  const [preview, setPreview] = useState<ImageCleanupPreview | null>(null);
  const [result, setResult] = useState<ImageCleanupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [message, setMessage] = useState("");
  const hasEligibleImages = Boolean(preview && preview.totalEligible > 0);

  async function loadPreview(clearResult = true) {
    setLoading(true);
    setMessage("");
    if (clearResult) {
      setResult(null);
    }

    try {
      setPreview(await fetchImageCleanupPreview(query));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không tải được preview dọn dẹp ảnh.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmCleanup() {
    setLoading(true);
    setMessage("");

    try {
      const cleanupResult = await runImageCleanup(query);
      setResult(cleanupResult);
      setConfirmOpen(false);
      await loadPreview(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không dọn dẹp được ảnh.");
    } finally {
      setLoading(false);
    }
  }

  function updateQuery(nextQuery: ImageCleanupQuery) {
    setQuery(nextQuery);
    setPreview(null);
    setResult(null);
    setMessage("");
  }

  return (
    <section className="admin-panel">
      <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-600">Image cleanup</p>
          <h2 className="mt-1.5 text-2xl font-semibold text-slate-950">Don dep anh cu</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            Chi xoa file anh khoi Supabase Storage, khong xoa job, log, timeline hoac metadata anh. Anh duoi {MIN_JOB_IMAGE_DELETE_AGE_DAYS} ngay va job chua dong se khong duoc phep xoa.
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm font-semibold text-amber-900">
          Can preview truoc khi xoa. Hanh dong xoa yeu cau xac nhan thu cong.
        </div>
      </div>

      {message ? <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{message}</p> : null}

      <div className="mt-4 grid gap-2.5 lg:grid-cols-[0.75fr_0.75fr_0.9fr_auto_auto]">
        <label className="block text-sm font-semibold text-slate-700">
          Tuoi anh
          <AdminSelect
            className="mt-2"
            value={query.ageDays}
            onChange={(value) => updateQuery({ ...query, ageDays: Number(value) as ImageCleanupQuery["ageDays"], beforeDate: undefined })}
            options={JOB_IMAGE_CLEANUP_AGE_OPTIONS.map((ageDays) => ({ label: `Cu hon ${ageDays} ngay`, value: String(ageDays) }))}
          />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Trang thai job
          <AdminSelect
            className="mt-2"
            value={query.status}
            onChange={(value) => updateQuery({ ...query, status: value as ImageCleanupQuery["status"] })}
            options={[
              { label: "Completed + cancelled", value: "all" },
              { label: "Chi completed", value: "completed" },
              { label: "Chi cancelled", value: "cancelled" }
            ]}
          />
        </label>
        <label className="block text-sm font-semibold text-slate-700">
          Hoac xoa anh tao truoc ngay
          <input className="premium-input mt-2" type="date" value={query.beforeDate ?? ""} onChange={(event) => updateQuery({ ...query, beforeDate: event.target.value || undefined })} />
        </label>
        <button className="secondary-button self-end" disabled={loading} type="button" onClick={() => loadPreview()}>
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          Xem preview
        </button>
        <button className="premium-button self-end bg-rose-600 hover:bg-rose-700" disabled={loading || !hasEligibleImages} type="button" onClick={() => setConfirmOpen(true)}>
          <Trash2 className="h-5 w-5" />
          Xoa file anh
        </button>
      </div>

      {preview ? (
        <div className="mt-4 grid gap-3 xl:grid-cols-[240px_minmax(0,1fr)]">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-500">Co the xoa</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">{preview.totalEligible}</p>
            <p className="mt-3 text-sm font-semibold text-slate-600">Uoc tinh giai phong: {formatBytes(preview.estimatedFreedBytes)}</p>
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            {preview.previewItems.length > 0 ? (
              <div className="max-h-72 divide-y divide-slate-100 overflow-auto bg-white">
                {preview.previewItems.map((item) => (
                  <div key={item.id} className="grid gap-2 p-3 text-sm sm:grid-cols-[1fr_auto_auto] sm:items-center">
                    <div>
                      <p className="font-semibold text-slate-900">{item.trackingCode ?? item.jobId.slice(0, 8)} - {item.jobTitle}</p>
                      <p className="mt-1 text-slate-500">{item.fileName ?? "Anh job"} - {formatDate(item.createdAt)}</p>
                    </div>
                    <span className="font-semibold text-slate-600">{formatBytes(item.sizeBytes)}</span>
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">Eligible</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid min-h-28 place-items-center bg-white p-5 text-center text-sm font-semibold text-slate-500">
                Không có ảnh đủ điều kiện với bộ lọc hiện tại.
              </div>
            )}
          </div>
        </div>
      ) : null}

      {result ? (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">
          Da xoa {result.deletedCount} file, giai phong khoang {formatBytes(result.freedBytes)}.
          {result.failedItems.length > 0 ? <span className="mt-2 block text-rose-700">Co {result.failedItems.length} file loi. Kiem tra quyen Storage hoac path file.</span> : null}
        </div>
      ) : null}

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-[1.35rem] bg-white p-5 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-950">Xac nhan don dep anh?</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  He thong se xoa file anh vat ly khoi Storage cho cac job da completed/cancelled va anh cu it nhat {MIN_JOB_IMAGE_DELETE_AGE_DAYS} ngay. Metadata, job va lich su van giu lai.
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
              Chi tiep tuc neu ban da xem preview. Hanh dong nay khong tu dong khoi phuc file anh.
            </div>
            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button className="secondary-button" disabled={loading} type="button" onClick={() => setConfirmOpen(false)}>Huy</button>
              <button className="premium-button bg-rose-600 hover:bg-rose-700" disabled={loading} type="button" onClick={confirmCleanup}>
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Trash2 className="h-5 w-5" />}
                Toi hieu, xoa file anh
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
