"use client";

import type { CurrentUserProfile } from "@cnl/shared";
import {
  BarChart3,
  BriefcaseBusiness,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  UsersRound,
  Wrench
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "../lib/supabase";

type AdminShellProps = {
  profile: CurrentUserProfile;
  children: React.ReactNode;
};

const navItems = [
  { href: "/dashboard", label: "Tổng quan", icon: LayoutDashboard, group: "Vận hành" },
  { href: "/jobs", label: "Job dịch vụ", icon: BriefcaseBusiness, group: "Vận hành" },
  { href: "/customers", label: "Khách hàng", icon: UsersRound, group: "Quản lý" },
  { href: "/technicians", label: "Nhân viên", icon: Wrench, group: "Quản lý" },
  { href: "/reports", label: "Báo cáo", icon: BarChart3, group: "Phân tích" },
  { href: "/image-cleanup", label: "Dọn ảnh", icon: ImageIcon, group: "Hệ thống" }
];

export function AdminShell({ profile, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  function prefetchRoute(href: string) {
    router.prefetch(href);
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <div className="min-h-screen bg-[#F6F9FC] text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200/80 bg-white/95 px-3 py-4 shadow-[8px_0_28px_rgba(15,23,42,0.035)] backdrop-blur-xl lg:flex">
        <Link className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-sm" href="/dashboard">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/15">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-950">CNL Admin</p>
            <p className="truncate text-xs font-medium text-slate-500">Trung tâm vận hành</p>
          </div>
        </Link>

        <nav className="mt-5 flex-1 space-y-4 overflow-y-auto pr-1">
          {["Vận hành", "Quản lý", "Phân tích", "Hệ thống"].map((group) => (
            <div key={group}>
              <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">{group}</p>
              <div className="space-y-1">
                {navItems.filter((item) => item.group === group).map((item) => {
                  const Icon = item.icon;
                  const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.href}
                      className={`flex min-h-10 items-center gap-3 rounded-xl px-3 text-sm font-semibold transition duration-150 ${
                        active
                          ? "bg-blue-600 text-white shadow-[0_10px_22px_rgba(37,99,235,0.18)]"
                          : "text-slate-600 hover:bg-blue-50 hover:text-slate-950"
                      }`}
                      href={item.href}
                      onFocus={() => prefetchRoute(item.href)}
                      onMouseEnter={() => prefetchRoute(item.href)}
                    >
                      <Icon className="h-[18px] w-[18px]" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="mt-4 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3">
          <p className="truncate text-sm font-semibold text-slate-950">{profile.fullName || "Admin"}</p>
          <p className="truncate text-xs text-slate-500">{profile.email}</p>
          <button
            className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-slate-950 active:scale-[0.99]"
            onClick={signOut}
            type="button"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
        <Link className="flex items-center gap-3" href="/dashboard">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-blue-600 text-white">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-950">CNL Admin</p>
            <p className="text-xs text-slate-500">Vận hành</p>
          </div>
        </Link>
        <button className="rounded-xl border border-slate-200 p-2 text-slate-700" type="button">
          <Menu className="h-5 w-5" />
        </button>
      </header>

      <nav className="sticky top-[65px] z-20 flex gap-2 overflow-x-auto border-b border-slate-200/80 bg-white/90 px-4 py-2.5 backdrop-blur lg:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              className={`flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-xs font-semibold transition ${
                active ? "bg-blue-600 text-white shadow-sm shadow-blue-500/15" : "bg-slate-50 text-slate-600"
              }`}
              href={item.href}
              onFocus={() => prefetchRoute(item.href)}
              onMouseEnter={() => prefetchRoute(item.href)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <main className="lg:pl-64">{children}</main>
    </div>
  );
}
