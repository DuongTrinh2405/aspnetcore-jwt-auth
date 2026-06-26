"use client";

import { CNL_CONTACT } from "@cnl/shared";
import Link from "next/link";

type BrandLogoProps = {
  href: string;
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClass = {
  sm: "h-9 w-9",
  md: "h-11 w-11",
  lg: "h-12 w-12"
};

export function BrandLogo({
  href,
  title = CNL_CONTACT.shortName,
  subtitle = "Trung tâm dịch vụ",
  size = "md",
  className = ""
}: BrandLogoProps) {
  return (
    <Link href={href} className={`flex min-w-0 items-center gap-3 ${className}`}>
      <span className={`cnl-logo-mark ${sizeClass[size]}`}>
        <img alt="Châu Ngọc Long" src={CNL_CONTACT.logoPath} />
      </span>
      <div className="min-w-0">
        <p className="truncate font-semibold text-slate-950">{title}</p>
        <p className="hidden text-xs font-medium text-slate-600 sm:block">{subtitle}</p>
      </div>
    </Link>
  );
}
