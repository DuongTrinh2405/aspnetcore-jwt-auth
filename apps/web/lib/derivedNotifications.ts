"use client";

import { JOB_STATUS_LABELS, SERVICE_TYPE_LABELS, type CurrentUserProfile, type Job } from "@cnl/shared";
import { fetchCustomerJobs } from "./jobs";
import { fetchAssignedJobs, fetchAvailableJobs } from "./technician";
import { formatRelativeSubmittedTime } from "./time";

export type VisibleNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  href: string;
  cta: string;
};

function sortLatest(items: VisibleNotification[]) {
  return [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function customerNotificationFromJob(job: Job): VisibleNotification {
  const statusLabel = JOB_STATUS_LABELS[job.status] ?? "Đang cập nhật";
  const title =
    job.status === "completed"
      ? "Yêu cầu đã hoàn thành"
      : job.status === "in_progress"
        ? "Kỹ thuật viên đang xử lý"
        : job.status === "accepted"
          ? "Yêu cầu đã được tiếp nhận"
          : "Yêu cầu đã gửi";

  return {
    id: `customer-${job.id}-${job.status}`,
    title,
    body: `${job.title} · ${statusLabel} · ${formatRelativeSubmittedTime(job)}`,
    createdAt: job.updated_at || job.created_at,
    href: `/customer/jobs/${job.id}`,
    cta: "Xem yêu cầu"
  };
}

function technicianNotificationFromJob(job: Job, kind: "available" | "assigned"): VisibleNotification {
  const service = SERVICE_TYPE_LABELS[job.service_type];
  const isAvailable = kind === "available";
  const title = isAvailable
    ? `Có việc mới: ${service}`
    : job.status === "in_progress"
      ? "Việc cần hoàn thành"
      : "Việc đang phụ trách";

  return {
    id: `technician-${kind}-${job.id}-${job.status}`,
    title,
    body: `${job.title} · ${formatRelativeSubmittedTime(job)} · ${job.address}`,
    createdAt: job.updated_at || job.created_at,
    href: `/technician/jobs?tab=${isAvailable ? "available" : "assigned"}`,
    cta: isAvailable ? "Nhận việc" : "Xem việc"
  };
}

export async function fetchVisibleNotifications(profile: CurrentUserProfile, limit = 8): Promise<VisibleNotification[]> {
  if (profile.role === "customer" || profile.role === "customer_vip") {
    const jobs = await fetchCustomerJobs();
    return sortLatest(
      jobs
        .filter((job) => job.status !== "cancelled")
        .slice(0, limit)
        .map(customerNotificationFromJob)
    ).slice(0, limit);
  }

  if (profile.role === "technician" || profile.role === "technician_vip") {
    const [available, assigned] = await Promise.all([fetchAvailableJobs(), fetchAssignedJobs()]);
    return sortLatest([
      ...available.slice(0, 5).map((job) => technicianNotificationFromJob(job, "available")),
      ...assigned
        .filter((job) => job.status === "accepted" || job.status === "in_progress")
        .slice(0, 5)
        .map((job) => technicianNotificationFromJob(job, "assigned"))
    ]).slice(0, limit);
  }

  return [];
}
