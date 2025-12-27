// Mock data repository for court management
// Seed data derived from create_db.sql and create_data.sql

import type {
  Court,
  CourtType,
  Branch,
  MaintenanceReport,
  CourtBookingSummary,
  CreateCourtPayload,
  UpdateCourtPayload,
  CreateMaintenanceReportPayload,
} from "./types";
import {
  mockCourtTypes,
  mockBranches,
  mockCourts as baseCourts,
} from "@/features/booking/mock/mockRepo";
import { mockCourtBookings, mockInvoices } from "@/features/booking/mock/mockRepo";
import { mockCustomers } from "@/features/booking/mock/mockRepo";
import { mockEmployees } from "@/features/employee/mockRepo";

// Enhanced Courts with status and capacity
let mockCourts: Court[] = baseCourts.map((court) => ({
  id: court.id,
  name: court.name,
  status: "Available" as const,
  capacity: 4, // Default capacity
  base_hourly_price: court.base_hourly_price,
  branch_id: court.branch_id,
  branch_name: mockBranches.find((b) => b.id === court.branch_id)?.name || "",
  court_type_id: court.court_type_id,
  court_type_name:
    mockCourtTypes.find((ct) => ct.id === court.court_type_id)?.name || "",
}));

// Set some courts to different statuses
mockCourts[3] = { ...mockCourts[3], status: "Maintenance" };
mockCourts[5] = { ...mockCourts[5], status: "InUse" };

// Maintenance Reports (in-memory store)
let mockMaintenanceReports: MaintenanceReport[] = [
  {
    id: 1,
    court_id: 4,
    date: "2025-10-15",
    description: "Thay lưới và sửa chữa mặt sân",
    cost: 5000000,
    employee_id: 3,
    employee_name: mockEmployees.find((e) => e.id === 3)?.full_name || "",
    status_after: "Available",
  },
  {
    id: 2,
    court_id: 4,
    date: "2025-08-20",
    description: "Bảo trì định kỳ",
    cost: 3000000,
    employee_id: 3,
    employee_name: mockEmployees.find((e) => e.id === 3)?.full_name || "",
    status_after: "Available",
  },
];

// Auto-increment IDs
let nextCourtId = Math.max(...mockCourts.map((c) => c.id), 0) + 1;
let nextMaintenanceId =
  Math.max(...mockMaintenanceReports.map((m) => m.id), 0) + 1;

// Repository functions
export async function listCourts(): Promise<Court[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockCourts;
}

export async function getCourt(id: number): Promise<Court | null> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return mockCourts.find((c) => c.id === id) || null;
}

export async function addCourt(payload: CreateCourtPayload): Promise<Court> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const courtType = mockCourtTypes.find(
    (ct) => ct.id === payload.court_type_id
  );
  const branch = mockBranches.find((b) => b.id === payload.branch_id);

  const newCourt: Court = {
    id: nextCourtId++,
    name: payload.name,
    status: payload.status,
    capacity: payload.capacity,
    base_hourly_price: payload.base_hourly_price,
    maintenance_date: payload.maintenance_date,
    branch_id: payload.branch_id,
    branch_name: branch?.name || "",
    court_type_id: payload.court_type_id,
    court_type_name: courtType?.name || "",
  };

  mockCourts.push(newCourt);
  return newCourt;
}

export async function updateCourt(
  id: number,
  payload: UpdateCourtPayload
): Promise<Court> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const court = mockCourts.find((c) => c.id === id);
  if (!court) throw new Error("Court not found");

  // Update fields
  if (payload.name !== undefined) court.name = payload.name;
  if (payload.status !== undefined) court.status = payload.status;
  if (payload.capacity !== undefined) court.capacity = payload.capacity;
  if (payload.base_hourly_price !== undefined)
    court.base_hourly_price = payload.base_hourly_price;
  if (payload.maintenance_date !== undefined)
    court.maintenance_date = payload.maintenance_date;

  // Update type if changed
  if (
    payload.court_type_id !== undefined &&
    payload.court_type_id !== court.court_type_id
  ) {
    const courtType = mockCourtTypes.find(
      (ct) => ct.id === payload.court_type_id
    );
    court.court_type_id = payload.court_type_id;
    court.court_type_name = courtType?.name || "";
  }

  // Update branch if changed
  if (
    payload.branch_id !== undefined &&
    payload.branch_id !== court.branch_id
  ) {
    const branch = mockBranches.find((b) => b.id === payload.branch_id);
    court.branch_id = payload.branch_id;
    court.branch_name = branch?.name || "";
  }

  return court;
}

export async function getMaintenanceReports(
  courtId: number
): Promise<MaintenanceReport[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return mockMaintenanceReports.filter((m) => m.court_id === courtId);
}

export async function addMaintenanceReport(
  payload: CreateMaintenanceReportPayload
): Promise<MaintenanceReport> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const employee = mockEmployees.find((e) => e.id === payload.employee_id);

  const newReport: MaintenanceReport = {
    id: nextMaintenanceId++,
    ...payload,
    employee_name: employee?.full_name || "",
  };

  mockMaintenanceReports.push(newReport);

  // Update court status
  const court = mockCourts.find((c) => c.id === payload.court_id);
  if (court) {
    court.status = payload.status_after;
    court.maintenance_date = payload.date;
  }

  return newReport;
}

export async function getBookingsForCourt(
  courtId: number
): Promise<CourtBookingSummary[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const bookings = mockCourtBookings.filter((b) => b.court_id === courtId);

  return bookings.map((booking) => {
    const customer = mockCustomers.find((c) => c.id === booking.customer_id);
    const slots = booking.slots || [];

    // Get time range
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
      booking_code: bookingCode,
      customer_name: customer?.full_name || "-",
      date: booking.created_at.split("T")[0],
      time_range: timeRange,
      payment_status: paymentStatus,
      total_amount: totalAmount,
    };
  });
}
// Export mock data for direct access
export { mockCourtTypes, mockBranches };
