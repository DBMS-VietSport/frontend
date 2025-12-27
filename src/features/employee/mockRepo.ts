// Mock data repository for employee management
// Seed data derived from create_db.sql and create_data.sql

import type {
  Employee,
  Role,
  WorkShift,
  SalaryHistory,
  PerformanceRecord,
  CreateEmployeePayload,
  UpdateEmployeePayload,
} from "./types";
import { mockBranches } from "@/features/booking/mock/mockRepo";

// Roles
export const mockRoles: Role[] = [
  { id: 1, name: "Quản lý", description: "Quản lý chi nhánh" },
  { id: 2, name: "Lễ tân", description: "Tiếp đón khách hàng" },
  { id: 3, name: "Kỹ thuật", description: "Bảo trì và kỹ thuật" },
  { id: 4, name: "Thu ngân", description: "Xử lý thanh toán" },
];

// Employees (in-memory store)
let mockEmployees: Employee[] = [
  {
    id: 1,
    full_name: "Nguyễn Văn A",
    gender: "Nam",
    dob: "1985-05-15",
    id_card_number: "001234567890",
    address: "123 Đường ABC, Quận 1, TP.HCM",
    phone_number: "0901111222",
    email: "nguyenvana@vietsport.vn",
    status: "Working",
    commission_rate: 5,
    base_salary: 10000000,
    base_allowance: 2000000,
    branch_id: 1,
    branch_name: "Hồ Chí Minh",
    role_id: 1,
    role_name: "Quản lý",
  },
  {
    id: 2,
    full_name: "Lê Thị C",
    gender: "Nữ",
    dob: "1992-08-20",
    id_card_number: "002345678901",
    address: "456 Đường XYZ, Quận 1, TP.HCM",
    phone_number: "0902222333",
    email: "lethic@vietsport.vn",
    status: "Working",
    commission_rate: 3,
    base_salary: 7000000,
    base_allowance: 1000000,
    branch_id: 1,
    branch_name: "Hồ Chí Minh",
    role_id: 2,
    role_name: "Lễ tân",
  },
  {
    id: 3,
    full_name: "Hoàng Văn D",
    gender: "Nam",
    dob: "1988-11-10",
    id_card_number: "003456789012",
    address: "789 Đường DEF, Quận 2, TP.HCM",
    phone_number: "0903333444",
    email: "hoangvand@vietsport.vn",
    status: "Working",
    commission_rate: 2,
    base_salary: 8000000,
    base_allowance: 1500000,
    branch_id: 1,
    branch_name: "Hồ Chí Minh",
    role_id: 3,
    role_name: "Kỹ thuật",
  },
  {
    id: 4,
    full_name: "Phạm Thị E",
    gender: "Nữ",
    dob: "1990-03-25",
    id_card_number: "004567890123",
    address: "321 Đường GHI, Quận 3, TP.HCM",
    phone_number: "0904444555",
    email: "phamthie@vietsport.vn",
    status: "Working",
    commission_rate: 3,
    base_salary: 7500000,
    base_allowance: 1200000,
    branch_id: 1,
    branch_name: "Hồ Chí Minh",
    role_id: 4,
    role_name: "Thu ngân",
  },
];

// Work Shifts (in-memory store)
let mockWorkShifts: WorkShift[] = [
  {
    id: 1,
    date: "2025-11-01",
    start_time: "2025-11-01T08:00:00+07:00",
    end_time: "2025-11-01T17:00:00+07:00",
    note: "Ca sáng",
    status: "Completed",
  },
  {
    id: 2,
    date: "2025-11-02",
    start_time: "2025-11-02T08:00:00+07:00",
    end_time: "2025-11-02T17:00:00+07:00",
    note: "",
    status: "Completed",
  },
  {
    id: 3,
    date: "2025-11-03",
    start_time: "2025-11-03T14:00:00+07:00",
    end_time: "2025-11-03T22:00:00+07:00",
    note: "Ca chiều",
    status: "Assigned",
  },
  {
    id: 4,
    date: "2025-11-04",
    start_time: "2025-11-04T08:00:00+07:00",
    end_time: "2025-11-04T17:00:00+07:00",
    note: "",
    status: "Assigned",
  },
];

// Salary History (in-memory store)
let mockSalaryHistory: SalaryHistory[] = [
  {
    id: 1,
    year: 2025,
    month: 10,
    base_salary: 10000000,
    base_allowance: 2000000,
    commission_rate: 5,
    commission_amount: 500000,
    deduction_penalty: 0,
    gross_pay: 12500000,
    net_pay: 12500000,
    payment_status: "Paid",
    payment_method: "Bank Transfer",
    paid_at: "2025-11-01T10:00:00+07:00",
  },
  {
    id: 2,
    year: 2025,
    month: 9,
    base_salary: 10000000,
    base_allowance: 2000000,
    commission_rate: 5,
    commission_amount: 450000,
    deduction_penalty: 0,
    gross_pay: 12450000,
    net_pay: 12450000,
    payment_status: "Paid",
    payment_method: "Bank Transfer",
    paid_at: "2025-10-01T10:00:00+07:00",
  },
  {
    id: 3,
    year: 2025,
    month: 8,
    base_salary: 10000000,
    base_allowance: 2000000,
    commission_rate: 5,
    commission_amount: 600000,
    deduction_penalty: 0,
    gross_pay: 12600000,
    net_pay: 12600000,
    payment_status: "Paid",
    payment_method: "Bank Transfer",
    paid_at: "2025-09-01T10:00:00+07:00",
  },
];

