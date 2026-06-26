import type { Job } from "./types";

export type SubmittedTimeJob = Pick<Job, "customer_submitted_at" | "created_at">;

export function getJobSubmittedAt(job: SubmittedTimeJob): string {
  return job.customer_submitted_at || job.created_at;
}

export function formatRelativePostedTime(value: string, now = new Date()): string {
  const createdAt = new Date(value);
  const diffMs = now.getTime() - createdAt.getTime();

  if (!Number.isFinite(createdAt.getTime()) || diffMs < 0) {
    return "Vừa đăng";
  }

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "Vừa đăng";
  if (diffMs < hour) return `Đăng ${Math.floor(diffMs / minute)} phút trước`;
  if (diffMs < 2 * hour) return "Đăng 1 giờ trước";
  if (diffMs < day) return `Đăng ${Math.floor(diffMs / hour)} giờ trước`;
  if (diffMs < 2 * day) return "Đăng hôm qua";

  return `Đăng ${Math.floor(diffMs / day)} ngày trước`;
}

export function formatRelativeSubmittedTime(job: SubmittedTimeJob, now = new Date()): string {
  return formatRelativePostedTime(getJobSubmittedAt(job), now)
    .replace(/^Đăng/, "Khách gửi")
    .replace("Vừa đăng", "Khách vừa gửi");
}

export function formatSubmittedAt(value: string): string {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}
