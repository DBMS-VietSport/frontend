// Data selectors and transformation utilities
import type { Court, CourtCardData } from "./types";

/**
 * Generate court name (defaults to "Sân {id}" if not present)
 */
export function getCourtName(court: Court): string {
  return court.name || `Sân ${court.id}`;
}

/**
 * Transform Court to CourtCardData for grid display
 */
export function makeCourtCard(court: Court, imageUrl: string): CourtCardData {
  return {
    id: court.id,
    name: getCourtName(court),
    type: court.court_type_name,
    capacity: court.capacity,
    basePrice: court.base_hourly_price,
    branch: court.branch_name,
    maintenanceDate: court.maintenance_date,
    status: court.status,
    image: imageUrl,
  };
}

/**
 * Search courts by name or id
 */
export function searchCourts(courts: Court[], searchText: string): Court[] {
  if (!searchText || searchText.trim() === "") return courts;

  const lowerText = searchText.toLowerCase();

  return courts.filter((court) => {
    const name = getCourtName(court);
    return (
      name.toLowerCase().includes(lowerText) ||
      court.id.toString().includes(searchText)
    );
  });
}

/**
 * Filter courts by type
 */
export function filterByCourtType(
  courts: Court[],
  courtTypeId: number | null
): Court[] {
  if (!courtTypeId) return courts;
  return courts.filter((court) => court.court_type_id === courtTypeId);
}

/**
 * Filter courts by branch
 */
export function filterByBranch(
  courts: Court[],
  branchId: number | null
): Court[] {
  if (!branchId) return courts;
  return courts.filter((court) => court.branch_id === branchId);
}

/**
 * Filter courts by status
 */
export function filterByStatus(
  courts: Court[],
  status: string | null
): Court[] {
  if (!status) return courts;
  return courts.filter((court) => court.status === status);
}

/**
 * Group courts by type
 */
export interface CourtTypeGroup {
  typeId: number;
  typeName: string;
  courts: Court[];
}

export function groupCourtsByType(courts: Court[]): CourtTypeGroup[] {
  const groups = new Map<number, CourtTypeGroup>();

  courts.forEach((court) => {
    if (!groups.has(court.court_type_id)) {
      groups.set(court.court_type_id, {
        typeId: court.court_type_id,
        typeName: court.court_type_name,
        courts: [],
      });
    }
    groups.get(court.court_type_id)!.courts.push(court);
  });

  return Array.from(groups.values()).sort((a, b) =>
    a.typeName.localeCompare(b.typeName)
  );
}
