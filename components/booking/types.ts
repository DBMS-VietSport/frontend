// Shared TypeScript interfaces for booking components

export interface City {
  id: string;
  name: string;
}

export interface Facility {
  id: string;
  name: string;
  cityId: string;
}

export interface CourtType {
  id: string;
  name: string;
  slotDuration: number; // in minutes
}

export interface Staff {
  id: string;
  name: string;
  courtTypeId: string;
}

export interface Court {
  id: string;
  name: string;
  type: string;
  facilityId: string;
  imageUrl: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  status: "available" | "booked" | "pending" | "past";
  bookedBy?: string;
  phone?: string;
}

export interface BookingDetails {
  date: Date;
  timeSlot: TimeSlot;
  court: Court;
  courtType: CourtType;
  pricePerHour: number;
}

// Service booking interfaces
export interface ServiceItem {
  id: string;
  name: string;
  category: "equipment" | "coach" | "facility" | "drink";
  price: number;
  unit: "hour" | "turn" | "free";
  quantity: number;
  durationHours?: number;
  imageUrl?: string;
  description?: string;
}

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

export interface ServiceBooking {
  items: ServiceItem[];
  coaches: Coach[];
}
