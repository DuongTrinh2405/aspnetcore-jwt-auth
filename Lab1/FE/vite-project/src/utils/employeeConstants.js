// ==============================
// EMPLOYEE ROLE (MATCH BACKEND)
// ==============================
export const EMPLOYEE_ROLE = {
  ADMIN: 1,
  STAFF: 2,
};

// ==============================
// EMPLOYEE STATUS (MATCH BACKEND)
// ==============================
export const EMPLOYEE_STATUS = {
  ACTIVE: 1,
  INACTIVE: 2,
};

// ==============================
// OPTIONS (FOR UI SELECT)
// ==============================
export const EMPLOYEE_ROLE_OPTIONS = [
  { value: EMPLOYEE_ROLE.ADMIN, label: "Admin" },
  { value: EMPLOYEE_ROLE.STAFF, label: "Staff" },
];

export const EMPLOYEE_STATUS_OPTIONS = [
  { value: EMPLOYEE_STATUS.ACTIVE, label: "Active" },
  { value: EMPLOYEE_STATUS.INACTIVE, label: "Inactive" },
];