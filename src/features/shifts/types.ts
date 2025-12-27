// Core data types matching database schema

export interface Role {
  id: number;
  name: string; // 'Quản lý', 'Lễ tân', 'Kỹ thuật', 'Thu ngân', 'Khách hàng/Member'
}

export interface Employee {
  id: number;
  full_name: string;
  phone_number: string;
  email: string;
  role_id: number;
  role_name: string;
  branch_id: number;
  avatar?: string;
}

export interface WorkShift {
  id: number;
  date: string; // '2025-11-03' ISO date
  start_time: string; // '07:00:00'
  end_time: string; // '15:00:00'
  required_count: number; // total required employees
}

export interface ShiftAssignment {
  id?: number;
  employee_id: number;
  work_shift_id: number;
  status: "confirmed" | "pending" | "cancelled";
  note?: string;
}

// UI-specific types

export interface RoleRequirement {
  role_id: number;
  role_name: string;
  required: number;
  assigned: number;
  employees: Employee[];
}

export interface ShiftCellData {
  id: number; // work_shift_id
  date: string; // '2025-11-03'
  weekdayLabel: string; // 'Thứ 2 - 03/11/2025'
  timeRange: string; // '07:00 - 15:00'
  required_per_role: RoleRequirement[];
}

export interface WeekData {
  year: number;
  month: number;
  week: number;
  startDate: string;
  endDate: string;
  days: string[]; // Array of 7 dates
}

// Filter state
export interface ShiftFilters {
  year: number;
  month: number;
  week: number;
}
