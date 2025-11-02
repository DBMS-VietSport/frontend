// Mock data repository - simulates database layer
// Seed data derived from create_db.sql and create_data.sql

import type {
  Branch,
  CourtType,
  Court,
  Customer,
  Employee,
  CourtBooking,
  BookingSlot,
  Service,
  BranchService,
  ServiceBooking,
  ServiceBookingItem,
  Invoice,
  UpdateCourtTimePayload,
  UpdateServicesPayload,
} from "./types";

// Branches
export const mockBranches: Branch[] = [
  { id: 1, name: "Hồ Chí Minh", address: "Quận 1, TP.HCM" },
  { id: 2, name: "Hà Nội", address: "Hoàn Kiếm, Hà Nội" },
  { id: 3, name: "Cần Thơ", address: "Ninh Kiều, Cần Thơ" },
];

// Court Types
export const mockCourtTypes: CourtType[] = [
  { id: 1, name: "Cầu lông", rent_duration: 60 },
  { id: 2, name: "Bóng rổ", rent_duration: 60 },
  { id: 3, name: "Tennis", rent_duration: 120 },
  { id: 4, name: "Bóng đá mini", rent_duration: 90 },
  { id: 5, name: "Futsal", rent_duration: 90 },
];

// Courts
export const mockCourts: Court[] = [
  {
    id: 1,
    name: "Sân 1",
    court_type_id: 1,
    branch_id: 1,
    base_hourly_price: 100000,
  },
  {
    id: 2,
    name: "Sân 2",
    court_type_id: 1,
    branch_id: 1,
    base_hourly_price: 100000,
  },
  {
    id: 3,
    name: "Sân 3",
    court_type_id: 1,
    branch_id: 1,
    base_hourly_price: 120000,
  },
  {
    id: 4,
    name: "Sân Futsal 1",
    court_type_id: 5,
    branch_id: 1,
    base_hourly_price: 200000,
  },
  {
    id: 5,
    name: "Sân 1",
    court_type_id: 1,
    branch_id: 3,
    base_hourly_price: 80000,
  },
  {
    id: 6,
    name: "Sân Futsal 1",
    court_type_id: 5,
    branch_id: 3,
    base_hourly_price: 150000,
  },
  {
    id: 7,
    name: "Sân Tennis 1",
    court_type_id: 3,
    branch_id: 2,
    base_hourly_price: 150000,
  },
  {
    id: 8,
    name: "Sân Bóng rổ 1",
    court_type_id: 2,
    branch_id: 2,
    base_hourly_price: 120000,
  },
];

// Customers
export const mockCustomers: Customer[] = [
  {
    id: 1,
    full_name: "Nguyễn Văn An",
    phone_number: "0901234567",
    email: "nguyenvanan@gmail.com",
  },
  {
    id: 2,
    full_name: "Trần Thị Bình",
    phone_number: "0912345678",
    email: "tranthibinh@gmail.com",
  },
  {
    id: 3,
    full_name: "Lê Hoàng Cường",
    phone_number: "0923456789",
    email: "lehoangcuong@gmail.com",
  },
  {
    id: 4,
    full_name: "Phạm Minh Dũng",
    phone_number: "0934567890",
    email: "phamminhdung@gmail.com",
  },
];

// Employees
export const mockEmployees: Employee[] = [
  {
    id: 1,
    full_name: "Ngô Văn Tú",
    email: "ngovtu@vietsport.vn",
    phone_number: "0909111222",
  },
  {
    id: 2,
    full_name: "Đặng Thị Lan",
    email: "danglan@vietsport.vn",
    phone_number: "0909222333",
  },
  {
    id: 3,
    full_name: "Hoàng Minh Tuấn",
    email: "hoangtuan@vietsport.vn",
    phone_number: "0909333444",
  },
];

// Services
export const mockServices: Service[] = [
  { id: 1, name: "Thuê bóng cầu lông", unit: "Lần", rental_type: "Dụng cụ" },
  { id: 2, name: "Thuê vợt cầu lông", unit: "Giờ", rental_type: "Dụng cụ" },
  { id: 3, name: "Thuê tủ đồ", unit: "Lần", rental_type: "Tiện ích" },
  { id: 4, name: "Nước suối", unit: "Lần", rental_type: "Tiện ích" },
  {
    id: 5,
    name: "Huấn luyện viên cầu lông",
    unit: "Giờ",
    rental_type: "Nhân sự",
  },
  { id: 6, name: "Trọng tài Futsal", unit: "Trận", rental_type: "Nhân sự" },
  { id: 7, name: "Thuê bóng Futsal", unit: "Lần", rental_type: "Dụng cụ" },
];

