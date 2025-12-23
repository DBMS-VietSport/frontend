import { services, branchServices, branches } from "./data";
import type { Service, BranchService } from "./types";
import { nextId } from "./id-utils";

export interface ServiceRow {
  id: number;
  branch_service_id: number;
  name: string;
  rental_type: Service["rental_type"];
  unit: Service["unit"];
  unit_price: number;
  current_stock?: number;
  min_stock_threshold?: number;
  status?: BranchService["status"];
  branch_id: number;
  branch_name: string;
}

export const serviceRepo = {
  listServices: async (branchId?: number): Promise<ServiceRow[]> => {
    await new Promise((r) => setTimeout(r, 50));
    let bss = branchServices;
    if (branchId) bss = bss.filter((bs) => bs.branch_id === branchId);
    return bss.map((bs) => {
      const s = services.find((x) => x.id === bs.service_id)!;
      const b = branches.find((x) => x.id === bs.branch_id);
      return {
        id: s.id,
        branch_service_id: bs.id,
        name: s.name,
        rental_type: s.rental_type,
        unit: s.unit,
        unit_price: bs.unit_price,
        current_stock: bs.current_stock,
        min_stock_threshold: bs.min_stock_threshold,
        status: bs.status,
        branch_id: bs.branch_id,
        branch_name: b?.name || "",
      };
    });
  },
  getServiceById: async (
    serviceId: number,
    branchId?: number
  ): Promise<{
    service: Service;
    branchService: BranchService;
    branch_name: string;
  } | null> => {
    await new Promise((r) => setTimeout(r, 30));
    const s = services.find((x) => x.id === serviceId);
    if (!s) return null;
    const bs = branchId
      ? branchServices.find(
          (x) => x.service_id === serviceId && x.branch_id === branchId
        )
      : branchServices.find((x) => x.service_id === serviceId);
    if (!bs) return null;
    const b = branches.find((x) => x.id === bs.branch_id);
    return { service: s, branchService: bs, branch_name: b?.name || "" };
  },
  createService: async (payload: {
    name: string;
    unit: Service["unit"];
    rental_type: Service["rental_type"];
    branch_id: number;
    unit_price: number;
    current_stock: number;
    min_stock_threshold: number;
    status: BranchService["status"];
  }): Promise<ServiceRow> => {
    await new Promise((r) => setTimeout(r, 50));
    const newService: Service = {
      id: nextId(),
      name: payload.name,
      unit: payload.unit,
      rental_type: payload.rental_type,
    };
    services.push(newService);
    const newBS: BranchService = {
      id: nextId(),
      service_id: newService.id,
      branch_id: payload.branch_id,
      unit_price: payload.unit_price,
      current_stock: payload.current_stock,
      min_stock_threshold: payload.min_stock_threshold,
      status: payload.status,
    };
    branchServices.push(newBS);
    const b = branches.find((x) => x.id === payload.branch_id);
    return {
      id: newService.id,
      branch_service_id: newBS.id,
      name: newService.name,
      rental_type: newService.rental_type,
      unit: newService.unit,
      unit_price: newBS.unit_price,
      current_stock: newBS.current_stock,
      min_stock_threshold: newBS.min_stock_threshold,
      status: newBS.status,
      branch_id: newBS.branch_id,
      branch_name: b?.name || "",
    };
  },
  updateService: async (
    serviceId: number,
    payload: Partial<Service>
  ): Promise<Service | null> => {
    await new Promise((r) => setTimeout(r, 30));
    const sIdx = services.findIndex((x) => x.id === serviceId);
    if (sIdx === -1) return null;
    services[sIdx] = { ...services[sIdx], ...payload };
    return services[sIdx];
  },
  updateBranchService: async (
    branchServiceId: number,
    payload: Partial<BranchService>
  ): Promise<BranchService | null> => {
    await new Promise((r) => setTimeout(r, 30));
    const idx = branchServices.findIndex((x) => x.id === branchServiceId);
    if (idx === -1) return null;
    branchServices[idx] = { ...branchServices[idx], ...payload };
    return branchServices[idx];
  },
};
