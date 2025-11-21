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
    name: "Sân Bóng đá mini 1",
    court_type_id: 4,
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
    name: "Sân Bóng đá mini 1",
    court_type_id: 4,
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
  {
    id: 6,
    name: "Trọng tài Bóng đá mini",
    unit: "Trận",
    rental_type: "Nhân sự",
  },
  {
    id: 7,
    name: "Thuê bóng Bóng đá mini",
    unit: "Lần",
    rental_type: "Dụng cụ",
  },
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
let nextBookingId =
  (mockCourtBookings.length > 0
    ? Math.max(...mockCourtBookings.map((b) => b.id))
    : 0) + 1;
let nextInvoiceId =
  (mockInvoices.length > 0
    ? Math.max(...mockInvoices.map((inv) => inv.id))
    : 0) + 1;
let nextServiceBookingId =
  (mockServiceBookings.length > 0
    ? Math.max(...mockServiceBookings.map((sb) => sb.id))
    : 0) + 1;

/**
 * Generate random bookings for testing
 */
function generateRandomBookings(count: number): {
  bookings: CourtBooking[];
  slots: BookingSlot[];
  invoices: Invoice[];
  serviceBookings: ServiceBooking[];
  serviceItems: ServiceBookingItem[];
} {
  const bookings: CourtBooking[] = [];
  const slots: BookingSlot[] = [];
  const invoices: Invoice[] = [];
  const serviceBookings: ServiceBooking[] = [];
  const serviceItems: ServiceBookingItem[] = [];

  const statuses: Array<"Paid" | "Held" | "Booked" | "Cancelled" | "Pending"> =
    ["Paid", "Held", "Booked", "Cancelled", "Pending"];
  const types: Array<"Online" | "Direct"> = ["Online", "Direct"];
  const paymentMethods = ["Bank Transfer", "Counter", "Cash", "Credit Card"];

  const now = new Date();
  const startDate = new Date(now);
  startDate.setDate(startDate.getDate() - 30); // 30 days ago
  const endDate = new Date(now);
  endDate.setDate(endDate.getDate() + 30); // 30 days ahead

  for (let i = 0; i < count; i++) {
    const bookingId = nextBookingId++;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    const customer =
      mockCustomers[Math.floor(Math.random() * mockCustomers.length)];
    const court = mockCourts[Math.floor(Math.random() * mockCourts.length)];
    const employee =
      type === "Direct" && Math.random() > 0.3
        ? mockEmployees[Math.floor(Math.random() * mockEmployees.length)]
        : null;

    // Random date between startDate and endDate for booking creation
    const randomTime =
      startDate.getTime() +
      Math.random() * (endDate.getTime() - startDate.getTime());
    const createdAt = new Date(randomTime);
    createdAt.setHours(
      Math.floor(Math.random() * 12) + 8,
      Math.floor(Math.random() * 60),
      0,
      0
    );

    // Generate 1-3 slots
    const numSlots = Math.floor(Math.random() * 3) + 1;
    const bookingSlots: BookingSlot[] = [];

    // Slot date can be different from created_at (but usually close)
    // Random slot date between created_at and 7 days after
    const slotDateOffset = Math.floor(Math.random() * 7) - 2; // -2 to +5 days
    const slotDate = new Date(createdAt);
    slotDate.setDate(slotDate.getDate() + slotDateOffset);

    // First slot time (between 6:00 and 20:00)
    const firstSlotHour = Math.floor(Math.random() * 14) + 6;
    const firstSlotMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
    slotDate.setHours(firstSlotHour, firstSlotMinute, 0, 0);

    // Get court type duration
    const courtType = mockCourtTypes.find(
      (ct) => ct.id === court.court_type_id
    );
    const slotDuration = courtType?.rent_duration || 60; // minutes

    for (let j = 0; j < numSlots; j++) {
      const slotStart = new Date(slotDate);
      slotStart.setMinutes(slotStart.getMinutes() + j * slotDuration);

      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + slotDuration);

      const slot: BookingSlot = {
        id: nextSlotId++,
        start_time: slotStart.toISOString(),
        end_time: slotEnd.toISOString(),
        status: status,
        court_booking_id: bookingId,
      };

      bookingSlots.push(slot);
      slots.push(slot);
    }

    const booking: CourtBooking = {
      id: bookingId,
      created_at: createdAt.toISOString(),
      type: type,
      status: status,
      customer_id: customer.id,
      employee_id: employee?.id || null,
      court_id: court.id,
      slots: bookingSlots,
    };

    bookings.push(booking);

    // Generate invoice (70% chance)
    if (Math.random() > 0.3) {
      const hasServiceBooking = Math.random() > 0.7; // 30% chance
      let serviceBookingId: number | null = null;

      if (hasServiceBooking) {
        const serviceBooking: ServiceBooking = {
          id: nextServiceBookingId++,
          status: status,
          court_booking_id: bookingId,
        };
        serviceBookings.push(serviceBooking);
        serviceBookingId = serviceBooking.id;

        // Add 1-3 service items
        const numServiceItems = Math.floor(Math.random() * 3) + 1;
        const branchServices = mockBranchServices.filter(
          (bs) => bs.branch_id === court.branch_id
        );

        if (branchServices.length > 0) {
          const bookingServiceItems: ServiceBookingItem[] = [];
          for (let k = 0; k < numServiceItems; k++) {
            const branchService =
              branchServices[Math.floor(Math.random() * branchServices.length)];
            const quantity = Math.floor(Math.random() * 3) + 1;

            const serviceItem: ServiceBookingItem = {
              id: nextServiceItemId++,
              quantity: quantity,
              start_time: bookingSlots[0].start_time,
              end_time: bookingSlots[bookingSlots.length - 1].end_time,
              service_booking_id: serviceBooking.id,
              branch_service_id: branchService.id,
            };

            bookingServiceItems.push(serviceItem);
            serviceItems.push(serviceItem);
          }

          // Invoice for service booking (calculate after all items are added)
          const serviceTotal = bookingServiceItems.reduce((sum, item) => {
            const branchService = mockBranchServices.find(
              (bs) => bs.id === item.branch_service_id
            );
            return sum + (branchService?.unit_price || 0) * item.quantity;
          }, 0);

          if (serviceTotal > 0) {
            const serviceInvoice: Invoice = {
              id: nextInvoiceId++,
              total_amount: serviceTotal,
              payment_method:
                paymentMethods[
                  Math.floor(Math.random() * paymentMethods.length)
                ],
              status: status === "Paid" ? "Paid" : "Pending",
              court_booking_id: null,
              service_booking_id: serviceBooking.id,
              created_at: new Date(
                createdAt.getTime() + 5 * 60000
              ).toISOString(),
            };
            invoices.push(serviceInvoice);
          }
        }
      }

      // Invoice for court booking
      const courtFee =
        court.base_hourly_price *
        (numSlots * (slotDuration / 60)) *
        (Math.random() * 0.3 + 0.85); // Random variation 85-115%
      const courtInvoice: Invoice = {
        id: nextInvoiceId++,
        total_amount: Math.round(courtFee),
        payment_method:
          paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
        status: status === "Paid" ? "Paid" : "Pending",
        court_booking_id: bookingId,
        service_booking_id: null,
        created_at: new Date(createdAt.getTime() + 5 * 60000).toISOString(),
      };
      invoices.push(courtInvoice);
    }
  }

  return { bookings, slots, invoices, serviceBookings, serviceItems };
}

