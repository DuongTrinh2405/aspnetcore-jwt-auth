import type { LucideIcon } from "lucide-react";
import type React from "react";

type AppButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
};

const buttonVariants = {
  primary: "bg-blue-600 text-white shadow-[0_14px_30px_rgba(37,99,235,0.20)] hover:bg-blue-700",
  secondary: "border border-slate-200 bg-white text-slate-800 shadow-sm hover:border-blue-200 hover:bg-blue-50",
  ghost: "bg-transparent text-slate-600 hover:bg-blue-50 hover:text-slate-950",
  danger: "bg-rose-600 text-white shadow-[0_14px_30px_rgba(225,29,72,0.18)] hover:bg-rose-700"
};

const buttonSizes = {
  sm: "min-h-10 rounded-xl px-3 text-sm",
  md: "min-h-12 rounded-2xl px-5 text-sm",
  lg: "min-h-14 rounded-2xl px-6 text-base"
};

export function AppButton({ className = "", variant = "primary", size = "md", ...props }: AppButtonProps) {
  return (
    <button
      className={`tap-target inline-flex items-center justify-center gap-2 font-semibold transition duration-200 will-change-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${buttonVariants[variant]} ${buttonSizes[size]} ${className}`}
      {...props}
    />
  );
}

export function AppCard({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/90 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.05),0_16px_40px_rgba(37,99,235,0.07)] transition duration-200 ${className}`}
      {...props}
    />
  );
}

type AppBadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  tone?: "blue" | "cyan" | "green" | "amber" | "rose" | "slate";
};

const badgeTones = {
  blue: "bg-blue-50 text-blue-700 ring-blue-200",
  cyan: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  green: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  amber: "bg-amber-50 text-amber-700 ring-amber-200",
  rose: "bg-rose-50 text-rose-700 ring-rose-200",
  slate: "bg-slate-50 text-slate-600 ring-slate-200"
};

export function AppBadge({ className = "", tone = "slate", ...props }: AppBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${badgeTones[tone]} ${className}`}
      {...props}
    />
  );
}

export function AppSkeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton-shimmer rounded-2xl bg-white/80 shadow-sm ring-1 ring-slate-100 ${className}`} />;
}

type AppEmptyStateProps = {
  icon?: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
};

export function AppEmptyState({ action, description, icon: Icon, title }: AppEmptyStateProps) {
  return (
    <AppCard className="grid place-items-center p-8 text-center motion-safe:animate-fade-in">
      {Icon ? (
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
          <Icon className="h-6 w-6" />
        </div>
      ) : null}
      <h2 className="mt-4 text-xl font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </AppCard>
  );
}

type AppPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function AppPageHeader({ action, description, eyebrow, title }: AppPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">{eyebrow}</p> : null}
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function AppPageContainer({ className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`mx-auto w-full max-w-6xl px-4 pb-28 pt-5 sm:px-6 lg:px-8 lg:pb-10 lg:pt-8 ${className}`} {...props} />;
}
