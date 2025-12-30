/**
 * Booking API Service
 *
 * Service layer for booking-related API operations.
 * Now uses real REST API calls to the backend.
 */

import type {
  BookingRow,
  BookingDetailView,
  UpdateCourtTimePayload,
  UpdateServicesPayload,
} from "@/types/booking";

import type { BookingStatus } from "@/types/entities";

// Import real API functions
import {
  getBranchServices,
  getBranchCourts,
  getCourtBookingSlots,
  createCourtBooking as apiCreateCourtBooking,
  createServiceBooking as apiCreateServiceBooking,
  getBranchCourtBookings,
  getCustomers as apiGetCustomers,
  getCourtBookingById,
  cancelCourtBooking as apiCancelCourtBooking,
  getCourtTypes as apiGetCourtTypes,
  getEmployees as apiGetEmployees,
  getBranches as apiGetBranches,
  updateCourtBooking,
  type CourtBookingRequest,
  type ServiceBookingRequest,
  type BranchService,
  type Court,
} from "@/lib/api/booking";

// Import mock data for fallback (temporary)
import {
  mockBranches,
  mockCourtTypes,
  mockCustomers,
  mockEmployees,
  mockCourts,
  mockBranchServices,
  mockServices,
  getBooking as mockGetBooking,
  getInvoicesFor as mockGetInvoicesFor,
  getServicesFor as mockGetServicesFor,
  updateBookingCourtTime as mockUpdateCourtTime,
  updateServices as mockUpdateServices,
  cancelBooking as mockCancelBooking,
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
  branchId?: number;
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
    courtStatus: (booking as any).status as BookingStatus,
    bookingDate: (booking as any).booking_date || (booking as any).bookingDate,
    createdAt: (booking as any).created_at || (booking as any).createdAt,
  };
}

// -----------------------------------------------------------------------------
// Service Functions
// -----------------------------------------------------------------------------

/**
 * Fetch all bookings with optional filters
 */
export async function fetchBookings(filters?: BookingsFilter): Promise<BookingRow[]> {
  if (!filters?.branchId) {
    throw new Error("Branch ID is required to fetch bookings");
  }

  const apiBookings = await getBranchCourtBookings(filters.branchId, {
    status: filters.status,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
    search: filters.search,
  });

  return apiBookings.map((booking: any) => {
    // Generate booking code
    const dateStr = new Date(booking.created_at).toISOString().split("T")[0].replace(/-/g, "");
    const code = `VS-${booking.id}-${dateStr}`;

    return {
      id: booking.id,
      code,
      branchName: booking.branch_name,
      courtName: booking.court_name,
      courtType: booking.court_type_name,
      customerName: booking.customer_name,
      employeeName: booking.employee_name,
      timeRange: booking.time_range || "-",
      paymentStatus: (booking as any).status === "Paid" ? "Đã thanh toán" : "Chưa thanh toán",
      courtStatus: (booking as any).status as BookingStatus,
      bookingDate: (booking as any).booking_date || (booking as any).bookingDate,
      createdAt: (booking as any).created_at || (booking as any).createdAt,
    };
  });
}

/**
 * Fetch a single booking by ID with full details
 */
