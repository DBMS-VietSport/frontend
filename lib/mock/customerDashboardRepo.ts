/**
 * Mock Customer Dashboard Repository
 * Provides stats and data for customer dashboard
 */

import {
  mockCourtBookings,
  mockInvoices,
  mockServiceBookings,
  mockCourts,
  mockBranches,
} from "@/lib/booking/mockRepo";
import { listCustomers } from "@/lib/customers/mockRepo";
import type { CourtBooking, BookingSlot, Invoice } from "@/lib/types";
import type { Customer } from "@/lib/customers/types";
import { MOCK_USERS } from "@/lib/mock/authMock";

export interface UpcomingBooking {
  id: number;
  branch: string;
  courtName: string;
  date: string;
  timeRange: string;
  status: "Paid" | "Held" | "Booked" | "Cancelled";
}

export interface CustomerBookingStat {
  totalBookings: number; // tổng số lần đặt sân
  totalPlayHours: number; // tổng số giờ đã chơi (tính từ booking_slots)
  upcomingBookings: UpcomingBooking[];
  membershipLevel: string; // Platinum / Gold / Silver / Thường
  totalServiceSpending: number;
}

/**
 * Map username from auth to customer_id
 */
function getCustomerIdByUsername(username: string): number | null {
  const user = MOCK_USERS.find((u) => u.username === username);
  if (!user || user.role !== "customer") {
    return null;
  }

  // Map common customer usernames to customer IDs
  const usernameToCustomerId: Record<string, number> = {
    "customer.a": 1,
    "customer.b": 2,
    "customer.hcm": 3,
    "customer.hn": 4,
  };

  if (usernameToCustomerId[username]) {
    return usernameToCustomerId[username];
  }

  // Fallback: try to find customer by email (username is email in some cases)
  // This is a simplified mapping - in production, you'd query the database
  return null;
}

/**
 * Calculate total play hours from booking slots
 */
function calculateTotalPlayHours(bookings: CourtBooking[]): number {
  let totalHours = 0;

  for (const booking of bookings) {
    const slots = booking.slots || [];
    for (const slot of slots) {
      const start = new Date(slot.start_time);
      const end = new Date(slot.end_time);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      totalHours += hours;
    }
  }

  return Math.round(totalHours * 10) / 10; // Round to 1 decimal place
}

/**
 * Get upcoming bookings (future bookings that are not cancelled)
 */
function getUpcomingBookings(
  bookings: CourtBooking[],
  customerId: number
): UpcomingBooking[] {
  const now = new Date();
  interface UpcomingBookingWithISO extends UpcomingBooking {
    dateISO: string;
  }
  const upcoming: UpcomingBookingWithISO[] = [];

  for (const booking of bookings) {
    if (booking.customer_id !== customerId) continue;
    if (booking.status === "Cancelled") continue;

    // Check if any slot is in the future
    const slots = booking.slots || [];
    const hasFutureSlot = slots.some((slot) => {
      const slotDate = new Date(slot.start_time);
      return slotDate >= now;
    });

    if (!hasFutureSlot) continue;

    // Get court and branch info
    const court = mockCourts.find((c) => c.id === booking.court_id);
    const branch = court
      ? mockBranches.find((b) => b.id === court.branch_id)
      : null;

    // Get time range (slots already defined above)
    let timeRange = "-";
    let date = "-";
    let dateISO = "";
    if (slots.length > 0) {
      const firstSlot = slots[0];
      const lastSlot = slots[slots.length - 1];
      const startDate = new Date(firstSlot.start_time);
      const endDate = new Date(lastSlot.end_time);

      dateISO = startDate.toISOString();
      date = startDate.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });

      timeRange = `${startDate.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${endDate.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // Get invoice status - prioritize invoice status, fallback to booking status
    const invoice = mockInvoices.find(
      (inv) => inv.court_booking_id === booking.id
    );
    let status: "Paid" | "Held" | "Booked" | "Cancelled" = "Booked";

    if (booking.status === "Paid" || (invoice && invoice.status === "Paid")) {
      status = "Paid";
    } else if (
      booking.status === "Held" ||
      (invoice && invoice.status !== "Paid")
    ) {
      status = "Held";
    } else if (booking.status === "Booked" || booking.status === "Pending") {
      // Map "Booked" and "Pending" to "Held" for display
      status = "Held";
    }

    if (dateISO) {
      upcoming.push({
        id: booking.id,
        branch: branch?.name || "-",
        courtName: court?.name || `Sân ${court?.id || "?"}`,
        date,
        timeRange,
        status,
        dateISO, // Store ISO for sorting
      });
    }
  }

  // Sort by date (earliest first) using dateISO
  upcoming.sort((a, b) => {
    return new Date(a.dateISO).getTime() - new Date(b.dateISO).getTime();
  });

  // Remove dateISO before returning
  return upcoming.slice(0, 10).map(({ dateISO, ...rest }) => rest);
}

/**
 * Calculate total service spending
 */
function calculateTotalServiceSpending(customerId: number): number {
  let total = 0;

  // Get all court bookings for this customer
  const customerCourtBookingIds = mockCourtBookings
    .filter((b) => b.customer_id === customerId)
    .map((b) => b.id);

  // Find all service bookings linked to customer's court bookings
  const customerServiceBookings = mockServiceBookings.filter((sb) =>
    customerCourtBookingIds.includes(sb.court_booking_id)
  );

  // Calculate total from service invoices
  for (const serviceBooking of customerServiceBookings) {
    const invoice = mockInvoices.find(
      (inv) => inv.service_booking_id === serviceBooking.id
    );

    if (invoice) {
      total += invoice.total_amount;
    }
  }

  return total;
}

export const customerDashboardRepo = {
  async getStats(username: string): Promise<CustomerBookingStat> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 100));

    const customerId = getCustomerIdByUsername(username);
    if (!customerId) {
      // Return empty stats if customer not found
      return {
        totalBookings: 0,
        totalPlayHours: 0,
        upcomingBookings: [],
        membershipLevel: "Thường",
        totalServiceSpending: 0,
      };
    }

    // Get customer info for membership level
    const customers = await listCustomers();
    const customer = customers.find((c) => c.id === customerId);
    const membershipLevel = customer?.customer_level_name || "Thường";

    // Get all bookings for this customer
    const customerBookings = mockCourtBookings.filter(
      (b) => b.customer_id === customerId
    );

    // Calculate stats
    const totalBookings = customerBookings.length;
    const totalPlayHours = calculateTotalPlayHours(customerBookings);
    const upcomingBookings = getUpcomingBookings(mockCourtBookings, customerId);
    const totalServiceSpending = calculateTotalServiceSpending(customerId);

    return {
      totalBookings,
      totalPlayHours,
      upcomingBookings,
      membershipLevel,
      totalServiceSpending,
    };
  },
};
