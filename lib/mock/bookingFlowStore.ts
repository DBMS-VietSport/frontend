export interface BookingServiceItem {
  name: string;
  qty: number;
  price: number;
  unit?: string;
}

export interface BookingConfirmationData {
  bookingId: string;
  branch: string;
  courtName: string;
  courtType: string;
  date: string; // ISO date
  timeRange: string; // "18:00 - 19:00"
  services: BookingServiceItem[];
  subtotal: number;
  discount?: number;
  total: number;
  paymentMethod: "online" | "counter";
  status: "success" | "pending";
}

const STORAGE_KEY = "vietsport:lastBookingConfirmation";

export function getLastBooking(): BookingConfirmationData {
  try {
    const raw =
      typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw) as BookingConfirmationData;
      return parsed;
    }
  } catch {
    // ignore parse errors and return sample
  }

  // Sample fallback data
  const now = new Date();
  const isoDate = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  ).toISOString();

  return {
    bookingId: "BK-20251111-001",
    branch: "VietSport TP. Hồ Chí Minh - Quận 1",
    courtName: "Sân Cầu Lông HCM 1",
    courtType: "Cầu lông",
    date: isoDate,
    timeRange: "18:00 - 19:00",
    services: [
      { name: "Thuê vợt cầu lông", qty: 2, price: 10000, unit: "lượt" },
      { name: "Phòng tắm VIP", qty: 1, price: 10000, unit: "lượt" },
    ],
    subtotal: 70000,
    discount: 0,
    total: 70000,
    paymentMethod: "counter",
    status: "pending",
  };
}

export function setLastBooking(data: BookingConfirmationData) {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch {
    // ignore
  }
}
