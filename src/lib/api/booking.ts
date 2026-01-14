/**
 * Booking API - Real API calls for booking operations
 */

import { apiClient } from './client';

export interface CourtBookingRequest {
  creator?: number;
  customerId: number;
  courtId: number;
  bookingDate: string;
  slots: string; // JSON string of time slots
  byMonth: boolean;
  branchId: number;
  type: string;
}

export interface ServiceBookingRequest {
  courtBookingId: number;
  employeeId?: number;
  items: string; // JSON string of service items
}

export interface BookingSlot {
  id?: number;
  start_time: string;
  end_time: string;
  court_booking_id?: number;
}

export interface CourtBooking {
  id: number;
  type: string;
  status: string;
  bookingDate: string;
  createdAt: string;
  courtId: number;
  customerId: number;
  employeeId?: number;
}

export interface Court {
  id: number;
  name: string;
  courtTypeId: number;
  branchId: number;
  status: string;
  capacity: number;
  baseHourlyPrice: number;
}

export interface BranchService {
  id: number;
  branchId: number;
  serviceId: number;
  unitPrice: number;
  currentStock?: number;
  status: string;
}

/**
 * Calculate the price for booking specific time slots
 */
export async function calculateSlotsPrice(
  courtId: number,
  date: string,
  slots: BookingSlot[]
): Promise<any> {
  const response = await apiClient.post("/booking/calculate-slots-price", {
    courtId,
    date,
    slots: JSON.stringify(slots),
  });
  return response.data;
}

/**
 * Create a new court booking
 */
export async function createCourtBooking(
  request: CourtBookingRequest
): Promise<CourtBooking> {
  const response = await apiClient.post("/booking/court-bookings", request);
  return response.data;
}

/**
 * Create a new court booking using clone endpoint (for testing)
 */
export async function createCourtBookingClone(
  request: CourtBookingRequest
): Promise<CourtBooking> {
  const response = await apiClient.post("/booking/court-bookings-clone", request);
  return response.data;
}

/**
 * Create a new service booking
 */
export async function createServiceBooking(
  request: ServiceBookingRequest
): Promise<any> {
  const response = await apiClient.post("/booking/service-bookings", request);
  return response.data;
}

/**
 * Create a new service booking using clone endpoint (for testing)
 */
export async function createServiceBookingClone(
  request: ServiceBookingRequest
): Promise<any> {
  const response = await apiClient.post("/booking/service-bookings-clone", request);
  return response.data;
}

/**
 * Get booked slots for a specific court on a date
 */
export async function getCourtBookingSlots(
  courtId: number,
  date: string
): Promise<BookingSlot[]> {
  const response = await apiClient.get(`/booking/courts/${courtId}/booking-slots?date=${date}`);
  return response.data;
}

/**
 * Get all court bookings for a customer
 */
export async function getCustomerCourtBookings(
  customerId: number,
  branchId: number = 1 // Default to 1 to avoid breaking changes if not supplied immediately
): Promise<CourtBooking[]> {
  const response = await apiClient.get(`/booking/customers/${customerId}/court-bookings?branchId=${branchId}`);
  return response.data;
}

/**
 * Get all services available at a branch
 */
export async function getBranchServices(branchId: number): Promise<BranchService[]> {
  const response = await apiClient.get(`/booking/branches/${branchId}/services`);
  return response.data;
}

/**
 * Get detailed information about a service booking
 */
export async function getServiceBookingDetails(
  serviceBookingId: number
): Promise<any> {
  const response = await apiClient.get(`/booking/service-bookings/${serviceBookingId}/details`);
  return response.data;
}

/**
 * Get all service bookings for a court booking
 */
export async function getCourtBookingServiceBookings(
  courtBookingId: number
): Promise<any> {
  const response = await apiClient.get(`/booking/court-bookings/${courtBookingId}/service-bookings`);
  return response.data;
}

/**
 * Get available trainers/referees for a court booking
 */
export async function getAvailableTrainers(courtBookingId: number): Promise<any> {
  const response = await apiClient.get(`/booking/court-bookings/${courtBookingId}/trainer-referee`);
  return response.data;
}

/**
 * List all courts at a branch filtered by court type
 */
export async function getBranchCourts(
  branchId: number,
  courtTypeId?: number
): Promise<Court[]> {
  const query = courtTypeId ? `?courtTypeId=${courtTypeId}` : "";
  const response = await apiClient.get(`/booking/branches/${branchId}/courts${query}`);
  return response.data;
}

/**
 * Update an existing court booking
 */
export async function updateCourtBooking(
  bookingId: number,
  newCourtId: number,
  newBookingDate: string,
  newSlots: string,
  branchId: number
): Promise<any> {
  const response = await apiClient.put(`/booking/court-bookings/${bookingId}`, {
    newCourtId,
    newBookingDate,
    newSlots,
    branchId,
  });
  return response.data;
}

/**
 * Get all court bookings for a branch with optional filters
 */
export async function getBranchCourtBookings(
  branchId: number,
  filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
  }
): Promise<any[]> {
  const response = await apiClient.get(`/booking/branches/${branchId}/court-bookings`, {
    params: filters,
  });
  return response.data;
}

/**
 * Get all customers
 */
export async function getCustomers(): Promise<any[]> {
  const response = await apiClient.get('/customers');
  return response.data;
}

/**
 * Get all employees, optionally filtered by role
 */
export async function getEmployees(role?: string): Promise<any[]> {
  const response = await apiClient.get('/employees', {
    params: role ? { role } : undefined,
  });
  return response.data;
}

/**
 * Get all branches
 */
export async function getBranches(): Promise<any[]> {
  const response = await apiClient.get('/branches');
  // Handle paginated response: {data: [], pagination: {}}
  return response.data.data || response.data;
}

/**
 * Get a single court booking by ID with full details
 */
export async function getCourtBookingById(bookingId: number): Promise<any> {
  const response = await apiClient.get(`/booking/court-bookings/${bookingId}/details`);
  return response.data;
}

/**
 * Cancel a court booking
 */
export async function cancelCourtBooking(bookingId: number): Promise<void> {
  const response = await apiClient.delete(`/booking/court-bookings/${bookingId}`);
  return response.data;
}

/**
 * Get all court types
 */
export async function getCourtTypes(): Promise<any[]> {
  const response = await apiClient.get('/court-types');
  return response.data;
}