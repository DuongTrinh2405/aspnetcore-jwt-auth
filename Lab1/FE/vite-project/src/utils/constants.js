// ==============================
// API CONFIG
// ==============================
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ==============================
// STORAGE KEYS
// ==============================
export const STORAGE_KEYS = {
  TOKEN: "token",
  USER: "user",
  REFRESH_TOKEN: "refresh_token",
};

// ==============================
// USER ROLES
// ==============================
export const ROLES = {
  ADMIN: "Admin",
  STAFF: "Staff",
};

// ==============================
// EMPLOYEE ENUM
// ==============================
export const EMPLOYEE_ROLE = {
  ADMIN: 1,
  STAFF: 2,
};

export const EMPLOYEE_STATUS = {
  ACTIVE: 1,
  INACTIVE: 2,
};

export const EMPLOYEE_ROLE_OPTIONS = [
  { value: EMPLOYEE_ROLE.ADMIN, label: "Admin" },
  { value: EMPLOYEE_ROLE.STAFF, label: "Staff" },
];

export const EMPLOYEE_STATUS_OPTIONS = [
  { value: EMPLOYEE_STATUS.ACTIVE, label: "Active" },
  { value: EMPLOYEE_STATUS.INACTIVE, label: "Inactive" },
];

// ==============================
// ROUTES
// ==============================
export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "dashboard",
  CUSTOMERS: "customers",
  PROPERTIES: "properties",
  DEALS: "deals",
  APPOINTMENTS: "appointments",
  REPORTS: "reports",
  EMPLOYEES: "employees",
  PROFILE: "/profile",
};

// ==============================
// PAGINATION
// ==============================
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50],
};