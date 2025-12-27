import { courtBookings, bookingSlots, invoices } from "../../../mock/data";
import type { CourtBooking, BookingSlot, Invoice } from "../../../mock/types";

export const bookingRepo = {
  list: async (): Promise<CourtBooking[]> => {
    await new Promise((r) => setTimeout(r, 30));
    return courtBookings;
  },
  getSlots: (court_booking_id: number): BookingSlot[] =>
    bookingSlots.filter((s) => s.court_booking_id === court_booking_id),
  getInvoiceForBooking: (court_booking_id: number): Invoice | null =>
    invoices.find((i) => i.court_booking_id === court_booking_id) || null,
};
