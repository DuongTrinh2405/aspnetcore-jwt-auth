"use client";

import type { CurrentUserProfile } from "@cnl/shared";
import { Bell, BriefcaseBusiness, Home, LogOut, MapPinned, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { signOutAndRedirect } from "../lib/authSession";
import { AppMobileNav, type AppNavItem } from "./AppMobileNav";
import { BrandLogo } from "./BrandLogo";
import { NotificationCenter } from "./NotificationCenter";
import { PwaInstallButton } from "./pwa/PwaInstallButton";

type TechnicianShellProps = {
  profile: CurrentUserProfile;
  children: React.ReactNode;
};

const technicianNavItems: AppNavItem[] = [
  { href: "/technician", label: "Tổng quan", icon: Home },
  { href: "/technician/jobs?tab=available", label: "Nhận việc", icon: BriefcaseBusiness, match: "/technician/jobs" },
  { href: "/technician/jobs?tab=assigned", label: "Việc của tôi", icon: BriefcaseBusiness, match: "/technician/jobs" },
  { href: "/technician/map", label: "Bản đồ", icon: MapPinned },
  { href: "/technician/notifications", label: "Thông báo", icon: Bell }
];

function isItemActive(pathname: string, searchParams: URLSearchParams, item: AppNavItem) {
  const [itemPath, itemQuery] = item.href.split("?");
  const expectedTab = itemQuery ? new URLSearchParams(itemQuery).get("tab") : null;
  const currentTab = searchParams.get("tab");
  if (pathname === "/technician/jobs" && expectedTab === "available" && !currentTab) {
    return true;
  }
  return pathname === itemPath && (!expectedTab || searchParams.get("tab") === expectedTab);
}

export function TechnicianShell({ children, profile }: TechnicianShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchParams, setSearchParams] = useState(() => new URLSearchParams());
  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    setSearchParams(new URLSearchParams(window.location.search));
  }, [pathname]);

  function prefetchRoute(href: string) {
    router.prefetch(href);
  }

  return (
    <div className="min-h-screen bg-[#F6F9FC]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-72 border-r border-slate-200/75 bg-white/90 px-5 py-6 shadow-[12px_0_40px_rgba(37,99,235,0.04)] backdrop-blur-xl lg:block">
        <BrandLogo href="/technician/jobs?tab=available" size="lg" subtitle="Công cụ hiện trường" title="CNL Field" />

        <nav className="mt-8 space-y-2">
          {technicianNavItems.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(pathname, searchParams, item);
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
          <p className="truncate text-sm font-semibold text-slate-950">{profile.fullName || "Kỹ thuật viên"}</p>
          <p className="truncate text-xs text-slate-500">{profile.role === "technician_vip" ? "Kỹ thuật viên VIP" : "Kỹ thuật viên"}</p>
          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50" onClick={() => void signOutAndRedirect("/login")}>
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 px-4 pb-2 pt-[calc(0.5rem+env(safe-area-inset-top))] backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between">
          <BrandLogo href="/technician/jobs?tab=available" size="sm" subtitle="Công cụ hiện trường" title="CNL Field" />
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
            <Link className="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-slate-700 hover:bg-blue-50" href="/technician/profile" onClick={() => setAccountOpen(false)}>
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
            {technicianNavItems.map((item) => (
              <Link
                key={item.href}
                className={`rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition active:scale-[0.98] ${
                  isItemActive(pathname, searchParams, item) ? "bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]" : "text-slate-700 hover:bg-blue-50 hover:text-slate-950"
                }`}
                href={item.href}
                prefetch
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <NotificationCenter profile={profile} />
            <Link className="secondary-button min-h-11 px-4 py-2.5 text-sm" href="/technician/profile" prefetch>
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

      <AppMobileNav items={technicianNavItems} />
    </div>
  );
}
