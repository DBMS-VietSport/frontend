// Data types for customer management
// Based on create_db.sql & create_data.sql schemas

export interface Customer {
  id: number;
  full_name: string;
  dob: string; // ISO string
  gender: "Nam" | "Nữ" | "Khác";
  id_card_number: string;
  address: string;
  phone_number: string;
  email: string;
  bonus_point: number;
  customer_level_id: number;
  customer_level_name: string; // joined from customer_level
  discount_rate: number;
}

export interface CustomerLevel {
  id: number;
  name: string;
  discount_rate: number;
  minimum_point: number;
}

export interface BookingSummary {
  id: number;
  court_name: string;
  type: string;
  date: string;
  time_range: string;
  payment_status: string;
  total_amount: number;
  booking_code: string;
}

export interface InvoiceSummary {
  id: number;
  created_at: string;
  total_amount: number;
  payment_method: string;
  status: string;
  invoice_type: "Court" | "Service";
}

// Form payloads
export interface CreateCustomerPayload {
  full_name: string;
  dob: string;
  gender: "Nam" | "Nữ" | "Khác";
  id_card_number: string;
  address: string;
  phone_number: string;
  email: string;
  customer_level_id: number;
}

export interface UpdateCustomerPayload {
  full_name?: string;
  dob?: string;
  gender?: "Nam" | "Nữ" | "Khác";
  id_card_number?: string;
  address?: string;
  phone_number?: string;
  email?: string;
  customer_level_id?: number;
}
