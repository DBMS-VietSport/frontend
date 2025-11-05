/**
 * Mock Authentication Data
 * Frontend-only authentication for VietSport system
 */

export type UserRole =
  | "admin"
  | "manager"
  | "receptionist"
  | "cashier"
  | "technical"
  | "trainer"
  | "customer";

export interface MockUser {
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
  branch?: string;
}

export const MOCK_USERS: MockUser[] = [
  {
    username: "admin",
    password: "123456",
    fullName: "Quản trị viên hệ thống",
    role: "admin",
  },
  {
    username: "manager.hcm",
    password: "123456",
    fullName: "Nguyễn Văn Quản lý - TP.HCM",
    role: "manager",
    branch: "TP. Hồ Chí Minh",
  },
  {
    username: "receptionist.hcm",
    password: "123456",
    fullName: "Trần Thị Lễ tân - TP.HCM",
    role: "receptionist",
    branch: "TP. Hồ Chí Minh",
  },
  {
    username: "cashier.hcm",
    password: "123456",
    fullName: "Lê Văn Thu ngân - TP.HCM",
    role: "cashier",
    branch: "TP. Hồ Chí Minh",
  },
  {
    username: "technical.hcm",
    password: "123456",
    fullName: "Phạm Văn Kỹ thuật - TP.HCM",
    role: "technical",
    branch: "TP. Hồ Chí Minh",
  },
  {
    username: "trainer.hcm",
    password: "123456",
    fullName: "Ngô Minh Huấn luyện viên - TP.HCM",
    role: "trainer",
    branch: "TP. Hồ Chí Minh",
  },
  {
    username: "customer.a",
    password: "123456",
    fullName: "Khách hàng A",
    role: "customer",
  },
  {
    username: "customer.b",
    password: "123456",
    fullName: "Khách hàng B",
    role: "customer",
  },
  {
    username: "customer.hcm",
    password: "123456",
    fullName: "Khách hàng TP.HCM",
    role: "customer",
  },
  {
    username: "customer.hn",
    password: "123456",
    fullName: "Khách hàng Hà Nội",
    role: "customer",
  },
  // Additional users for other branches
  {
    username: "manager.hn",
    password: "123456",
    fullName: "Hoàng Văn Quản lý - Hà Nội",
    role: "manager",
    branch: "Hà Nội",
  },
  {
    username: "receptionist.hn",
    password: "123456",
    fullName: "Vũ Thị Lễ tân - Hà Nội",
    role: "receptionist",
    branch: "Hà Nội",
  },
];

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Quản trị viên",
  manager: "Quản lý",
  receptionist: "Lễ tân",
  cashier: "Thu ngân",
  technical: "Kỹ thuật",
  trainer: "Huấn luyện viên",
  customer: "Khách hàng",
};
