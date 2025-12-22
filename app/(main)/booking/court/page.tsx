"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CourtBookingFilter,
  CourtBookingSummaryCard,
  CourtSelector,
  CourtTimeSlotGrid,
} from "@/components/booking";
import { Separator } from "@/components/ui/separator";
import { mockCourtTypes } from "@/components/booking/mockData";
import type { CustomerCourt as Court, CustomerCourtType as CourtType, TimeSlot } from "@/lib/types";
import { useBookingFlowStore } from "@/lib/booking/useBookingFlowStore";
import { useAuth } from "@/lib/auth/useAuth";
import { BookingProgress } from "@/components/booking";
import { MOCK_CUSTOMERS } from "@/lib/mock/bookingFlowMock";

export default function BookingCourtPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { setCourtBooking, setCurrentStep, setSelectedCustomerId } =
    useBookingFlowStore();

  const isReceptionist = user?.role === "receptionist";

  // Filter state
  const [filters, setFilters] = React.useState({
    cityId: "",
    facilityId: "",
    courtTypeId: "",
    date: new Date(),
  });

  // Selection state
  const [selectedCourt, setSelectedCourt] = React.useState<Court | null>(null);
  const [selectedSlots, setSelectedSlots] = React.useState<TimeSlot[]>([]);
  const [selectedCustomer, setSelectedCustomer] = React.useState<string | null>(
    null
  );

  // Get current court type
  const currentCourtType = React.useMemo(() => {
    if (!filters.courtTypeId) return null;
    return (
      mockCourtTypes.find((type) => type.id === filters.courtTypeId) || null
    );
  }, [filters.courtTypeId]);

  // Reset selections when filters change
  React.useEffect(() => {
    setSelectedCourt(null);
    setSelectedSlots([]);
  }, [filters.courtTypeId, filters.facilityId]);

  const handleFilterChange = React.useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
  }, []);

  const handleCourtSelect = React.useCallback((court: Court) => {
    setSelectedCourt(court);
    setSelectedSlots([]);
  }, []);

  const handleSlotSelect = React.useCallback((slot: TimeSlot) => {
    setSelectedSlots((prev) => {
      const exists = prev.some(
        (s) => s.start === slot.start && s.end === slot.end
      );
      if (exists) {
        return prev.filter(
          (s) => !(s.start === slot.start && s.end === slot.end)
        );
      }
      return [...prev, slot];
    });
  }, []);

  const handleContinue = React.useCallback(() => {
    // Validate receptionist must select customer
    if (isReceptionist && !selectedCustomer) {
      alert("Vui lòng chọn khách hàng");
      return;
    }

    if (!selectedCourt || !currentCourtType || selectedSlots.length === 0) {
      alert("Vui lòng chọn đầy đủ thông tin đặt sân");
      return;
    }

    // Calculate total court fee
    const durationHours =
      selectedSlots.length * (currentCourtType.slotDuration / 60);
    const pricePerHour = 50000; // Mock price
    const totalCourtFee = pricePerHour * durationHours;

    // Generate booking ID
    const bookingId = `BK-${Date.now()}`;

    // Get customer info
    const customer = isReceptionist
      ? MOCK_CUSTOMERS.find((c) => c.id === selectedCustomer)
      : { id: user?.username || "guest", name: user?.fullName || "Guest" };

    // Save court booking to store
    setCourtBooking({
      id: bookingId,
      customerId: customer?.id,
      customerName: customer?.name,
      courtId: selectedCourt.id,
      courtName: selectedCourt.name,
      courtType: currentCourtType.name,
      facilityId: filters.facilityId,
      facilityName: "Mock Facility", // In production, get from filter
      date: filters.date,
      timeSlots: selectedSlots.map((s) => ({ start: s.start, end: s.end })),
      pricePerHour,
      totalCourtFee,
      status: "held",
    });

    // Save customer ID if receptionist
    if (isReceptionist && selectedCustomer) {
      setSelectedCustomerId(selectedCustomer);
    }

    // Move to next step
    setCurrentStep(2);
    router.push("/booking/services");
  }, [
    router,
    isReceptionist,
    selectedCustomer,
    selectedCourt,
    currentCourtType,
    selectedSlots,
    filters,
    user,
    setCourtBooking,
    setCurrentStep,
    setSelectedCustomerId,
  ]);

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {isReceptionist ? "Lập phiếu đặt sân" : "Đặt sân"}
          </h1>
          <p className="text-muted-foreground">
            {isReceptionist
              ? "Chọn khách hàng và tạo phiếu đặt sân"
              : "Chọn ngày, loại sân và khung giờ phù hợp với bạn"}
          </p>
        </div>
        <div className="shrink-0">
          <BookingProgress currentStep={1} />
        </div>
      </div>

      <Separator />

      {/* Filters - Combined with Customer Selection */}
      <section>
        <CourtBookingFilter
          onFilterChange={handleFilterChange}
          selectedCustomerId={selectedCustomer}
          onCustomerChange={setSelectedCustomer}
          customers={isReceptionist ? MOCK_CUSTOMERS : []}
        />
      </section>

      {/* Court Selection */}
      {filters.courtTypeId && (
        <section className="animate-in fade-in-50 duration-500">
          <CourtSelector
            courtTypeId={filters.courtTypeId}
            facilityId={filters.facilityId}
            selectedCourtId={selectedCourt?.id || null}
            onCourtSelect={handleCourtSelect}
          />
        </section>
      )}

      {/* Time Slot Grid */}
      {selectedCourt && (
        <section className="animate-in fade-in-50 duration-500">
          <CourtTimeSlotGrid
            court={selectedCourt}
            courtType={currentCourtType}
            selectedDate={filters.date}
            selectedSlots={selectedSlots}
            onSlotSelect={handleSlotSelect}
          />
        </section>
      )}

      {/* Booking Summary */}
      {selectedSlots.length > 0 && selectedCourt && currentCourtType && (
        <section className="animate-in fade-in-50 duration-500">
          <div className="max-w-2xl mx-auto">
            <CourtBookingSummaryCard
              date={filters.date}
              timeSlots={selectedSlots}
              court={selectedCourt}
              courtType={currentCourtType}
              onContinue={handleContinue}
            />
          </div>
        </section>
      )}

      {/* Empty State */}
      {!filters.courtTypeId && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-12 h-12 text-muted-foreground"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">Bắt đầu đặt sân</h3>
          <p className="text-muted-foreground max-w-md">
            Chọn loại sân từ bộ lọc phía trên để xem danh sách sân và lịch trống
          </p>
        </div>
      )}
    </div>
  );
}
