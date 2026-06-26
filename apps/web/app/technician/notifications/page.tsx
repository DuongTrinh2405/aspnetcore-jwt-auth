"use client";

import { isTechnicianRole, type CurrentUserProfile } from "@cnl/shared";
import { ArrowRight, Bell } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { RoleGuard } from "../../../components/RoleGuard";
import { TechnicianShell } from "../../../components/TechnicianShell";
import { AppCard, AppEmptyState, AppPageContainer, AppPageHeader, AppSkeleton } from "../../../components/ui/AppPrimitives";
import { fetchVisibleNotifications, type VisibleNotification } from "../../../lib/derivedNotifications";
import { formatRelativePostedTime } from "../../../lib/time";

export default function TechnicianNotificationsPage() {
  return (
    <RoleGuard allow={isTechnicianRole}>
      {(profile) => (
        <TechnicianShell profile={profile}>
          <TechnicianNotificationsContent profile={profile} />
        </TechnicianShell>
      )}
    </RoleGuard>
  );
}

function TechnicianNotificationsContent({ profile }: { profile: CurrentUserProfile }) {
  const [items, setItems] = useState<VisibleNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetchVisibleNotifications(profile)
      .then((notifications) => {
        if (!cancelled) setItems(notifications);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [profile.id, profile.role]);

  return (
    <AppPageContainer>
      <AppPageHeader
        eyebrow="Thông báo"
        title="Việc cần chú ý"
        description="Tổng hợp việc mới có thể nhận và các việc đang cần cập nhật tiến độ."
      />
      <div className="mt-6 grid gap-3">
        {loading ? (
          [1, 2, 3].map((item) => <AppSkeleton key={item} className="h-28" />)
        ) : items.length > 0 ? (
          items.map((item) => <NotificationCard key={item.id} item={item} />)
        ) : (
          <AppEmptyState
            icon={Bell}
            title="Chưa có thông báo mới"
            description="Khi có việc mới hoặc thay đổi trạng thái, thông báo sẽ xuất hiện tại đây."
          />
        )}
      </div>
    </AppPageContainer>
  );
}

function NotificationCard({ item }: { item: VisibleNotification }) {
  return (
    <AppCard className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-600">
            {formatRelativePostedTime(item.createdAt)}
          </p>
          <h2 className="mt-1 text-base font-semibold text-slate-950">{item.title}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
        </div>
        <Bell className="h-5 w-5 shrink-0 text-cyan-600" />
      </div>
      <Link className="secondary-button mt-4 w-full justify-between" href={item.href}>
        {item.cta}
        <ArrowRight className="h-4 w-4" />
      </Link>
    </AppCard>
  );
}
