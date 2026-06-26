"use client";

import { Download } from "lucide-react";
import { usePwaInstallPrompt } from "../../hooks/usePwaInstallPrompt";

type PwaInstallBannerProps = {
  className?: string;
};

export function PwaInstallBanner({ className = "" }: PwaInstallBannerProps) {
  const { canInstall, dismiss, install } = usePwaInstallPrompt();

  if (!canInstall) return null;

  return (
    <div className={`border-b border-blue-100 bg-white px-4 py-3 shadow-sm ${className}`}>
      <div className="mx-auto flex max-w-7xl items-center gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-700">
          <Download className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-950">Install the app for a faster experience</p>
        </div>
        <button className="min-h-9 rounded-xl bg-blue-600 px-3 text-sm font-semibold text-white transition active:scale-[0.98]" type="button" onClick={() => void install()}>
          Install App
        </button>
        <button className="min-h-9 shrink-0 rounded-xl px-2 text-sm font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-800" type="button" onClick={dismiss}>
          Close
        </button>
      </div>
    </div>
  );
}
