// Pricing calculation utilities
import type {
  Court,
  BookingSlot,
  ServiceBookingItem,
  BranchService,
  Service,
  Invoice,
  PricingCalculation,
} from "./types";

/**
 * Calculate minutes between two ISO date strings
 */
export function minutesBetween(startISO: string, endISO: string): number {
  const start = new Date(startISO);
  const end = new Date(endISO);
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60));
}

/**
 * Calculate total court rental fee based on slots and hourly price
 */
export function calcCourtFee(court: Court, slots: BookingSlot[]): number {
  if (slots.length === 0) return 0;

  let totalMinutes = 0;
  for (const slot of slots) {
    totalMinutes += minutesBetween(slot.start_time, slot.end_time);
  }

  const hours = totalMinutes / 60;
  return Math.round(court.base_hourly_price * hours);
}

/**
 * Calculate total services fee
 */
export function calcServicesFee(
  items: ServiceBookingItem[],
  branchServices: BranchService[],
  services: Service[]
): number {
  let total = 0;

  for (const item of items) {
    const branchService = branchServices.find(
      (bs) => bs.id === item.branch_service_id
    );
    if (!branchService) continue;

    const service = services.find((s) => s.id === branchService.service_id);
    if (!service) continue;

    const unitPrice = branchService.unit_price;

    if (service.unit === "Giờ") {
      const hours = minutesBetween(item.start_time, item.end_time) / 60;
      total += unitPrice * item.quantity * hours;
    } else {
      // Lần, Lượt, Tháng, Trận
      total += unitPrice * item.quantity;
    }
  }

  return Math.round(total);
}

/**
 * Calculate totals for a booking
 */
export function calcTotals(
  court: Court,
  slots: BookingSlot[],
  serviceItems: ServiceBookingItem[],
  branchServices: BranchService[],
  services: Service[],
  invoices: Invoice[]
): PricingCalculation {
  const courtFee = calcCourtFee(court, slots);
  const serviceFee = calcServicesFee(serviceItems, branchServices, services);
  const totalAmount = courtFee + serviceFee;

  const alreadyPaid = invoices
    .filter((inv) => inv.status === "Paid")
    .reduce((sum, inv) => sum + inv.total_amount, 0);

  const difference = totalAmount - alreadyPaid;

  return {
    courtFee,
    serviceFee,
    totalAmount,
    alreadyPaid,
    difference,
  };
}

/**
 * Format number as VND currency
 */
export function formatVND(n: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(n);
}

/**
 * Format date to Vietnamese format
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

/**
 * Format time from ISO string
 */
export function formatTime(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format date and time range
 */
export function formatTimeRange(startISO: string, endISO: string): string {
  return `${formatTime(startISO)} - ${formatTime(endISO)}`;
}
