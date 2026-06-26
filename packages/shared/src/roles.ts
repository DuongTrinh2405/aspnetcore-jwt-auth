import { CUSTOMER_ROLES, STAFF_ROLES, TECHNICIAN_ROLES, USER_ROLES } from "./constants";
import type { UserRole } from "./types";

export function isUserRole(value: string | null | undefined): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}

export function isCustomerRole(role: UserRole | null | undefined): boolean {
  return role ? CUSTOMER_ROLES.includes(role as "customer" | "customer_vip") : false;
}

export function isTechnicianRole(role: UserRole | null | undefined): boolean {
  return role ? TECHNICIAN_ROLES.includes(role as "technician" | "technician_vip") : false;
}

export function isStaffRole(role: UserRole | null | undefined): boolean {
  return role ? STAFF_ROLES.includes(role as "staff" | "admin") : false;
}

export function isAdminRole(role: UserRole | null | undefined): boolean {
  return role === "admin";
}

export function canViewVipJobs(role: UserRole | null | undefined): boolean {
  return role === "technician_vip" || role === "admin";
}
