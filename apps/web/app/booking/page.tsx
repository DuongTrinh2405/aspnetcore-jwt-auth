"use client";

import { PublicFooter } from "../../components/PublicFooter";
import { ServiceRequestForm } from "../../components/ServiceRequestForm";
import { PublicNav } from "../../components/PublicNav";

export default function BookingPage() {
  return (
    <main className="min-h-screen">
      <PublicNav />
      <section className="page-shell max-w-6xl">
        <p className="eyebrow">Đặt lịch</p>
        <h1 className="hero-title">Đặt lịch lắp đặt/sửa chữa</h1>
        <p className="hero-copy">
          Gửi yêu cầu trong vài phút, đính kèm ảnh hiện trạng và vị trí Google Maps. Trung tâm dịch vụ tiếp nhận, điều phối kỹ thuật viên và cập nhật tiến độ minh bạch.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["30-60 phút", "Phản hồi nhanh trong khu vực"],
            ["2,000+", "Yêu cầu kỹ thuật đã xử lý"],
            ["Đà Nẵng", "Hỗ trợ khu vực lân cận"],
            ["Bảo hành", "Theo dõi sau hoàn thành"]
          ].map(([value, label]) => (
            <div key={label} className="trust-card">
              <p className="text-xl font-semibold text-slate-900">{value}</p>
              <p className="mt-1 text-sm leading-6 text-slate-500">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <ServiceRequestForm mode="booking" />
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