// Branch Services
export const mockBranchServices: BranchService[] = [
  { id: 1, branch_id: 1, service_id: 1, unit_price: 5000 },
  { id: 2, branch_id: 1, service_id: 2, unit_price: 10000 },
  { id: 3, branch_id: 1, service_id: 3, unit_price: 10000 },
  { id: 4, branch_id: 1, service_id: 4, unit_price: 10000 },
  { id: 5, branch_id: 1, service_id: 5, unit_price: 100000 },
  { id: 6, branch_id: 1, service_id: 6, unit_price: 150000 },
  { id: 7, branch_id: 1, service_id: 7, unit_price: 5000 },
  { id: 11, branch_id: 3, service_id: 1, unit_price: 4000 },
  { id: 12, branch_id: 3, service_id: 2, unit_price: 8000 },
  { id: 13, branch_id: 3, service_id: 3, unit_price: 8000 },
  { id: 14, branch_id: 3, service_id: 4, unit_price: 8000 },
  { id: 15, branch_id: 3, service_id: 7, unit_price: 4000 },
];

// Booking Slots (in-memory store)
let mockBookingSlots: BookingSlot[] = [
  {
    id: 1,
    start_time: "2025-11-02T08:00:00+07:00",
    end_time: "2025-11-02T09:00:00+07:00",
    status: "Held",
    court_booking_id: 1,
  },
  {
    id: 2,
    start_time: "2025-11-02T14:00:00+07:00",
    end_time: "2025-11-02T15:30:00+07:00",
    status: "Held",
    court_booking_id: 2,
  },
  {
    id: 3,
    start_time: "2025-11-03T10:00:00+07:00",
    end_time: "2025-11-03T11:00:00+07:00",
    status: "Booked",
    court_booking_id: 3,
  },
  {
    id: 4,
    start_time: "2025-11-01T16:00:00+07:00",
    end_time: "2025-11-01T17:00:00+07:00",
    status: "Paid",
    court_booking_id: 4,
  },
  {
    id: 5,
    start_time: "2025-11-01T17:00:00+07:00",
    end_time: "2025-11-01T18:00:00+07:00",
    status: "Paid",
    court_booking_id: 4,
  },
];

// Court Bookings (in-memory store)
let mockCourtBookings: CourtBooking[] = [
  {
    id: 1,
    created_at: "2025-11-01T10:00:00+07:00",
    type: "Online",
    status: "Paid",
    customer_id: 1,
    employee_id: null,
    court_id: 1,
    slots: mockBookingSlots.filter((s) => s.court_booking_id === 1),
  },
  {
    id: 2,
    created_at: "2025-11-01T14:30:00+07:00",
    type: "Direct",
    status: "Held",
    customer_id: 2,
    employee_id: 2,
    court_id: 6,
    slots: mockBookingSlots.filter((s) => s.court_booking_id === 2),
  },
  {
    id: 3,
    created_at: "2025-11-02T09:00:00+07:00",
    type: "Online",
    status: "Booked",
    customer_id: 3,
    employee_id: null,
    court_id: 3,
    slots: mockBookingSlots.filter((s) => s.court_booking_id === 3),
  },
  {
    id: 4,
    created_at: "2025-10-31T12:00:00+07:00",
    type: "Direct",
    status: "Paid",
    customer_id: 4,
    employee_id: 1,
    court_id: 7,
    slots: mockBookingSlots.filter((s) => s.court_booking_id === 4),
  },
];

// Service Bookings
let mockServiceBookings: ServiceBooking[] = [
  { id: 1, status: "Paid", court_booking_id: 1 },
  { id: 2, status: "Held", court_booking_id: 2 },
];

// Service Booking Items
let mockServiceBookingItems: ServiceBookingItem[] = [
  {
    id: 1,
    quantity: 2,
    start_time: "2025-11-02T08:00:00+07:00",
    end_time: "2025-11-02T09:00:00+07:00",
    service_booking_id: 1,
    branch_service_id: 1,
  },
  {
    id: 2,
    quantity: 1,
    start_time: "2025-11-02T08:00:00+07:00",
    end_time: "2025-11-02T09:00:00+07:00",
    service_booking_id: 1,
    branch_service_id: 3,
  },
  {
    id: 3,
    quantity: 1,
    start_time: "2025-11-02T14:00:00+07:00",
    end_time: "2025-11-02T15:30:00+07:00",
    service_booking_id: 2,
    branch_service_id: 15,
  },
];

// Invoices
let mockInvoices: Invoice[] = [
  {
    id: 1,
    total_amount: 100000,
    payment_method: "Bank Transfer",
    status: "Paid",
    court_booking_id: 1,
    service_booking_id: null,
    created_at: "2025-11-01T10:05:00+07:00",
  },
  {
    id: 2,
    total_amount: 20000,
    payment_method: "Bank Transfer",
    status: "Paid",
    court_booking_id: null,
    service_booking_id: 1,
    created_at: "2025-11-01T10:05:00+07:00",
  },
  {
    id: 3,
    total_amount: 225000,
    payment_method: "Counter",
    status: "Pending",
    court_booking_id: 2,
    service_booking_id: null,
    created_at: "2025-11-01T14:35:00+07:00",
  },
  {
    id: 4,
    total_amount: 4000,
    payment_method: "Counter",
    status: "Pending",
    court_booking_id: null,
    service_booking_id: 2,
    created_at: "2025-11-01T14:35:00+07:00",
  },
  {
    id: 5,
    total_amount: 300000,
    payment_method: "Bank Transfer",
    status: "Paid",
    court_booking_id: 4,
    service_booking_id: null,
    created_at: "2025-10-31T12:10:00+07:00",
  },
];

