/**
 * Services Mock Repository - Convenience exports
 * Re-exports service repository functions for easier importing
 */

import { serviceRepo } from "./serviceRepo";

export const {
  listServices,
  getServiceById,
  createService,
  updateService,
  updateBranchService,
} = serviceRepo;