// Data selectors and transformation utilities for services

import type { ServiceRow, ServiceRentalType } from "./types";

/**
 * Search services by name
 */
export function searchServices(
  services: ServiceRow[],
  searchText: string
): ServiceRow[] {
  if (!searchText || searchText.trim() === "") return services;

  const lowerText = searchText.toLowerCase();

  return services.filter((service) =>
    service.name.toLowerCase().includes(lowerText)
  );
}

/**
 * Filter services by rental type
 */
export function filterByRentalType(
  services: ServiceRow[],
  rentalType: ServiceRentalType | "Tất cả" | null
): ServiceRow[] {
  if (!rentalType || rentalType === "Tất cả") return services;
  return services.filter((service) => service.rental_type === rentalType);
}

/**
 * Filter services by status
 */
export function filterByStatus(
  services: ServiceRow[],
  status: string | null
): ServiceRow[] {
  if (!status) return services;
  return services.filter((service) => service.status === status);
}

/**
 * Check if service is low stock (below threshold)
 */
export function isLowStock(service: ServiceRow): boolean {
  const stock = service.current_stock ?? 0;
  const threshold = service.min_stock_threshold ?? 0;
  return stock < threshold;
}

/**
 * Get stock status color
 */
export function getStockStatusColor(service: ServiceRow): string {
  const stock = service.current_stock ?? 0;
  if (stock === 0) return "text-red-500";
  if (isLowStock(service)) return "text-yellow-600";
  return "text-green-600";
}

/**
 * Format price in VND
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

/**
 * Sort services by name
 */
export function sortByName(
  services: ServiceRow[],
  ascending: boolean = true
): ServiceRow[] {
  return [...services].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name, "vi-VN");
    return ascending ? comparison : -comparison;
  });
}

/**
 * Sort services by stock level
 */
export function sortByStock(
  services: ServiceRow[],
  ascending: boolean = true
): ServiceRow[] {
  return [...services].sort((a, b) => {
    const stockA = a.current_stock ?? 0;
    const stockB = b.current_stock ?? 0;
    const comparison = stockA - stockB;
    return ascending ? comparison : -comparison;
  });
}

/**
 * Get services with low stock
 */
export function getLowStockServices(services: ServiceRow[]): ServiceRow[] {
  return services.filter(isLowStock);
}
