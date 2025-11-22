import {
  courts,
  courtTypes,
  branches,
  BookingSlot,
  CourtBooking,
  Invoice,
} from "@/lib/mock";
import {
  addDays,
  format,
  isWithinInterval,
  startOfDay,
  endOfDay,
  subMonths,
} from "date-fns";

// --- Extended Mock Data Generation ---

// We generate a larger dataset for reporting purposes because the base mock data is too small.
let cachedMockData: {
  bookings: CourtBooking[];
  slots: BookingSlot[];
  invoices: Invoice[];
} | null = null;

function generateMockReportData() {
  if (cachedMockData) return cachedMockData;

  const bookings: CourtBooking[] = [];
  const slots: BookingSlot[] = [];
  const invoices: Invoice[] = [];

  const now = new Date();
  const startDate = subMonths(now, 12);
  const endDate = now;

  let bookingIdCounter = 1000;
  let slotIdCounter = 1000;
  let invoiceIdCounter = 1000;

  // Generate ~500 bookings
  for (let i = 0; i < 500; i++) {
    const bookingDate = new Date(
      startDate.getTime() +
        Math.random() * (endDate.getTime() - startDate.getTime())
    );
    const court = courts[Math.floor(Math.random() * courts.length)];
    const type = Math.random() > 0.4 ? "Online" : "Direct";

    // Status distribution
    const randStatus = Math.random();
    let status = "Paid";
    if (randStatus > 0.9) status = "Cancelled";
    else if (randStatus > 0.85) status = "NoShow"; // Custom status for report
    else if (randStatus > 0.8) status = "Held";

    const bookingId = bookingIdCounter++;

    // For report purposes, we use the specific statuses including NoShow to enable filtering
    // In a real app, this might be a separate field or specific status enum
    const finalStatus = status === "Held" ? "Pending" : status;

    bookings.push({
      id: bookingId,
      created_at: bookingDate.toISOString(),
      type: type as "Online" | "Direct",
      status: finalStatus,
      customer_id: Math.floor(Math.random() * 10) + 1,
      employee_id: type === "Direct" ? Math.floor(Math.random() * 5) + 1 : null,
      court_id: court.id,
    });

    // Create slot
    const durationMinutes = [60, 90, 120][Math.floor(Math.random() * 3)];
    const endTime = new Date(bookingDate.getTime() + durationMinutes * 60000);

    slots.push({
      id: slotIdCounter++,
      start_time: bookingDate.toISOString(),
      end_time: endTime.toISOString(),
      status:
        finalStatus === "Cancelled" || finalStatus === "NoShow"
          ? "Cancelled"
          : "Confirmed",
      court_booking_id: bookingId,
    });

    // Create invoice if paid
    if (status === "Paid") {
      invoices.push({
        id: invoiceIdCounter++,
        total_amount: (court.base_hourly_price * durationMinutes) / 60,
        payment_method: Math.random() > 0.5 ? "Cash" : "Transfer",
        status: "Paid",
        created_at: bookingDate.toISOString(),
        court_booking_id: bookingId,
        service_booking_id: null,
      });
    } else if (status === "NoShow" || status === "Cancelled") {
      // Some cancelled bookings might have partial payment or refund info,
      // but for simplicity we just track them as lost revenue opportunities if needed
    }
  }

  cachedMockData = { bookings, slots, invoices };
  return cachedMockData;
}

// --- Filter Logic ---

export interface CourtReportFilter {
  dateRange: { from: Date; to: Date } | undefined;
  branchIds: number[];
  courtTypeId: number | null;
  bookingMethod: "All" | "Online" | "Direct";
  bookingStatus: "All" | "Paid" | "Held" | "Cancelled" | "NoShow";
}

