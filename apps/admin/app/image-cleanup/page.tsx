"use client";

import { isAdminRole } from "@cnl/shared";
import { ImageIcon, ShieldAlert } from "lucide-react";
import { AdminGuard } from "../../components/AdminGuard";
import { AdminShell } from "../../components/AdminShell";
import { ImageCleanupPanel } from "../../components/ImageCleanupPanel";

export default function ImageCleanupPage() {
  return (
    <AdminGuard allow={isAdminRole}>
      {(profile) => (
        <AdminShell profile={profile}>
          <main className="admin-page">
            <section className="admin-panel">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563EB]">Storage operations</p>
                  <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Don dep anh cu</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Cong cu rieng cho admin de preview va xoa file anh cu trong Supabase Storage. Thong tin job, log va metadata anh van duoc giu lai.
                  </p>
                </div>
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan-50 text-cyan-600">
                  <ImageIcon className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-900">
                <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
                <p>Chức năng này chỉ xóa file ảnh vật lý. Không xóa đơn hàng, không xóa lịch sử xử lý và không chạy tự động.</p>
              </div>
            </section>

            <div className="mt-4">
              <ImageCleanupPanel />
            </div>
          </main>
        </AdminShell>
      )}
    </AdminGuard>
  );
}
