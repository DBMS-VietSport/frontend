import {
  courts,
  courtTypes,
  branches,
  courtBookings,
  bookingSlots,
  invoices,
  serviceBookings,
  serviceBookingItems,
  branchServices,
  services,
} from "@/lib/mock";

export interface CourtFilterOptions {
  month?: number | null;
  quarter?: number | null;
  courtTypeId?: number | null;
}

export interface CourtUsageRow {
  court_id: number;
  court_name: string;
  court_type_id: number;
  court_type_name: string;
  branch_id: number;
  branch_name: string;
  slot_count: number;
  booked_minutes: number;
  capacity_minutes: number;
  occupancy: number; // 0..1
}

export interface BookingTypeStats {
  online: number;
  direct: number;
}

export interface CancellationStats {
  cancelledCount: number;
  noShowCount: number;
  lostRevenue: number;
}

export interface MostUsedService {
  service_id: number;
  service_name: string;
  usage_count: number;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate(); // month is 1..12 compatible
}

function isSameMonth(dateIso: string, year: number, month: number) {
  const d = new Date(dateIso);
  return d.getFullYear() === year && d.getMonth() + 1 === month;
}

function isMonthInQuarter(month: number, quarter: number) {
  const start = (quarter - 1) * 3 + 1;
  const end = start + 2;
  return month >= start && month <= end;
}

function filterBookingsByPeriod(
  year: number,
  options?: CourtFilterOptions
): typeof courtBookings {
  const { month, quarter } = options || {};
  return courtBookings.filter((b) => {
    const created = new Date(b.created_at);
    if (created.getFullYear() !== year) return false;
    const m = created.getMonth() + 1;
    if (month && m !== month) return false;
    if (!month && quarter && !isMonthInQuarter(m, quarter)) return false;
    return true;
  });
}

// Calculate capacity minutes for a period
function getCapacityMinutes(
  year: number,
  options?: CourtFilterOptions
): number {
  const { month, quarter } = options || {};
  if (month) {
    const dayCount = daysInMonth(year, month);
    return dayCount * 8 * 60; // 8h/day
  }
  if (quarter) {
    const startMonth = (quarter - 1) * 3 + 1;
    let totalDays = 0;
    for (let m = startMonth; m < startMonth + 3; m++) {
      totalDays += daysInMonth(year, m);
    }
    return totalDays * 8 * 60;
  }
  // Full year
  let totalDays = 0;
  for (let m = 1; m <= 12; m++) {
    totalDays += daysInMonth(year, m);
  }
  return totalDays * 8 * 60;
}

export function getCourtUsageByPeriod(
  year: number,
  options?: CourtFilterOptions
): CourtUsageRow[] {
  const capacityMinutes = getCapacityMinutes(year, options);
  const bookingsInPeriod = filterBookingsByPeriod(year, options);
  const { courtTypeId } = options || {};

  const rows: CourtUsageRow[] = courts
    .filter((c) => (courtTypeId ? c.court_type_id === courtTypeId : true))
    .map((c) => {
      const type = courtTypes.find((t) => t.id === c.court_type_id);
      const branch = branches.find((b) => b.id === c.branch_id);
      // bookings for this court
      const bookingIds = bookingsInPeriod
        .filter((b) => b.court_id === c.id && b.status !== "Cancelled")
        .map((b) => b.id);
      const slots = bookingSlots.filter(
        (s) =>
          bookingIds.includes(s.court_booking_id) && s.status !== "Cancelled"
      );
      let bookedMinutes = 0;
      for (const s of slots) {
        const start = new Date(s.start_time).getTime();
        const end = new Date(s.end_time).getTime();
        bookedMinutes += Math.max(0, Math.round((end - start) / 60000));
      }
      return {
        court_id: c.id,
        court_name: c.display_name,
        court_type_id: c.court_type_id,
        court_type_name: type?.name || "",
        branch_id: c.branch_id,
        branch_name: branch?.name || "",
        slot_count: slots.length,
        booked_minutes: bookedMinutes,
        capacity_minutes: capacityMinutes,
        occupancy: capacityMinutes > 0 ? bookedMinutes / capacityMinutes : 0,
      };
    });

  return rows;
}

