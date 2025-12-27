import { serviceRepo, branches } from "@/mock";
import type { Service, BranchService } from "@/types";

// Backward-compatible service mockRepo that proxies to the centralized lib/mock/serviceRepo

export const mockBranches = branches;

export async function listServices(branchId?: number) {
  return serviceRepo.listServices(branchId);
}

export async function getServiceById(serviceId: number, branchId?: number) {
  return serviceRepo.getServiceById(serviceId, branchId);
}

export async function createService(payload: {
  name: string;
  unit: Service["unit"];
  rental_type: Service["rental_type"];
  branch_id: number;
  unit_price: number;
  current_stock: number;
  min_stock_threshold: number;
  status: BranchService["status"];
}) {
  return serviceRepo.createService(payload);
}

export async function updateService(
  serviceId: number,
  payload: Partial<Service>
) {
  return serviceRepo.updateService(serviceId, payload);
}

export async function updateBranchService(
  branchServiceId: number,
  payload: Partial<BranchService>
) {
  return serviceRepo.updateBranchService(branchServiceId, payload);
}
