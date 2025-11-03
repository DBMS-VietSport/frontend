export interface Role {
  id: number;
  name: string;
}

export interface CustomerLevel {
  id: number;
  name: string;
  discount_rate: number;
  minimum_point: number;
}

export interface Branch {
  id: number;
  name: string;
  address: string;
  hotline: string;
  late_time_limit: number;
}

export interface CourtType {
  id: number;
  name: string;
  rent_duration: number;
}

export interface Court {
  id: number;
  status: "Available" | "InUse" | "Maintenance";
  capacity: number;
  base_hourly_price: number;
  maintenance_date?: string;
  branch_id: number;
  court_type_id: number;
  display_name: string;
}

export type ServiceUnit = "Lần" | "Giờ" | "Trận" | "Tháng" | "Lượt" | "Chai";

export interface Service {
  id: number;
  name: string;
  unit: ServiceUnit;
  rental_type: "Dụng cụ" | "Nhân sự" | "Tiện ích";
}

export interface BranchService {
  id: number;
  unit_price: number;
  current_stock: number;
  min_stock_threshold: number;
  status: "Available" | "Unavailable";
  branch_id: number;
  service_id: number;
}

export interface Account {
  id: string;
  username: string;
  role_id: number;
}

export interface Employee {
  id: number;
  full_name: string;
  gender: string;
  dob: string;
  address: string;
  phone_number: string;
  email: string;
  status: string;
  commission_rate: number;
  base_salary: number;
  base_allowance: number;
  branch_id: number;
  user_id: string;
  role_id?: number;
}

export interface Customer {
  id: number;
  full_name: string;
  dob: string;
  gender: string;
  id_card_number: string;
  address: string;
  phone_number: string;
  email: string;
  customer_level_id: number;
  user_id: string;
  bonus_point: number;
}

export interface CourtBooking {
  id: number;
  created_at: string;
  type: "Online" | "Direct";
  status: string;
  customer_id: number;
  employee_id?: number | null;
  court_id: number;
}

export interface BookingSlot {
  id: number;
  start_time: string;
  end_time: string;
  status: string;
  court_booking_id: number;
}

export interface ServiceBooking {
  id: number;
  status: string;
  court_booking_id: number;
  employee_id?: number | null;
}

export interface ServiceBookingItem {
  id: number;
  quantity: number;
  start_time: string;
  end_time: string;
  service_booking_id: number;
  branch_service_id: number;
}

export interface Invoice {
  id: number;
  total_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  service_booking_id?: number | null;
  court_booking_id?: number | null;
}

export interface WorkShift {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  required_count: number;
}

export interface ShiftAssignment {
  employee_id: number;
  work_shift_id: number;
  status: string;
  note?: string;
}
