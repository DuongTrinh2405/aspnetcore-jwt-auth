import { CNL_CONTACT, SERVICE_CATALOG } from "@cnl/shared";
import { Globe2, HeartHandshake, Mail, MapPin, Phone, ShieldCheck, UserRoundCheck } from "lucide-react";
import Link from "next/link";
import { BrandLogo } from "./BrandLogo";

const quickLinks = [
  { href: "/booking", label: "Đặt lịch dịch vụ" },
  { href: "/report-issue", label: "Báo lỗi" },
  { href: "/track", label: "Tra cứu đơn hàng" },
  { href: "/warranty", label: "Chính sách bảo hành" }
];

export function PublicFooter() {
  const serviceLinks = SERVICE_CATALOG.slice(-4);

  return (
    <footer className="mt-10 border-t border-slate-200/80 bg-gradient-to-b from-white/88 to-blue-50/70">
      <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1.1fr]">
          <section>
            <BrandLogo href="/" title="Châu Ngọc Long" subtitle="Trung tâm dịch vụ" size="lg" />
            <h2 className="mt-5 text-xl font-semibold tracking-tight text-slate-950">{CNL_CONTACT.companyName}</h2>
            <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
              Chuyên cung cấp giải pháp và dịch vụ kỹ thuật chất lượng cao: nhà thông minh, robot, hệ thống mạng, cabin bảo vệ và các dịch vụ kỹ thuật khác.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {[
                { icon: ShieldCheck, label: "Uy tín" },
                { icon: UserRoundCheck, label: "Chuyên nghiệp" },
                { icon: HeartHandshake, label: "Tận tâm" }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <span key={item.label} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 shadow-sm">
                    <Icon className="h-4 w-4 text-cyan-600" />
                    {item.label}
                  </span>
                );
              })}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-900">Dịch vụ</h3>
            <div className="mt-4 grid gap-3 text-sm text-slate-600">
              {serviceLinks.map((service) => (
                <Link key={service.slug} className="transition hover:text-blue-700" href={`/booking?service=${service.slug}`} prefetch>
                  {service.title}
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-900">Liên kết nhanh</h3>
            <div className="mt-4 grid gap-3 text-sm text-slate-600">
              {quickLinks.map((link) => (
                <Link key={link.href} className="transition hover:text-blue-700" href={link.href} prefetch>
                  {link.label}
                </Link>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-900">Liên hệ</h3>
            <div className="mt-4 grid gap-4 text-sm text-slate-600">
              <a className="flex items-start gap-3 font-semibold text-slate-900 transition hover:text-blue-700" href={`tel:${CNL_CONTACT.hotline.replace(/\s+/g, "")}`}>
                <Phone className="mt-0.5 h-5 w-5 text-blue-600" />
                <span>
                  {CNL_CONTACT.hotline}
                  <span className="block text-sm font-medium text-slate-500">Tư vấn kỹ thuật</span>
                </span>
              </a>
              <a className="flex items-start gap-3 transition hover:text-blue-700" href={`mailto:${CNL_CONTACT.email}`}>
                <Mail className="mt-0.5 h-5 w-5 text-cyan-600" />
                {CNL_CONTACT.email}
              </a>
              <a className="flex items-start gap-3 transition hover:text-blue-700" href={CNL_CONTACT.website} rel="noreferrer" target="_blank">
                <Globe2 className="mt-0.5 h-5 w-5 text-blue-600" />
                {CNL_CONTACT.websiteLabel}
              </a>
              <a className="flex items-start gap-3 transition hover:text-blue-700" href={CNL_CONTACT.facebook} rel="noreferrer" target="_blank">
                <Globe2 className="mt-0.5 h-5 w-5 text-cyan-600" />
                {CNL_CONTACT.facebookLabel}
              </a>
              <p className="flex items-start gap-3 leading-6">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
                {CNL_CONTACT.address}
              </p>
            </div>
          </section>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-slate-200/80 pt-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {CNL_CONTACT.companyName}. All rights reserved.</p>
          <p className="text-xs text-slate-400">Dev by NguyenDuongTrinh · Dev</p>
        </div>
      </div>

      <a
        className="fixed bottom-4 left-4 z-20 hidden items-center gap-3 rounded-full border border-blue-100 bg-white/95 px-5 py-3 text-sm font-semibold text-blue-700 shadow-[0_16px_34px_rgba(37,99,235,0.16)] backdrop-blur transition hover:-translate-y-0.5 sm:flex"
        href={`tel:${CNL_CONTACT.hotline.replace(/\s+/g, "")}`}
      >
        <Phone className="h-5 w-5" />
        <span>
          {CNL_CONTACT.hotline}
          <span className="block text-xs font-medium text-slate-500">Tư vấn kỹ thuật</span>
        </span>
      </a>
    </footer>
  );
}
