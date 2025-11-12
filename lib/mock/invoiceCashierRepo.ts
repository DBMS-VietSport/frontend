// Mock repository for cashier invoice operations
import {
  listBookings,
  getInvoicesFor,
  getServicesFor,
} from "@/lib/booking/mockRepo";
import { makeBookingCode } from "@/lib/booking/selectors";
import { formatTime } from "@/lib/booking/pricing";
import {
  mockBranches,
  mockCourts,
  mockCustomers,
  mockServices,
  mockBranchServices,
} from "@/lib/booking/mockRepo";
import type { Invoice, CourtBooking } from "@/lib/booking/types";

// In-memory store for cashier invoices (in real app, this would be in database)
let cashierInvoices: Invoice[] = [];
let nextCashierInvoiceId = 1000; // Start from 1000 to avoid conflicts

export interface BookingForInvoice {
  bookingCode: string;
  bookingId: number;
  customerName: string;
  branch: string;
  branchId: number;
  court: string;
  timeRange: string;
  basePrice: number;
  services: Array<{
    name: string;
    qty: number;
    price: number;
    isFacility?: boolean;
  }>;
}

export interface InvoiceRow {
  id: number;
  code: string;
  customerName: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

export interface CreateInvoicePayload {
  court_booking_id: number;
  service_items?: Array<{
    branch_service_id: number;
    quantity: number;
  }>;
  discount_percent?: number;
  payment_method: string;
}

export interface UnpaidBookingItem {
  bookingCode: string;
  bookingId: number;
  customerName: string;
  branch: string;
  court: string;
  timeRange: string;
  createdAt: string;
}

// Get booking info by booking code
export async function getBookingForInvoice(
  bookingCode: string
): Promise<BookingForInvoice | null> {
  // Parse booking code: VS-{id}-{YYYYMMDD}
  const match = bookingCode.match(/^VS-(\d+)-(\d{8})$/);
  if (!match) {
    return null;
  }

  const bookingId = parseInt(match[1], 10);
  const bookings = await listBookings();
  const booking = bookings.find((b) => b.id === bookingId);

  if (!booking) {
    return null;
  }

  // Get customer
  const customer = mockCustomers.find((c) => c.id === booking.customer_id);
  if (!customer) {
    return null;
  }

  // Get court
  const court = mockCourts.find((c) => c.id === booking.court_id);
  if (!court) {
    return null;
  }

  // Get branch
  const branch = mockBranches.find((b) => b.id === court.branch_id);
  if (!branch) {
    return null;
  }

  // Get time range
  const slots = booking.slots || [];
  let timeRange = "-";
  if (slots.length > 0) {
    const starts = slots.map((s) => new Date(s.start_time));
    const ends = slots.map((s) => new Date(s.end_time));
    const minStart = new Date(Math.min(...starts.map((d) => d.getTime())));
    const maxEnd = new Date(Math.max(...ends.map((d) => d.getTime())));
    timeRange = `${formatTime(minStart.toISOString())} - ${formatTime(
      maxEnd.toISOString()
    )}`;
  }

  // Calculate base price (court fee)
  const courtType = slots.length > 0 ? slots[0] : null;
  let basePrice = 0;
  if (courtType) {
    const startTime = new Date(courtType.start_time);
    const endTime = new Date(courtType.end_time);
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    basePrice = court.base_hourly_price * hours * slots.length;
  }

  // Get existing services
  const { items: serviceItems } = await getServicesFor(bookingId);
  const services: BookingForInvoice["services"] = [];

  for (const serviceItem of serviceItems) {
    const branchService = mockBranchServices.find(
      (bs) => bs.id === serviceItem.branch_service_id
    );
    if (!branchService) continue;

    const service = mockServices.find((s) => s.id === branchService.service_id);
    if (!service) continue;

    services.push({
      name: service.name,
      qty: serviceItem.quantity,
      price: branchService.unit_price * serviceItem.quantity,
      isFacility: service.rental_type === "Tiện ích",
    });
  }

  return {
    bookingCode,
    bookingId: booking.id,
    customerName: customer.full_name,
    branch: branch.name,
    branchId: branch.id,
    court: court.name || `Sân ${court.id}`,
    timeRange,
    basePrice,
    services,
  };
}

// List unpaid bookings
export async function listUnpaidBookings(): Promise<UnpaidBookingItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const bookings = await listBookings();
  const unpaidBookings: UnpaidBookingItem[] = [];

