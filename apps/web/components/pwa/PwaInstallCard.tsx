"use client";

import { Download } from "lucide-react";
import { usePwaInstallPrompt } from "../../hooks/usePwaInstallPrompt";
import { AppButton, AppCard } from "../ui/AppPrimitives";

export function PwaInstallCard() {
  const { canInstall, install, showIosHint } = usePwaInstallPrompt();

  if (!canInstall) return null;

  return (
    <AppCard className="mt-5 flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-blue-700">
          <Download className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold leading-6 text-slate-700">
          {showIosHint ? "Tap Share -> Add to Home Screen." : "Install the app for faster access and a native-like experience."}
        </p>
      </div>
      <AppButton className="w-full sm:w-auto" size="sm" type="button" onClick={() => void install()}>
        Install App
      </AppButton>
    </AppCard>
  );
}