function filterData(filter: CourtReportFilter) {
  const { bookings, slots, invoices } = generateMockReportData();

  const filteredBookings = bookings.filter((b) => {
    const bookingDate = new Date(b.created_at);

    // Date Range
    if (filter.dateRange?.from && filter.dateRange?.to) {
      if (
        !isWithinInterval(bookingDate, {
          start: startOfDay(filter.dateRange.from),
          end: endOfDay(filter.dateRange.to),
        })
      ) {
        return false;
      }
    }

    // Branch
    const court = courts.find((c) => c.id === b.court_id);
    if (!court) return false;
    if (
      filter.branchIds.length > 0 &&
      !filter.branchIds.includes(court.branch_id)
    ) {
      return false;
    }

    // Court Type
    if (filter.courtTypeId && court.court_type_id !== filter.courtTypeId) {
      return false;
    }

    // Booking Method
    if (filter.bookingMethod !== "All" && b.type !== filter.bookingMethod) {
      return false;
    }

    // Booking Status
    const dbStatus = b.status;
    if (filter.bookingStatus !== "All") {
      if (filter.bookingStatus === "Paid" && dbStatus !== "Paid") return false;
      if (filter.bookingStatus === "Held" && dbStatus !== "Pending")
        return false;
      if (filter.bookingStatus === "Cancelled" && dbStatus !== "Cancelled")
        return false;
      if (filter.bookingStatus === "NoShow" && dbStatus !== "NoShow")
        return false;
    }

    return true;
  });

  const filteredBookingIds = new Set(filteredBookings.map((b) => b.id));

  const filteredSlots = slots.filter((s) =>
    filteredBookingIds.has(s.court_booking_id)
  );
  const filteredInvoices = invoices.filter(
    (i) => i.court_booking_id && filteredBookingIds.has(i.court_booking_id)
  );

  return { filteredBookings, filteredSlots, filteredInvoices };
}

// --- KPI Calculations ---

export function getReportKPIs(filter: CourtReportFilter) {
  const { filteredBookings, filteredSlots, filteredInvoices } =
    filterData(filter);

  const totalBookings = filteredBookings.length;

  const totalBookedMinutes = filteredSlots.reduce((acc, slot) => {
    const start = new Date(slot.start_time).getTime();
    const end = new Date(slot.end_time).getTime();
    return acc + (end - start) / 60000;
  }, 0);

  const totalBookedHours = Math.round(totalBookedMinutes / 60);

  // Occupancy: Total Booked Hours / Total Available Hours
  // Total Available Hours = (Days in Range * Open Hours per Day * Number of Courts in Filter)
  // Approximation: 12 hours open per day per court
  const daysDiff =
    filter.dateRange?.from && filter.dateRange?.to
      ? (filter.dateRange.to.getTime() - filter.dateRange.from.getTime()) /
        (1000 * 3600 * 24)
      : 30; // default 30 days

  const relevantCourtsCount = courts.filter(
    (c) =>
      (filter.branchIds.length === 0 ||
        filter.branchIds.includes(c.branch_id)) &&
      (!filter.courtTypeId || c.court_type_id === filter.courtTypeId)
  ).length;

  const totalCapacityHours =
    Math.max(1, Math.ceil(daysDiff)) * 12 * relevantCourtsCount;
  const occupancyRate =
    totalCapacityHours > 0 ? totalBookedHours / totalCapacityHours : 0;

  const totalRevenue = filteredInvoices.reduce(
    (acc, inv) => acc + inv.total_amount,
    0
  );

  const onlineCount = filteredBookings.filter(
    (b) => b.type === "Online"
  ).length;
  const directCount = filteredBookings.filter(
    (b) => b.type === "Direct"
  ).length;

  const cancelledCount = filteredBookings.filter(
    (b) => b.status === "Cancelled"
  ).length;
  const noShowCount = filteredBookings.filter(
    (b) => b.status === "NoShow"
  ).length;

  // Estimated lost revenue: Average booking value * (cancelled + noshow)
  const avgBookingValue =
    totalBookings > 0 ? totalRevenue / totalBookings : 150000;
  const lostRevenue = Math.round(
    (cancelledCount + noShowCount) * avgBookingValue
  );

      return {
    totalBookings,
    totalBookedHours,
    occupancyRate,
    totalRevenue,
    onlineCount,
    directCount,
    cancelledCount,
    noShowCount,
    lostRevenue,
  };
}

// --- Chart Data ---

