// Data types for booking management
// Based on create_db.sql & create_data.sql schemas

export type BookingStatus =
  | "Paid"
  | "Held"
  | "Booked"
  | "Cancelled"
  | "Pending";
export type PaymentStatusUI = "Chưa thanh toán" | "Đã thanh toán" | "Đã hủy";
export type BookingType = "Online" | "Direct";
export type ServiceUnit = "Giờ" | "Lần" | "Lượt" | "Tháng" | "Trận";
export type ServiceRentalType = "Nhân sự" | "Dụng cụ" | "Tiện ích";

// Core entities
export interface CourtType {
  id: number;
  name: string;
  rent_duration: number; // minutes
}

export interface Branch {
  id: number;
  name: string;
  address?: string;
}

export interface Court {
  id: number;
  name?: string;
  court_type_id: number;
  branch_id: number;
  base_hourly_price: number;
}

export interface Customer {
  id: number;
  full_name: string;
  phone_number: string;
  email: string;
}

export interface Employee {
  id: number;
  full_name: string;
  email: string;
  phone_number?: string;
}

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
  status: BookingStatus;
  customer_id: number;
  employee_id?: number | null;
  court_id: number;
  slots: BookingSlot[];
}

// Service entities
export interface Service {
  id: number;
  name: string;
  unit: ServiceUnit;
  rental_type: ServiceRentalType;
}

export interface BranchService {
  id: number;
  branch_id: number;
  service_id: number;
  unit_price: number;
}

export interface ServiceBooking {
  id: number;
  status: string;
  court_booking_id: number;
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

// Invoice
export interface Invoice {
  id: number;
  total_amount: number;
  payment_method: string;
  status: string;
  court_booking_id?: number | null;
  service_booking_id?: number | null;
  created_at?: string;
}

// UI projections
export interface BookingRow {
  id: number;
  code: string;
  branchName: string;
  courtName: string;
  courtType: string;
  customerName: string;
  employeeName?: string;
  timeRange: string;
  paymentStatus: PaymentStatusUI;
  courtStatus: BookingStatus;
  createdAt: string;
}

export interface BookingDetailView extends BookingRow {
  customer: Customer;
  employee?: Employee;
  court: Court;
  courtTypeData: CourtType;
  branch: Branch;
  slots: BookingSlot[];
  invoices: Invoice[];
  serviceBooking?: ServiceBooking;
  serviceItems: ServiceBookingItemDetail[];
  courtFee: number;
  serviceFee: number;
  totalAmount: number;
}

export interface ServiceBookingItemDetail extends ServiceBookingItem {
  service: Service;
  branchService: BranchService;
  trainerNames?: string[];
}

// Edit payloads
export interface UpdateCourtTimePayload {
  court_id: number;
  slots: Array<{ start_time: string; end_time: string }>;
}

export interface UpdateServicesPayload {
  items: Array<{
    id?: number; // omit for new items
    branch_service_id: number;
    quantity: number;
    start_time: string;
    end_time: string;
    trainer_ids?: number[];
  }>;
  removedItemIds?: number[];
}

// Calculation results
export interface PricingCalculation {
  courtFee: number;
  serviceFee: number;
  totalAmount: number;
  alreadyPaid: number;
  difference: number;
}
