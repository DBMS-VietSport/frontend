import { apiClient } from './client';

export interface ConfigBranchDto {
  lateTimeLimit?: number;
  maxCourtsPerUser?: number;
  shiftPay?: number;
  shiftAbsencePenalty?: number;
  loyaltyPointRate?: number; // 0-1 (0% - 100%)
  cancelFeeBefore24h?: number; // 0-1 (0% - 100%)
  cancelFeeWithin24h?: number; // 0-1 (0% - 100%)
  noShowFee?: number; // 0-1 (0% - 100%)
  nightCharge?: number; // 0-1 (0% - 100%)
  holidayCharge?: number; // 0-1 (0% - 100%)
  weekendCharge?: number; // 0-1 (0% - 100%)
}

export interface ConfigBranchResponse {
  Success: number;
  Message: string;
  BranchID: number;
  BranchName: string;
  UpdatedFields: string;
  Warnings: string;
}

/**
 * Get all branches with optional search and pagination
 */
export async function getBranches(params?: {
  search?: string;
  page?: number;
  limit?: number;
}): Promise<any> {
  const response = await apiClient.get('/branches', { params });
  return response.data;
}

/**
 * Get a single branch by ID with all configuration fields
 */
export async function getBranchById(branchId: number): Promise<any> {
  const response = await apiClient.get(`/branches/${branchId}`);
  return response.data;
}

/**
 * Configure branch parameters (Manager only)
 * @param config - Configuration parameters (all optional)
 */
export async function configBranch(
  config: ConfigBranchDto
): Promise<ConfigBranchResponse[]> {
  const response = await apiClient.post('/branches/config', config);
  return response.data;
}
