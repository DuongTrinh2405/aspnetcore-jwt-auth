import { CheckCircle2, Clock3, Loader2, ShieldCheck } from "lucide-react";
import { JOB_PRIORITY_LABELS, type JobPriority, type JobStatus } from "@cnl/shared";
import { AppBadge } from "./ui/AppPrimitives";

type DisplayStatus = "waiting" | "accepted" | "working" | "completed";

const statusMap: Record<JobStatus, DisplayStatus> = {
  pending: "waiting",
  received: "accepted",
  scheduled: "accepted",
  on_the_way: "accepted",
  inspecting: "working",
  quoted: "working",
  accepted: "accepted",
  in_progress: "working",
  completed: "completed",
  warranty_followup: "completed",
  cancelled: "completed"
};

const displayStatus = {
  waiting: {
    label: "Đang chờ tiếp nhận",
    tone: "amber" as const,
    icon: Clock3
  },
  accepted: {
    label: "Đã tiếp nhận",
    tone: "cyan" as const,
    icon: ShieldCheck
  },
  working: {
    label: "Đang xử lý",
    tone: "blue" as const,
    icon: Loader2
  },
  completed: {
    label: "Hoàn thành",
    tone: "green" as const,
    icon: CheckCircle2
  }
};

const priorityTone: Record<JobPriority, "slate" | "cyan" | "amber" | "rose"> = {
  low: "slate",
  normal: "cyan",
  high: "amber",
  urgent: "rose"
};

export function StatusBadge({ status }: { status: JobStatus }) {
  const statusInfo = displayStatus[statusMap[status]];
  const Icon = statusInfo.icon;

  return (
    <AppBadge tone={statusInfo.tone}>
      <Icon className={`h-3.5 w-3.5 ${statusMap[status] === "working" ? "animate-spin" : ""}`} />
      {statusInfo.label}
    </AppBadge>
  );
}

export function PriorityBadge({ priority }: { priority: JobPriority }) {
  return <AppBadge tone={priorityTone[priority]}>{JOB_PRIORITY_LABELS[priority]}</AppBadge>;
}
