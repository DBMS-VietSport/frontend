// Data types for service management
// Based on create_db.sql [service] and [branch_service] schemas

import type { BranchServiceStatus } from "@/types";

export type ServiceRentalType = "Dụng cụ" | "Nhân sự" | "Tiện ích";
export type ServiceUnit = "Lần" | "Giờ" | "Trận" | "Tháng" | "Lượt" | "Chai";
export type ServiceStatus = "Available" | "Unavailable";

// Re-export for convenience
export type { BranchServiceStatus };

export interface Service {
  id: number;
  name: string;
  unit: ServiceUnit;
  rental_type: ServiceRentalType;
}

export interface BranchService {
  id: number;
  service_id: number;
  branch_id: number;
  unit_price: number;
  current_stock?: number;
  min_stock_threshold?: number;
  status?: BranchServiceStatus;
}

// UI projection for table display
export interface ServiceRow {
  id: number;
  branch_service_id: number;
  name: string;
  rental_type: ServiceRentalType;
  unit: ServiceUnit;
  unit_price: number;
  current_stock?: number;
  min_stock_threshold?: number;
  status?: BranchServiceStatus;
  branch_id: number;
  branch_name: string;
}

// Combined detail view
export interface ServiceDetail {
  service: Service;
  branchService: BranchService;
  branch_name: string;
}

// Form payloads
export interface CreateServicePayload {
  name: string;
  unit: ServiceUnit;
  rental_type: ServiceRentalType;
  branch_id: number;
  unit_price: number;
  current_stock: number;
  min_stock_threshold: number;
  status: BranchServiceStatus;
}

export interface UpdateServicePayload {
  name?: string;
  unit?: ServiceUnit;
  rental_type?: ServiceRentalType;
  unit_price?: number;
  current_stock?: number;
  min_stock_threshold?: number;
  status?: BranchServiceStatus;
}

export interface UpdateBranchServicePayload {
  unit_price?: number;
  current_stock?: number;
  min_stock_threshold?: number;
  status?: BranchServiceStatus;
}
