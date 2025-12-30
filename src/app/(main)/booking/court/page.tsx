"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  CourtBookingFilter,
  CourtBookingSummaryCard,
  CourtSelector,
  CourtTimeSlotGrid,
} from "@/features/booking/components";
import { Separator } from "@/ui/separator";
import type { CustomerCourt as Court, CustomerCourtType as CourtType, TimeSlot } from "@/types";
import { useBookingFlowStore } from "@/features/booking/stores/useBookingFlowStore";
import { useAuth } from "@/features/auth/lib/useAuth";
import { BookingProgress } from "@/features/booking/components";
import { ROLES } from "@/lib/role-labels";
import { useCustomers, useCourtTypes, useCourts, useBranches, useCreateCourtBooking } from "@/lib/api";

export default function BookingCourtPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { setCourtBooking, setCurrentStep, setSelectedCustomerId } =
    useBookingFlowStore();

  const isReceptionist = user?.role === ROLES.RECEPTIONIST || user?.role?.toLowerCase() === "receptionist";

  // Mutation for creating court booking
  const createCourtBookingMutation = useCreateCourtBooking();

  // Fetch real data
  const { data: customers = [] } = useCustomers();
  const { data: courtTypes = [] } = useCourtTypes();
  const { data: branches = [] } = useBranches();


  // Filter state
  const [filters, setFilters] = React.useState({
    cityId: "",
    facilityId: (Array.isArray(branches) && branches[0]?.id) ? branches[0].id.toString() : "1",
    courtTypeId: "",
    date: new Date(),
  });
  // Sync facilityId with user's branch or first available branch
  React.useEffect(() => {
    if (user?.branchId && !filters.facilityId) {
      setFilters(prev => ({ ...prev, facilityId: user.branchId!.toString() }));
    } else if (branches.length > 0 && !filters.facilityId) {
      setFilters(prev => ({ ...prev, facilityId: branches[0].id.toString() }));
    }
  }, [user?.branchId, branches, filters.facilityId]);

  // Fetch courts based on selected branch and court type
  const { data: rawCourts = [], isLoading: isLoadingCourts } = useCourts(
    filters.facilityId ? parseInt(filters.facilityId) : undefined,
    filters.courtTypeId ? parseInt(filters.courtTypeId) : undefined
  );

  // Transform courts for UI
  const courts = React.useMemo(() => {
    return rawCourts.map((c: any) => ({
      id: c.id.toString(),
      name: c.name,
      type: c.court_type_id?.toString() || filters.courtTypeId,
      facilityId: c.branch_id?.toString() || filters.facilityId,
      imageUrl: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=2070&auto=format&fit=crop",
      baseHourlyPrice: c.base_hourly_price || 50000,
      capacity: c.capacity || 4,
    } as Court));
  }, [rawCourts, filters.courtTypeId, filters.facilityId]);


  // Selection state
  const [selectedCourt, setSelectedCourt] = React.useState<Court | null>(null);
  const [selectedSlots, setSelectedSlots] = React.useState<TimeSlot[]>([]);
  const [selectedCustomer, setSelectedCustomer] = React.useState<string | null>(
    null
  );

  // Transform customers for UI
  const customersForUI = React.useMemo(() => {
    return customers.map((c: any) => ({
      id: c.id.toString(),
      name: c.full_name,
      phone: c.phone_number,
      email: c.email,
    }));
  }, [customers]);

  // Get current court type
  const currentBranch = React.useMemo(() => {
    const branch = branches.find((b: any) => b.id.toString() === filters.facilityId) || null;
    console.log("Current Branch sync:", { facilityId: filters.facilityId, found: !!branch, branch });
    return branch;
  }, [branches, filters.facilityId]);

  const currentCourtType = React.useMemo(() => {
    if (!filters.courtTypeId) return null;
    const courtType = courtTypes.find((type: any) => type.id.toString() === filters.courtTypeId);
    if (!courtType) return null;

    return {
      id: courtType.id.toString(),
      name: courtType.name,
      slotDuration: (courtType as any).slotDuration || (courtType as any).rent_duration || 60,
      icon: "🏸",
    } as CourtType;
  }, [filters.courtTypeId, courtTypes]);

  // Reset selections when filters change
  React.useEffect(() => {
    setSelectedCourt(null);
    setSelectedSlots([]);
  }, [filters.courtTypeId, filters.facilityId, filters.date]);

  const handleFilterChange = React.useCallback((newFilters: any) => {
    // If date is a string, convert it to a Date object
    let processedFilters = { ...newFilters };
    if (processedFilters.date && typeof processedFilters.date === "string") {
      processedFilters.date = new Date(processedFilters.date);
    }
    setFilters(processedFilters);
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

  const handleContinue = React.useCallback(async () => {
    // Validate receptionist must select customer
    if (isReceptionist && !selectedCustomer) {
      alert("Vui lòng chọn khách hàng");
      return;
    }

    if (!selectedCourt || !currentCourtType || selectedSlots.length === 0) {
      alert("Vui lòng chọn đầy đủ thông tin đặt sân");
      return;
    }

    // Get customer info
    const customer = isReceptionist
      ? customersForUI.find((c) => c.id === selectedCustomer)
      : { id: user?.id || 0, name: user?.fullName || "Guest" };

    if (!customer) {
      alert("Không tìm thấy thông tin khách hàng");
      return;
    }

    // Prepare API request
    const bookingRequest = {
      creator: isReceptionist ? user?.employeeId : undefined,
      customerId: customer.id,
      courtId: parseInt(selectedCourt.id.toString()),
      bookingDate: filters.date.toISOString().split('T')[0], // YYYY-MM-DD format
      slots: JSON.stringify(selectedSlots.map((s) => ({
        start_time: `${filters.date.toISOString().split('T')[0]}T${s.start}:00`,
        end_time: `${filters.date.toISOString().split('T')[0]}T${s.end}:00`,
      }))),
      byMonth: false,
      branchId: parseInt(filters.facilityId),
      type: isReceptionist ? "Trực tiếp" : "Online",
    };

    try {
      const response = await createCourtBookingMutation.mutateAsync(bookingRequest);
      
      // Save to store for UI flow
      const bookingId = response.id || `BK-${Date.now()}`;
      const totalCourtFee = selectedSlots.reduce((sum, slot) => {
        const price = typeof slot.price === 'string' ? parseFloat(slot.price) : (slot.price || 0);
        return sum + price;
      }, 0);
      const pricePerHour = selectedCourt.baseHourlyPrice || 50000;
      const branch = branches.find((b: any) => b.id.toString() === filters.facilityId);

      setCourtBooking({
        id: bookingId.toString(),
        customerId: customer?.id,
        customerName: customer?.name,
        courtId: selectedCourt.id,
        courtName: selectedCourt.name,
        courtType: currentCourtType.name,
        facilityId: filters.facilityId,
        facilityName: (currentBranch as any)?.name || branch?.branchName || "VietSport",
        date: filters.date,
        timeSlots: selectedSlots.map((s) => ({
          start: s.start,
          end: s.end,
          price: s.price
        })),
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
    } catch (error) {
      console.error("Failed to create court booking:", error);
      alert("Có lỗi xảy ra khi tạo phiếu đặt sân. Vui lòng thử lại.");
    }
  }, [
    router,
    isReceptionist,
    selectedCustomer,
    selectedCourt,
    currentCourtType,
    selectedSlots,
    filters,
    user,
    branches,
    customersForUI,
    setCourtBooking,
    setCurrentStep,
    setSelectedCustomerId,
    createCourtBookingMutation,
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
          selectedFilters={filters}
          selectedCustomerId={selectedCustomer}
          onCustomerChange={setSelectedCustomer}
          customers={isReceptionist ? customersForUI : []}
          branches={branches}
          courtTypes={courtTypes}
        />
      </section>

      {/* Court Selection */}
      {filters.courtTypeId && (
        <section className="animate-in fade-in-50 duration-500">
          {isLoadingCourts ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-3 text-muted-foreground">Đang tải danh sách sân...</span>
            </div>
          ) : (
            <CourtSelector
              courtTypeId={filters.courtTypeId}
              facilityId={filters.facilityId}
              selectedCourtId={selectedCourt?.id || null}
              onCourtSelect={handleCourtSelect}
              courts={courts}
            />
          )}
        </section>
      )}

      {/* Time Slot Grid */}
      {selectedCourt && (
        <section className="animate-in fade-in-50 duration-500">
          <CourtTimeSlotGrid
            court={selectedCourt}
            courtType={currentCourtType}
            branch={currentBranch}
            selectedDate={filters.date instanceof Date ? filters.date : new Date(filters.date)}
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
