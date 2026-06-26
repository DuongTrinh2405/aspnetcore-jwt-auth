"use client";

import type { CurrentUserProfile } from "@cnl/shared";
import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchVisibleNotifications, type VisibleNotification } from "../lib/derivedNotifications";

function formatTime(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function NotificationCenter({ profile }: { profile: CurrentUserProfile }) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<VisibleNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const visibleCount = notifications.length;

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchVisibleNotifications(profile)
      .then((items) => {
        if (!cancelled) setNotifications(items);
      })
      .catch(() => {
        if (!cancelled) setNotifications([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [profile.id, profile.role]);

  return (
    <div className="relative">
      <button
        className="relative grid h-11 w-11 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md active:scale-[0.96]"
        onClick={() => setOpen((current) => !current)}
        type="button"
        aria-label="Mở thông báo"
      >
        <Bell className="h-5 w-5" />
        {visibleCount > 0 ? (
          <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[11px] font-black text-white">
            {visibleCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-14 z-50 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.18)]">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <p className="text-sm font-black text-slate-950">Thông báo</p>
              <p className="text-xs font-semibold text-slate-500">{visibleCount} cập nhật có thể xem</p>
            </div>
            <CheckCheck className="h-5 w-5 text-cyan-600" />
          </div>
          <div className="max-h-96 overflow-y-auto p-2">
            {loading ? <div className="m-2 h-20 animate-pulse rounded-2xl bg-slate-100" /> : null}
            {!loading && notifications.length === 0 ? (
              <div className="p-5 text-center">
                <p className="text-sm font-semibold text-slate-700">Chưa có thông báo mới</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Khi có việc mới hoặc thay đổi trạng thái, thông báo sẽ xuất hiện tại đây.
                </p>
              </div>
            ) : null}
            {notifications.map((notification) => (
              <Link
                key={notification.id}
                className="block w-full rounded-2xl p-3 text-left transition hover:bg-slate-50 active:scale-[0.99]"
                href={notification.href}
                onClick={() => setOpen(false)}
              >
                <div className="flex items-start gap-3">
                  <span className="mt-1 h-2.5 w-2.5 rounded-full bg-cyan-500" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-slate-950">{notification.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-500">{notification.body}</p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <p className="text-xs font-bold text-slate-400">{formatTime(notification.createdAt)}</p>
                      <span className="text-xs font-bold text-blue-700">{notification.cta}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
