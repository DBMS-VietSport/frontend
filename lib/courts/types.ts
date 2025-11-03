// Data types for court management
// Based on create_db.sql & create_data.sql schemas

export type CourtStatus = "Available" | "InUse" | "Maintenance";

export interface CourtType {
  id: number;
  name: string;
  rent_duration: number; // in minutes
}

export interface Branch {
  id: number;
  name: string;
  address: string;
}

export interface Court {
  id: number;
  status: CourtStatus;
  capacity: number;
  base_hourly_price: number;
  maintenance_date?: string; // ISO string
  branch_id: number;
  branch_name: string;
  court_type_id: number;
  court_type_name: string;
  name?: string; // Optional name, defaults to "Sân {id}"
}

// UI projection for cards
export interface CourtCardData {
  id: number;
  name: string;
  type: string;
  capacity: number;
  basePrice: number;
  branch: string;
  maintenanceDate?: string;
  status: CourtStatus;
  image: string;
}
// Maintenance report
export interface MaintenanceReport {
  id: number;
  court_id: number;
  date: string; // ISO string
  description: string;
  cost: number;
  employee_id: number;
  employee_name: string;
  status_after: CourtStatus;
}

// Booking summary for court detail
export interface CourtBookingSummary {
  id: number;
  booking_code: string;
  customer_name: string;
  date: string;
  time_range: string;
  payment_status: string;
  total_amount: number;
}

// Form payloads
export interface CreateCourtPayload {
  name?: string;
  court_type_id: number;
  branch_id: number;
  capacity: number;
  base_hourly_price: number;
  status: CourtStatus;
  maintenance_date?: string;
}

export interface UpdateCourtPayload {
  name?: string;
  court_type_id?: number;
  branch_id?: number;
  capacity?: number;
  base_hourly_price?: number;
  status?: CourtStatus;
  maintenance_date?: string;
}

export interface CreateMaintenanceReportPayload {
  court_id: number;
  date: string;
  description: string;
  cost: number;
  employee_id: number;
  status_after: CourtStatus;
}
