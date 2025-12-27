/**
 * Mock Data Barrel Export
 * 
 * Central export for all mock data and types
 */

// Export all data
export * from "./data";

// Export types
export * from "./types";

// Export utilities
export * from "./branchSettingsRepo";
export * from "./passwordResetRepo";
export * from "./passwordStorage";
export * from "./id-utils";

// Export repos
export { serviceRepo } from "@/features/services/mock/serviceRepo";
export { employeeRepo } from "@/features/employee/mock/employeeRepo";