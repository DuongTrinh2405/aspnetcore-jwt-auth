"use client";

import type { CurrentUserProfile, UserRole } from "@cnl/shared";
import { Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./AuthProvider";

type RoleGuardProps = {
  allow: (role: UserRole) => boolean;
  children: React.ReactNode | ((profile: CurrentUserProfile) => React.ReactNode);
};

export function RoleGuard({ allow, children }: RoleGuardProps) {
  const router = useRouter();
  const { loading, profile } = useAuth();

  useEffect(() => {
    if (loading) return;

    if (!profile) {
      router.replace("/login");
      return;
    }

    if (!allow(profile.role)) {
      router.replace("/");
    }
  }, [allow, loading, profile, router]);

  if (loading || !profile) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#F6F9FC] px-5">
        <section className="premium-card w-full max-w-md p-6 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
            {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <ShieldCheck className="h-6 w-6" />}
          </div>
          <h1 className="mt-4 text-xl font-semibold text-slate-950">
            {loading ? "Đang mở không gian làm việc" : "Cần đăng nhập"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            {loading
              ? "Hệ thống đang xác thực phiên đăng nhập và chuẩn bị đúng workspace theo vai trò của bạn."
              : "Bạn sẽ được chuyển về trang đăng nhập để tiếp tục."}
          </p>
        </section>
      </main>
    );
  }

  if (!allow(profile.role)) {
    return null;
  }

  return <>{typeof children === "function" ? children(profile) : children}</>;
}
