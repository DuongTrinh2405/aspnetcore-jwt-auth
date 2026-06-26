import { SERVICE_CATALOG } from "@cnl/shared";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { PublicFooter } from "../../components/PublicFooter";
import { PublicNav } from "../../components/PublicNav";

export default function ServicesPage() {
  return (
    <main className="min-h-screen">
      <PublicNav />
      <section className="page-shell">
          <p className="eyebrow">Danh mục dịch vụ</p>
        <h1 className="hero-title">Dịch vụ kỹ thuật đang hỗ trợ</h1>
        <p className="hero-copy">
          Danh mục được chuẩn hóa cho đặt lịch, báo lỗi, điều phối kỹ thuật viên và theo dõi bảo hành sau thi công.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {SERVICE_CATALOG.map((service) => (
            <article key={service.slug} className="premium-card flex min-h-[420px] flex-col p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-600">{service.shortTitle}</p>
              <h2 className="mt-2 line-clamp-2 text-2xl font-semibold text-slate-900">{service.title}</h2>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">{service.description}</p>
              <div className="mt-5 space-y-2">
                {service.options.slice(0, 5).map((option) => (
                  <p key={option} className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    {option}
                  </p>
                ))}
              </div>
              {service.options.length > 5 ? <p className="mt-3 text-sm font-medium text-slate-400">+{service.options.length - 5} lựa chọn khác</p> : null}
              <Link className="secondary-button mt-auto" href={`/booking?service=${service.slug}`} prefetch>
                Đặt lịch
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
