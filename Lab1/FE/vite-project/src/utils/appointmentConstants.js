// ==============================
// APPOINTMENT STATUS (MATCH BACKEND)
// ==============================

export const APPOINTMENT_STATUS = {
  SCHEDULED: 0,
  COMPLETED: 1,
  CANCELLED: 2,
  NO_SHOW: 3,
};

// ==============================
// DROPDOWN OPTIONS
// ==============================

export const APPOINTMENT_STATUS_OPTIONS = [
  { value: 0, label: "Scheduled" },
  { value: 1, label: "Completed" },
  { value: 2, label: "Cancelled" },
  { value: 3, label: "No Show" },
];

// ==============================
// MAP VALUE → LABEL
// ==============================

export const APPOINTMENT_STATUS_MAP = {
  0: "Scheduled",
  1: "Completed",
  2: "Cancelled",
  3: "No Show",
};