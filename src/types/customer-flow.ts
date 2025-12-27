// =============================================================================
// Customer Flow Types - Public Booking Flow
// =============================================================================
// Types for the customer-facing booking flow.
// Uses string IDs for frontend-only entities (cities, facilities, etc.)
// =============================================================================

import type { TimeSlotStatus } from "./entities";

// -----------------------------------------------------------------------------
// Location & Facility Types
// -----------------------------------------------------------------------------

export interface City {
  id: string;
  name: string;
}

export interface Facility {
  id: string;
  name: string;
  cityId: string;
}

// -----------------------------------------------------------------------------
// Court Types for Customer Flow
// -----------------------------------------------------------------------------

/** Court type for customer-facing booking flow */
export interface CustomerCourtType {
  id: string;
  name: string;
  slotDuration: number; // in minutes
}

/** Staff member for court type */
export interface Staff {
  id: string;
  name: string;
  courtTypeId: string;
}

/** Court for customer-facing booking flow */
export interface CustomerCourt {
  id: string;
  name: string;
  type: string;
  facilityId: string;
  imageUrl: string;
}

// -----------------------------------------------------------------------------
// Time Slot Types
// -----------------------------------------------------------------------------

export interface TimeSlot {
  start: string;
  end: string;
  status: TimeSlotStatus;
  bookedBy?: string;
  phone?: string;
  email?: string;
  startISO?: string;
  endISO?: string;
}

// -----------------------------------------------------------------------------
// Booking Flow Types
// -----------------------------------------------------------------------------

export interface BookingDetails {
  date: Date;
  timeSlot: TimeSlot;
  court: CustomerCourt;
  courtType: CustomerCourtType;
  pricePerHour: number;
}

// -----------------------------------------------------------------------------
// Service Item Types
// -----------------------------------------------------------------------------

export type ServiceItemCategory = "equipment" | "coach" | "facility" | "drink";
export type ServiceItemUnit = "hour" | "turn" | "free";

export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceItemCategory;
  price: number;
  unit: ServiceItemUnit;
  quantity: number;
  durationHours?: number;
  imageUrl?: string;
  description?: string;
  hourEntries?: Array<{ id: string; hours: number }>;
}

// -----------------------------------------------------------------------------
// Coach Types
// -----------------------------------------------------------------------------

export interface Coach {
  id: string;
  name: string;
  sport: string;
  pricePerHour: number;
  quantity: number;
  durationHours?: number;
  avatarUrl?: string;
  degree?: string;
  bio?: string;
  studentsTrained?: number;
  expertise?: string[];
}

// -----------------------------------------------------------------------------
// Customer Service Booking
// -----------------------------------------------------------------------------

export interface CustomerServiceBooking {
  items: ServiceItem[];
  coaches: Coach[];
}