// Legacy function for backward compatibility
export function getCourtUsageByMonth(
  year: number,
  month: number,
  branchId?: number | null,
  courtTypeId?: number | null
): CourtUsageRow[] {
  return getCourtUsageByPeriod(year, { month, courtTypeId });
}

export function getTopCourts(
  year: number,
  options?: CourtFilterOptions,
  limit = 5
) {
  const rows = getCourtUsageByPeriod(year, options)
    .sort((a, b) => b.slot_count - a.slot_count)
    .slice(0, limit);
  return rows;
}

export function getLowCourts(
  year: number,
  options?: CourtFilterOptions,
  limit = 3
) {
  const rows = getCourtUsageByPeriod(year, options)
    .sort((a, b) => a.slot_count - b.slot_count)
    .slice(0, limit);
  return rows;
}

export function getBookingTypeStats(
  year: number,
  options?: CourtFilterOptions
): BookingTypeStats {
  const bookings = filterBookingsByPeriod(year, options);
  let online = 0;
  let direct = 0;

  for (const booking of bookings) {
    if (booking.status === "Cancelled") continue;
    if (booking.type === "Online") {
      online++;
    } else if (booking.type === "Direct") {
      direct++;
    }
  }

  return { online, direct };
}

export function getCancellationStats(
  year: number,
  options?: CourtFilterOptions
): CancellationStats {
  const bookings = filterBookingsByPeriod(year, options);
  let cancelledCount = 0;
  let noShowCount = 0;
  let lostRevenue = 0;

  for (const booking of bookings) {
    if (booking.status === "Cancelled") {
      cancelledCount++;
      // Check if it's a no-show (cancelled after the booking time)
      const bookingDate = new Date(booking.created_at);
      const now = new Date();
      // If cancelled after booking time, consider it no-show
      // For simplicity, we'll check if there are slots that have passed
      const bookingSlotsForBooking = bookingSlots.filter(
        (s) => s.court_booking_id === booking.id
      );
      const hasPassedSlots = bookingSlotsForBooking.some(
        (s) => new Date(s.start_time) < now
      );
      if (hasPassedSlots) {
        noShowCount++;
      }

      // Calculate lost revenue from invoices
      const relatedInvoices = invoices.filter(
        (inv) =>
          inv.court_booking_id === booking.id ||
          (inv.service_booking_id &&
            serviceBookings.find(
              (sb) =>
                sb.id === inv.service_booking_id &&
                sb.court_booking_id === booking.id
            ))
      );
      // Only count unpaid invoices as lost revenue (paid ones might be refunded)
      for (const inv of relatedInvoices) {
        if (inv.status === "Unpaid" || inv.status === "Cancelled") {
          lostRevenue += inv.total_amount;
        }
      }
    }
  }

  return { cancelledCount, noShowCount, lostRevenue };
}

export function getMostUsedServices(
  year: number,
  options?: CourtFilterOptions,
  limit = 5
): MostUsedService[] {
  const bookings = filterBookingsByPeriod(year, options);
  const bookingIds = new Set(
    bookings.filter((b) => b.status !== "Cancelled").map((b) => b.id)
  );

  const serviceBookingIds = new Set(
    serviceBookings
      .filter((sb) => bookingIds.has(sb.court_booking_id))
      .map((sb) => sb.id)
  );

  const serviceUsage = new Map<number, number>();

  for (const item of serviceBookingItems) {
    if (!serviceBookingIds.has(item.service_booking_id)) continue;
    const branchService = branchServices.find(
      (bs) => bs.id === item.branch_service_id
    );
    if (!branchService) continue;
    const currentCount = serviceUsage.get(branchService.service_id) || 0;
    serviceUsage.set(branchService.service_id, currentCount + item.quantity);
  }

  return Array.from(serviceUsage.entries())
    .map(([service_id, usage_count]) => {
      const service = services.find((s) => s.id === service_id);
      return {
        service_id,
        service_name: service?.name || `Dịch vụ #${service_id}`,
        usage_count,
      };
    })
    .sort((a, b) => b.usage_count - a.usage_count)
    .slice(0, limit);
}
