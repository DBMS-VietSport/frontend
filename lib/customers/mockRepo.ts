// Mock data repository for customer management
// Seed data derived from create_db.sql and create_data.sql

import type {
  Customer,
  CustomerLevel,
  BookingSummary,
  InvoiceSummary,
  CreateCustomerPayload,
  UpdateCustomerPayload,
} from "./types";
import {
  mockCourtBookings,
  mockInvoices,
  mockCustomers as baseCustomers,
} from "@/lib/booking/mockRepo";
import { mockCourts, mockCourtTypes } from "@/lib/booking/mockRepo";
import { mockServiceBookings } from "@/lib/booking/mockRepo";

// Customer Levels
export const mockCustomerLevels: CustomerLevel[] = [
  { id: 1, name: "Platinum", discount_rate: 20, minimum_point: 1000 },
  { id: 2, name: "Gold", discount_rate: 15, minimum_point: 500 },
  { id: 3, name: "Silver", discount_rate: 10, minimum_point: 200 },
  { id: 4, name: "Thường", discount_rate: 0, minimum_point: 0 },
];

// Enhanced Customers with level info
let mockCustomers: Customer[] = baseCustomers.map((c) => {
  // Assign levels based on points (mock logic)
  let levelId = 4; // Default to "Thường"
  let points = 0;

  if (c.id === 2) {
    levelId = 1; // Platinum
    points = 1000;
  } else if (c.id === 1) {
    levelId = 2; // Gold
    points = 600;
  } else if (c.id === 3) {
    levelId = 3; // Silver
    points = 250;
  }

  const level =
    mockCustomerLevels.find((l) => l.id === levelId) || mockCustomerLevels[3];

  return {
    id: c.id,
    full_name: c.full_name,
    dob: "1990-01-01",
    gender: "Nam" as const,
    id_card_number: `0${c.id.toString().padStart(8, "0")}`,
    address: `123 Đường ABC, Quận ${c.id}, TP.HCM`,
    phone_number: c.phone_number,
    email: c.email,
    bonus_point: points,
    customer_level_id: levelId,
    customer_level_name: level.name,
    discount_rate: level.discount_rate,
  };
});

// Auto-increment ID
let nextCustomerId = Math.max(...mockCustomers.map((c) => c.id), 0) + 1;

// Repository functions
export async function listCustomers(): Promise<Customer[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockCustomers;
}

export async function getCustomer(id: number): Promise<Customer | null> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return mockCustomers.find((c) => c.id === id) || null;
}

export async function addCustomer(
  payload: CreateCustomerPayload
): Promise<Customer> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const level =
    mockCustomerLevels.find((l) => l.id === payload.customer_level_id) ||
    mockCustomerLevels[3];

  const newCustomer: Customer = {
    id: nextCustomerId++,
    ...payload,
    bonus_point: 0,
    customer_level_name: level.name,
    discount_rate: level.discount_rate,
  };

  mockCustomers.push(newCustomer);
  return newCustomer;
}

export async function updateCustomer(
  id: number,
  payload: UpdateCustomerPayload
): Promise<Customer> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const customer = mockCustomers.find((c) => c.id === id);
  if (!customer) throw new Error("Customer not found");

  // Update fields
  if (payload.full_name !== undefined) customer.full_name = payload.full_name;
  if (payload.dob !== undefined) customer.dob = payload.dob;
  if (payload.gender !== undefined) customer.gender = payload.gender;
  if (payload.id_card_number !== undefined)
    customer.id_card_number = payload.id_card_number;
  if (payload.address !== undefined) customer.address = payload.address;
  if (payload.phone_number !== undefined)
    customer.phone_number = payload.phone_number;
  if (payload.email !== undefined) customer.email = payload.email;

  // Update level if changed
  if (
    payload.customer_level_id !== undefined &&
    payload.customer_level_id !== customer.customer_level_id
  ) {
    const level =
      mockCustomerLevels.find((l) => l.id === payload.customer_level_id) ||
      mockCustomerLevels[3];
    customer.customer_level_id = payload.customer_level_id;
    customer.customer_level_name = level.name;
    customer.discount_rate = level.discount_rate;
  }

  return customer;
}

export async function getCustomerBookings(
  customerId: number
): Promise<BookingSummary[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const bookings = mockCourtBookings.filter(
    (b) => b.customer_id === customerId
  );

  return bookings.map((booking) => {
    const court = mockCourts.find((c) => c.id === booking.court_id);
    const courtType = court
      ? mockCourtTypes.find((ct) => ct.id === court.court_type_id)
      : null;

    // Get time range
    const slots = booking.slots || [];
    let timeRange = "-";
    if (slots.length > 0) {
      const start = new Date(slots[0].start_time);
      const end = new Date(slots[slots.length - 1].end_time);
      timeRange = `${start.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${end.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // Get invoice for payment status
    const invoice = mockInvoices.find(
      (inv) => inv.court_booking_id === booking.id
    );
    const paymentStatus =
      invoice?.status === "Paid" ? "Đã thanh toán" : "Chưa thanh toán";
    const totalAmount = invoice?.total_amount || 0;

    // Generate booking code
    const date = new Date(booking.created_at);
    const dateStr = date.toISOString().split("T")[0].replace(/-/g, "");
    const bookingCode = `VS-${booking.id}-${dateStr}`;

    return {
      id: booking.id,
      court_name: court?.name || `Sân ${court?.id || "?"}`,
      type: booking.type,
      date: booking.created_at.split("T")[0],
      time_range: timeRange,
      payment_status: paymentStatus,
      total_amount: totalAmount,
      booking_code: bookingCode,
    };
  });
}

export async function getCustomerInvoices(
  customerId: number
): Promise<InvoiceSummary[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Get all bookings for this customer
  const bookings = mockCourtBookings.filter(
    (b) => b.customer_id === customerId
  );
  const bookingIds = bookings.map((b) => b.id);

  // Get service booking IDs
  const serviceBookings = mockServiceBookings.filter((sb) =>
    bookings.some((b) => b.id === sb.court_booking_id)
  );
  const serviceBookingIds = serviceBookings.map((sb) => sb.id);

  // Get invoices for these bookings
  const invoices = mockInvoices.filter(
    (inv) =>
      (inv.court_booking_id && bookingIds.includes(inv.court_booking_id)) ||
      (inv.service_booking_id &&
        serviceBookingIds.includes(inv.service_booking_id))
  );

  return invoices.map((inv) => ({
    id: inv.id,
    created_at: inv.created_at || inv.court_booking_id?.toString() || "",
    total_amount: inv.total_amount,
    payment_method: inv.payment_method,
    status: inv.status,
    invoice_type: inv.court_booking_id ? "Court" : "Service",
  }));
}
