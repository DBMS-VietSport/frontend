// =============================================================================
// Core Domain Types - VietSport
// =============================================================================
// Centralized type definitions for the entire application.
// Re-exported from @/types for easy importing.
// =============================================================================

// -----------------------------------------------------------------------------
// Enums & Literal Types (Aligned with DB Constraints)
// -----------------------------------------------------------------------------

export type CourtStatus = "Sẵn sàng" | "Bảo trì";
export type BookingStatus = "Đã thanh toán" | "Chưa thanh toán" | "Đã hủy" | "Đang giữ chỗ";
export type BookingType = "Online" | "Trực tiếp";
export type ServiceUnit = "Cái" | "Người" | "Phòng" | "Chai" | "Giờ" | "Lượt" | "Tháng" | "Trận";
export type ServiceRentalType = "Theo giờ" | "Theo lần";
export type ServiceStockType = "theo_thoi_gian" | "tieu_hao" | "khong_gioi_han" | "hlv_trong_tai";
export type BranchServiceStatus = "Còn" | "Hết";
export type TimeSlotStatus = "Đã đặt" | "Đã hủy" | "Đã sử dụng" | "Trống" | "Đang giữ chỗ" | "available" | "booked" | "pending" | "past";

// -----------------------------------------------------------------------------
// Core Entities - Foundation Layer
// -----------------------------------------------------------------------------

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

export interface Account {
  id: string;
  username: string;
  role_id: number;
}

// -----------------------------------------------------------------------------
// Branch & Court Entities
// -----------------------------------------------------------------------------

export interface Branch {
  id: number;
  name: string;
  address: string;
  hotline?: string;
  late_time_limit?: number;
}

export interface CourtType {
  id: number;
  name: string;
  rent_duration: number; // minutes
}

export interface Court {
  id: number;
  status: CourtStatus | string;
  capacity?: number;
  base_hourly_price: number;
  maintenance_date?: string;
  branch_id: number;
  court_type_id: number;
  display_name?: string; // Frontend helper
  name?: string;
}

// -----------------------------------------------------------------------------
// Employee & Customer Entities
// -----------------------------------------------------------------------------

export interface Employee {
  id: number;
  full_name: string;
  gender?: string;
  dob?: string;
  address?: string;
  phone_number: string;
  email: string;
  status?: string;
  commission_rate?: number;
  base_salary?: number;
  base_allowance?: number;
  branch_id?: number;
  user_id?: string;
  role_id?: number;
}

export interface Customer {
  id: number;
  full_name: string;
  dob?: string;
  gender?: string;
  id_card_number?: string;
  address?: string;
  phone_number: string;
  email: string;
  customer_level_id?: number;
  user_id?: string;
  bonus_point?: number;
}

// -----------------------------------------------------------------------------
// Service Entities
// -----------------------------------------------------------------------------

export interface Service {
  id: number;
  name: string;
  unit: ServiceUnit | string;
  rental_type: ServiceRentalType | string;
  stock_type?: ServiceStockType | string;
}

export interface BranchService {
  id: number;
  unit_price: number;
  current_stock?: number;
  min_stock_threshold?: number;
  status?: BranchServiceStatus;
  branch_id: number;
  service_id: number;
}

// -----------------------------------------------------------------------------
// Booking Entities
// -----------------------------------------------------------------------------

export interface BookingSlot {
  id: number;
  start_time: string; // ISO string
  end_time: string; // ISO string
  status: string;
  court_booking_id: number;
}

export interface CourtBooking {
  id: number;
  created_at: string; // ISO string
  type: BookingType;
  status: BookingStatus | string;
  customer_id: number;
  employee_id?: number | null;
  court_id: number;
  slots?: BookingSlot[];
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
  start_time: string; // ISO string
  end_time: string; // ISO string  
  service_booking_id: number;
  branch_service_id: number;
  trainer_ids?: number[];
}

// -----------------------------------------------------------------------------
// Invoice Entities
// -----------------------------------------------------------------------------

export interface Invoice {
  id: number;
  total_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  service_booking_id?: number | null;
  court_booking_id?: number | null;
}

// -----------------------------------------------------------------------------
// Work Shift Entities
// -----------------------------------------------------------------------------

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
