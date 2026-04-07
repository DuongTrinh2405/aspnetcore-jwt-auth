// ==============================
// DEAL STAGE (match backend enum)
// ==============================
export const DEAL_STAGE = {
  PROSPECT: 0,
  QUALIFIED: 1,
  PROPOSAL: 2,
  NEGOTIATION: 3,
  WON: 4,
  LOST: 5,
};

// label hiển thị
export const DEAL_STAGE_LABEL = {
  0: "Prospect",
  1: "Qualified",
  2: "Proposal",
  3: "Negotiation",
  4: "Won",
  5: "Lost",
};

// options cho select
export const DEAL_STAGE_OPTIONS = [
  { value: 0, label: "Prospect" },
  { value: 1, label: "Qualified" },
  { value: 2, label: "Proposal" },
  { value: 3, label: "Negotiation" },
  { value: 4, label: "Won" },
  { value: 5, label: "Lost" },
];

// ==============================
// DEAL STATUS (match backend enum)
// ==============================
export const DEAL_STATUS = {
  OPEN: 0,
  IN_PROGRESS: 1,
  WON: 2,
  LOST: 3,
  CANCELLED: 4,
};

// label hiển thị
export const DEAL_STATUS_LABEL = {
  0: "Open",
  1: "In Progress",
  2: "Won",
  3: "Lost",
  4: "Cancelled",
};

// options cho select
export const DEAL_STATUS_OPTIONS = [
  { value: 0, label: "Open" },
  { value: 1, label: "In Progress" },
  { value: 2, label: "Won" },
  { value: 3, label: "Lost" },
  { value: 4, label: "Cancelled" },
];

// ==============================
// HELPER FUNCTIONS
// ==============================

// number -> label (CHUẨN MỚI)
export const getDealStageLabel = (stage) =>
  DEAL_STAGE_LABEL[stage] ?? "Unknown";

export const getDealStatusLabel = (status) =>
  DEAL_STATUS_LABEL[status] ?? "Unknown";