import {
  customers,
  customerLevels,
  invoices,
  courtBookings,
  serviceBookings,
} from "@/lib/mock";

export interface CustomerFilterOptions {
  month?: number | null;
  quarter?: number | null;
}

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

export interface CustomerRevenueSummary {
  totalRevenue: number;
  activeCustomers: number;
}

function isSameYear(dateIso: string, year: number) {
  const d = new Date(dateIso);
  return d.getFullYear() === year;
}

function isMonthInQuarter(month: number, quarter: number) {
  const start = (quarter - 1) * 3 + 1;
  const end = start + 2;
  return month >= start && month <= end;
}

function matchesPeriod(
  dateIso: string,
  year: number,
  options?: CustomerFilterOptions
) {
  const d = new Date(dateIso);
  if (d.getFullYear() !== year) return false;
  const month = d.getMonth() + 1;
  if (options?.month && month !== options.month) return false;
  if (
    !options?.month &&
    options?.quarter &&
    !isMonthInQuarter(month, options.quarter)
  )
    return false;
  return true;
}

function resolveCustomerIdFromInvoice(inv: (typeof invoices)[number]) {
  if (inv.court_booking_id) {
    const booking = courtBookings.find((b) => b.id === inv.court_booking_id);
    if (booking) return booking.customer_id;
  }
  if (inv.service_booking_id) {
    const service = serviceBookings.find(
      (s) => s.id === inv.service_booking_id
    );
    if (service) {
      const booking = courtBookings.find(
        (b) => b.id === service.court_booking_id
      );
      if (booking) return booking.customer_id;
    }
  }
  return null;
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
  options?: CustomerFilterOptions
): TopCustomerRow[] {
  const paid = invoices.filter(
    (inv) =>
      inv.status === "Paid" && matchesPeriod(inv.created_at, year, options)
  );
  const map = new Map<number, { amount: number; count: number }>();
  for (const inv of paid) {
    const customerId = resolveCustomerIdFromInvoice(inv);
    if (!customerId) continue;
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

export function getCustomerRevenueSummary(
  year: number,
  options?: CustomerFilterOptions
): CustomerRevenueSummary {
  const paid = invoices.filter(
    (inv) =>
      inv.status === "Paid" && matchesPeriod(inv.created_at, year, options)
  );
  const totalRevenue = paid.reduce((sum, inv) => sum + inv.total_amount, 0);
  const customerIds = new Set<number>();
  for (const inv of paid) {
    const customerId = resolveCustomerIdFromInvoice(inv);
    if (customerId) {
      customerIds.add(customerId);
    }
  }
  return {
    totalRevenue,
    activeCustomers: customerIds.size,
  };
}