// Auto-increment IDs
let nextEmployeeId = Math.max(...mockEmployees.map((e) => e.id), 0) + 1;
let nextShiftId = Math.max(...mockWorkShifts.map((s) => s.id), 0) + 1;
let nextSalaryId = Math.max(...mockSalaryHistory.map((s) => s.id), 0) + 1;

// Repository functions
export async function listEmployees(): Promise<Employee[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockEmployees;
}

export async function getEmployee(id: number): Promise<Employee | null> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return mockEmployees.find((e) => e.id === id) || null;
}

export async function addEmployee(
  payload: CreateEmployeePayload
): Promise<Employee> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const role = mockRoles.find((r) => r.id === payload.role_id) || mockRoles[1];
  const branch =
    mockBranches.find((b) => b.id === payload.branch_id) || mockBranches[0];

  const newEmployee: Employee = {
    id: nextEmployeeId++,
    ...payload,
    status: "Working",
    role_name: role.name,
    branch_name: branch.name,
  };

  mockEmployees.push(newEmployee);
  return newEmployee;
}

export async function updateEmployee(
  id: number,
  payload: UpdateEmployeePayload
): Promise<Employee> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const employee = mockEmployees.find((e) => e.id === id);
  if (!employee) throw new Error("Employee not found");

  // Update fields
  if (payload.full_name !== undefined) employee.full_name = payload.full_name;
  if (payload.gender !== undefined) employee.gender = payload.gender;
  if (payload.dob !== undefined) employee.dob = payload.dob;
  if (payload.id_card_number !== undefined)
    employee.id_card_number = payload.id_card_number;
  if (payload.address !== undefined) employee.address = payload.address;
  if (payload.phone_number !== undefined)
    employee.phone_number = payload.phone_number;
  if (payload.email !== undefined) employee.email = payload.email;
  if (payload.status !== undefined) employee.status = payload.status;
  if (payload.commission_rate !== undefined)
    employee.commission_rate = payload.commission_rate;
  if (payload.base_salary !== undefined)
    employee.base_salary = payload.base_salary;
  if (payload.base_allowance !== undefined)
    employee.base_allowance = payload.base_allowance;

  // Update role if changed
  if (payload.role_id !== undefined && payload.role_id !== employee.role_id) {
    const role =
      mockRoles.find((r) => r.id === payload.role_id) || mockRoles[1];
    employee.role_id = payload.role_id;
    employee.role_name = role.name;
  }

  // Update branch if changed
  if (
    payload.branch_id !== undefined &&
    payload.branch_id !== employee.branch_id
  ) {
    const branch =
      mockBranches.find((b) => b.id === payload.branch_id) || mockBranches[0];
    employee.branch_id = payload.branch_id;
    employee.branch_name = branch.name;
  }

  return employee;
}

export async function getWorkShifts(employeeId: number): Promise<WorkShift[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Mock: assign some shifts to employee 1 and 2
  if (employeeId === 1 || employeeId === 2) {
    return mockWorkShifts;
  }
  return [];
}

export async function getSalaryHistory(
  employeeId: number
): Promise<SalaryHistory[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Mock: assign salary history to employee 1
  if (employeeId === 1) {
    return mockSalaryHistory;
  }

  // Generate mock salary history for other employees
  const baseSalary =
    mockEmployees.find((e) => e.id === employeeId)?.base_salary || 7000000;
  const baseAllowance =
    mockEmployees.find((e) => e.id === employeeId)?.base_allowance || 1000000;
  const commissionRate =
    mockEmployees.find((e) => e.id === employeeId)?.commission_rate || 3;

  return [
    {
      id: nextSalaryId++,
      year: 2025,
      month: 10,
      base_salary: baseSalary,
      base_allowance: baseAllowance,
      commission_rate: commissionRate,
      commission_amount: Math.round((baseSalary * commissionRate) / 100),
      deduction_penalty: 0,
      gross_pay:
        baseSalary +
        baseAllowance +
        Math.round((baseSalary * commissionRate) / 100),
      net_pay:
        baseSalary +
        baseAllowance +
        Math.round((baseSalary * commissionRate) / 100),
      payment_status: "Paid",
      payment_method: "Bank Transfer",
      paid_at: "2025-11-01T10:00:00+07:00",
    },
  ];
}

export async function getPerformanceStats(
  employeeId: number
): Promise<PerformanceRecord[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Generate mock performance data
  const months = ["2025-08", "2025-09", "2025-10", "2025-11"];

  return months.map((month) => ({
    month,
    shift_count: Math.floor(Math.random() * 20) + 10,
    booking_handled: Math.floor(Math.random() * 50) + 20,
    customer_satisfaction: Math.floor(Math.random() * 20) + 80,
  }));
}

// Export mockEmployees (defined as let above, so needs explicit export)
export { mockEmployees };
