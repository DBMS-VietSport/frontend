/**
 * Booking Component Types
 *
 * Re-exports types used by booking components from centralized type definitions.
 * This provides a single import point for booking-related types.
 */

// Re-export customer flow types (used in customer-facing booking)
export type {
  TimeSlot,
  CustomerCourt as Court,
  CustomerCourtType as CourtType,
  ServiceItem,
  Coach,
  City,
  Facility,
  BookingDetails,
  CustomerServiceBooking,
} from "@/lib/types/customer-flow";

// Re-export entity types (used in admin/management)
export type {
  BookingSlot,
  CourtBooking,
  ServiceBooking,
  ServiceBookingItem,
  Invoice,
} from "@/lib/types/entities";
