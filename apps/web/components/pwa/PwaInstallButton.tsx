"use client";

import { Download } from "lucide-react";
import { usePwaInstallPrompt } from "../../hooks/usePwaInstallPrompt";
import { AppButton } from "../ui/AppPrimitives";

type PwaInstallButtonProps = {
  className?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "ghost";
};

export function PwaInstallButton({ className = "", label = "Install App", size = "sm", variant = "secondary" }: PwaInstallButtonProps) {
  const { canInstall, install } = usePwaInstallPrompt();

  if (!canInstall) return null;

  return (
    <AppButton className={className} size={size} type="button" variant={variant} onClick={() => void install()}>
      <Download className="h-4 w-4" />
      {label}
    </AppButton>
  );
}
