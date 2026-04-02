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

// 👉 label hiển thị
export const DEAL_STAGE_LABEL = {
  0: "Prospect",
  1: "Qualified",
  2: "Proposal",
  3: "Negotiation",
  4: "Won",
  5: "Lost",
};

// 👉 options cho select
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

// 👉 label hiển thị
export const DEAL_STATUS_LABEL = {
  0: "Open",
  1: "In Progress",
  2: "Won",
  3: "Lost",
  4: "Cancelled",
};

// 👉 options cho select
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

// 👉 convert number -> label
export const getDealStageLabel = (stage) =>
  DEAL_STAGE_LABEL[stage] || stage;

export const getDealStatusLabel = (status) =>
  DEAL_STATUS_LABEL[status] || status;

// 👉 convert string (BE trả về) -> number
export const parseDealStage = (stage) => {
  if (typeof stage === "number") return stage;

  const map = {
    Prospect: 0,
    Qualified: 1,
    Proposal: 2,
    Negotiation: 3,
    Won: 4,
    Lost: 5,
  };

  return map[stage] ?? 0;
};

export const parseDealStatus = (status) => {
  if (typeof status === "number") return status;

  const map = {
    Open: 0,
    InProgress: 1,
    Won: 2,
    Lost: 3,
    Cancelled: 4,
  };

  return map[status] ?? 0;
};