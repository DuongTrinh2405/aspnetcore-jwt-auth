"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  match?: string;
};

type AppMobileNavProps = {
  items: AppNavItem[];
};

function isActive(pathname: string, searchParams: URLSearchParams, item: AppNavItem) {
  const [itemPath, itemQuery] = item.href.split("?");
  const matchPath = item.match ?? itemPath;

  if (pathname !== matchPath && pathname !== itemPath) return false;
  if (!itemQuery) return pathname === matchPath || pathname === itemPath;

  const expected = new URLSearchParams(itemQuery);
  if (pathname === "/technician/jobs" && expected.get("tab") === "available" && !searchParams.get("tab")) {
    return true;
  }
  for (const [key, value] of expected.entries()) {
    if (searchParams.get(key) !== value) return false;
  }
  return true;
}

export function AppMobileNav({ items }: AppMobileNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchParams, setSearchParams] = useState(() => new URLSearchParams());

  useEffect(() => {
    setSearchParams(new URLSearchParams(window.location.search));
  }, [pathname]);

  const gridClass = items.length === 4 ? "grid-cols-4" : "grid-cols-5";

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 translate-z-0 border-t border-slate-200/80 bg-white/95 px-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-2 shadow-[0_-16px_40px_rgba(15,23,42,0.08)] backdrop-blur-xl lg:hidden">
      <div className={`mx-auto grid max-w-md ${gridClass} gap-1`}>
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, searchParams, item);
          return (
            <Link
              key={item.href}
              aria-current={active ? "page" : undefined}
              className={`tap-target flex min-h-[58px] flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[11px] font-semibold transition duration-200 will-change-transform active:scale-[0.96] ${
                active ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20" : "text-slate-500 hover:bg-blue-50 hover:text-slate-900"
              }`}
              href={item.href}
              onFocus={() => router.prefetch(item.href)}
              onMouseEnter={() => router.prefetch(item.href)}
            >
              <Icon className="h-5 w-5" />
              <span className="leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