// Auto-increment IDs
let nextSlotId = 100;
let nextServiceItemId = 100;

// Repository functions
export async function listBookings(): Promise<CourtBooking[]> {
  // Simulate async delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Refresh slots reference for each booking
  return mockCourtBookings.map((booking) => ({
    ...booking,
    slots: mockBookingSlots.filter((s) => s.court_booking_id === booking.id),
  }));
}

export async function getBooking(id: number): Promise<CourtBooking | null> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  const booking = mockCourtBookings.find((b) => b.id === id);
  if (!booking) return null;

  return {
    ...booking,
    slots: mockBookingSlots.filter((s) => s.court_booking_id === booking.id),
  };
}

export async function getInvoicesFor(bookingId: number): Promise<Invoice[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  // Get service_booking_id for this booking
  const serviceBooking = mockServiceBookings.find(
    (sb) => sb.court_booking_id === bookingId
  );

  return mockInvoices.filter(
    (inv) =>
      inv.court_booking_id === bookingId ||
      (serviceBooking && inv.service_booking_id === serviceBooking.id)
  );
}

export async function getServicesFor(bookingId: number): Promise<{
  serviceBooking: ServiceBooking | null;
  items: ServiceBookingItem[];
}> {
  await new Promise((resolve) => setTimeout(resolve, 50));

  const serviceBooking = mockServiceBookings.find(
    (sb) => sb.court_booking_id === bookingId
  );
  if (!serviceBooking) {
    return { serviceBooking: null, items: [] };
  }

  const items = mockServiceBookingItems.filter(
    (item) => item.service_booking_id === serviceBooking.id
  );

  return { serviceBooking, items };
}

export async function updateBookingCourtTime(
  id: number,
  payload: UpdateCourtTimePayload
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const booking = mockCourtBookings.find((b) => b.id === id);
  if (!booking) throw new Error("Booking not found");

  // Remove old slots
  mockBookingSlots = mockBookingSlots.filter((s) => s.court_booking_id !== id);

  // Add new slots
  const newSlots = payload.slots.map((slot) => ({
    id: nextSlotId++,
    start_time: slot.start_time,
    end_time: slot.end_time,
    status: booking.status,
    court_booking_id: id,
  }));

  mockBookingSlots.push(...newSlots);

  // Update booking
  booking.court_id = payload.court_id;
  booking.slots = newSlots;
}

export async function updateServices(
  bookingId: number,
  payload: UpdateServicesPayload
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  let serviceBooking = mockServiceBookings.find(
    (sb) => sb.court_booking_id === bookingId
  );

  // Create service booking if doesn't exist
  if (!serviceBooking && payload.items.length > 0) {
    const newId = Math.max(...mockServiceBookings.map((sb) => sb.id), 0) + 1;
    serviceBooking = {
      id: newId,
      status: "Pending",
      court_booking_id: bookingId,
    };
    mockServiceBookings.push(serviceBooking);
  }

  if (!serviceBooking) return;

  // Remove deleted items
  if (payload.removedItemIds) {
    mockServiceBookingItems = mockServiceBookingItems.filter(
      (item) => !payload.removedItemIds!.includes(item.id)
    );
  }

  // Update or add items
  for (const itemPayload of payload.items) {
    if (itemPayload.id) {
      // Update existing
      const existingItem = mockServiceBookingItems.find(
        (item) => item.id === itemPayload.id
      );
      if (existingItem) {
        existingItem.quantity = itemPayload.quantity;
        existingItem.start_time = itemPayload.start_time;
        existingItem.end_time = itemPayload.end_time;
        existingItem.branch_service_id = itemPayload.branch_service_id;
        existingItem.trainer_ids = itemPayload.trainer_ids;
      }
    } else {
      // Add new
      mockServiceBookingItems.push({
        id: nextServiceItemId++,
        quantity: itemPayload.quantity,
        start_time: itemPayload.start_time,
        end_time: itemPayload.end_time,
        service_booking_id: serviceBooking.id,
        branch_service_id: itemPayload.branch_service_id,
        trainer_ids: itemPayload.trainer_ids,
      });
    }
  }
}

/**
 * Check if new slot conflicts with existing bookings on the same court
 */
export function hasConflict(
  courtId: number,
  startISO: string,
  endISO: string,
  excludeBookingId?: number
): boolean {
  const start = new Date(startISO);
  const end = new Date(endISO);

  // Get all bookings for this court
  const courtBookings = mockCourtBookings.filter(
    (b) =>
      b.court_id === courtId &&
      b.id !== excludeBookingId &&
      b.status !== "Cancelled"
  );

  // Check each slot
  for (const booking of courtBookings) {
    for (const slot of booking.slots) {
      const slotStart = new Date(slot.start_time);
      const slotEnd = new Date(slot.end_time);

      // Check overlap
      if (start < slotEnd && end > slotStart) {
        return true;
      }
    }
  }

  return false;
}

// Export all mock data for direct access if needed
export {
  mockCourtBookings,
  mockBookingSlots,
  mockServiceBookings,
  mockServiceBookingItems,
  mockInvoices,
};
