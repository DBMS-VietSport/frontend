// Data types for employee management
// Based on create_db.sql & create_data.sql schemas

export interface Employee {
  id: number;
  full_name: string;
  gender: "Nam" | "Nữ" | "Khác";
  dob: string; // ISO string
  id_card_number: string;
  address: string;
  phone_number: string;
  email: string;
  status: string; // "Working" | "Inactive"
  commission_rate: number;
  base_salary: number;
  base_allowance: number;
  branch_id: number;
  branch_name: string;
  role_id: number;
  role_name: string;
}

export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface WorkShift {
  id: number;
  date: string; // ISO string
  start_time: string; // ISO string
  end_time: string; // ISO string
  note?: string;
  status: string; // "Assigned" | "Completed"
}

export interface SalaryHistory {
  id: number;
  year: number;
  month: number;
  base_salary: number;
  base_allowance: number;
  commission_rate: number;
  commission_amount: number;
  deduction_penalty: number;
  gross_pay: number;
  net_pay: number;
  payment_status: string; // "Paid" | "Pending"
  payment_method: string;
  paid_at: string;
}

export interface PerformanceRecord {
  month: string; // "YYYY-MM"
  shift_count: number;
  booking_handled: number;
  customer_satisfaction: number; // percentage or score
}

// Form payloads
export interface CreateEmployeePayload {
  full_name: string;
  gender: "Nam" | "Nữ" | "Khác";
  dob: string;
  id_card_number: string;
  address: string;
  phone_number: string;
  email: string;
  commission_rate: number;
  base_salary: number;
  base_allowance: number;
  branch_id: number;
  role_id: number;
}

export interface UpdateEmployeePayload {
  full_name?: string;
  gender?: "Nam" | "Nữ" | "Khác";
  dob?: string;
  id_card_number?: string;
  address?: string;
  phone_number?: string;
  email?: string;
  status?: string;
  commission_rate?: number;
  base_salary?: number;
  base_allowance?: number;
  branch_id?: number;
  role_id?: number;
}
