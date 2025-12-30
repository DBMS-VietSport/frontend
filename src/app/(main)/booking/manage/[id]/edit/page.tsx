"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Separator } from "@/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/ui/tabs";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { CourtTimeEditor } from "@/features/booking/components/manage/CourtTimeEditor";
import { ServiceEditor } from "@/features/booking/components/manage/ServiceEditor";
import { InvoiceRecalcPanel } from "@/features/booking/components/manage/InvoiceRecalcPanel";
import {
  useCourtBooking,
  useUpdateCourtBooking,
  useCancelCourtBooking,
  useBranchServices, // Use real hook for branch services
  useCalculatePrice,
} from "@/lib/api/use-bookings";
import { calcTotals, formatVND } from "@/lib/booking/pricing";
import type {
  CourtBooking,
  Invoice,
  ServiceBookingItem,
  UpdateCourtTimePayload,
  PricingCalculation,
} from "@/lib/types";
import { LoadingSpinner } from "@/components/shared";
import { logger } from "@/lib/utils/logger";

export default function EditBookingPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = parseInt(params.id as string);

  // Real API Hooks
  const { data: bookingData, isLoading: isLoadingBooking, error: bookingError } = useCourtBooking(bookingId);
  const updateCourtBookingMutation = useUpdateCourtBooking();
  const cancelBookingMutation = useCancelCourtBooking();
  const calculatePriceMutation = useCalculatePrice(); // Add calculation hook

  // Interface for the real API response
  interface BookingDetails {
    id: number;
    court_id: number;
    customer_id: number;
    booking_date: string;
    status: string;
    booked_base_price: number | string;
    court: {
      id: number;
      branch_id: number;
      name: string;
      branch?: {
        id: number;
        name: string;
      };
      court_type?: {
        id: number;
        name: string;
      };
    };
    booking_slots: {
      id: number;
      start_time: string;
      end_time: string;
      status: string;
      court_booking_id: number;
    }[];
    invoice: any[];
    service_booking: {
      id: number;
      status: string;
      invoice: any[];
      service_booking_item: any[];
    }[];
  }

  // Cast the data to our interface
  const booking = bookingData as BookingDetails | undefined;

  // We need branchId for loading services. Derived from booking court -> branch
  const branchId = booking?.court?.branch_id || booking?.court?.branch?.id || 1;
  const { data: branchServicesData } = useBranchServices(branchId);

  // Derived State
  const invoices = React.useMemo(() => {
    if (!booking) return [];
    // Aggregate invoices from court booking and its service bookings
    const courtInvoices = booking.invoice || [];
    const serviceInvoices = booking.service_booking?.flatMap((sb: any) => sb.invoice || []) || [];
    return [...courtInvoices, ...serviceInvoices];
  }, [booking]);

  const serviceItems = React.useMemo(() => {
    if (!booking) return [];

    // Aggregate items from all service bookings
    return booking.service_booking?.flatMap((sb: any) =>
      sb.service_booking_item?.map((item: any) => {
        // Try to find missing branchService details from the fetched branchServicesData
        // This is necessary if the backend detail query didn't deep-include branchService
        let branchService = item.branchService || item.branch_service;

        if (!branchService && branchServicesData) {
          branchService = (branchServicesData as any[]).find(s => s.id === item.branch_service_id);
        }

        // Ensure unit_price is a number
        if (branchService && branchService.unit_price) {
          branchService.unit_price = Number(branchService.unit_price);
        }

        return {
          ...item,
          service_booking_id: sb.id,
          branchService: branchService
        };
      }) || []
    ) || [];
  }, [booking, branchServicesData]);

  // Transform booking slots to match component expectation (mapping status)
  const initialSlots = React.useMemo(() => {
    if (!booking?.booking_slots) return [];
    return booking.booking_slots.map((slot: any) => {
      // Map Vietnamese status to internal English status if needed
      let status = slot.status;
      if (slot.status === "Trống") status = "available";
      else if (slot.status === "Đã đặt") status = "booked";
      else if (slot.status === "Đang giữ chỗ") status = "pending";
      // else keep as is (e.g. "past") or default to "booked" if recognized
      if (!status || status === "Đã thanh toán") status = "booked";

      // IMPORTANT: Backend returns ISO strings (e.g., 2024-05-21T16:00:00.000Z)
      // To satisfy "no timezone process needed" (meaning treating the numeric literal as local time),
      // we strip the 'Z' suffix so the browser parses it as Local Date instead of UTC.
      // 2024-05-21T16:00:00.000Z (UTC 16:00) -> 2024-05-21T16:00:00.000 (Local 16:00)
      const startTime = slot.start_time.endsWith('Z') ? slot.start_time.slice(0, -1) : slot.start_time;
      const endTime = slot.end_time.endsWith('Z') ? slot.end_time.slice(0, -1) : slot.end_time;

      return {
        ...slot,
        id: slot.id, // Ensure ID is passed
        start_time: startTime,
        end_time: endTime,
        status: status as any
      };
    });
  }, [booking]);

  const [isSaving, setIsSaving] = React.useState(false);

  // Edit state
  const [editedCourtId, setEditedCourtId] = React.useState<number | null>(null);
  const [editedSlots, setEditedSlots] = React.useState<any[]>([]);
  const [editedServiceItems, setEditedServiceItems] = React.useState<any[]>([]);
  const [removedServiceIds, setRemovedServiceIds] = React.useState<number[]>([]);

  // Initialize edit state when booking data loads
  React.useEffect(() => {
    if (booking) {
      setEditedCourtId(booking.court_id);
      setEditedSlots(
        (initialSlots ?? []).map((s: any) => ({
          id: s.id,
          start_time: s.start_time,
          end_time: s.end_time,
        }))
      );
      // Initialize edited services from real data
      setEditedServiceItems(serviceItems);
    }
  }, [booking, serviceItems, initialSlots]);



  // Calculate pricing (using real or mock logic? We might need to update calcTotals to handle real data structure)
  // For now, assuming calcTotals works with the structure or we might need to map it.
  // Real data structure might hold court price differently.

  // MAPPING FOR PRICING CALC (Temporary adapter if needed, or ensure calcTotals is robust)
  // bookingData.court is real. 

  // TODO: calcTotals relies on mockCourts etc. We might need to fetch real court/service reference data for pricing.
  // For now, passing mixed data might be risky. 
  // Let's assume we use the pricing fields from the DB booking for "original" and re-calc for "new".

  // Calculate pricing
  const originalCalculation: PricingCalculation = React.useMemo(() => {
    // 1. Calculate paid amount (from invoices)
    const paid = invoices
      .filter((inv: any) => inv.status === "Paid" || inv.status === "Đã thanh toán")
      .reduce((sum: number, inv: any) => sum + Number(inv.total_amount), 0);

    // 2. Calculate service total from initial items (Value)
    const serviceTotal = serviceItems.reduce(
      (sum, item) => sum + (item.quantity * (item.branchService?.unit_price || 0)),
      0
    );

    const courtFee = Number(booking?.booked_base_price || 0);
    const totalValue = courtFee + serviceTotal;

    return {
      courtFee: courtFee,
      serviceFee: serviceTotal,
      totalAmount: totalValue, // Total Value of the booking
      alreadyPaid: paid,
      difference: 0
    };
  }, [booking, invoices, serviceItems]);

  const [newCalculation, setNewCalculation] = React.useState<PricingCalculation>(originalCalculation);

  // Change Detection
  const hasChanges = React.useMemo(() => {
    if (!booking) return false;

    // 1. Court Time Changes
    const courtChanged = editedCourtId !== booking.court_id;
    // Simple check on slots length or content. 
    // Ideally hash content. Here we check start/end times matches.
    const slotsChanged = JSON.stringify(editedSlots.map(s => ({ s: s.start_time, e: s.end_time }))) !==
      JSON.stringify(initialSlots.map(s => ({ s: s.start_time, e: s.end_time })));

    // 2. Service Changes
    // Check if items length changed or any quantity/item changed
    const servicesChanged = JSON.stringify(editedServiceItems.map(i => ({ id: i.branch_service_id, q: i.quantity }))) !==
      JSON.stringify(serviceItems.map(i => ({ id: i.branch_service_id, q: i.quantity })));

    return courtChanged || slotsChanged || servicesChanged;
  }, [booking, editedCourtId, editedSlots, initialSlots, editedServiceItems, serviceItems]);


  // Real API Hooks
  // (Hooks are already declared at the top of the component)

  // ... (existing code)

  // Recalculate New Pricing when edits happen
  React.useEffect(() => {
    // 1. Services: Client-side sum (always synchronous)
    const newServiceFee = editedServiceItems.reduce(
      (sum, item) => sum + (item.quantity * (item.branchService?.unit_price || 0)),
      0
    );

    if (!hasChanges) {
      setNewCalculation(prev => ({ ...originalCalculation, serviceFee: newServiceFee, totalAmount: originalCalculation.courtFee + newServiceFee, difference: (originalCalculation.courtFee + newServiceFee) - originalCalculation.totalAmount }));
      // Actually if !hasChanges, strictly return originalCalculation? 
      // But maybe service items changed back to original but price might theoretically differ?
      // No, for simplicity, if !hasChanges, it is exactly original.
      setNewCalculation(originalCalculation);
      return;
    }

    const calculateCourtFee = async () => {
      let newCourtFee = originalCalculation.courtFee;

      // Only re-calculate court fee if court or slots changed
      const courtChanged = editedCourtId !== booking?.court_id;
      const slotsChanged = JSON.stringify(editedSlots.map(s => ({ s: s.start_time, e: s.end_time }))) !==
        JSON.stringify(initialSlots.map(s => ({ s: s.start_time, e: s.end_time })));

      if ((courtChanged || slotsChanged) && editedCourtId && editedSlots.length > 0) {
        try {
          // Prepare simple slots array for API (HH:mm format preferred by backend logic often)
          // Edit page slots are full ISO strings (Local) e.g. "2024-05-21T16:00:00.000"
          // We extract HH:mm
          const simplifiedSlots = editedSlots.map(s => {
            const st = s.start_time.includes("T") ? s.start_time.split("T")[1].substring(0, 5) : s.start_time.substring(0, 5);
            const et = s.end_time.includes("T") ? s.end_time.split("T")[1].substring(0, 5) : s.end_time.substring(0, 5);
            return { start_time: st, end_time: et };
          });

          // Call API
          // We need the date. Booking date is usually strict "YYYY-MM-DD"
          // booking.booking_date is ISO.
          const dateStr = booking?.booking_date ? (booking.booking_date.includes("T") ? booking.booking_date.split("T")[0] : booking.booking_date) : new Date().toISOString().split("T")[0];

          const result: any[] = await calculatePriceMutation.mutateAsync({
            courtId: editedCourtId,
            date: dateStr,
            slots: simplifiedSlots
          });

          // Result is array of price details per slot. Sum total_price.
          if (Array.isArray(result)) {
            newCourtFee = result.reduce((sum, item) => sum + Number(item.total_price), 0);
          }
        } catch (e) {
          console.error("Failed to calculate court price", e);
          // Fallback: newCourtFee remains (or 0?)
        }
      } else if (!courtChanged && !slotsChanged) {
        // If court/slots didn't change, keep original court fee logic
        newCourtFee = originalCalculation.courtFee;
      } else {
        // Changed but invalid state?
        newCourtFee = 0;
      }

      const total = newCourtFee + newServiceFee;

      setNewCalculation({
        courtFee: newCourtFee,
        serviceFee: newServiceFee,
        totalAmount: total,
        alreadyPaid: originalCalculation.alreadyPaid,
        difference: total - originalCalculation.totalAmount // Delta
      });
    };

    calculateCourtFee();
  }, [hasChanges, editedServiceItems, originalCalculation, editedSlots, editedCourtId, booking?.booking_date, booking?.court_id, initialSlots]);

  // Handle Loading & Errors - MOVED here to satisfy Rules of Hooks
  if (isLoadingBooking) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (bookingError || !booking) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center text-destructive">
          Không thể tải thông tin booking. Vui lòng thử lại sau.
        </div>
        <Button variant="outline" onClick={() => router.push("/booking/manage")} className="mt-4">
          Quay lại danh sách
        </Button>
      </div>
    );
  }


  const handleCourtTimeChange = (courtId: number, slots: any[]) => {
    setEditedCourtId(courtId);
    setEditedSlots(slots);
  };

  const handleServiceChange = (items: any[], removedIds: number[]) => {
    setEditedServiceItems(items);
    setRemovedServiceIds(removedIds);
  };

  const handleSave = async () => {
    if (!booking) return;
    setIsSaving(true);
    try {
      // 1. Update Court Booking
      if (editedCourtId && (editedCourtId !== booking.court_id ||
        JSON.stringify(editedSlots) !== JSON.stringify(initialSlots))) {

        await updateCourtBookingMutation.mutateAsync({
          bookingId,
          courtId: editedCourtId!,
          bookingDate: booking.booking_date,
          slots: JSON.stringify(editedSlots),
          branchId: booking.court.branch_id
        });
        toast.success("Cập nhật thời gian/sân thành công");
      }

      // 2. Update Services (Stub for now, or Toast)
      // Since backend doesn't have a specific endpoint for update services on an existing booking easily exposed here yet
      // we will warn user.
      if (JSON.stringify(editedServiceItems) !== JSON.stringify(serviceItems)) {
        toast.warning("Hệ thống chưa hỗ trợ cập nhật dịch vụ trực tiếp. Vui lòng tạo booking dịch vụ riêng hoặc liên hệ nhân viên.");
      }

      router.push("/booking/manage");
    } catch (error) {
      logger.error("Failed to save changes:", error);
      toast.error("Không thể lưu thay đổi");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/booking/manage");
  };

  const handleCancelBooking = async () => {
    if (!booking) return;
    const ok = window.confirm(`Bạn có chắc muốn hủy booking #${bookingId}?`);
    if (!ok) return;
    try {
      setIsSaving(true);
      await cancelBookingMutation.mutateAsync(bookingId);
      toast.success("Đã hủy booking thành công");
      router.push("/booking/manage");
    } catch (e) {
      toast.error("Hủy booking thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  const court = booking.court;

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Chỉnh sửa đặt sân #{bookingId}
            </h1>
            <p className="text-muted-foreground">
              {booking.court?.branch?.name || booking.court?.name ? (
                <>
                  {booking.court?.branch?.name} • {booking.court?.name}
                </>
              ) : (
                "Thay đổi thông tin sân, thời gian và dịch vụ"
              )}
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Editors */}
        <div className="lg:col-span-2 space-y-6 ">
          <Card className="rounded-2xl overflow-hidden">
            <Tabs defaultValue="court" className="w-full">
              <TabsList className="w-full grid grid-cols-2 rounded-none border-b ">
                <TabsTrigger value="court">Sân & Thời gian</TabsTrigger>
                <TabsTrigger value="services">Dịch vụ</TabsTrigger>
              </TabsList>

              <TabsContent value="court" className="p-6 mt-0 overflow-auto">
                <CourtTimeEditor
                  bookingId={bookingId}
                  initialCourtId={booking.court_id}
                  initialSlots={initialSlots}
                  branchId={branchId}
                  initialCourtDetails={{
                    id: booking.court.id,
                    name: booking.court.name,
                    branch: booking.court.branch || (booking.court.branch_id ? { name: `Chi nhánh ${booking.court.branch_id}` } : undefined), // Fallback if needed
                    court_type: booking.court.court_type,
                    base_hourly_price: Number(booking.booked_base_price) // Use booked price as base for display if not fetching court details separately yet
                  }}
                  onChange={handleCourtTimeChange}
                />
              </TabsContent>

              <TabsContent value="services" className="p-6 mt-0">
                <ServiceEditor
                  branchId={branchId}
                  initialItems={serviceItems}
                  defaultStartTime={(initialSlots)[0]?.start_time || new Date().toISOString()}
                  defaultEndTime={(initialSlots)[(initialSlots).length - 1]?.end_time || new Date().toISOString()}
                  invoices={invoices}
                  onChange={handleServiceChange}
                  bookingId={bookingId}
                  customerId={booking.customer_id}
                />
              </TabsContent>
            </Tabs>
          </Card>
        </div>

        {/* Right Column - Pricing Panel */}
        <div className="lg:col-span-1">
          <InvoiceRecalcPanel
            oldCalculation={originalCalculation}
            newCalculation={newCalculation}
            hasChanges={hasChanges}
            onSave={handleSave}
            onCancel={handleCancel}
            isSaving={isSaving}
            onCancelBooking={handleCancelBooking}
            bookingStatus={booking.status}
            bookingId={bookingId}
          />
        </div>
      </div>
    </div>
  );
}
