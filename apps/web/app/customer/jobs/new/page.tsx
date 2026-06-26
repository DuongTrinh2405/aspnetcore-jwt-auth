"use client";

import { CNL_CONTACT, isCustomerRole } from "@cnl/shared";
import { Globe2, MapPin, Phone, ShieldCheck } from "lucide-react";
import { ProductShell } from "../../../../components/ProductShell";
import { RoleGuard } from "../../../../components/RoleGuard";
import { ServiceRequestForm } from "../../../../components/ServiceRequestForm";

export default function NewJobPage() {
  return (
    <RoleGuard allow={isCustomerRole}>
      {(profile) => (
        <ProductShell profile={profile}>
          <div className="px-5 pb-28 pt-6 sm:px-8 lg:px-10 lg:py-10">
            <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
              <section>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">Service operations</p>
                <h1 className="mt-2 text-4xl font-black text-slate-950">Tạo yêu cầu kỹ thuật</h1>
                <p className="mt-3 max-w-2xl text-slate-500">
                  Đặt lịch lắp đặt, báo lỗi, upload ảnh hiện trạng và gửi yêu cầu đến trung tâm dịch vụ.
                </p>
                <div className="mt-7">
                  <ServiceRequestForm mode="booking" />
                </div>
              </section>

              <aside className="space-y-4">
                <div className="premium-card p-5">
                  <ShieldCheck className="h-8 w-8 text-blue-600" />
                  <h2 className="mt-4 text-xl font-black text-slate-950">Quy trình minh bạch</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Job mặc định ở trạng thái đang chờ. Mỗi lần đổi trạng thái đều được ghi vào lịch sử.
                  </p>
                </div>
                <div className="premium-card p-5">
                  <MapPin className="h-8 w-8 text-cyan-600" />
                  <h2 className="mt-4 text-xl font-black text-slate-950">Bản đồ vệ tinh</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Map mặc định dùng hình ảnh vệ tinh để nhận diện hẻm, nhà và mốc xung quanh rõ hơn.
                  </p>
                </div>
                <div className="premium-card p-5">
                  <Phone className="h-8 w-8 text-emerald-600" />
                  <h2 className="mt-4 text-xl font-black text-slate-950">Hotline</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {CNL_CONTACT.hotline} · {CNL_CONTACT.address}
                  </p>
                  <a className="mt-3 inline-flex items-center gap-2 text-sm font-black text-cyan-700 hover:text-blue-700" href={CNL_CONTACT.website} rel="noreferrer" target="_blank">
                    <Globe2 className="h-4 w-4" />
                    {CNL_CONTACT.websiteLabel}
                  </a>
                </div>
              </aside>
            </div>
          </div>
        </ProductShell>
      )}
    </RoleGuard>
  );
}
