/**
 * Role labels mapping for display purposes
 */
export const ROLE_LABELS: Record<string, string> = {
  "Quản trị hệ thống": "Quản trị viên",
  "Quản lý": "Quản lý",
  "Lễ tân": "Lễ tân",
  "Kỹ thuật": "Kỹ thuật",
  "Thu ngân": "Thu ngân",
  "Khách hàng/Member": "Khách hàng",
  "Huấn luyện viên": "Huấn luyện viên",
  // English fallbacks
  "admin": "Quản trị viên",
  "manager": "Quản lý",
  "receptionist": "Lễ tân",
  "technical": "Kỹ thuật",
  "cashier": "Thu ngân",
  "customer": "Khách hàng",
  "trainer": "Huấn luyện viên",
};

/**
 * Role constants for checking user roles
 */
export const ROLES = {
  ADMIN: "Quản trị hệ thống",
  MANAGER: "Quản lý",
  RECEPTIONIST: "Lễ tân",
  TECHNICAL: "Kỹ thuật",
  CASHIER: "Thu ngân",
  CUSTOMER: "Khách hàng/Member",
  TRAINER: "Huấn luyện viên",
} as const;

/**
 * Check if user has customer role
 */
export function isCustomer(user: { role?: string } | null): boolean {
  return user?.role === ROLES.CUSTOMER;
}

/**
 * Check if user has staff role (any non-customer role)
 */
export function isStaff(user: { role?: string } | null): boolean {
  return user?.role !== undefined && user.role !== ROLES.CUSTOMER;
}