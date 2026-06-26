type AppSpinnerProps = {
  size?: "sm" | "md" | "lg" | "xl";
  tone?: "primary" | "subtle" | "success" | "warning" | "danger";
  label?: string;
  className?: string;
};

const sizeClass: Record<NonNullable<AppSpinnerProps["size"]>, string> = {
  sm: "h-4 w-4 border-2",
  md: "h-5 w-5 border-2",
  lg: "h-8 w-8 border-[3px]",
  xl: "h-12 w-12 border-4"
};

const toneClass: Record<NonNullable<AppSpinnerProps["tone"]>, string> = {
  primary: "border-blue-200 border-t-blue-600",
  subtle: "border-slate-200 border-t-slate-500",
  success: "border-emerald-100 border-t-emerald-500",
  warning: "border-amber-100 border-t-amber-500",
  danger: "border-rose-100 border-t-rose-500"
};

export function AppSpinner({ size = "md", tone = "primary", label, className = "" }: AppSpinnerProps) {
  return (
    <span className={`inline-flex items-center justify-center gap-2 ${className}`} role={label ? "status" : undefined} aria-label={label}>
      <span className={`cnl-spinner ${sizeClass[size]} ${toneClass[tone]}`} aria-hidden="true" />
      {label ? <span className="text-sm font-semibold">{label}</span> : null}
    </span>
  );
}
