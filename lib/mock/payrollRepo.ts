/**
 * Mock Payroll Repository
 * Get personal payroll/salary history for employees
 */

import { employees } from "./data";
import { MOCK_USERS } from "./authMock";

export interface PayrollRecord {
  year: number;
  month: number;
  base_salary: number;
  base_allowance?: number;
  commission_rate?: number;
  commission_amount?: number;
  deduction_penalty?: number;
  gross_pay: number;
  net_pay: number;
  payment_status: "Paid" | "Pending";
  payment_method?: string;
  paid_at?: string;
  shift_count?: number;
  note?: string;
}

/**
 * Map username from auth to employee_id
 * Similar to scheduleRepo logic
 */
function getEmployeeIdByUsername(username: string): number | null {
  const user = MOCK_USERS.find((u) => u.username === username);
  if (!user) return null;

  // Try to find employee by fullName match
  const employee = employees.find((e) => {
    const nameMatch = e.full_name
      .toLowerCase()
      .includes(user.fullName.toLowerCase().split(" ")[0]);
    return nameMatch;
  });

  // If not found by name, try to map by role and branch
  if (!employee) {
    const usernameToEmployeeId: Record<string, number> = {
      "manager.hcm": 1,
      "receptionist.hcm": 2,
      "cashier.hcm": 3,
      "technical.hcm": 4,
      "manager.hn": 1,
      "receptionist.hn": 2,
    };

    if (usernameToEmployeeId[username]) {
      return usernameToEmployeeId[username];
    }

    // Default: return first employee if user is not customer
    if (user.role !== "customer" && employees.length > 0) {
      return employees[0].id;
    }
  }

  return employee?.id || null;
}

/**
 * Mock payroll data for employees
 * In real app, this would come from salary_history table
 */
const mockPayrollData: Record<number, PayrollRecord[]> = {
  1: [
    {
      year: 2024,
      month: 4,
      base_salary: 8000000,
      base_allowance: 500000,
      commission_rate: 5,
      commission_amount: 1200000,
      deduction_penalty: 50000,
      gross_pay: 9700000,
      net_pay: 9650000,
      payment_status: "Paid",
      payment_method: "Bank Transfer",
      paid_at: "2024-05-01T10:00:00+07:00",
      shift_count: 22,
      note: "Lương tháng 4/2024",
    },
    {
      year: 2024,
      month: 5,
      base_salary: 8000000,
      base_allowance: 500000,
      commission_rate: 5,
      commission_amount: 1500000,
      deduction_penalty: 0,
      gross_pay: 10000000,
      net_pay: 10000000,
      payment_status: "Paid",
      payment_method: "Bank Transfer",
      paid_at: "2024-06-01T10:00:00+07:00",
      shift_count: 24,
      note: "Lương tháng 5/2024",
    },
    {
      year: 2024,
      month: 6,
      base_salary: 8000000,
      base_allowance: 500000,
      commission_rate: 5,
      commission_amount: 1800000,
      deduction_penalty: 100000,
      gross_pay: 10300000,
      net_pay: 10200000,
      payment_status: "Paid",
      payment_method: "Bank Transfer",
      paid_at: "2024-07-01T10:00:00+07:00",
      shift_count: 26,
      note: "Lương tháng 6/2024",
    },
    {
      year: 2024,
      month: 7,
      base_salary: 8000000,
      base_allowance: 500000,
      commission_rate: 5,
      commission_amount: 2000000,
      deduction_penalty: 0,
      gross_pay: 10500000,
      net_pay: 10500000,
      payment_status: "Pending",
      shift_count: 28,
      note: "Lương tháng 7/2024 - Đang xử lý",
    },
  ],
  2: [
    {
      year: 2024,
      month: 4,
      base_salary: 6000000,
      base_allowance: 300000,
      commission_rate: 3,
      commission_amount: 720000,
      deduction_penalty: 0,
      gross_pay: 7020000,
      net_pay: 7020000,
      payment_status: "Paid",
      payment_method: "Bank Transfer",
      paid_at: "2024-05-01T10:00:00+07:00",
      shift_count: 20,
      note: "Lương tháng 4/2024",
    },
    {
      year: 2024,
      month: 5,
      base_salary: 6000000,
      base_allowance: 300000,
      commission_rate: 3,
      commission_amount: 900000,
      deduction_penalty: 50000,
      gross_pay: 7150000,
      net_pay: 7100000,
      payment_status: "Paid",
      payment_method: "Bank Transfer",
      paid_at: "2024-06-01T10:00:00+07:00",
      shift_count: 22,
      note: "Lương tháng 5/2024",
    },
    {
      year: 2024,
      month: 6,
      base_salary: 6000000,
      base_allowance: 300000,
      commission_rate: 3,
      commission_amount: 1080000,
      deduction_penalty: 0,
      gross_pay: 7380000,
      net_pay: 7380000,
      payment_status: "Paid",
      payment_method: "Bank Transfer",
      paid_at: "2024-07-01T10:00:00+07:00",
      shift_count: 24,
      note: "Lương tháng 6/2024",
    },
    {
      year: 2024,
      month: 7,
      base_salary: 6000000,
      base_allowance: 300000,
      commission_rate: 3,
      commission_amount: 1200000,
      deduction_penalty: 0,
      gross_pay: 7500000,
      net_pay: 7500000,
      payment_status: "Pending",
      shift_count: 25,
      note: "Lương tháng 7/2024 - Đang xử lý",
    },
  ],
};

/**
 * Get my payroll records for a user
 * @param usernameOrEmployeeId - username from auth or employee_id
 */
export function getMyPayroll(
  usernameOrEmployeeId: string | number
): PayrollRecord[] {
  let employeeId: number | null = null;

  // If it's a number, use it directly
  if (typeof usernameOrEmployeeId === "number") {
    employeeId = usernameOrEmployeeId;
  } else {
    // Otherwise, get employee_id from username
    employeeId = getEmployeeIdByUsername(usernameOrEmployeeId);
  }

  if (!employeeId) {
    return [];
  }

  // Get payroll data for this employee
  const payroll = mockPayrollData[employeeId] || [];

  // Sort by year desc, then month desc (newest first)
  return [...payroll].sort((a, b) => {
    if (a.year !== b.year) {
      return b.year - a.year;
    }
    return b.month - a.month;
  });
}
