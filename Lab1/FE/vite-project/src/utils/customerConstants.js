// ==============================
// CUSTOMER STATUS (MATCH BACKEND ENUM)
// ==============================

export const CUSTOMER_STATUS = {
  NEW: 0,
  CONTACTED: 1,
  INTERESTED: 2,
  NEGOTIATING: 3,
  CONVERTED: 4,
  LOST: 5,
};

// ==============================
// DROPDOWN OPTIONS
// ==============================

export const CUSTOMER_STATUS_OPTIONS = [
  { value: 0, label: "New" },
  { value: 1, label: "Contacted" },
  { value: 2, label: "Interested" },
  { value: 3, label: "Negotiating" },
  { value: 4, label: "Converted" },
  { value: 5, label: "Lost" },
];

// ==============================
// MAP VALUE → LABEL
// ==============================

export const CUSTOMER_STATUS_MAP = {
  0: "New",
  1: "Contacted",
  2: "Interested",
  3: "Negotiating",
  4: "Converted",
  5: "Lost",
};