export function getRevenueOverTime(filter: CourtReportFilter) {
  const { filteredInvoices } = filterData(filter);
  const dataMap = new Map<string, number>();

  filteredInvoices.forEach((inv) => {
    const date = format(new Date(inv.created_at), "yyyy-MM-dd");
    dataMap.set(date, (dataMap.get(date) || 0) + inv.total_amount);
  });

  // Fill in gaps if needed, but for now just return sorted entries
  return Array.from(dataMap.entries())
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getTopCourts(filter: CourtReportFilter) {
  const { filteredBookings, filteredSlots } = filterData(filter);
  const courtMap = new Map<
    number,
    { name: string; bookings: number; hours: number }
  >();

  filteredBookings.forEach((b) => {
    const court = courts.find((c) => c.id === b.court_id);
    if (!court) return;

    if (!courtMap.has(b.court_id)) {
      courtMap.set(b.court_id, {
        name: court.display_name,
        bookings: 0,
        hours: 0,
      });
    }
    const entry = courtMap.get(b.court_id)!;
    entry.bookings += 1;
  });

  // Add hours
  filteredSlots.forEach((s) => {
    const b = filteredBookings.find((fb) => fb.id === s.court_booking_id);
    if (b && courtMap.has(b.court_id)) {
      const start = new Date(s.start_time).getTime();
      const end = new Date(s.end_time).getTime();
      const hours = (end - start) / (1000 * 3600);
      courtMap.get(b.court_id)!.hours += hours;
    }
  });

  return Array.from(courtMap.values())
    .sort((a, b) => b.hours - a.hours)
    .slice(0, 10);
}

export function getStatusDistribution(filter: CourtReportFilter) {
  const { filteredBookings } = filterData(filter);
  const counts = {
    Paid: 0,
    Held: 0,
    Cancelled: 0,
    NoShow: 0,
  };

  filteredBookings.forEach((b) => {
    if (b.status === "Paid") counts.Paid++;
    else if (b.status === "Pending") counts.Held++;
    else if (b.status === "Cancelled") counts.Cancelled++;
    else if (b.status === "NoShow") counts.NoShow++;
  });

  return [
    { name: "Đã thanh toán", value: counts.Paid, fill: "#22c55e" }, // green
    { name: "Giữ chỗ", value: counts.Held, fill: "#eab308" }, // yellow
    { name: "Đã hủy", value: counts.Cancelled, fill: "#ef4444" }, // red
    { name: "Vắng mặt", value: counts.NoShow, fill: "#f97316" }, // orange
  ];
}

// --- Data Table ---

export function getCourtDetailsTable(filter: CourtReportFilter) {
  const { filteredBookings, filteredSlots, filteredInvoices } =
    filterData(filter);

  // We want a row per court that matches the Branch/Type filter
  const relevantCourts = courts.filter(
    (c) =>
      (filter.branchIds.length === 0 ||
        filter.branchIds.includes(c.branch_id)) &&
      (!filter.courtTypeId || c.court_type_id === filter.courtTypeId)
  );

  return relevantCourts.map((court) => {
    const courtBookings = filteredBookings.filter(
      (b) => b.court_id === court.id
    );
    const bookingIds = new Set(courtBookings.map((b) => b.id));
    const courtSlots = filteredSlots.filter((s) =>
      bookingIds.has(s.court_booking_id)
    );
    const courtInvoices = filteredInvoices.filter(
      (i) => i.court_booking_id && bookingIds.has(i.court_booking_id)
    );

    const bookingCount = courtBookings.length;
    const totalHours = courtSlots.reduce((acc, s) => {
      return (
        acc +
        (new Date(s.end_time).getTime() - new Date(s.start_time).getTime()) /
          (1000 * 3600)
      );
    }, 0);

    const revenue = courtInvoices.reduce((acc, i) => acc + i.total_amount, 0);
    const cancelCount = courtBookings.filter(
      (b) => b.status === "Cancelled" || b.status === "NoShow"
    ).length;

    const branch = branches.find((b) => b.id === court.branch_id);
    const type = courtTypes.find((t) => t.id === court.court_type_id);

    // Occupancy
    const daysDiff =
      filter.dateRange?.from && filter.dateRange?.to
        ? (filter.dateRange.to.getTime() - filter.dateRange.from.getTime()) /
          (1000 * 3600 * 24)
        : 30;
    const capacityHours = Math.max(1, Math.ceil(daysDiff)) * 12; // 12h/day assumption
    const occupancy =
      capacityHours > 0 ? (totalHours / capacityHours) * 100 : 0;

      return {
      id: court.id,
      name: court.display_name,
      branchName: branch?.name || "",
      typeName: type?.name || "",
      bookingCount,
      totalHours: Math.round(totalHours * 10) / 10,
      occupancy: Math.round(occupancy),
      revenue,
      cancelled: cancelCount,
    };
  });
}
