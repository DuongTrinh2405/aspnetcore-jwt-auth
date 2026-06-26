"use client";

import { CNL_CONTACT, ROLE_HOME_PATH } from "@cnl/shared";
import { ArrowRight, Globe2, LayoutDashboard, LogIn, LogOut, Menu, Phone, UserPlus, Wrench, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { signOutAndRedirect } from "../lib/authSession";
import { BrandLogo } from "./BrandLogo";
import { useAuth } from "./AuthProvider";
import { PwaInstallBanner } from "./pwa/PwaInstallBanner";
import { PwaInstallButton } from "./pwa/PwaInstallButton";

const publicLinks = [
  { href: "/services", label: "Dịch vụ" },
  { href: "/booking", label: "Đặt lịch" },
  { href: "/report-issue", label: "Báo lỗi" },
  { href: "/track", label: "Tra cứu" },
  { href: "/warranty", label: "Bảo hành" }
];

const technicianLinks = [
  { href: "/technician", label: "Tổng quan" },
  { href: "/technician/jobs?tab=available", label: "Nhận việc" },
  { href: "/technician/jobs?tab=assigned", label: "Việc của tôi" },
  { href: "/technician/map", label: "Bản đồ" },
  { href: "/technician/notifications", label: "Thông báo" }
];

function getAdminUrl() {
  return process.env.NEXT_PUBLIC_ADMIN_URL ?? "http://localhost:3001/dashboard";
}

function isActive(pathname: string, searchParams: URLSearchParams, href: string) {
  const [path, query] = href.split("?");
  if (pathname !== path) return false;
  if (!query) return true;

  const expected = new URLSearchParams(query);
  if (pathname === "/technician/jobs" && expected.get("tab") === "available" && !searchParams.get("tab")) {
    return true;
  }

  for (const [key, value] of expected.entries()) {
    if (searchParams.get(key) !== value) return false;
  }
  return true;
}

export function PublicNav() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchParams, setSearchParams] = useState(() => new URLSearchParams());
  const isCustomer = profile?.role === "customer" || profile?.role === "customer_vip";
  const isTechnician = profile?.role === "technician" || profile?.role === "technician_vip";
  const isAdmin = profile?.role === "admin";
  const isStaff = profile?.role === "staff";
  const isAuthenticated = Boolean(profile);
  const workspaceHref = isAdmin ? getAdminUrl() : profile ? ROLE_HOME_PATH[profile.role] : "/login";
  const workspaceLabel = isTechnician ? "Công cụ kỹ thuật" : isStaff ? "Điều phối" : isAdmin ? "Admin" : "Không gian của tôi";
  const centerLinks = isTechnician ? technicianLinks : publicLinks;
  const WorkspaceIcon = isTechnician ? Wrench : LayoutDashboard;

  useEffect(() => {
    setSearchParams(new URLSearchParams(window.location.search));
  }, [pathname]);

  return (
    <>
    <header className="sticky top-0 z-30 border-b border-slate-300/80 bg-white/95 shadow-[0_1px_0_rgba(255,255,255,0.85)_inset,0_10px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 px-4 py-2 sm:min-h-[72px] sm:px-5 sm:py-3 lg:px-10">
        <BrandLogo
          href={isTechnician ? "/technician/jobs?tab=available" : isCustomer ? "/customer" : "/"}
          subtitle={isTechnician ? "Công cụ hiện trường" : "Trung tâm dịch vụ"}
          title={isTechnician ? "CNL Field" : "Châu Ngọc Long"}
        />

        <nav className="hidden items-center gap-1 lg:flex">
          {centerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch
              className={`rounded-2xl px-3.5 py-2.5 text-sm font-semibold transition active:scale-[0.98] ${
                isActive(pathname, searchParams, link.href)
                  ? "bg-blue-600 text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]"
                  : "text-slate-700 hover:bg-blue-50 hover:text-slate-950"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <PwaInstallButton className="hidden xl:inline-flex" />

          {!isTechnician ? (
            <>
              <a className="hidden items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-blue-50 hover:text-slate-950 xl:flex" href={CNL_CONTACT.website} rel="noreferrer" target="_blank">
                <Globe2 className="h-4 w-4 text-cyan-600" />
                {CNL_CONTACT.websiteLabel}
              </a>
              <a className="hidden items-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-cyan-300 hover:bg-cyan-50 md:flex" href={`tel:${CNL_CONTACT.hotline.replace(/\s+/g, "")}`}>
                <Phone className="h-4 w-4 text-cyan-600" />
                <span className="leading-tight">
                  {CNL_CONTACT.hotline}
                  <span className="block text-xs font-medium text-slate-500">Tư vấn</span>
                </span>
              </a>
            </>
          ) : null}

          {isAuthenticated ? (
            <>
              <Link
                className="hidden min-h-11 items-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 shadow-sm transition hover:border-blue-300 hover:bg-blue-100 sm:inline-flex"
                href={workspaceHref}
                prefetch={!isAdmin}
              >
                <WorkspaceIcon className="h-4 w-4" />
                {workspaceLabel}
              </Link>
              <button className="secondary-button hidden min-h-11 px-4 py-2.5 text-sm sm:inline-flex" type="button" onClick={() => void signOutAndRedirect("/")}>
                <LogOut className="h-4 w-4" />
                Đăng xuất
              </button>
            </>
          ) : (
            <div className="hidden items-center gap-2 sm:flex">
              <Link className="secondary-button min-h-11 px-4 py-2.5 text-sm" href="/login" prefetch>
                <LogIn className="h-4 w-4" />
                Đăng nhập
              </Link>
              <Link className="premium-button min-h-11 px-4 py-2.5 text-sm" href="/login?mode=register" prefetch>
                <UserPlus className="h-4 w-4" />
                Đăng ký
              </Link>
            </div>
          )}

          {!isAuthenticated || isCustomer ? (
            <Link className="premium-button hidden min-h-11 px-4 py-2.5 text-sm sm:inline-flex" href="/booking" prefetch>
              Đặt lịch
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}

          <button
            className="grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-800 shadow-sm transition active:scale-[0.97] lg:hidden"
            type="button"
            aria-label={menuOpen ? "Đóng menu" : "Mở menu"}
            onClick={() => setMenuOpen((current) => !current)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div className="border-t border-slate-200/80 bg-white/95 px-4 pb-4 pt-2 shadow-[0_18px_36px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden">
          <nav className="grid gap-2">
            {centerLinks.map((link) => (
              <Link
                key={link.href}
                className={`rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive(pathname, searchParams, link.href) ? "bg-blue-600 text-white" : "bg-slate-50 text-slate-800 hover:bg-blue-50"
                }`}
                href={link.href}
                prefetch
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3">
            {isAuthenticated ? (
              <>
                <PwaInstallButton className="w-full justify-center" />
                <Link className="secondary-button w-full justify-center" href={workspaceHref} prefetch={!isAdmin} onClick={() => setMenuOpen(false)}>
                  <WorkspaceIcon className="h-4 w-4" />
                  {workspaceLabel}
                </Link>
                <button className="secondary-button w-full justify-center" type="button" onClick={() => void signOutAndRedirect("/")}>
                  <LogOut className="h-4 w-4" />
                  Đăng xuất
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link className="secondary-button justify-center px-3" href="/login" prefetch onClick={() => setMenuOpen(false)}>
                  Đăng nhập
                </Link>
                <Link className="premium-button justify-center px-3" href="/login?mode=register" prefetch onClick={() => setMenuOpen(false)}>
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
    {!isAuthenticated ? <PwaInstallBanner className="lg:hidden" /> : null}
    </>
  );
}
