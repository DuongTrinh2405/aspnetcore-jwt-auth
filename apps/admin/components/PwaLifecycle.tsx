"use client";

import { CheckCircle2, WifiOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function PwaLifecycle() {
  const [isOnline, setIsOnline] = useState(true);
  const [showReconnect, setShowReconnect] = useState(false);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    setIsOnline(window.navigator.onLine);

    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

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

    const isLocalDev = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    if (isLocalDev) {
      void navigator.serviceWorker
        .getRegistrations()
        .then((registrations) => Promise.all(registrations.map((registration) => registration.unregister())))
        .then(() => (typeof caches === "undefined" ? [] : caches.keys()))
        .then((keys) => Promise.all(keys.map((key) => caches.delete(key))))
        .catch(() => {
          // Local cleanup is best-effort only.
        });
      return;
    }

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Admin remains fully usable even if PWA registration is blocked.
    });
  }, []);

  return (
    <>
      {!isOnline ? (
        <div className="fixed inset-x-3 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[80] mx-auto flex max-w-xl animate-slide-down items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900 shadow-lg shadow-amber-500/10">
          <WifiOff className="h-5 w-5 shrink-0 text-amber-600" />
          <span>Admin đang ngoại tuyến. Không thể cập nhật job, tài khoản hoặc dọn ảnh cho đến khi có mạng.</span>
        </div>
      ) : null}

      {showReconnect ? (
        <div className="fixed inset-x-3 top-[calc(env(safe-area-inset-top)+0.75rem)] z-[80] mx-auto flex max-w-xl animate-slide-down items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-900 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
          <span>Đã kết nối lại. Bạn có thể tiếp tục thao tác admin.</span>
        </div>
      ) : null}
    </>
  );
}
