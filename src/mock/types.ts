/**
 * Mock Types
 *
 * Re-exports types used by mock repositories from centralized type definitions.
 */

export type {
  // Core entities
  Role,
  CustomerLevel,
  Account,
  Branch,
  CourtType,
  Court,
  CourtStatus,
  Employee,
  Customer,
  Service,
  BranchService,
  // Booking entities
  BookingSlot,
  CourtBooking,
  BookingStatus,
  BookingType,
  ServiceBooking,
  ServiceBookingItem,
  // Invoice entities
  Invoice,
  // Work shift entities
  WorkShift,
  ShiftAssignment,
  // Enums
  ServiceUnit,
  ServiceRentalType,
  BranchServiceStatus,
  PaymentStatusUI,
} from "@/types/entities";

// Re-export from booking types
export type {
  BookingRow,
  BookingDetailView,
  UpdateCourtTimePayload,
  UpdateServicesPayload,
  PricingCalculation,
} from "@/types/booking";

