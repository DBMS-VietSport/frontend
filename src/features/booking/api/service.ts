/**
 * Booking API Service
 *
 * Service layer for booking-related API operations.
 * Currently uses mock data, but can be easily switched to real REST API.
 */

import type {
  BookingRow,
  BookingDetailView,
  UpdateCourtTimePayload,
  UpdateServicesPayload,
} from "@/types/booking";

import type { BookingStatus } from "@/types/entities";

// Import mock repo functions (temporary - will be replaced with real API calls)
import {
  listBookings as mockListBookings,
  getBooking as mockGetBooking,
  getServicesFor as mockGetServicesFor,
  getInvoicesFor as mockGetInvoicesFor,
  updateBookingCourtTime as mockUpdateCourtTime,
  updateServices as mockUpdateServices,
  cancelBooking as mockCancelBooking,
  mockBranches,
  mockCourts,
  mockCourtTypes,
  mockCustomers,
  mockEmployees,
  mockServices,
  mockBranchServices,
} from "@/features/booking/mock/mockRepo";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface BookingsFilter {
  branchId?: number;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  [key: string]: unknown;
}

export interface CreateBookingInput {
  customerId: number;
  courtId: number;
  slots: Array<{ start_time: string; end_time: string }>;
  employeeId?: number;
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

/**
 * Transform raw booking data to UI-friendly BookingRow
 */
function toBookingRow(booking: Awaited<ReturnType<typeof mockGetBooking>>): BookingRow | null {
  if (!booking) return null;

  const court = mockCourts.find((c) => c.id === booking.court_id);
  const courtType = mockCourtTypes.find((ct) => ct.id === court?.court_type_id);
  const branch = mockBranches.find((b) => b.id === court?.branch_id);
  const customer = mockCustomers.find((c) => c.id === booking.customer_id);
  const employee = booking.employee_id
    ? mockEmployees.find((e) => e.id === booking.employee_id)
    : undefined;

  // Calculate time range
  let timeRange = "-";
  const slots = booking.slots ?? [];
  if (slots.length > 0) {
    const sortedSlots = [...slots].sort(
      (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
    );
    const start = new Date(sortedSlots[0].start_time);
    const end = new Date(sortedSlots[sortedSlots.length - 1].end_time);
    timeRange = `${start.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })} - ${end.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  // Generate booking code
  const dateStr = new Date(booking.created_at).toISOString().split("T")[0].replace(/-/g, "");
  const code = `VS-${booking.id}-${dateStr}`;

  return {
    id: booking.id,
    code,
    branchName: branch?.name || "-",
    courtName: court?.name || "-",
    courtType: courtType?.name || "-",
    customerName: customer?.full_name || "-",
    employeeName: employee?.full_name,
    timeRange,
    paymentStatus: booking.status === "Paid" ? "Đã thanh toán" : "Chưa thanh toán",
    courtStatus: booking.status as BookingStatus,
    createdAt: booking.created_at,
  };
}

// -----------------------------------------------------------------------------
// Service Functions
// -----------------------------------------------------------------------------

/**
 * Fetch all bookings with optional filters
 */
export async function fetchBookings(filters?: BookingsFilter): Promise<BookingRow[]> {
  const rawBookings = await mockListBookings();

  let result = rawBookings
    .map((b) => toBookingRow(b))
    .filter((b): b is BookingRow => b !== null);

  // Apply filters
  if (filters?.branchId) {
    result = result.filter((b) => {
      const court = mockCourts.find((c) => c.name === b.courtName);
      return court?.branch_id === filters.branchId;
    });
  }

  if (filters?.status) {
    result = result.filter((b) => b.courtStatus === filters.status);
  }

  if (filters?.search) {
    const searchLower = filters.search.toLowerCase();
    result = result.filter(
      (b) =>
        b.code.toLowerCase().includes(searchLower) ||
        b.customerName.toLowerCase().includes(searchLower) ||
        b.courtName.toLowerCase().includes(searchLower)
    );
  }

  // Sort by created date descending
  result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return result;
}

/**
 * Fetch a single booking by ID with full details
 */
export async function fetchBookingById(id: number): Promise<BookingDetailView | null> {
  const booking = await mockGetBooking(id);
  if (!booking) return null;

  const baseRow = toBookingRow(booking);
  if (!baseRow) return null;

  // Fetch related data
  const [invoices, servicesData] = await Promise.all([
    mockGetInvoicesFor(id),
    mockGetServicesFor(id),
  ]);

  const court = mockCourts.find((c) => c.id === booking.court_id)!;
  const courtType = mockCourtTypes.find((ct) => ct.id === court?.court_type_id)!;
  const branch = mockBranches.find((b) => b.id === court?.branch_id)!;
  const customer = mockCustomers.find((c) => c.id === booking.customer_id)!;
  const employee = booking.employee_id
    ? mockEmployees.find((e) => e.id === booking.employee_id)
    : undefined;

  // Calculate fees
  const courtFee = invoices
    .filter((inv) => inv.court_booking_id === id)
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  const serviceFee = invoices
    .filter((inv) => inv.service_booking_id !== null)
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  // Map service items with details
  const serviceItems = servicesData.items.map((item) => {
    const branchService = mockBranchServices.find((bs) => bs.id === item.branch_service_id);
    const service = mockServices.find((s) => s.id === branchService?.service_id);
    return {
      ...item,
      service: service!,
      branchService: branchService!,
      trainerNames: item.trainer_ids?.map(
        (tid: number) => mockEmployees.find((e) => e.id === tid)?.full_name || ""
      ),
    };
  });

  return {
    ...baseRow,
    customer,
    employee,
    court,
    courtTypeData: courtType,
    branch,
    slots: booking.slots ?? [],
    invoices,
    serviceBooking: servicesData.serviceBooking || undefined,
    serviceItems,
    courtFee,
    serviceFee,
    totalAmount: courtFee + serviceFee,
  };
}

/**
 * Update court time for a booking
 */
export async function updateCourtTime(
  bookingId: number,
  payload: UpdateCourtTimePayload
): Promise<void> {
  await mockUpdateCourtTime(bookingId, payload);
}

/**
 * Update services for a booking
 */
export async function updateBookingServices(
  bookingId: number,
  payload: UpdateServicesPayload
): Promise<void> {
  await mockUpdateServices(bookingId, payload);
}

/**
 * Cancel a booking
 */
export async function cancelBooking(bookingId: number): Promise<void> {
  await mockCancelBooking(bookingId);
}

/**
 * Create a new booking
 * TODO: Implement when backend is ready
 */
export async function createBooking(input: CreateBookingInput): Promise<{ id: number }> {
  // Placeholder - will be implemented with real API
  console.log("Create booking:", input);
  return { id: Date.now() };
}

// -----------------------------------------------------------------------------
// Reference Data Functions
// -----------------------------------------------------------------------------

export async function fetchBranches() {
  return mockBranches;
}

export async function fetchCourtTypes() {
  return mockCourtTypes;
}

export async function fetchCourts(branchId?: number) {
  if (branchId) {
    return mockCourts.filter((c) => c.branch_id === branchId);
  }
  return mockCourts;
}

export async function fetchCustomers() {
  return mockCustomers;
}

export async function fetchEmployees() {
  return mockEmployees;
}
