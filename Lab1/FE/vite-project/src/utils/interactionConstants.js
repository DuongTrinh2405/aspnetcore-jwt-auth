// Mapping ENUM giống backend (Lab1.Enums.InteractionType)
export const INTERACTION_TYPE = {
  CALL: 0,
  EMAIL: 1,
  MEETING: 2,
  MESSAGE: 3,
  DEMO: 4,
  FOLLOW_UP: 5,
};

// Dùng để hiển thị UI
export const INTERACTION_TYPE_LABEL = {
  0: "Call",
  1: "Email",
  2: "Meeting",
  3: "Message",
  4: "Demo",
  5: "Follow Up",
};

// (optional) dùng cho select dropdown tiện hơn
export const INTERACTION_TYPE_OPTIONS = [
  { value: 0, label: "Call" },
  { value: 1, label: "Email" },
  { value: 2, label: "Meeting" },
  { value: 3, label: "Message" },
  { value: 4, label: "Demo" },
  { value: 5, label: "Follow Up" },
];