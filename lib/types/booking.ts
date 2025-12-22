// =============================================================================
// Booking Domain Types - UI Projections & Payloads
// =============================================================================
// Types specific to the booking management domain.
// These extend or compose the core entities for UI and API needs.
// =============================================================================

import type {
  BookingStatus,
  PaymentStatusUI,
  BookingSlot,
  Court,
  CourtType,
  Branch,
  Customer,
  Employee,
  Invoice,
  Service,
  BranchService,
  ServiceBooking,
  ServiceBookingItem,
} from "./entities";

// -----------------------------------------------------------------------------
// UI Projection Types
// -----------------------------------------------------------------------------

/** Flattened booking row for table display */
export interface BookingRow {
  id: number;
  code: string;
  branchName: string;
  courtName: string;
  courtType: string;
  customerName: string;
  employeeName?: string;
  timeRange: string;
  paymentStatus: PaymentStatusUI;
  courtStatus: BookingStatus;
  createdAt: string;
}

/** Extended service booking item with related entities */
export interface ServiceBookingItemDetail extends ServiceBookingItem {
  service: Service;
  branchService: BranchService;
  trainerNames?: string[];
}

/** Full booking detail view for booking management */
export interface BookingDetailView extends BookingRow {
  customer: Customer;
  employee?: Employee;
  court: Court;
  courtTypeData: CourtType;
  branch: Branch;
  slots: BookingSlot[];
  invoices: Invoice[];
  serviceBooking?: ServiceBooking;
  serviceItems: ServiceBookingItemDetail[];
  courtFee: number;
  serviceFee: number;
  totalAmount: number;
}

// -----------------------------------------------------------------------------
// API Payloads
// -----------------------------------------------------------------------------

/** Payload for updating court time */
export interface UpdateCourtTimePayload {
  court_id: number;
  slots: Array<{ start_time: string; end_time: string }>;
}

/** Payload for updating services */
export interface UpdateServicesPayload {
  items: Array<{
    id?: number; // omit for new items
    branch_service_id: number;
    quantity: number;
    start_time: string;
    end_time: string;
    trainer_ids?: number[];
  }>;
  removedItemIds?: number[];
}

// -----------------------------------------------------------------------------
// Calculation Types
// -----------------------------------------------------------------------------

/** Pricing calculation results */
export interface PricingCalculation {
  courtFee: number;
  serviceFee: number;
  totalAmount: number;
  alreadyPaid: number;
  difference: number;
}
