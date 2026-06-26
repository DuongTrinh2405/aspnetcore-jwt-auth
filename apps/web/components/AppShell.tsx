"use client";

import type { CurrentUserProfile } from "@cnl/shared";
import { Bell, BriefcaseBusiness, Home, LogOut, PlusCircle, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { signOutAndRedirect } from "../lib/authSession";
import { AppMobileNav, type AppNavItem } from "./AppMobileNav";
import { BrandLogo } from "./BrandLogo";
import { NotificationCenter } from "./NotificationCenter";
import { PwaInstallButton } from "./pwa/PwaInstallButton";

type AppShellProps = {
  profile: CurrentUserProfile;
  children: React.ReactNode;
};

const customerNavItems: AppNavItem[] = [
  { href: "/customer", label: "Tổng quan", icon: Home },
  { href: "/customer/jobs", label: "Yêu cầu", icon: BriefcaseBusiness },
  { href: "/customer/jobs/new", label: "Tạo mới", icon: PlusCircle },
  { href: "/customer/notifications", label: "Thông báo", icon: Bell }
];

const customerHeaderLinks = [
  { href: "/services", label: "Dịch vụ" },
  { href: "/booking", label: "Đặt lịch" },
  { href: "/report-issue", label: "Báo lỗi" },
  { href: "/track", label: "Tra cứu" },
  { href: "/warranty", label: "Bảo hành" }
];

export function AppShell({ children, profile }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [accountOpen, setAccountOpen] = useState(false);

  function prefetchRoute(href: string) {
    router.prefetch(href);
  }

  return (
    <div className="min-h-screen bg-[#F6F9FC]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200/75 bg-white/90 px-5 py-6 shadow-[12px_0_40px_rgba(37,99,235,0.04)] backdrop-blur-xl lg:block">
        <BrandLogo href="/customer" size="lg" subtitle="Không gian khách hàng" title="CNL Service" />

        <nav className="mt-8 space-y-2">
          {customerNavItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-semibold transition duration-200 active:scale-[0.98] ${
                  active ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-600 hover:bg-blue-50 hover:text-slate-950"
                }`}
                href={item.href}
                onFocus={() => prefetchRoute(item.href)}
                onMouseEnter={() => prefetchRoute(item.href)}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-5 right-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_10px_30px_rgba(37,99,235,0.07)]">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-cyan-50 text-blue-600">
              <UserRound className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950">{profile.fullName || "Khách hàng"}</p>
              <p className="text-xs text-slate-500">{profile.role === "customer_vip" ? "Khách VIP" : "Khách hàng"}</p>
            </div>
          </div>
          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50" onClick={() => void signOutAndRedirect("/login")}>
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-4 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top))] backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between">
          <BrandLogo href="/customer" size="sm" subtitle="Không gian khách hàng" title="CNL Service" />
          <div className="flex items-center gap-2">
            <NotificationCenter profile={profile} />
            <button
              className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm"
              type="button"
              aria-label="Mở tài khoản"
              onClick={() => setAccountOpen((current) => !current)}
            >
              <UserRound className="h-4 w-4" />
            </button>
          </div>
        </div>
        {accountOpen ? (
          <div className="mt-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_16px_36px_rgba(15,23,42,0.10)]">
            <Link className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-700 hover:bg-blue-50" href="/customer/profile" onClick={() => setAccountOpen(false)}>
              <UserRound className="h-4 w-4 text-blue-600" />
              Cá nhân
            </Link>
            <PwaInstallButton className="mt-1 w-full justify-start border-0 px-3 shadow-none" variant="ghost" />
            <button className="mt-1 flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-700 hover:bg-blue-50" type="button" onClick={() => void signOutAndRedirect("/login")}>
              <LogOut className="h-4 w-4 text-blue-600" />
              Đăng xuất
            </button>
          </div>
        ) : null}
      </header>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-20 hidden border-b border-slate-200/80 bg-white/85 px-8 py-4 backdrop-blur-xl lg:flex lg:items-center lg:justify-between">
          <nav className="flex items-center gap-1">
            {customerHeaderLinks.map((link) => (
              <Link
                key={link.href}
                className={`rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition active:scale-[0.98] ${
                  pathname === link.href ? "bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]" : "text-slate-700 hover:bg-blue-50 hover:text-slate-950"
                }`}
                href={link.href}
                prefetch
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <NotificationCenter profile={profile} />
            <Link className="secondary-button min-h-11 px-4 py-2.5 text-sm" href="/customer/profile" prefetch>
              <UserRound className="h-4 w-4" />
              {profile.fullName || "Tài khoản"}
            </Link>
            <button className="secondary-button min-h-11 px-4 py-2.5 text-sm" type="button" onClick={() => void signOutAndRedirect("/login")}>
              <LogOut className="h-4 w-4" />
              Đăng xuất
            </button>
          </div>
        </header>
        {children}
      </main>

      <AppMobileNav items={customerNavItems} />
    </div>
  );
}
