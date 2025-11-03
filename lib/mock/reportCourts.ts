import {
  courts,
  courtTypes,
  branches,
  courtBookings,
  bookingSlots,
} from "@/lib/mock";

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

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate(); // month is 1..12 compatible
}

function isSameMonth(dateIso: string, year: number, month: number) {
  const d = new Date(dateIso);
  return d.getFullYear() === year && d.getMonth() + 1 === month;
}

export function getCourtUsageByMonth(
  year: number,
  month: number,
  branchId?: number | null,
  courtTypeId?: number | null
): CourtUsageRow[] {
  const dayCount = daysInMonth(year, month);
  const capacityMinutes = dayCount * 8 * 60; // 8h/day

  // Pre-filter bookings by month and branch/courtType if specified
  const bookingsInMonth = courtBookings.filter((b) =>
    isSameMonth(b.created_at, year, month)
  );

  const rows: CourtUsageRow[] = courts
    .filter((c) => (branchId ? c.branch_id === branchId : true))
    .filter((c) => (courtTypeId ? c.court_type_id === courtTypeId : true))
    .map((c) => {
      const type = courtTypes.find((t) => t.id === c.court_type_id);
      const branch = branches.find((b) => b.id === c.branch_id);
      // bookings for this court
      const bookingIds = bookingsInMonth
        .filter((b) => b.court_id === c.id)
        .map((b) => b.id);
      const slots = bookingSlots.filter((s) =>
        bookingIds.includes(s.court_booking_id)
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

export function getTopCourts(
  year: number,
  month: number,
  limit = 5,
  branchId?: number | null,
  courtTypeId?: number | null
) {
  const rows = getCourtUsageByMonth(year, month, branchId, courtTypeId)
    .sort((a, b) => b.slot_count - a.slot_count)
    .slice(0, limit);
  return rows;
}

export function getLowCourts(
  year: number,
  month: number,
  limit = 3,
  branchId?: number | null,
  courtTypeId?: number | null
) {
  const rows = getCourtUsageByMonth(year, month, branchId, courtTypeId)
    .sort((a, b) => a.slot_count - b.slot_count)
    .slice(0, limit);
  return rows;
}
