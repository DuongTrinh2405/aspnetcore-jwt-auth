"use client";

import { isCustomerRole } from "@cnl/shared";
import { Phone, ShieldCheck, UserRound } from "lucide-react";
import { AppBadge, AppCard, AppPageContainer, AppPageHeader } from "../../../components/ui/AppPrimitives";
import { ProductShell } from "../../../components/ProductShell";
import { RoleGuard } from "../../../components/RoleGuard";

export default function CustomerProfilePage() {
  return (
    <RoleGuard allow={isCustomerRole}>
      {(profile) => (
        <ProductShell profile={profile}>
          <AppPageContainer>
            <AppPageHeader
              eyebrow="Tài khoản"
              title="Cá nhân"
              description="Thông tin tài khoản dùng để hỗ trợ đặt lịch, liên hệ và theo dõi yêu cầu dịch vụ nhanh hơn."
            />
            <AppCard className="mt-6 p-5">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                  <UserRound className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-slate-950">{profile.fullName || "Khách hàng"}</h2>
                    <AppBadge tone={profile.role === "customer_vip" ? "amber" : "cyan"}>
                      {profile.role === "customer_vip" ? "Khách VIP" : "Khách hàng"}
                    </AppBadge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{profile.email || "Chưa có email"}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <p className="mt-2 text-sm font-semibold text-slate-500">Số điện thoại</p>
                  <p className="mt-1 font-semibold text-slate-950">{profile.phone || "Chưa cập nhật"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <p className="mt-2 text-sm font-semibold text-slate-500">Trạng thái</p>
                  <p className="mt-1 font-semibold text-slate-950">{profile.isActive ? "Đang hoạt động" : "Tạm khóa"}</p>
                </div>
              </div>
            </AppCard>
          </AppPageContainer>
        </ProductShell>
      )}
    </RoleGuard>
  );
}
