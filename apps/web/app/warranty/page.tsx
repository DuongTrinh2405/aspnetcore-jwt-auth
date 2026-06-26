"use client";

import { CalendarClock, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { PublicFooter } from "../../components/PublicFooter";
import { PublicNav } from "../../components/PublicNav";
import { AppSpinner } from "../../components/ui/AppSpinner";
import { findWarranty } from "../../lib/jobs";
import type { WarrantyRecord } from "@cnl/shared";

export default function WarrantyPage() {
  const [warrantyCode, setWarrantyCode] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<WarrantyRecord | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = await findWarranty(warrantyCode, phone);
      if (!data) {
        setResult(null);
        setMessage("Không tìm thấy bảo hành với mã và số điện thoại này.");
      } else {
        setResult(data);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không tra cứu được bảo hành.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <PublicNav />
      <section className="page-shell grid max-w-6xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow">Bảo hành</p>
          <h1 className="hero-title">Tra cứu bảo hành/bảo trì</h1>
          <p className="hero-copy">Dùng mã bảo hành và số điện thoại để kiểm tra thời hạn, trạng thái và ghi chú cơ bản.</p>
          <form className="premium-card mt-6 p-5" onSubmit={submit}>
            <label className="form-label">
              Mã bảo hành
              <input className="premium-input mt-2 uppercase" placeholder="WR-CNL-..." value={warrantyCode} onChange={(event) => setWarrantyCode(event.target.value)} />
            </label>
            <label className="mt-4 form-label">
              Số điện thoại
              <input className="premium-input mt-2" placeholder="090..." value={phone} onChange={(event) => setPhone(event.target.value)} />
            </label>
            <button className="premium-button mt-5 w-full" disabled={loading || !warrantyCode || !phone} type="submit">
              {loading ? <AppSpinner size="md" tone="subtle" /> : <Search className="h-5 w-5" />}
              {loading ? "Đang tra cứu..." : "Tra cứu"}
            </button>
          </form>
        </div>

        <div className="premium-card min-h-96 p-5">
          {message ? (
            <div className="rounded-2xl bg-amber-50 p-4">
              <p className="font-semibold text-amber-800">{message}</p>
              <p className="mt-2 text-sm font-medium leading-6 text-amber-800/80">
                Kiểm tra lại mã bảo hành, số điện thoại hoặc liên hệ trung tâm để được đối chiếu hồ sơ dịch vụ.
              </p>
            </div>
          ) : null}
          {loading && result ? <p className="mb-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">Đang cập nhật thông tin bảo hành...</p> : null}
          {!loading && !result && !message ? (
            <div className="grid min-h-80 place-items-center text-center">
              <div>
                <ShieldCheck className="mx-auto h-12 w-12 text-cyan-600" />
                <h2 className="mt-4 text-2xl font-semibold text-slate-900">Thông tin bảo hành sẽ hiển thị ở đây</h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Nhập mã bảo hành và số điện thoại để xem thời hạn, tình trạng hỗ trợ và ghi chú bảo trì liên quan.
                </p>
                <div className="mx-auto mt-5 grid max-w-md gap-3 text-left sm:grid-cols-2">
                  <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                    <CalendarClock className="h-5 w-5 text-blue-600" />
                    <p className="mt-2 text-sm font-semibold text-slate-900">Xem thời hạn</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Biết thời điểm bắt đầu và kết thúc bảo hành.</p>
                  </div>
                  <div className="rounded-2xl border border-cyan-100 bg-cyan-50/70 p-4">
                    <ShieldCheck className="h-5 w-5 text-cyan-600" />
                    <p className="mt-2 text-sm font-semibold text-slate-900">Biết bước hỗ trợ</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">Xem trạng thái và ghi chú xử lý nếu có.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          {result ? (
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-cyan-600">{result.warranty_code}</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">{result.title}</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-blue-50 p-4">
                  <p className="text-xs font-bold uppercase text-blue-700">Bắt đầu</p>
                  <p className="mt-1 font-semibold text-slate-950">{result.starts_at}</p>
                </div>
                <div className="rounded-2xl bg-cyan-50 p-4">
                  <p className="text-xs font-bold uppercase text-cyan-700">Kết thúc</p>
                  <p className="mt-1 font-semibold text-slate-950">{result.ends_at}</p>
                </div>
                <div className="rounded-2xl bg-emerald-50 p-4">
                  <p className="text-xs font-bold uppercase text-emerald-700">Trạng thái</p>
                  <p className="mt-1 font-semibold text-slate-950">{result.status}</p>
                </div>
              </div>
              {result.notes ? <p className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">{result.notes}</p> : null}
              <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Bước tiếp theo</p>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">
                  Nếu thiết bị còn trong thời hạn hoặc cần kiểm tra định kỳ, hãy lưu mã bảo hành này khi liên hệ trung tâm.
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
