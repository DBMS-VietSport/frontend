import {
  customers,
  customerLevels,
  invoices,
  courtBookings,
  courts,
  branches,
} from "@/lib/mock";

export interface MonthlyNewCustomersPoint {
  x: number; // month 1..12
  y: number; // count
}

export interface TopCustomerRow {
  customer_id: number;
  full_name: string;
  phone_number: string;
  invoice_count: number;
  total_amount: number;
}

export interface LevelDistributionRow {
  level_id: number;
  level_name: string;
  count: number;
}

function isSameYear(dateIso: string, year: number) {
  const d = new Date(dateIso);
  return d.getFullYear() === year;
}

function filterInvoicesByYearBranch(year: number, branchId?: number | null) {
  return invoices.filter((inv) => {
    if (inv.status !== "Paid") return false;
    if (!isSameYear(inv.created_at, year)) return false;
    if (!branchId) return true;
    // derive branch from court of the court booking
    if (inv.court_booking_id) {
      const booking = courtBookings.find((b) => b.id === inv.court_booking_id);
      const court = courts.find((c) => c.id === booking?.court_id);
      return court?.branch_id === branchId;
    }
    return false;
  });
}

export function getNewCustomersByMonth(
  year: number
): MonthlyNewCustomersPoint[] {
  const result: MonthlyNewCustomersPoint[] = Array.from(
    { length: 12 },
    (_, i) => ({ x: i + 1, y: 0 })
  );
  for (const c of customers) {
    // Fallback use dob as created_at if no created date exists
    const created = c as any;
    const createdAt = (created.created_at as string) || c.dob;
    const d = new Date(createdAt);
    if (d.getFullYear() !== year) continue;
    const m = d.getMonth();
    result[m].y += 1;
  }
  return result;
}

export function getTopCustomersByRevenue(
  year: number,
  limit = 10,
  branchId?: number | null
): TopCustomerRow[] {
  const paid = filterInvoicesByYearBranch(year, branchId);
  const map = new Map<number, { amount: number; count: number }>();
  for (const inv of paid) {
    const booking = courtBookings.find((b) => b.id === inv.court_booking_id);
    if (!booking) continue;
    const customerId = booking.customer_id;
    const prev = map.get(customerId) || { amount: 0, count: 0 };
    prev.amount += inv.total_amount;
    prev.count += 1;
    map.set(customerId, prev);
  }
  const rows: TopCustomerRow[] = Array.from(map.entries())
    .map(([customer_id, v]) => {
      const c = customers.find((x) => x.id === customer_id);
      return {
        customer_id,
        full_name: c?.full_name || `Khách #${customer_id}`,
        phone_number: c?.phone_number || "",
        invoice_count: v.count,
        total_amount: v.amount,
      };
    })
    .sort((a, b) => b.total_amount - a.total_amount);
  return rows.slice(0, limit);
}

export function getCustomerLevelDistribution(): LevelDistributionRow[] {
  const map = new Map<number, number>();
  for (const c of customers) {
    map.set(c.customer_level_id, (map.get(c.customer_level_id) || 0) + 1);
  }
  return customerLevels.map((lvl) => ({
    level_id: lvl.id,
    level_name: lvl.name,
    count: map.get(lvl.id) || 0,
  }));
}
