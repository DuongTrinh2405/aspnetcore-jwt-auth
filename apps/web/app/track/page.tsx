"use client";

import { JOB_STATUS_LABELS, type TrackingResult } from "@cnl/shared";
import { CheckCircle2, Clock3, Route, Search, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { PublicFooter } from "../../components/PublicFooter";
import { PublicNav } from "../../components/PublicNav";
import { StatusBadge } from "../../components/StatusBadge";
import { AppSpinner } from "../../components/ui/AppSpinner";
import { trackJob } from "../../lib/jobs";

const previewSteps = ["Đã tiếp nhận", "Đang điều phối", "Kỹ thuật viên đang đến", "Đang xử lý", "Hoàn thành"];

function getTrackingNextStep(status: TrackingResult["job"]["status"]) {
  if (status === "pending") return "Trung tâm sẽ kiểm tra thông tin và phân công kỹ thuật viên phù hợp.";
  if (status === "accepted") return "Kỹ thuật viên đã tiếp nhận. Bạn nên giữ điện thoại sẵn sàng để xác nhận lịch.";
  if (status === "in_progress") return "Yêu cầu đang được xử lý. Kết quả hoàn thành sẽ được cập nhật tại đây.";
  if (status === "completed") return "Yêu cầu đã hoàn thành. Bạn có thể lưu mã này để đối chiếu khi cần hỗ trợ.";
  return "Yêu cầu đã dừng xử lý. Vui lòng liên hệ trung tâm nếu cần mở lại hoặc tạo yêu cầu mới.";
}

export default function TrackPage() {
  const [trackingCode, setTrackingCode] = useState("");
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const data = await trackJob(trackingCode, phone);
      if (!data) {
        setResult(null);
        setMessage("Không tìm thấy yêu cầu với mã và số điện thoại này.");
      } else {
        setResult(data);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Không tra cứu được tiến độ.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <PublicNav />
      <section className="page-shell grid max-w-6xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="eyebrow">Tra cứu tiến độ</p>
          <h1 className="hero-title">Tra cứu tiến độ yêu cầu</h1>
          <p className="hero-copy">Khách không cần đăng nhập, chỉ cần mã yêu cầu và số điện thoại đã gửi.</p>
          <form className="premium-card mt-6 p-5" onSubmit={submit}>
            <label className="form-label">
              Mã yêu cầu
              <input className="premium-input mt-2 uppercase" placeholder="CNL-1234ABCD" value={trackingCode} onChange={(event) => setTrackingCode(event.target.value)} />
            </label>
            <label className="form-label mt-4">
              Số điện thoại
              <input className="premium-input mt-2" placeholder="090..." value={phone} onChange={(event) => setPhone(event.target.value)} />
            </label>
            <button className="premium-button mt-5 w-full" disabled={loading || !trackingCode || !phone} type="submit">
              {loading ? <AppSpinner size="md" tone="subtle" /> : <Search className="h-5 w-5" />}
              {loading ? "Đang tra cứu..." : "Tra cứu"}
            </button>
          </form>
        </div>

        <div className="premium-card min-h-96 p-5">
          {message ? <p className="rounded-2xl bg-amber-50 p-4 font-medium text-amber-800">{message}</p> : null}
          {message ? (
            <p className="mt-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-4 text-sm font-semibold leading-6 text-blue-800">
              Kiểm tra lại mã yêu cầu, số điện thoại hoặc liên hệ hotline nếu bạn cần hỗ trợ tra cứu.
            </p>
          ) : null}
          {loading && result ? <p className="mb-4 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">Đang cập nhật kết quả tra cứu...</p> : null}
          {loading && !result ? <TrackingSkeleton /> : null}
          {!loading && !result && !message ? <TrackingEmpty /> : null}
          {result ? <TrackingResultView result={result} /> : null}
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}

function TrackingSkeleton() {
  return (
    <div className="space-y-5">
      <div className="skeleton-line h-5 w-40" />
      <div className="skeleton-line h-8 w-2/3" />
      <div className="skeleton-line h-4 w-full" />
      <div className="mt-6 space-y-4">
        {[1, 2, 3, 4].map((item) => <div key={item} className="h-16 animate-pulse rounded-2xl bg-slate-100" />)}
      </div>
    </div>
  );
}

function TrackingEmpty() {
  return (
    <div className="min-h-80">
      <div className="rounded-3xl border border-cyan-100 bg-gradient-to-br from-white to-cyan-50/70 p-5 text-center">
        <ShieldCheck className="mx-auto h-12 w-12 text-cyan-600" />
        <h2 className="mt-4 text-2xl font-semibold text-slate-900">Thông tin tiến độ sẽ hiển thị ở đây</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">Bạn sẽ thấy trạng thái hiện tại, lịch sử cập nhật và bước tiếp theo của kỹ thuật viên.</p>
      </div>
      <div className="mt-6 space-y-4">
        {previewSteps.map((label, index) => (
          <div key={label} className="flex gap-3">
            <div className={`mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full ${index === 0 ? "bg-cyan-500 text-white" : "bg-slate-100 text-slate-400"}`}>
              {index === 0 ? <CheckCircle2 className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}
            </div>
            <div>
              <p className="font-medium text-slate-900">{label}</p>
          <p className="text-sm text-slate-500">Cập nhật tự động khi yêu cầu thay đổi trạng thái.</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrackingResultView({ result }: { result: TrackingResult }) {
  const history = result.statusHistory.length
    ? result.statusHistory
    : [{ id: "current", new_status: result.job.status, created_at: result.job.created_at, note: null }];

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-cyan-600">{result.job.tracking_code ?? result.job.id.slice(0, 8)}</p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-900">{result.job.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">{result.job.description}</p>
        </div>
        <StatusBadge status={result.job.status} />
      </div>

      <div className="mt-5 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">Hiện tại cần làm gì?</p>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-800">{getTrackingNextStep(result.job.status)}</p>
      </div>

      <div className="mt-6 space-y-4">
        {history.map((item) => (
          <div key={item.id} className="flex gap-3">
            <div className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-cyan-50 text-cyan-600 ring-1 ring-cyan-100">
              <Route className="h-4 w-4" />
            </div>
            <div>
              <p className="font-medium text-slate-900">{JOB_STATUS_LABELS[item.new_status]}</p>
              <p className="text-sm text-slate-500">{new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(new Date(item.created_at))}</p>
              {item.note ? <p className="mt-1 text-sm text-slate-500">{item.note}</p> : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
