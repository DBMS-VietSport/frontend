"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ServiceBookingForm,
  ServiceSummaryCard,
  BookingProgress,
} from "@/features/booking/components";
import { Separator } from "@/ui/separator";
import { Button } from "@/ui/button";
import { ArrowLeft } from "lucide-react";
import type {
  ServiceItem,
  Coach,
  TimeSlot,
  ServiceItemCategory,
  ServiceItemUnit,
  CustomerCourt as Court,
  CustomerCourtType as CourtType
} from "@/types";
import { useBookingFlowStore } from "@/features/booking/stores/useBookingFlowStore";
import { useAuth } from "@/features/auth/lib/useAuth";
import {
  BookingSelector,
  type CourtBookingOption,
} from "@/features/booking/components/shared/BookingSelector";
import {
  CustomerSelector,
} from "@/features/booking/components/shared/CustomerSelector";
import { Card, CardContent } from "@/ui/card";
import { Label } from "@/ui/label";
import { ROLES } from "@/lib/role-labels";
import { useCustomers, useCourtBookings, useBranchServices, useEmployees, useCustomerCourtBookings, useAvailableTrainers } from "@/lib/api";
import { toast } from "sonner";
import { setLastBooking } from "@/features/booking/mock/bookingFlowStore";

const EMPTY_ARRAY: any[] = [];

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
    resetFlow,
  } = useBookingFlowStore();

  const isReceptionist = user?.role === ROLES.RECEPTIONIST || user?.role?.toLowerCase() === "receptionist";
  const branchId = user?.branchId || 1;

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

  // Fetch real data
  const { data: qCustomersData } = useCustomers();
  const customersData = qCustomersData ?? EMPTY_ARRAY;

  const { data: qCustomerBookingsData, isLoading: isLoadingBookings } = useCustomerCourtBookings(
    localCustomerId ? parseInt(localCustomerId) : 0,
    branchId
  );
  const customerBookingsData = qCustomerBookingsData ?? EMPTY_ARRAY;

  const { data: qBranchServicesData } = useBranchServices(branchId);
  const branchServicesData = qBranchServicesData ?? EMPTY_ARRAY;

  const { data: qAvailableTrainersData } = useAvailableTrainers(
    localBookingId ? parseInt(localBookingId) : 0
  );
  const availableTrainersData = qAvailableTrainersData ?? EMPTY_ARRAY;

  // Transform data for UI
  const customers = React.useMemo(() => {
    return (customersData as any[]).map((c: any) => ({
      id: c.id.toString(),
      name: c.full_name,
      phone: c.phone_number,
      email: c.email,
    }));
  }, [customersData]);

  const availBookings: CourtBookingOption[] = React.useMemo(() => {
    return (customerBookingsData as any[]).map((b: any) => {
      let status: "held" | "pending" | "confirmed" | "paid" = "pending";
      const bStatus = b.status?.toLowerCase();
      if (bStatus?.includes("thanh toán") || bStatus === "paid") status = "paid";
      else if (bStatus?.includes("xác nhận")) status = "confirmed";
      else if (bStatus?.includes("giữ")) status = "held";

      // Ensure slots is an array
      let parsedSlots: any[] = [];
      try {
        parsedSlots = typeof b.slots === "string" ? JSON.parse(b.slots) : b.slots;
        if (!Array.isArray(parsedSlots)) parsedSlots = [];
      } catch (e) {
        console.error("Error parsing slots:", e);
      }

      // Parse slots to get time range
      let timeRange = "-";
      if (parsedSlots.length > 0) {
        const first = parsedSlots[0];
        const last = parsedSlots[parsedSlots.length - 1];
        const start = first.start_time.includes("T")
          ? first.start_time.split("T")[1].substring(0, 5)
          : first.start_time.substring(0, 5);
        const end = last.end_time.includes("T")
          ? last.end_time.split("T")[1].substring(0, 5)
          : last.end_time.substring(0, 5);
        timeRange = `${start} - ${end}`;
      }

      return {
        id: b.id.toString(),
        bookingRef: `BK00${b.id}`,
        courtName: b.court_name || '-',
        customerName: b.customer_name || '-',
        courtType: b.court_type || "Sân cầu lông",
        date: new Date(b.booking_date),
        timeRange: timeRange,
        status: status,
        totalAmount: b.total_price || 0,
        slots: parsedSlots,
      };
    });
  }, [customerBookingsData]);

  const services: ServiceItem[] = React.useMemo(() => {
    return (branchServicesData as any[]).map((bs: any) => {
      const name = bs.name || '-';
      let category: ServiceItemCategory = "equipment";
      let icon = "🎾";

      const lowerName = name.toLowerCase();

      if (lowerName.includes("nước") || lowerName.includes("revive") || lowerName.includes("drink")) {
        category = "drink";
        icon = "🥤";
      } else if (
        lowerName.includes("tủ") ||
        lowerName.includes("phòng") ||
        lowerName.includes("locker") ||
        lowerName.includes("shower") ||
        lowerName.includes("sân")
      ) {
        category = "facility";
        icon = "🏢";
      }

      // Map unit from rental_type or fallback to unit
      let unit: ServiceItemUnit = "piece";

      if (bs.rental_type && bs.rental_type.toLowerCase().includes("giờ")) {
        unit = "hour";
      } else if (bs.unit) {
        const u = bs.unit.toLowerCase();
        if (u.includes("giờ") || u === "hour") unit = "hour";
        else if (u.includes("bộ") || u === "set") unit = "set";
      }

      return {
        id: bs.id.toString(),
        name: name,
        price: bs.unit_price,
        unit: unit,
        category: category,
        quantity: 0,
        available: bs.current_stock || 0,
        icon: icon,
      };
    });
  }, [branchServicesData]);

  const coaches: Coach[] = React.useMemo(() => {
    return (availableTrainersData as any[]).map((t: any) => {
      return {
        id: t.id.toString(),
        name: t.full_name,
        sport: t.sport_type || "Cầu lông",
        pricePerHour: t.price_per_hour || 200000,
        quantity: 0,
        rating: 5,
        experience: t.num_of_exp ? `${t.num_of_exp} năm` : "5 năm",
        avatarUrl: "",
      };
    });
  }, [availableTrainersData]);

  // Selection state using ID-to-selection maps for stability
  const [serviceSelections, setServiceSelections] = React.useState<Record<string, {
    quantity: number;
    durationHours?: number;
    hourEntries?: Array<{ id: string; hours: number }>;
  }>>({});

  const [coachSelections, setCoachSelections] = React.useState<Record<string, {
    quantity: number;
    durationHours?: number;
  }>>({});

  // Derive active services/coaches with selection data merged in
  const activeServices = React.useMemo(() => {
    return services.map(s => ({
      ...s,
      ...(serviceSelections[s.id] || { quantity: 0 })
    }));
  }, [services, serviceSelections]);

  const activeCoaches = React.useMemo(() => {
    return coaches.map(c => ({
      ...c,
      ...(coachSelections[c.id] || { quantity: 0 })
    }));
  }, [coaches, coachSelections]);

  // Initialize with court booking from store if available
  const [bookingData, setBookingData] = React.useState(() => {
    if (courtBookingData) {
      return {
        date: courtBookingData.date,
        court: {
          id: courtBookingData.courtId?.toString() || "1",
          name: courtBookingData.courtName,
          type: "1",
          facilityId: "1",
          imageUrl: "",
          capacity: 4,
          baseHourlyPrice: 50000
        } as Court,
        courtType: {
          id: "1",
          name: courtBookingData.courtType,
          slotDuration: 60,
          icon: "🏸"
        } as CourtType,
        timeSlots: courtBookingData.timeSlots.map((slot) => ({
          ...slot,
          status: "Trống" as const,
        })) as TimeSlot[],
      };
    }
    return {
      date: new Date(),
      court: {
        id: "1",
        name: "Sân chưa chọn",
        type: "1",
        facilityId: "1",
        imageUrl: "",
        capacity: 4,
        baseHourlyPrice: 50000
      } as Court,
      courtType: {
        id: "1",
        name: "Cầu lông",
        slotDuration: 60,
        icon: "🏸"
      } as CourtType,
      timeSlots: [] as TimeSlot[],
    };
  });

  const handleServiceUpdate = React.useCallback(
    (
      id: string,
      quantity: number,
      durationHours?: number,
      hourEntries?: Array<{ id: string; hours: number }>
    ) => {
      setServiceSelections((prev) => ({
        ...prev,
        [id]: {
          quantity,
          durationHours,
          hourEntries: hourEntries || prev[id]?.hourEntries,
        },
      }));
    },
    []
  );

  const handleCoachUpdate = React.useCallback(
    (id: string, quantity: number, durationHours?: number) => {
      setCoachSelections((prev) => ({
        ...prev,
        [id]: { quantity, durationHours },
      }));
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

      // Load booking data with full metadata
      if (bookingId) {
        const booking = availBookings.find((b) => b.id === bookingId);
        if (booking) {
          setBookingData({
            date: booking.date,
            court: {
              id: booking.id, // This is booking ID, but summary card expects court object
              name: booking.courtName,
              type: booking.courtType,
              facilityId: "1",
              imageUrl: "",
              capacity: 4,
              baseHourlyPrice: booking.totalAmount / (booking.slots.length || 1) // Rough estimation if not explicit
            } as Court,
            courtType: {
              id: "1",
              name: booking.courtType,
              slotDuration: 60,
              icon: "🏸"
            } as CourtType,
            timeSlots: booking.slots.map((s) => ({
              start: s.start_time.includes("T")
                ? s.start_time.split("T")[1].substring(0, 5)
                : s.start_time.substring(0, 5),
              end: s.end_time.includes("T")
                ? s.end_time.split("T")[1].substring(0, 5)
                : s.end_time.substring(0, 5),
              status: "Trống" as const,
              price: s.price || 0,
            })) as TimeSlot[],
          });
        }
      }
    },
    [setSelectedCourtBookingId, availBookings]
  );

  const handleContinue = React.useCallback(() => {
    if (!localBookingId) {
      alert("Vui lòng chọn phiếu đặt sân");
      return;
    }

    // Calculate total service fee
    let totalServiceFee = 0;
    activeServices.forEach((service) => {
      if (service.quantity > 0 && service.unit !== "free") {
        if (service.unit === "hour") {
          totalServiceFee +=
            service.price * service.quantity * (service.durationHours || 1);
        } else {
          totalServiceFee += service.price * service.quantity;
        }
      }
    });

    activeCoaches.forEach((coach) => {
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
      services: activeServices
        .filter((s) => s.quantity > 0)
        .map((s) => ({
          id: s.id,
          name: s.name,
          quantity: s.quantity,
          price: s.price,
          unit: s.unit,
          durationHours: s.durationHours,
        })),
      coaches: activeCoaches
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
    if (isReceptionist) {
      const booking = availBookings.find((b) => b.id === localBookingId);
      if (booking) {
        setLastBooking({
          bookingId: booking.bookingRef,
          branch: "VietSport TP. Hồ Chí Minh - Quận 1",
          courtName: booking.courtName,
          courtType: booking.courtType,
          date: booking.date.toISOString(),
          timeRange: booking.timeRange,
          services: activeServices
            .filter((s) => s.quantity > 0)
            .map((s) => ({
              name: s.name,
              qty: s.quantity,
              price: s.price,
              unit: s.unit,
            })),
          subtotal: totalServiceFee, // Just service fee
          total: totalServiceFee,
          paymentMethod: "counter", // Default to counter/cash
          status: "success",
        });
      }
      toast.success("Đã lập phiếu dịch vụ thành công");
      resetFlow();
      router.push("/booking/confirmation");
    } else {
      setCurrentStep(3);
      // If coming from edit flow, preserve bookingId in URL
      const bookingIdParam = bookingIdFromQuery
        ? `?bookingId=${bookingIdFromQuery}`
        : "";
      router.push(`/booking/payment${bookingIdParam}`);
    }
  }, [
    router,
    localBookingId,
    activeServices,
    activeCoaches,
    setServiceBooking,
    setCurrentStep,
    bookingIdFromQuery,
    isReceptionist,
    availBookings,
    resetFlow,
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
                className={`grid gap-4 ${isReceptionist
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
                      customers={customers}
                      placeholder="Chọn khách hàng..."
                    />
                  </div>
                )}

                {/* 2. Phiếu đặt sân */}
                <div className="space-y-2">
                  <Label htmlFor="booking">Phiếu đặt sân</Label>
                  {isLoadingBookings ? (
                    <div className="h-10 w-full flex items-center justify-center border rounded-md bg-muted/20 animate-pulse text-xs text-muted-foreground">
                      Đang tải phiếu đặt...
                    </div>
                  ) : (
                    <BookingSelector
                      value={localBookingId}
                      onChange={handleBookingChange}
                      bookings={availBookings}
                      placeholder="Chọn phiếu đặt sân..."
                      emptyMessage={
                        isReceptionist && !localCustomerId
                          ? "Vui lòng chọn khách hàng trước"
                          : "Không tìm thấy phiếu đặt sân"
                      }
                      disabled={isReceptionist && !localCustomerId}
                    />
                  )}
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
                services={activeServices}
                coaches={activeCoaches}
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
                totalCourtPrice={bookingData.court.baseHourlyPrice * (bookingData.timeSlots.length || 1)} // Use the stored total price (we abused baseHourlyPrice to store total/slots)
                services={activeServices}
                coaches={activeCoaches}
                onContinue={handleContinue}
                actionLabel={isReceptionist ? "Xác nhận" : "Tiếp tục"}
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
              {isReceptionist ? "Xác nhận" : "Tiếp tục thanh toán"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
