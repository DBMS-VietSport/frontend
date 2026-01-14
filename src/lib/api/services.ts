// API client for service management
import { ServiceRow } from "@/features/services/types";
import { apiClient } from "./client";

export interface ServiceQueryParams {
  search?: string;
  branch_id?: number;
  rental_type?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface ServicesResponse {
  data: ServiceRow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get all services with filters and pagination
 */
export async function getServices(
  params: ServiceQueryParams = {}
): Promise<ServicesResponse> {
  const response = await apiClient.get<ServicesResponse>('/services', { params });
  return response.data;
}

/**
 * Get a single service by branch_service_id
 */
export async function getServiceById(
  branchServiceId: number
): Promise<ServiceRow> {
  const response = await apiClient.get<ServiceRow>(`/services/${branchServiceId}`);
  return response.data;
}

/**
 * Create a new service
 */
export async function createService(
  data: {
    name: string;
    unit: string;
    rental_type: string;
    branch_id: number;
    unit_price: number;
    current_stock: number;
    min_stock_threshold: number;
    status: string;
  }
): Promise<{ success: boolean; message: string; data: unknown }> {
  const response = await apiClient.post<{ success: boolean; message: string; data: unknown }>('/services', data);
  return response.data;
}

/**
 * Update service base info (name, unit, rental_type)
 */
export async function updateServiceBase(
  serviceId: number,
  data: {
    name?: string;
    unit?: string;
    rental_type?: string;
  }
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.put<{ success: boolean; message: string }>(`/services/${serviceId}/base`, data);
  return response.data;
}

/**
 * Update branch service using sp_update_branch_service stored procedure
 * @param branchServiceId - The branch_service ID
 * @param data - Update data
 *   - unit_price: New unit price (optional)
 *   - stock_adjustment: Amount to add (positive) or subtract (negative) from current stock (optional)
 *   - min_stock_threshold: New minimum stock threshold (optional)
 *   - status: New status (optional)
 */
export async function updateBranchService(
  branchServiceId: number,
  data: {
    unit_price?: number;
    stock_adjustment?: number;
    min_stock_threshold?: number;
    status?: string;
  }
): Promise<{
  success: boolean;
  message: string;
  data?: {
    branch_service_id: number;
    branch_name: string;
    service_name: string;
    updated_fields: string;
    warnings: string | null;
  };
}> {
  const response = await apiClient.put<{
    success: boolean;
    message: string;
    data?: {
      branch_service_id: number;
      branch_name: string;
      service_name: string;
      updated_fields: string;
      warnings: string | null;
    };
  }>(`/services/${branchServiceId}`, data);
  return response.data;
}

/**
 * Delete a service
 */
export async function deleteService(
  serviceId: number
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.delete<{ success: boolean; message: string }>(`/services/${serviceId}`);
  return response.data;
}
