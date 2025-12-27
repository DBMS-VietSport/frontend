/**
 * Mock data for Booking Flow
 * Used for testing the new wizard-style booking flow
 */

import type { Customer } from "@/features/booking/components/shared/CustomerSelector";
import type { CourtBookingOption } from "@/features/booking/components/shared/BookingSelector";

// Mock customers for testing
export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    name: "Nguyễn Văn A",
    phone: "0901234567",
    email: "vana@example.com",
  },
  {
    id: "cust-2",
    name: "Trần Thị B",
    phone: "0912345678",
    email: "thib@example.com",
  },
  {
    id: "cust-3",
    name: "Lê Văn C",
    phone: "0923456789",
    email: "vanc@example.com",
  },
  {
    id: "cust-4",
    name: "Phạm Thị D",
    phone: "0934567890",
    email: "thid@example.com",
  },
  {
    id: "cust-5",
    name: "Hoàng Văn E",
    phone: "0945678901",
    email: "vane@example.com",
  },
];

// Mock court bookings for testing
export const MOCK_COURT_BOOKINGS: CourtBookingOption[] = [
  {
    id: "BK-001",
    bookingRef: "BK-20251121-001",
    courtName: "Sân Cầu Lông 1",
    courtType: "Cầu lông",
    date: new Date(),
    timeRange: "08:00 - 10:00",
    status: "held",
    totalAmount: 100000,
  },
  {
    id: "BK-002",
    bookingRef: "BK-20251121-002",
    courtName: "Sân Tennis 2",
    courtType: "Tennis",
    date: new Date(),
    timeRange: "14:00 - 16:00",
    status: "pending",
    totalAmount: 200000,
  },
  {
    id: "BK-003",
    bookingRef: "BK-20251121-003",
    courtName: "Sân Bóng đá 1",
    courtType: "Bóng đá",
    date: new Date(),
    timeRange: "16:00 - 18:00",
    status: "confirmed",
    totalAmount: 300000,
  },
  {
    id: "BK-004",
    bookingRef: "BK-20251120-004",
    courtName: "Sân Cầu Lông 2",
    courtType: "Cầu lông",
    date: new Date(Date.now() - 86400000), // Yesterday
    timeRange: "09:00 - 11:00",
    status: "paid",
    totalAmount: 100000,
  },
];

// Helper function to get bookings by customer ID
export function getBookingsByCustomerId(
  customerId: string
): CourtBookingOption[] {
  // In production, this would filter by actual customer ID
  // For now, return all bookings for demo
  return MOCK_COURT_BOOKINGS;
}

// Helper function to get bookings that need payment
export function getPendingPaymentBookings(): CourtBookingOption[] {
  return MOCK_COURT_BOOKINGS.filter(
    (b) => b.status === "held" || b.status === "pending"
  );
}

// Helper function to get customer by ID
export function getCustomerById(id: string): Customer | undefined {
  return MOCK_CUSTOMERS.find((c) => c.id === id);
}

// Helper function to search customers
export function searchCustomers(query: string): Customer[] {
  const lowerQuery = query.toLowerCase();
  return MOCK_CUSTOMERS.filter(
    (c) =>
      c.name.toLowerCase().includes(lowerQuery) ||
      c.phone?.includes(query) ||
      c.email?.toLowerCase().includes(lowerQuery)
  );
}
