"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { CourtTimeEditor } from "@/components/booking/manage/CourtTimeEditor";
import { ServiceEditor } from "@/components/booking/manage/ServiceEditor";
import { InvoiceRecalcPanel } from "@/components/booking/manage/InvoiceRecalcPanel";
import {
  getBooking,
  getInvoicesFor,
  getServicesFor,
  updateBookingCourtTime,
  updateServices,
  mockCourts,
  mockBranchServices,
  mockServices,
  cancelBooking,
} from "@/lib/booking/mockRepo";
import { calcTotals, formatVND } from "@/lib/booking/pricing";
import type {
  CourtBooking,
  Invoice,
  ServiceBookingItem,
  UpdateCourtTimePayload,
  UpdateServicesPayload,
  PricingCalculation,
} from "@/lib/types";
import { LoadingSpinner } from "@/components/shared";
import { logger } from "@/lib/utils/logger";

export default function EditBookingPage() {
  const router = useRouter();
  const params = useParams();
  const bookingId = parseInt(params.id as string);

  const [booking, setBooking] = React.useState<CourtBooking | null>(null);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [serviceItems, setServiceItems] = React.useState<ServiceBookingItem[]>(
    []
  );
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);

  // Edit state
  const [editedCourtId, setEditedCourtId] = React.useState<number | null>(null);
  const [editedSlots, setEditedSlots] = React.useState<any[]>([]);
  const [editedServiceItems, setEditedServiceItems] = React.useState<any[]>([]);
  const [removedServiceIds, setRemovedServiceIds] = React.useState<number[]>(
    []
  );

  // Load booking data
  React.useEffect(() => {
    loadBookingData();
  }, [bookingId]);

  const loadBookingData = async () => {
    setIsLoading(true);
    try {
      const bookingData = await getBooking(bookingId);
      if (!bookingData) {
        toast.error("Không tìm thấy booking");
        router.push("/booking/manage");
        return;
      }

      const invoicesData = await getInvoicesFor(bookingId);
      const { items } = await getServicesFor(bookingId);

      setBooking(bookingData);
      setInvoices(invoicesData);
      setServiceItems(items);

      // Initialize edit state
      setEditedCourtId(bookingData.court_id);
      setEditedSlots(
        (bookingData.slots ?? []).map((s: { id: number; start_time: string; end_time: string }) => ({
          id: s.id,
          start_time: s.start_time,
          end_time: s.end_time,
        }))
      );
    } catch (error) {
      logger.error("Failed to load booking:", error);
      toast.error("Không thể tải thông tin booking");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate original pricing
  const originalCalculation = React.useMemo((): PricingCalculation => {
    if (!booking) {
      return {
        courtFee: 0,
        serviceFee: 0,
        totalAmount: 0,
        alreadyPaid: 0,
        difference: 0,
      };
    }

    const court = mockCourts.find((c) => c.id === booking.court_id)!;
    return calcTotals(
      court,
      booking.slots ?? [],
      serviceItems,
      mockBranchServices,
      mockServices,
      invoices
    );
  }, [booking, serviceItems, invoices]);

  // Calculate new pricing based on edits
  const newCalculation = React.useMemo((): PricingCalculation => {
    if (!booking || !editedCourtId) {
      return originalCalculation;
    }

    const court = mockCourts.find((c) => c.id === editedCourtId)!;
    return calcTotals(
      court,
      editedSlots,
      editedServiceItems.filter(
        (item) => !item.id || !removedServiceIds.includes(item.id)
      ),
      mockBranchServices,
      mockServices,
      invoices
    );
  }, [
    booking,
    editedCourtId,
    editedSlots,
    editedServiceItems,
    removedServiceIds,
    invoices,
    originalCalculation,
  ]);

  // Check if there are changes
  const hasChanges = React.useMemo(() => {
    if (!booking) return false;

    // Check court/time changes
    const courtChanged = editedCourtId !== booking.court_id;
    const slotsChanged =
      JSON.stringify(editedSlots) !==
      JSON.stringify(
        (booking.slots ?? []).map((s: { id: number; start_time: string; end_time: string }) => ({
          id: s.id,
          start_time: s.start_time,
          end_time: s.end_time,
        }))
      );

    // Check service changes
    const servicesChanged =
      editedServiceItems.length !== serviceItems.length ||
      removedServiceIds.length > 0 ||
      JSON.stringify(editedServiceItems) !== JSON.stringify(serviceItems);

    return courtChanged || slotsChanged || servicesChanged;
  }, [
    booking,
    editedCourtId,
    editedSlots,
    editedServiceItems,
    removedServiceIds,
    serviceItems,
  ]);

  const handleCourtTimeChange = (courtId: number, slots: any[]) => {
    setEditedCourtId(courtId);
    setEditedSlots(slots);
  };

  const handleServiceChange = React.useCallback(
    (items: any[], removedIds: number[]) => {
      setEditedServiceItems(items);
      setRemovedServiceIds(removedIds);
    },
    []
  );

  const handleSave = async () => {
    if (!booking) return;

    setIsSaving(true);
    try {
      // Update court and time
      const courtPayload: UpdateCourtTimePayload = {
        court_id: editedCourtId!,
        slots: editedSlots.map((s) => ({
          start_time: s.start_time,
          end_time: s.end_time,
        })),
      };
      await updateBookingCourtTime(bookingId, courtPayload);

      // Update services
      const servicePayload: UpdateServicesPayload = {
        items: editedServiceItems.map((item) => ({
          id: item.id,
          branch_service_id: item.branch_service_id,
          quantity: item.quantity,
          start_time: item.start_time,
          end_time: item.end_time,
          trainer_ids: item.trainer_ids,
        })),
        removedItemIds: removedServiceIds,
      };
      await updateServices(bookingId, servicePayload);

      const diff = newCalculation.difference;
      const message =
        diff > 0
          ? `Cập nhật thành công. Cần thanh toán thêm: ${formatVND(diff)}`
          : diff < 0
          ? `Cập nhật thành công. Hoàn lại: ${formatVND(Math.abs(diff))}`
          : "Cập nhật thành công";

      toast.success(message);
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
    if (booking.status === "Paid") {
      toast.error("Không thể hủy đơn đã thanh toán");
      return;
    }
    if (booking.status === "Cancelled") {
      toast.error("Đơn đã được hủy trước đó");
      return;
    }
    const ok = window.confirm(`Bạn có chắc muốn hủy booking #${bookingId}?`);
    if (!ok) return;
    try {
      setIsSaving(true);
      await cancelBooking(bookingId);
      toast.success("Đã hủy booking thành công");
      router.push("/booking/manage");
    } catch (e) {
      logger.error("Cancel booking failed:", e);
      toast.error("Hủy booking thất bại");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const court = mockCourts.find((c) => c.id === booking.court_id);
  const branchId = court?.branch_id || 1;

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
              Thay đổi thông tin sân, thời gian và dịch vụ
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

              <TabsContent value="court" className="p-6 mt-0">
                <CourtTimeEditor
                  bookingId={bookingId}
                  initialCourtId={booking.court_id}
                  initialSlots={booking.slots ?? []}
                  onChange={handleCourtTimeChange}
                />
              </TabsContent>

              <TabsContent value="services" className="p-6 mt-0">
                <ServiceEditor
                  branchId={branchId}
                  initialItems={serviceItems.map((item) => {
                    const branchService = mockBranchServices.find(
                      (bs) => bs.id === item.branch_service_id
                    )!;
                    const service = mockServices.find(
                      (s) => s.id === branchService.service_id
                    )!;
                    return {
                      ...item,
                      service,
                      branchService,
                    };
                  })}
                  defaultStartTime={
                    (booking.slots ?? [])[0]?.start_time || new Date().toISOString()
                  }
                  defaultEndTime={
                    (booking.slots ?? [])[(booking.slots ?? []).length - 1]?.end_time ||
                    new Date().toISOString()
                  }
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
