import { CNL_CONTACT, SERVICE_CATALOG } from "@cnl/shared";
import { ArrowRight, CalendarCheck, ClipboardCheck, MapPin, ShieldCheck, Wrench } from "lucide-react";
import Link from "next/link";
import { PublicFooter } from "../components/PublicFooter";
import { PublicNav } from "../components/PublicNav";

export default function HomePage() {
  const featured = SERVICE_CATALOG.slice(0, 6);

  return (
    <main className="min-h-screen">
      <PublicNav />
      <section className="mx-auto grid max-w-7xl gap-10 px-5 py-12 lg:grid-cols-[1.04fr_0.96fr] lg:px-10 lg:py-20">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-bold text-blue-700 shadow-sm">
            <ShieldCheck className="h-4 w-4" />
            Không thay thế website cũ, tập trung vận hành dịch vụ
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-black tracking-tight text-slate-950 sm:text-6xl">
            {CNL_CONTACT.brandName}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Web app đặt lịch, báo lỗi, upload ảnh hiện trạng, theo dõi tiến độ, quản lý kỹ thuật viên và bảo hành/bảo trì cho các dịch vụ kỹ thuật.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="premium-button" href="/booking">
              Đặt lịch dịch vụ
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link className="secondary-button" href="/track">
              Tra cứu tiến độ
            </Link>
          </div>
          <div className="mt-8 grid gap-3 text-sm font-semibold text-slate-600 sm:grid-cols-2">
            <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-cyan-600" />{CNL_CONTACT.address}</p>
            <p className="flex items-center gap-2"><CalendarCheck className="h-4 w-4 text-cyan-600" />Hỗ trợ đặt lịch và bảo trì định kỳ</p>
          </div>
        </div>

        <div className="premium-card p-5">
          <div className="rounded-[1.5rem] bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-500 p-6 text-white">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-100">Trung tâm vận hành</p>
            <h2 className="mt-3 text-3xl font-black">Luồng xử lý dịch vụ</h2>
            <div className="mt-6 grid gap-3">
              {[
                { icon: ClipboardCheck, title: "Khách gửi yêu cầu", meta: "Chọn dịch vụ, mô tả lỗi, upload ảnh" },
                { icon: Wrench, title: "Điều phối kỹ thuật viên", meta: "Lọc theo dịch vụ, khu vực, mức độ khẩn cấp" },
                { icon: ShieldCheck, title: "Theo dõi và bảo hành", meta: "Timeline trạng thái, mã yêu cầu, lịch bảo trì" }
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-white text-blue-600">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-black">{item.title}</p>
                        <p className="text-sm text-blue-50">{item.meta}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-16 lg:px-10">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Danh mục dịch vụ</p>
            <h2 className="mt-2 text-3xl font-black text-slate-950">Nhóm dịch vụ vận hành</h2>
          </div>
          <Link className="secondary-button" href="/services">Xem tất cả</Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((service) => (
            <Link key={service.slug} href={`/booking?service=${service.slug}`} className="premium-card block p-5 hover:-translate-y-1">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-600">{service.shortTitle}</p>
              <h3 className="mt-2 text-xl font-black text-slate-950">{service.title}</h3>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-500">{service.description}</p>
            </Link>
          ))}
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}
