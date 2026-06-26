"use client";

import { isTechnicianRole } from "@cnl/shared";
import { Phone, ShieldCheck, UserRound, Wrench } from "lucide-react";
import { AppBadge, AppCard, AppPageContainer, AppPageHeader } from "../../../components/ui/AppPrimitives";
import { RoleGuard } from "../../../components/RoleGuard";
import { TechnicianShell } from "../../../components/TechnicianShell";

export default function TechnicianProfilePage() {
  return (
    <RoleGuard allow={isTechnicianRole}>
      {(profile) => (
        <TechnicianShell profile={profile}>
          <AppPageContainer>
            <AppPageHeader
              eyebrow="Tài khoản"
              title="Cá nhân"
              description="Thông tin tài khoản kỹ thuật viên dùng cho điều phối việc và liên hệ khách hàng."
            />
            <AppCard className="mt-6 p-5">
              <div className="flex items-start gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-blue-600">
                  <UserRound className="h-7 w-7" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-slate-950">{profile.fullName || "Kỹ thuật viên"}</h2>
                    <AppBadge tone={profile.role === "technician_vip" ? "amber" : "cyan"}>
                      {profile.role === "technician_vip" ? "Kỹ thuật viên VIP" : "Kỹ thuật viên"}
                    </AppBadge>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">{profile.email || "Chưa có email"}</p>
                </div>
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <p className="mt-2 text-sm font-semibold text-slate-500">Số điện thoại</p>
                  <p className="mt-1 font-semibold text-slate-950">{profile.phone || "Chưa cập nhật"}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <Wrench className="h-5 w-5 text-cyan-600" />
                  <p className="mt-2 text-sm font-semibold text-slate-500">Vai trò</p>
                  <p className="mt-1 font-semibold text-slate-950">{profile.role}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 p-4">
                  <ShieldCheck className="h-5 w-5 text-emerald-600" />
                  <p className="mt-2 text-sm font-semibold text-slate-500">Trạng thái</p>
                  <p className="mt-1 font-semibold text-slate-950">{profile.isActive ? "Đang hoạt động" : "Tạm khóa"}</p>
                </div>
              </div>
            </AppCard>
          </AppPageContainer>
        </TechnicianShell>
      )}
    </RoleGuard>
  );
}
