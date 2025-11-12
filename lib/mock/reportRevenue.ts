import {
  invoices,
  courtBookings,
  serviceBookings,
  serviceBookingItems,
  branchServices,
  services,
  courts,
} from "@/lib/mock";

export interface RevenueFilterOptions {
  branchId?: number | null;
  month?: number | null;
  quarter?: number | null;
}

export interface MonthlyRevenuePoint {
  x: number; // month 1..12
  y: number; // revenue
}

export interface ServiceRevenueRow {
  service_id: number;
  service_name: string;
  total_amount: number;
  total_quantity: number;
}

export interface CourtRevenueRow {
  court_id: number;
  court_name: string;
  total_amount: number;
}

function isMonthInQuarter(month: number, quarter: number) {
  const start = (quarter - 1) * 3 + 1;
  const end = start + 2;
  return month >= start && month <= end;
}

function invoiceMatchesBranch(
  invoice: (typeof invoices)[number],
  branchId: number
) {
  if (invoice.court_booking_id) {
    const booking = courtBookings.find(
      (b) => b.id === invoice.court_booking_id
    );
    if (!booking) return false;
    const court = courts.find((c) => c.id === booking.court_id);
    return court?.branch_id === branchId;
  }
  if (invoice.service_booking_id) {
    const sb = serviceBookings.find((s) => s.id === invoice.service_booking_id);
    if (!sb) return false;
    const booking = courtBookings.find((b) => b.id === sb.court_booking_id);
    const court = courts.find((c) => c?.id === booking?.court_id);
    return court?.branch_id === branchId;
  }
  return false;
}

function filterInvoicesByPeriod(year: number, options?: RevenueFilterOptions) {
  const { branchId, month, quarter } = options || {};
  return invoices.filter((inv) => {
    const created = new Date(inv.created_at);
    if (created.getFullYear() !== year) return false;
    const m = created.getMonth() + 1;
    if (month && m !== month) return false;
    if (!month && quarter && !isMonthInQuarter(m, quarter)) return false;
    if (branchId) {
      return invoiceMatchesBranch(inv, branchId);
    }
    return true;
  });
}

export function getInvoicesByPeriod(
  year: number,
  options?: RevenueFilterOptions
) {
  return filterInvoicesByPeriod(year, options);
}

export function getPaidInvoices(year: number, options?: RevenueFilterOptions) {
  return filterInvoicesByPeriod(year, options).filter(
    (inv) => inv.status === "Paid"
  );
}

export function getMonthlyRevenue(
  year: number,
  options?: RevenueFilterOptions
): MonthlyRevenuePoint[] {
  const result: MonthlyRevenuePoint[] = Array.from({ length: 12 }, (_, i) => ({
    x: i + 1,
    y: 0,
  }));
  const list = getPaidInvoices(year, options);
  for (const inv of list) {
    const m = new Date(inv.created_at).getMonth();
    result[m].y += inv.total_amount;
  }
  return result;
}

export function getRevenueByService(
  year: number,
  options?: RevenueFilterOptions
): ServiceRevenueRow[] {
  // Build a map service_id -> {amount, qty}
  const totals = new Map<number, { amount: number; qty: number }>();
  // Use only PAID invoices in year and (optional) branch
  const paid = getPaidInvoices(year, options);
  const paidServiceBookingIds = new Set(
    paid
      .filter((i) => i.service_booking_id)
      .map((i) => i.service_booking_id as number)
  );
  const items = serviceBookingItems.filter((it) =>
    paidServiceBookingIds.has(it.service_booking_id)
  );
  for (const it of items) {
    const bs = branchServices.find((b) => b.id === it.branch_service_id);
    if (!bs) continue;
    const amount = bs.unit_price * it.quantity;
    const prev = totals.get(bs.service_id) || { amount: 0, qty: 0 };
    prev.amount += amount;
    prev.qty += it.quantity;
    totals.set(bs.service_id, prev);
  }
  return Array.from(totals.entries())
    .map(([service_id, v]) => {
      const svc = services.find((s) => s.id === service_id);
      return {
        service_id,
        service_name: svc?.name || `Dịch vụ #${service_id}`,
        total_amount: v.amount,
        total_quantity: v.qty,
      };
    })
    .sort((a, b) => b.total_amount - a.total_amount);
}

export function getRevenueByCourt(
  year: number,
  options?: RevenueFilterOptions
): CourtRevenueRow[] {
  const totals = new Map<number, number>(); // court_id -> amount
  const list = getPaidInvoices(year, options);
  for (const inv of list) {
    if (inv.court_booking_id) {
      const booking = courtBookings.find((b) => b.id === inv.court_booking_id);
      if (!booking) continue;
      const courtId = booking.court_id;
      totals.set(courtId, (totals.get(courtId) || 0) + inv.total_amount);
    }
  }
  return Array.from(totals.entries())
    .map(([court_id, total]) => {
      const court = courts.find((c) => c.id === court_id);
      return {
        court_id,
        court_name: court?.display_name || `Sân #${court_id}`,
        total_amount: total,
      };
    })
    .sort((a, b) => b.total_amount - a.total_amount);
}
