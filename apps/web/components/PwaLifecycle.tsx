"use client";

import { CheckCircle2, RefreshCcw, WifiOff, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { usePwaInstallPrompt } from "../hooks/usePwaInstallPrompt";

export function PwaLifecycle() {
  const isOnline = useOnlineStatus();
  const { closeIosInstructions, iosInstructionsOpen } = usePwaInstallPrompt();
  const wasOfflineRef = useRef(false);
  const [showReconnect, setShowReconnect] = useState(false);
  const [updateReady, setUpdateReady] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
      setShowReconnect(false);
      return;
    }

    if (!wasOfflineRef.current) return;
    wasOfflineRef.current = false;
    setShowReconnect(true);
    const timer = window.setTimeout(() => setShowReconnect(false), 3200);
    return () => window.clearTimeout(timer);
  }, [isOnline]);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const isPrivateLanHost =
      /^192\.168\./.test(window.location.hostname) ||
      /^10\./.test(window.location.hostname) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(window.location.hostname);
    const isLocalDev =
      process.env.NODE_ENV !== "production" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      isPrivateLanHost;

    if (isLocalDev) {
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .then(() => (typeof caches === "undefined" ? [] : caches.keys()))
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .catch(() => {
          // Local cache cleanup is best-effort and must not block the app.
        });
      return;
    }

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          if (!worker) return;
          worker.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) {
              setUpdateReady(true);
            }
          });
        });
      })
      .catch(() => {
        // PWA should never block the core booking experience.
      });
  }, []);

  return (
    <>
      {!isOnline ? (
        <div className="fixed inset-x-3 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[80] mx-auto flex max-w-xl animate-slide-down items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 shadow-lg shadow-amber-500/10">
          <WifiOff className="h-5 w-5 shrink-0 text-amber-600" />
          <span>Ban dang ngoai tuyen. Co the xem noi dung da tai, nhung dat lich va upload anh can ket noi mang.</span>
        </div>
      ) : null}

      {showReconnect ? (
        <div className="fixed inset-x-3 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[80] mx-auto flex max-w-xl animate-slide-down items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>Da ket noi lai. Ban co the tiep tuc thao tac.</span>
        </div>
      ) : null}

      {updateReady ? (
        <div className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+5.5rem)] z-[75] mx-auto flex max-w-md animate-slide-up items-center gap-3 rounded-2xl border border-blue-100 bg-white/95 p-4 text-sm font-semibold text-slate-800 shadow-[0_20px_60px_rgba(37,99,235,0.16)] backdrop-blur">
          <RefreshCcw className="h-5 w-5 shrink-0 text-blue-600" />
          <span className="flex-1">Co phien ban moi san sang.</span>
          <button className="rounded-xl bg-blue-600 px-3 py-2 text-white transition active:scale-[0.98]" type="button" onClick={() => window.location.reload()}>
            Tai lai
          </button>
        </div>
      ) : null}

      {iosInstructionsOpen ? (
        <div className="fixed inset-0 z-[90] grid place-items-end bg-slate-950/35 px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] sm:place-items-center sm:p-4">
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-slate-950">Install App</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">Add CNL Service to your Home Screen.</p>
              </div>
              <button className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800" type="button" onClick={closeIosInstructions} aria-label="Close install instructions">
                <X className="h-4 w-4" />
              </button>
            </div>
            <ol className="mt-4 space-y-3 text-sm font-semibold text-slate-700">
              <li className="rounded-2xl bg-slate-50 px-4 py-3">1. Tap Share</li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">2. Tap Add to Home Screen</li>
              <li className="rounded-2xl bg-slate-50 px-4 py-3">3. Confirm Add</li>
            </ol>
          </div>
        </div>
      ) : null}
    </>
  );
}
