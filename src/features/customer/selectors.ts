// Data selectors and transformation utilities
import type { Customer, BookingSummary, InvoiceSummary } from "./types";

/**
 * Search customers by name or phone number
 */
export function searchCustomers(
  customers: Customer[],
  searchText: string
): Customer[] {
  if (!searchText || searchText.trim() === "") return customers;

  const lowerText = searchText.toLowerCase();

  return customers.filter(
    (c) =>
      c.full_name.toLowerCase().includes(lowerText) ||
      c.phone_number.includes(searchText)
  );
}

/**
 * Filter customers by level
 */
export function filterByLevel(
  customers: Customer[],
  levelId: number | null
): Customer[] {
  if (!levelId) return customers;
  return customers.filter((c) => c.customer_level_id === levelId);
}

/**
 * Filter invoices by status
 */
export function filterInvoicesByStatus(
  invoices: InvoiceSummary[],
  status: string | null
): InvoiceSummary[] {
  if (!status) return invoices;
  return invoices.filter((inv) => inv.status === status);
}

/**
 * Paginate array
 */
export function paginate<T>(items: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  return items.slice(start, end);
}
