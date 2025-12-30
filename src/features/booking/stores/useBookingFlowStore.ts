import { create } from "zustand";
import { persist } from "zustand/middleware";

export type BookingStep = 1 | 2 | 3;

export interface CourtBookingData {
  id: string;
  customerId?: string;
  customerName?: string;
  courtId: string;
  courtName: string;
  courtType: string;
  facilityId: string;
  facilityName: string;
  date: Date;
  timeSlots: Array<{ start: string; end: string; price?: number }>;
  pricePerHour: number;
  totalCourtFee: number;
  status: "held" | "pending" | "confirmed" | "paid";
}

export interface ServiceBookingData {
  id: string;
  courtBookingId: string;
  services: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    unit: string;
    durationHours?: number;
  }>;
  coaches: Array<{
    id: string;
    name: string;
    quantity: number;
    pricePerHour: number;
    durationHours?: number;
  }>;
  totalServiceFee: number;
}

interface BookingFlowState {
  // Current step (1 = court, 2 = service, 3 = payment)
  currentStep: BookingStep;

  // Selected data
  selectedCourtBookingId: string | null;
  selectedCustomerId: string | null; // For receptionist

  // Temp data for step transitions
  courtBookingData: CourtBookingData | null;
  serviceBookingData: ServiceBookingData | null;

  // Actions
  setCurrentStep: (step: BookingStep) => void;
  goToStep: (step: BookingStep) => void;

  setCourtBooking: (data: CourtBookingData) => void;
  setServiceBooking: (data: ServiceBookingData) => void;

  setSelectedCourtBookingId: (id: string | null) => void;
  setSelectedCustomerId: (id: string | null) => void;

  resetFlow: () => void;

  // Computed helpers
  canAccessStep: (step: BookingStep) => boolean;
}

const initialState = {
  currentStep: 1 as BookingStep,
  selectedCourtBookingId: null,
  selectedCustomerId: null,
  courtBookingData: null,
  serviceBookingData: null,
};

export const useBookingFlowStore = create<BookingFlowState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setCurrentStep: (step) => set({ currentStep: step }),

      goToStep: (step) => {
        const canAccess = get().canAccessStep(step);
        if (canAccess) {
          set({ currentStep: step });
        }
      },

      setCourtBooking: (data) =>
        set({
          courtBookingData: data,
          selectedCourtBookingId: data.id,
        }),

      setServiceBooking: (data) =>
        set({
          serviceBookingData: data,
        }),

      setSelectedCourtBookingId: (id) => set({ selectedCourtBookingId: id }),

      setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),

      resetFlow: () => set(initialState),

      canAccessStep: (step) => {
        const state = get();

        // Step 1 is always accessible
        if (step === 1) return true;

        // Step 2 & 3 require a court booking to be selected or created
        if (step === 2 || step === 3) {
          return !!state.selectedCourtBookingId || !!state.courtBookingData;
        }

        return false;
      },
    }),
    {
      name: "vietsport-booking-flow",
      // Only persist minimal necessary data
      partialize: (state) => ({
        currentStep: state.currentStep,
        selectedCourtBookingId: state.selectedCourtBookingId,
        selectedCustomerId: state.selectedCustomerId,
      }),
    }
  )
);
