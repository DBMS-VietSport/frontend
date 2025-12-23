// Data selectors and transformation utilities
import type {
  CourtBooking,
  BookingRow,
  BookingDetailView,
  PaymentStatusUI,
  Invoice,
  ServiceBookingItem,
  ServiceBookingItemDetail,
  BookingSlot,
  BookingStatus,
} from "./types";
import {
  mockBranches,
  mockCourtTypes,
  mockCourts,
  mockCustomers,
  mockEmployees,
  mockServices,
  mockBranchServices,
} from "./mockRepo";
import { formatTime, formatDate } from "./pricing";

/**
 * Generate booking code (VS-{id}-{YYYYMMDD})
 */
export function makeBookingCode(id: number, createdAt: string): string {
  const date = new Date(createdAt);
  const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
  return `VS-${id}-${dateStr}`;
}

/**
 * Determine payment status from invoices and booking status
 */
export function getPaymentStatus(
  bookingId: number,
  bookingStatus: string,
  invoices: Invoice[]
): PaymentStatusUI {
  if (bookingStatus === "Cancelled") {
    return "Đã hủy";
  }

  const hasPaidInvoice = invoices.some(
    (inv) =>
      (inv.court_booking_id === bookingId || inv.service_booking_id) &&
      inv.status === "Paid"
  );

  if (hasPaidInvoice) {
    return "Đã thanh toán";
  }

  return "Chưa thanh toán";
}

/**
 * Get time range from slots (min start to max end)
 */
export function getTimeRange(slots: BookingSlot[]): string {
  if (slots.length === 0) return "-";

  const starts = slots.map((s) => new Date(s.start_time));
  const ends = slots.map((s) => new Date(s.end_time));

  const minStart = new Date(Math.min(...starts.map((d) => d.getTime())));
  const maxEnd = new Date(Math.max(...ends.map((d) => d.getTime())));

  return `${formatTime(minStart.toISOString())} - ${formatTime(
    maxEnd.toISOString()
  )}`;
}

/**
 * Transform CourtBooking to BookingRow for table display
 */
export function makeBookingRow(
  booking: CourtBooking,
  invoices: Invoice[]
): BookingRow {
  const court = mockCourts.find((c) => c.id === booking.court_id);
  const courtType = court
    ? mockCourtTypes.find((ct) => ct.id === court.court_type_id)
    : null;
  const branch = court
    ? mockBranches.find((b) => b.id === court.branch_id)
    : null;
  const customer = mockCustomers.find((c) => c.id === booking.customer_id);
  const employee = booking.employee_id
    ? mockEmployees.find((e) => e.id === booking.employee_id)
    : null;

  return {
    id: booking.id,
    code: makeBookingCode(booking.id, booking.created_at),
    branchName: branch?.name || "-",
    courtName: court?.name || `Sân ${court?.id || "?"}`,
    courtType: courtType?.name || "-",
    customerName: customer?.full_name || "-",
    employeeName: employee?.full_name,
    timeRange: getTimeRange(booking.slots ?? []),
    paymentStatus: getPaymentStatus(booking.id, booking.status, invoices),
    courtStatus: booking.status as BookingStatus,
    createdAt: booking.created_at,
  };
}

/**
 * Create detailed view for dialog/edit page
 */
export function makeBookingDetailView(
  booking: CourtBooking,
  invoices: Invoice[],
  serviceItems: ServiceBookingItem[],
  serviceBookingId?: number
): BookingDetailView {
  const row = makeBookingRow(booking, invoices);

  const court = mockCourts.find((c) => c.id === booking.court_id)!;
  const courtTypeData = mockCourtTypes.find(
    (ct) => ct.id === court.court_type_id
  )!;
  const branch = mockBranches.find((b) => b.id === court.branch_id)!;
  const customer = mockCustomers.find((c) => c.id === booking.customer_id)!;
  const employee = booking.employee_id
    ? mockEmployees.find((e) => e.id === booking.employee_id)
    : undefined;

  // Enrich service items
  const serviceItemDetails: ServiceBookingItemDetail[] = serviceItems.map(
    (item) => {
      const branchService = mockBranchServices.find(
        (bs) => bs.id === item.branch_service_id
      )!;
      const service = mockServices.find(
        (s) => s.id === branchService.service_id
      )!;

      return {
        ...item,
        service,
        branchService,
      };
    }
  );

  // Calculate fees (basic calculation here, full calculation in pricing.ts)
  const slots: BookingSlot[] = booking.slots || [];
  const courtFee = court.base_hourly_price * (slots.length || 1);
  const serviceFee = serviceItemDetails.reduce((sum, item) => {
    return sum + item.branchService.unit_price * item.quantity;
  }, 0);
  const totalAmount = courtFee + serviceFee;

  return {
    ...row,
    customer,
    employee,
    court,
    courtTypeData,
    branch,
    slots,
    invoices,
    serviceItems: serviceItemDetails,
    courtFee,
    serviceFee,
    totalAmount,
  };
}

/**
 * Filter bookings by date (matches any slot within the booking)
 */
export function filterByDate(
  rows: BookingRow[],
  date: Date | null
): BookingRow[] {
  if (!date) return rows;

  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);

  return rows.filter((row) => {
    const bookingDate = new Date(row.createdAt);
    bookingDate.setHours(0, 0, 0, 0);
    return bookingDate.getTime() === targetDate.getTime();
  });
}

/**
 * Filter bookings by court type
 */
export function filterByCourtType(
  rows: BookingRow[],
  courtTypeId: number | null
): BookingRow[] {
  if (!courtTypeId) return rows;

  const courtTypeName = mockCourtTypes.find(
    (ct) => ct.id === courtTypeId
  )?.name;
  if (!courtTypeName) return rows;

  return rows.filter((row) => row.courtType === courtTypeName);
}

/**
 * Filter bookings by payment status
 */
export function filterByPayment(
  rows: BookingRow[],
  status: PaymentStatusUI | null
): BookingRow[] {
  if (!status) return rows;
  return rows.filter((row) => row.paymentStatus === status);
}

/**
 * Search bookings by text (customer name, employee name, court name, booking code)
 */
export function search(rows: BookingRow[], text: string): BookingRow[] {
  if (!text || text.trim() === "") return rows;

  const lowerText = text.toLowerCase();

  return rows.filter((row) => {
    return (
      row.customerName.toLowerCase().includes(lowerText) ||
      row.employeeName?.toLowerCase().includes(lowerText) ||
      row.courtName.toLowerCase().includes(lowerText) ||
      row.code.toLowerCase().includes(lowerText) ||
      row.branchName.toLowerCase().includes(lowerText)
    );
  });
}

/**
 * Apply all filters
 */
export function applyFilters(
  rows: BookingRow[],
  filters: {
    date?: Date | null;
    courtTypeId?: number | null;
    paymentStatus?: PaymentStatusUI | null;
    searchText?: string;
  }
): BookingRow[] {
  let result = rows;

  if (filters.date) {
    result = filterByDate(result, filters.date);
  }

  if (filters.courtTypeId) {
    result = filterByCourtType(result, filters.courtTypeId);
  }

  if (filters.paymentStatus) {
    result = filterByPayment(result, filters.paymentStatus);
  }

  if (filters.searchText) {
    result = search(result, filters.searchText);
  }

  return result;
}
