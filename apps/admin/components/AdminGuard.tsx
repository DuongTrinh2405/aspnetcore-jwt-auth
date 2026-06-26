"use client";

import type { CurrentUserProfile, UserRole } from "@cnl/shared";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./AuthProvider";

type AdminGuardProps = {
  allow: (role: UserRole) => boolean;
  children: React.ReactNode | ((profile: CurrentUserProfile) => React.ReactNode);
};

export function AdminGuard({ allow, children }: AdminGuardProps) {
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
      <main className="grid min-h-screen place-items-center bg-[#F6F9FC] p-6 text-slate-600">
        <div className="premium-card p-6 text-center">
          <p className="text-sm font-bold text-[#2563EB]">Đang xác thực quyền quản trị...</p>
        </div>
      </main>
    );
  }

  if (!allow(profile.role)) {
    return null;
  }

  return <>{typeof children === "function" ? children(profile) : children}</>;
}