export async function fetchBookingById(id: number): Promise<BookingDetailView | null> {
  try {
    const booking = await getCourtBookingById(id);
    if (!booking) return null;

    // Generate booking code
    const dateStr = new Date(booking.created_at).toISOString().split('T')[0].replace(/-/g, '');
    const code = `VS-${booking.id}-${dateStr}`;

    // Calculate time range from slots
    let timeRange = '-';
    if (booking.booking_slots && booking.booking_slots.length > 0) {
      const sortedSlots = [...booking.booking_slots].sort(
        (a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
      );
      const start = new Date(sortedSlots[0].start_time);
      const end = new Date(sortedSlots[sortedSlots.length - 1].end_time);
      timeRange = `${start.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })} - ${end.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })}`;
    }

    // Calculate fees from invoices
    const courtFee = booking.invoice
      ?.filter((inv: any) => inv.court_booking_id === id)
      .reduce((sum: number, inv: any) => sum + Number(inv.total_amount), 0) || 0;

    const serviceFee = booking.service_booking
      ?.flatMap((sb: any) => sb.invoice || [])
      .reduce((sum: number, inv: any) => sum + Number(inv.total_amount), 0) || 0;

    return {
      id: booking.id,
      code,
      branchName: booking.court?.branch?.name || '-',
      courtName: booking.court?.name || '-',
      courtType: booking.court?.court_type?.name || '-',
      customerName: booking.customer?.full_name || '-',
      employeeName: booking.employee?.full_name,
      timeRange,
      paymentStatus: (booking as any).status === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán',
      courtStatus: (booking as any).status,
      bookingDate: (booking as any).booking_date || (booking as any).bookingDate,
      createdAt: (booking as any).created_at || (booking as any).createdAt,
      customer: booking.customer,
      employee: booking.employee,
      court: booking.court,
      courtTypeData: booking.court?.court_type,
      branch: booking.court?.branch,
      slots: booking.booking_slots || [],
      invoices: [...(booking.invoice || []), ...(booking.service_booking?.flatMap((sb: any) => sb.invoice || []) || [])],
      serviceBooking: booking.service_booking?.[0],
      serviceItems: booking.service_booking?.flatMap((sb: any) => sb.service_booking_item || []) || [],
      courtFee,
      serviceFee,
      totalAmount: courtFee + serviceFee,
    };
  } catch (error) {
    console.error('Failed to fetch booking:', error);
    return null;
  }
}

/**
 * Update court time for a booking
 */
export async function updateCourtTime(
  bookingId: number,
  payload: UpdateCourtTimePayload
): Promise<void> {
  // Get current booking to extract branch_id and booking_date
  const booking = await getCourtBookingById(bookingId);
  if (!booking) throw new Error('Booking not found');

  await updateCourtBooking(
    bookingId,
    payload.court_id,
    booking.booking_date || new Date().toISOString().split('T')[0],
    JSON.stringify(payload.slots),
    booking.court?.branch_id || 1
  );
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
  await apiCancelCourtBooking(bookingId);
}

/**
 * Create a new booking
 * TODO: Implement when backend is ready
 */
export async function createBooking(input: CreateBookingInput): Promise<{ id: number }> {
  try {
    const slotsJson = JSON.stringify(input.slots);

    // Extract booking date from the first slot
    const bookingDate = input.slots[0]?.start_time.split('T')[0] || new Date().toISOString().split('T')[0];

    const request: CourtBookingRequest = {
      customerId: input.customerId,
      courtId: input.courtId,
      bookingDate,
      slots: slotsJson,
      byMonth: false, // Default to single booking
      branchId: input.branchId || 1, // Default branch or get from context
      type: "Online", // Default type
      creator: input.employeeId,
    };

    const result = await apiCreateCourtBooking(request);
    return { id: result.id };
  } catch (error) {
    console.error("Failed to create booking:", error);
    throw error;
  }
}

// -----------------------------------------------------------------------------
// Reference Data Functions
// -----------------------------------------------------------------------------

export async function fetchBranches() {
  const branches = await apiGetBranches();
  return branches.map(branch => ({
    id: branch.id,
    name: branch.name,
    address: branch.address,
    hotline: branch.hotline,
  }));
}

export async function fetchUsers(filters?: {
  type?: 'customer' | 'employee';
  role?: string;
}) {
  let customers: any[] = [];
  let employees: any[] = [];

  if (!filters?.type || filters.type === 'customer') {
    customers = await apiGetCustomers();
  }

  if (!filters?.type || filters.type === 'employee') {
    employees = await apiGetEmployees(filters?.role);
  }

  return {
    customers,
    employees,
  };
}

export async function fetchCourtTypes() {
  return apiGetCourtTypes();
}

export async function fetchCourts(branchId?: number, courtTypeId?: number) {
  if (!branchId) {
    // If no branch specified, return empty array or handle differently
    return [];
  }

  const courts = await getBranchCourts(branchId, courtTypeId);
  return courts.map(court => ({
    id: court.id,
    name: court.name,
    status: court.status,
    capacity: court.capacity,
    base_hourly_price: court.base_hourly_price,
    maintenance_date: court.maintenance_date,
    branch_id: court.branch_id,
    court_type_id: court.court_type_id,
    court_type: court.court_type,
  }));
}

export async function fetchCustomers() {
  const customers = await apiGetCustomers();
  return customers.map(customer => ({
    id: customer.id,
    full_name: customer.full_name,
    phone: customer.phone_number,
    email: customer.email,
    loyalty_points: customer.bonus_point,
    customer_level_id: customer.customer_level_id,
    user_id: customer.user_id,
    account: customer.account,
    customer_level: customer.customer_level,
  }));
}

export async function fetchEmployees() {
  const employees = await apiGetEmployees();
  return employees.map(employee => ({
    id: employee.id,
    full_name: employee.full_name,
    phone: employee.phone_number,
    email: employee.email,
    role: employee.account?.role?.name || employee.status, // Use role name from account, fallback to status
    branch_id: employee.branch_id,
    user_id: employee.user_id,
    account: employee.account,
    branch: employee.branch,
    commission_rate: employee.commission_rate,
    base_salary: employee.base_salary,
  }));
}