  for (const booking of bookings) {
    // Skip cancelled bookings
    if (booking.status === "Cancelled") {
      continue;
    }

    // Get invoices for this booking
    const invoices = await getInvoicesFor(booking.id);

    // Check if booking is unpaid (no paid invoice)
    const hasPaidInvoice = invoices.some(
      (inv) =>
        (inv.court_booking_id === booking.id || inv.service_booking_id) &&
        inv.status === "Paid"
    );

    if (!hasPaidInvoice) {
      // Get customer
      const customer = mockCustomers.find((c) => c.id === booking.customer_id);
      if (!customer) continue;

      // Get court
      const court = mockCourts.find((c) => c.id === booking.court_id);
      if (!court) continue;

      // Get branch
      const branch = mockBranches.find((b) => b.id === court.branch_id);
      if (!branch) continue;

      // Get time range
      const slots = booking.slots || [];
      let timeRange = "-";
      if (slots.length > 0) {
        const starts = slots.map((s) => new Date(s.start_time));
        const ends = slots.map((s) => new Date(s.end_time));
        const minStart = new Date(Math.min(...starts.map((d) => d.getTime())));
        const maxEnd = new Date(Math.max(...ends.map((d) => d.getTime())));
        timeRange = `${formatTime(minStart.toISOString())} - ${formatTime(
          maxEnd.toISOString()
        )}`;
      }

      // Generate booking code
      const bookingCode = makeBookingCode(booking.id, booking.created_at);

      unpaidBookings.push({
        bookingCode,
        bookingId: booking.id,
        customerName: customer.full_name,
        branch: branch.name,
        court: court.name || `Sân ${court.id}`,
        timeRange,
        createdAt: booking.created_at,
      });
    }
  }

  // Sort by created_at desc (most recent first)
  unpaidBookings.sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  return unpaidBookings;
}

// List invoices from current shift (today)
export async function listInvoicesOfCurrentShift(
  cashierUsername: string
): Promise<InvoiceRow[]> {
  // Get all invoices from both booking invoices and cashier invoices
  const allBookings = await listBookings();
  const allInvoices: Invoice[] = [...cashierInvoices];

  for (const booking of allBookings) {
    const invoices = await getInvoicesFor(booking.id);
    allInvoices.push(...invoices);
  }

  // Filter by today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayInvoices = allInvoices.filter((inv) => {
    if (!inv.created_at) return false;
    const invDate = new Date(inv.created_at);
    invDate.setHours(0, 0, 0, 0);
    return invDate.getTime() === today.getTime();
  });

  // Transform to InvoiceRow
  const invoiceRows: InvoiceRow[] = [];

  for (const invoice of todayInvoices) {
    // Find booking - cashier invoices always have court_booking_id
    let booking = null;
    if (invoice.court_booking_id) {
      booking = allBookings.find((b) => b.id === invoice.court_booking_id);
    } else if (invoice.service_booking_id) {
      // For service invoices, find by service_booking_id
      // We need to find the service booking first, then the court booking
      // This is handled in getInvoicesFor, but for now we'll skip service-only invoices
      // or find them through the service booking
      continue;
    }

    if (!booking) continue;

    // Get customer
    const customer = mockCustomers.find((c) => c.id === booking.customer_id);
    if (!customer) continue;

    // Generate invoice code: IN-{id}-{YYYYMMDD}
    const date = invoice.created_at ? new Date(invoice.created_at) : new Date();
    const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
    const invoiceCode = `IN-${invoice.id}-${dateStr}`;

    invoiceRows.push({
      id: invoice.id,
      code: invoiceCode,
      customerName: customer.full_name,
      totalAmount: invoice.total_amount,
      status: invoice.status,
      createdAt: invoice.created_at || new Date().toISOString(),
    });
  }

  // Sort by created_at desc
  invoiceRows.sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateB.getTime() - dateA.getTime();
  });

  return invoiceRows;
}

// Create invoice
export async function createInvoice(
  payload: CreateInvoicePayload
): Promise<number> {
  // Calculate total amount
  let totalAmount = 0;

  // Get court booking
  const bookings = await listBookings();
  const booking = bookings.find((b) => b.id === payload.court_booking_id);
  if (!booking) {
    throw new Error("Booking not found");
  }

  // Calculate court fee
  const court = mockCourts.find((c) => c.id === booking.court_id);
  if (!court) {
    throw new Error("Court not found");
  }

  const slots = booking.slots || [];
  if (slots.length > 0) {
    const startTime = new Date(slots[0].start_time);
    const endTime = new Date(slots[slots.length - 1].end_time);
    const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    totalAmount += court.base_hourly_price * hours * slots.length;
  }

  // Add service fees
  if (payload.service_items) {
    for (const item of payload.service_items) {
      const branchService = mockBranchServices.find(
        (bs) => bs.id === item.branch_service_id
      );
      if (branchService) {
        totalAmount += branchService.unit_price * item.quantity;
      }
    }
  }

  // Apply discount
  if (payload.discount_percent) {
    totalAmount = totalAmount * (1 - payload.discount_percent / 100);
  }

  // Create invoice and store it in cashier invoices
  const newInvoiceId = nextCashierInvoiceId++;

  const newInvoice: Invoice = {
    id: newInvoiceId,
    total_amount: Math.round(totalAmount),
    payment_method: payload.payment_method,
    status: "Paid",
    court_booking_id: payload.court_booking_id,
    service_booking_id: null,
    created_at: new Date().toISOString(),
  };

  // Store invoice in cashier invoices
  cashierInvoices.push(newInvoice);

  return newInvoiceId;
}

export const invoiceCashierRepo = {
  getBookingForInvoice,
  listUnpaidBookings,
  listInvoicesOfCurrentShift,
  createInvoice,
};
