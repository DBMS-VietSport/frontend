// API client for court management
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Court, UpdateCourtPayload, CreateCourtPayload } from "@/features/court/types";
import { apiClient } from "./client";

export interface CourtQueryParams {
  search?: string;
  branch_id?: number;
  court_type_id?: number;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CourtsResponse {
  data: Court[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Get all courts with filters and pagination
 */
export async function getCourts(
  params: CourtQueryParams = {}
): Promise<CourtsResponse> {
  const response = await apiClient.get<CourtsResponse>('/courts', { params });
  return response.data;
}

/**
 * Get a single court by ID
 */
export async function getCourtById(id: number): Promise<Court> {
  const response = await apiClient.get<Court>(`/courts/${id}`);
  return response.data;
}

/**
 * Create a new court
 */
export async function createCourt(
  data: CreateCourtPayload
): Promise<{ success: boolean; message: string; data: unknown }> {
  const response = await apiClient.post<{ success: boolean; message: string; data: unknown }>('/courts', data);
  return response.data;
}

/**
 * Update a court using sp_UpdateCourt stored procedure
 */
export async function updateCourt(
  courtId: number,
  data: {
    name: string;
    status: string;
    capacity: number;
    base_hourly_price: number;
    maintenance_date?: string;
  }
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.put<{ success: boolean; message: string }>(`/courts/${courtId}`, data);
  return response.data;
}

/**
 * Delete a court
 */
export async function deleteCourt(
  id: number
): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.delete<{ success: boolean; message: string }>(`/courts/${id}`);
  return response.data;
}
