"use client";

import { isAdminRole } from "@cnl/shared";
import { Crown, RefreshCcw, Wrench } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AdminGuard } from "../../components/AdminGuard";
import { AdminShell } from "../../components/AdminShell";
import { AdminUserManager } from "../../components/AdminUserManager";
import { fetchAdminDataset, type AdminDataset } from "../../lib/admin";

export default function AdminTechniciansPage() {
  const [dataset, setDataset] = useState<AdminDataset | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const loadRequestRef = useRef(0);

  const load = useCallback(async () => {
    const requestId = loadRequestRef.current + 1;
    loadRequestRef.current = requestId;
    setLoading(true);
    setError("");
    try {
      const nextDataset = await fetchAdminDataset();
      if (loadRequestRef.current === requestId) {
        setDataset(nextDataset);
      }
    } catch (nextError) {
      if (loadRequestRef.current === requestId) {
      setError(nextError instanceof Error ? nextError.message : "Không tải được danh sách nhân viên.");
      }
    } finally {
      if (loadRequestRef.current === requestId) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <AdminGuard allow={isAdminRole}>
      {(profile) => (
        <AdminShell profile={profile}>
          <main className="admin-page">
            <section className="admin-panel">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2563EB]">Technicians</p>
                  <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Quản lý nhân viên</h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Theo dõi năng lực, workload, VIP và trạng thái tài khoản kỹ thuật viên/điều phối.
                  </p>
                </div>
                <button className="premium-button" disabled={loading} onClick={load} type="button">
                  <RefreshCcw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                  Làm mới
                </button>
              </div>
            </section>

            <section className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="admin-kpi">
                <Wrench className="h-5 w-5 text-[#2563EB]" />
                <p className="mt-3 text-2xl font-semibold text-slate-950">{dataset?.stats.technicians ?? 0}</p>
                <p className="text-sm font-bold text-slate-500">Nhân viên thường</p>
              </div>
              <div className="admin-kpi">
                <Crown className="h-5 w-5 text-amber-500" />
                <p className="mt-3 text-2xl font-semibold text-slate-950">{dataset?.stats.vipTechnicians ?? 0}</p>
                <p className="text-sm font-bold text-slate-500">Nhân viên VIP</p>
              </div>
            </section>

            {error ? <p className="mt-3 rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p> : null}

            <AdminUserManager dataset={dataset} kind="technician" refreshing={loading} search={search} onReload={load} onSearchChange={setSearch} />
          </main>
        </AdminShell>
      )}
    </AdminGuard>
  );
}
