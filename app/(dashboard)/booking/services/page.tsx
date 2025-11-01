"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  ServiceBookingForm,
  ServiceSummaryCard,
  BookingProgress,
} from "@/components/booking";
import { Separator } from "@/components/ui/separator";
import { mockServiceItems, mockCoaches } from "@/components/booking/mockData";
import { mockCourts, mockCourtTypes } from "@/components/booking/mockData";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type {
  ServiceItem,
  Coach,
  Court,
  CourtType,
  TimeSlot,
} from "@/components/booking/types";

export default function ServicesPage() {
  const router = useRouter();

  // Mock court booking data (in production, this would come from URL params, session, or context)
  const [bookingData] = React.useState({
    date: new Date(),
    court: mockCourts[0],
    courtType: mockCourtTypes[0],
    timeSlots: [
      { start: "08:00", end: "09:00", status: "available" as const },
      { start: "09:00", end: "10:00", status: "available" as const },
    ] as TimeSlot[],
  });

  // Service state
  const [services, setServices] = React.useState<ServiceItem[]>([
    ...mockServiceItems,
  ]);
  const [coaches, setCoaches] = React.useState<Coach[]>([...mockCoaches]);

  const handleServiceUpdate = React.useCallback(
    (id: string, quantity: number, durationHours?: number) => {
      setServices((prev) =>
        prev.map((s) => (s.id === id ? { ...s, quantity, durationHours } : s))
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

  const handleContinue = React.useCallback(() => {
    // Navigate to payment page (not yet implemented)
    router.push("/booking/payment");
  }, [router]);

  const handleBack = React.useCallback(() => {
    router.push("/booking/schedule");
  }, [router]);

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      {/* Page Header with Progress */}
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
                Đặt dịch vụ bổ sung
              </h1>
              <p className="text-muted-foreground">
                Chọn thêm các dịch vụ và tiện ích cho buổi chơi của bạn
              </p>
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <BookingProgress currentStep={2} />
        </div>
      </div>

      <Separator />

      {/* Main Content */}
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
    </div>
  );
}