// Generate 50 random bookings
const randomData = generateRandomBookings(50);
mockCourtBookings.push(...randomData.bookings);
mockBookingSlots.push(...randomData.slots);
mockInvoices.push(...randomData.invoices);
mockServiceBookings.push(...randomData.serviceBookings);
mockServiceBookingItems.push(...randomData.serviceItems);

function ensureServiceDataForBooking(bookingId: number) {
  const booking = mockCourtBookings.find((b) => b.id === bookingId);
  if (!booking || booking.slots.length === 0) return;

  const court = mockCourts.find((c) => c.id === booking.court_id);
  if (!court) return;

  const branchServices = mockBranchServices.filter(
    (bs) => bs.branch_id === court.branch_id
  );
  if (branchServices.length === 0) return;

  let serviceBooking = mockServiceBookings.find(
    (sb) => sb.court_booking_id === bookingId
  );
  if (!serviceBooking) {
    serviceBooking = {
      id: nextServiceBookingId++,
      status: booking.status,
      court_booking_id: bookingId,
    };
    mockServiceBookings.push(serviceBooking);
  }

  const existingItems = mockServiceBookingItems.filter(
    (item) => item.service_booking_id === serviceBooking!.id
  );
  if (existingItems.length === 0) {
    const branchService =
      branchServices[bookingId % branchServices.length] || branchServices[0];
    const quantity = (bookingId % 3) + 1;
    mockServiceBookingItems.push({
      id: nextServiceItemId++,
      quantity,
      start_time: booking.slots[0].start_time,
      end_time: booking.slots[booking.slots.length - 1].end_time,
      service_booking_id: serviceBooking!.id,
      branch_service_id: branchService.id,
    });
  }

  const hasServiceInvoice = mockInvoices.some(
    (inv) => inv.service_booking_id === serviceBooking!.id
  );
  if (!hasServiceInvoice) {
    const serviceTotal = mockServiceBookingItems
      .filter((item) => item.service_booking_id === serviceBooking!.id)
      .reduce((sum, item) => {
        const branchService = mockBranchServices.find(
          (bs) => bs.id === item.branch_service_id
        );
        return sum + (branchService?.unit_price || 0) * item.quantity;
      }, 0);

    if (serviceTotal > 0) {
      mockInvoices.push({
        id: nextInvoiceId++,
        total_amount: serviceTotal,
        payment_method: "Counter",
        status: booking.status === "Paid" ? "Paid" : "Pending",
        court_booking_id: null,
        service_booking_id: serviceBooking!.id,
        created_at: booking.created_at,
      });
    }
  }
}

// Ensure specific bookings always have service data (for demo/edit pages)
[1, 2, 3, 4, 5, 10, 17].forEach((bookingId) =>
  ensureServiceDataForBooking(bookingId)
);

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

export async function cancelBooking(id: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 80));
  const booking = mockCourtBookings.find((b) => b.id === id);
  if (!booking) throw new Error("Booking not found");

  booking.status = "Cancelled";
  // Update slots status
  mockBookingSlots = mockBookingSlots.map((s) =>
    s.court_booking_id === id ? { ...s, status: "Cancelled" } : s
  );

  // Also cancel related service booking if exists
  const serviceBooking = mockServiceBookings.find(
    (sb) => sb.court_booking_id === id
  );
  if (serviceBooking) {
    serviceBooking.status = "Cancelled" as any;
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
