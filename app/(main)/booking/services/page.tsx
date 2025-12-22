"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ServiceBookingForm,
  ServiceSummaryCard,
  BookingProgress,
} from "@/components/booking";
import { Separator } from "@/components/ui/separator";
import { mockServiceItems, mockCoaches } from "@/components/booking/mockData";
import { mockCourts, mockCourtTypes } from "@/components/booking/mockData";
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertCircle } from "lucide-react";
import type { ServiceItem, Coach, TimeSlot } from "@/lib/types";
import { useBookingFlowStore } from "@/lib/booking/useBookingFlowStore";
import { useAuth } from "@/lib/auth/useAuth";
import {
  BookingSelector,
  type CourtBookingOption,
} from "@/components/booking/shared/BookingSelector";
import {
  CustomerSelector,
  type Customer,
} from "@/components/booking/shared/CustomerSelector";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import {
  MOCK_CUSTOMERS,
  MOCK_COURT_BOOKINGS,
} from "@/lib/mock/bookingFlowMock";

export default function ServicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const {
    courtBookingData,
    selectedCourtBookingId,
    selectedCustomerId,
    setSelectedCourtBookingId,
    setSelectedCustomerId,
    setServiceBooking,
    setCurrentStep,
  } = useBookingFlowStore();

  const isReceptionist = user?.role === "receptionist";

  // Get bookingId and customerId from query params (for edit flow)
  const bookingIdFromQuery = searchParams.get("bookingId");
  const customerIdFromQuery = searchParams.get("customerId");

  // Local state for customer and booking selection
  const [localCustomerId, setLocalCustomerId] = React.useState<string | null>(
    customerIdFromQuery || selectedCustomerId
  );
  const [localBookingId, setLocalBookingId] = React.useState<string | null>(
    bookingIdFromQuery || selectedCourtBookingId
  );

  // Auto-select booking if coming from edit page
  React.useEffect(() => {
    if (bookingIdFromQuery) {
      // Find booking by ID (in production, fetch from API)
      const booking = MOCK_COURT_BOOKINGS.find(
        (b) => b.id === bookingIdFromQuery
      );
      if (booking) {
        setLocalBookingId(bookingIdFromQuery);
        setSelectedCourtBookingId(bookingIdFromQuery);
        setBookingData({
          date: booking.date,
          court: mockCourts[0], // Mock
          courtType: mockCourtTypes[0], // Mock
          timeSlots: [
            {
              start: booking.timeRange.split(" - ")[0],
              end: booking.timeRange.split(" - ")[1],
              status: "available" as const,
            },
          ] as TimeSlot[],
        });
      }
    }
    if (customerIdFromQuery) {
      setLocalCustomerId(customerIdFromQuery);
      setSelectedCustomerId(customerIdFromQuery);
    }
  }, [
    bookingIdFromQuery,
    customerIdFromQuery,
    setSelectedCourtBookingId,
    setSelectedCustomerId,
  ]);

  // Initialize with court booking from store if available
  const [bookingData, setBookingData] = React.useState(() => {
    if (courtBookingData) {
      return {
        date: courtBookingData.date,
        court: mockCourts[0], // Mock - in production, fetch by ID
        courtType: mockCourtTypes[0], // Mock
        timeSlots: courtBookingData.timeSlots.map((slot) => ({
          ...slot,
          status: "available" as const,
        })) as TimeSlot[],
      };
    }
    return {
      date: new Date(),
      court: mockCourts[0],
      courtType: mockCourtTypes[0],
      timeSlots: [
        { start: "08:00", end: "09:00", status: "available" as const },
        { start: "09:00", end: "10:00", status: "available" as const },
      ] as TimeSlot[],
    };
  });

  // Service state
  const [services, setServices] = React.useState<ServiceItem[]>([
    ...mockServiceItems,
  ]);
  const [coaches, setCoaches] = React.useState<Coach[]>([...mockCoaches]);

  const handleServiceUpdate = React.useCallback(
    (
      id: string,
      quantity: number,
      durationHours?: number,
      hourEntries?: Array<{ id: string; hours: number }>
    ) => {
      setServices((prev) =>
        prev.map((s) =>
          s.id === id
            ? {
                ...s,
                quantity,
                durationHours,
                hourEntries: hourEntries || s.hourEntries,
              }
            : s
        )
      );
    },
    []
  );

  const handleCoachUpdate = React.useCallback(
    (id: string, quantity: number, durationHours?: number) => {
      setCoaches((prev) =>
        prev.map((c) => (c.id === id ? { ...c, quantity, durationHours } : c))
      );
    },
    []
  );

  // Handle customer change (receptionist only)
  const handleCustomerChange = React.useCallback(
    (customerId: string | null) => {
      setLocalCustomerId(customerId);
      setSelectedCustomerId(customerId);
      // Reset booking selection when customer changes
      setLocalBookingId(null);
      setSelectedCourtBookingId(null);
    },
    [setSelectedCustomerId, setSelectedCourtBookingId]
  );

  // Handle booking selection change
  const handleBookingChange = React.useCallback(
    (bookingId: string | null) => {
      setLocalBookingId(bookingId);
      setSelectedCourtBookingId(bookingId);

      // Load booking data
      if (bookingId) {
        const booking = MOCK_COURT_BOOKINGS.find((b) => b.id === bookingId);
        if (booking) {
          // Update booking data based on selected booking
          setBookingData({
            date: booking.date,
            court: mockCourts[0], // Mock
            courtType: mockCourtTypes[0], // Mock
            timeSlots: [
              {
                start: booking.timeRange.split(" - ")[0],
                end: booking.timeRange.split(" - ")[1],
                status: "available" as const,
              },
            ] as TimeSlot[],
          });
        }
      }
    },
    [setSelectedCourtBookingId]
  );

  // Filter bookings based on selected customer (for receptionist)
  const availableBookings = React.useMemo(() => {
    if (isReceptionist && localCustomerId) {
      // In production, filter bookings by customer ID
      return MOCK_COURT_BOOKINGS;
    }
    if (!isReceptionist) {
      // For customers, show only their bookings
      return MOCK_COURT_BOOKINGS;
    }
    return [];
  }, [isReceptionist, localCustomerId]);

  const handleContinue = React.useCallback(() => {
    if (!localBookingId) {
      alert("Vui lòng chọn phiếu đặt sân");
      return;
    }

    // Calculate total service fee
    let totalServiceFee = 0;
    services.forEach((service) => {
      if (service.quantity > 0 && service.unit !== "free") {
        if (service.unit === "hour") {
          totalServiceFee +=
            service.price * service.quantity * (service.durationHours || 1);
        } else {
          totalServiceFee += service.price * service.quantity;
        }
      }
    });

    coaches.forEach((coach) => {
      if (coach.quantity > 0) {
        totalServiceFee +=
          coach.pricePerHour * coach.quantity * (coach.durationHours || 1);
      }
    });

    // Save service booking to store
    const serviceBookingId = `SB-${Date.now()}`;
    setServiceBooking({
      id: serviceBookingId,
      courtBookingId: localBookingId,
      services: services
        .filter((s) => s.quantity > 0)
        .map((s) => ({
          id: s.id,
          name: s.name,
          quantity: s.quantity,
          price: s.price,
          unit: s.unit,
          durationHours: s.durationHours,
        })),
      coaches: coaches
        .filter((c) => c.quantity > 0)
        .map((c) => ({
          id: c.id,
          name: c.name,
          quantity: c.quantity,
          pricePerHour: c.pricePerHour,
          durationHours: c.durationHours,
        })),
      totalServiceFee,
    });

    // Move to next step
    setCurrentStep(3);

    // If coming from edit flow, preserve bookingId in URL
    const bookingIdParam = bookingIdFromQuery
      ? `?bookingId=${bookingIdFromQuery}`
      : "";
    router.push(`/booking/payment${bookingIdParam}`);
  }, [
    router,
    localBookingId,
    services,
    coaches,
    setServiceBooking,
    setCurrentStep,
  ]);

  const handleBack = React.useCallback(() => {
    router.push("/booking/court");
  }, [router]);

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {isReceptionist ? "Lập phiếu dịch vụ" : "Đặt dịch vụ bổ sung"}
              </h1>
              <p className="text-muted-foreground">
                {isReceptionist
                  ? "Chọn phiếu đặt sân và thêm dịch vụ kèm theo"
                  : "Chọn thêm các dịch vụ và tiện ích cho buổi chơi của bạn"}
              </p>
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <BookingProgress currentStep={2} />
        </div>
      </div>

      <Separator />

      {/* Customer & Booking Selection - Combined Filter */}
      <section>
        <Card className="p-6 rounded-2xl">
          <CardContent className="px-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Bộ lọc</h3>
              </div>
              <div
                className={`grid gap-4 ${
                  isReceptionist
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-2"
                    : "grid-cols-1 md:grid-cols-1 lg:grid-cols-1"
                }`}
              >
                {/* 1. Khách hàng (chỉ cho receptionist) */}
                {isReceptionist && (
                  <div className="space-y-2">
                    <Label htmlFor="customer">Khách hàng</Label>
                    <CustomerSelector
                      value={localCustomerId}
                      onChange={handleCustomerChange}
                      customers={MOCK_CUSTOMERS}
                      placeholder="Chọn khách hàng..."
                    />
                  </div>
                )}

                {/* 2. Phiếu đặt sân */}
                <div className="space-y-2">
                  <Label htmlFor="booking">Phiếu đặt sân</Label>
                  <BookingSelector
                    value={localBookingId}
                    onChange={handleBookingChange}
                    bookings={availableBookings}
                    placeholder="Chọn phiếu đặt sân..."
                    emptyMessage={
                      isReceptionist && !localCustomerId
                        ? "Vui lòng chọn khách hàng trước"
                        : "Không tìm thấy phiếu đặt sân"
                    }
                    disabled={isReceptionist && !localCustomerId}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* Main Content - Only show if booking is selected */}
      {localBookingId && (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Service Booking Form */}
            <div className="lg:col-span-2 space-y-6">
              <ServiceBookingForm
                services={services}
                coaches={coaches}
                onServiceUpdate={handleServiceUpdate}
                onCoachUpdate={handleCoachUpdate}
              />
            </div>

            {/* Service Summary Card */}
            <div className="lg:col-span-1">
              <ServiceSummaryCard
                date={bookingData.date}
                timeSlots={bookingData.timeSlots}
                court={bookingData.court}
                courtType={bookingData.courtType}
                services={services}
                coaches={coaches}
                onContinue={handleContinue}
              />
            </div>
          </div>

          {/* Mobile Continue Button */}
          <div className="lg:hidden">
            <Button
              onClick={handleContinue}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              Tiếp tục thanh toán
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
