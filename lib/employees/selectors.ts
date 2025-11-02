// Data selectors and transformation utilities
import type { Employee } from "./types";

/**
 * Search employees by name or phone number
 */
export function searchEmployees(
  employees: Employee[],
  searchText: string
): Employee[] {
  if (!searchText || searchText.trim() === "") return employees;

  const lowerText = searchText.toLowerCase();

  return employees.filter(
    (e) =>
      e.full_name.toLowerCase().includes(lowerText) ||
      e.phone_number.includes(searchText)
  );
}

/**
 * Filter employees by role
 */
export function filterByRole(
  employees: Employee[],
  roleName: string | null
): Employee[] {
  if (!roleName) return employees;
  return employees.filter((e) => e.role_name === roleName);
}

/**
 * Paginate array
 */
export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return items.slice(start, end);
}
