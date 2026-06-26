"use client";

import { AlertTriangle } from "lucide-react";
import { PublicFooter } from "../../components/PublicFooter";
import { PublicNav } from "../../components/PublicNav";
import { ServiceRequestForm } from "../../components/ServiceRequestForm";

export default function ReportIssuePage() {
  return (
    <main className="min-h-screen">
      <PublicNav />
      <section className="page-shell max-w-6xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 shadow-sm">
          <AlertTriangle className="h-4 w-4" />
          Báo lỗi nhanh
        </div>
        <h1 className="hero-title">Báo lỗi thiết bị/hệ thống</h1>
        <p className="hero-copy">
          Dùng cho camera mất hình, barie lỗi, mạng chập chờn, inverter cảnh báo, máy chấm công lỗi nhận diện hoặc thiết bị thông minh mất kết nối.
        </p>
        <div className="mt-8">
          <ServiceRequestForm mode="report" />
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
