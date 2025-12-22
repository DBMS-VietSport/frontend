"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { RequireRole } from "@/components/auth/RequireRole";
import { useAuth } from "@/lib/auth/useAuth";
import {
  getBookingForInvoice,
  createInvoice,
  type BookingForInvoice,
} from "@/lib/mock/invoiceCashierRepo";
import {
  BookingInfoCard,
  ServicesCard,
  DiscountCard,
  InvoiceSummaryCard,
  AddServiceDialog,
  type ServiceItem,
} from "@/components/invoices";
import { toast } from "sonner";
import { mockServices, mockBranchServices } from "@/lib/booking/mockRepo";
import { logger } from "@/lib/utils/logger";

export default function CashierInvoicePage() {
  const { user } = useAuth();
  const [bookingCode, setBookingCode] = React.useState("");
  const [booking, setBooking] = React.useState<BookingForInvoice | null>(null);
  const [services, setServices] = React.useState<ServiceItem[]>([]);
  const [discount, setDiscount] = React.useState<string>("none");
  const [paymentMethod, setPaymentMethod] = React.useState<string>("cash");
  const [loading, setLoading] = React.useState(false);
  const [addServiceDialogOpen, setAddServiceDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleLoadBooking = async (code?: string) => {
    const codeToLoad = (code || bookingCode).trim();
    if (!codeToLoad) {
      toast.error("Vui lòng nhập mã đặt sân");
      return;
    }

    setLoading(true);
    try {
      const bookingData = await getBookingForInvoice(codeToLoad);
      if (!bookingData) {
        toast.error("Không tìm thấy đặt sân với mã này");
        setBooking(null);
        setServices([]);
        return;
      }

      setBooking(bookingData);

      // Convert existing services to ServiceItem format
      // The services from booking already include price and quantity
      // We need to find the branch_service_id to match with available services
      // Merge services with the same branch_service_id
      const existingServicesMap = new Map<number, ServiceItem>();
      for (const service of bookingData.services) {
        // Find service by name in mockServices
        const serviceData = mockServices.find((s) => s.name === service.name);
        if (!serviceData) continue;

        // Find branch service for this branch and service
        const branchService = mockBranchServices.find(
          (bs) =>
            bs.branch_id === bookingData.branchId &&
            bs.service_id === serviceData.id
        );

        if (branchService) {
          const existingService = existingServicesMap.get(branchService.id);
          if (existingService) {
            // Merge: add quantity if same branch_service_id
            existingService.quantity += service.qty;
          } else {
            // Add new service - use unit_price from branchService for consistency
            existingServicesMap.set(branchService.id, {
              branch_service_id: branchService.id,
              service_id: serviceData.id,
              name: service.name,
              unit_price: branchService.unit_price,
              quantity: service.qty,
              unit: serviceData.unit,
            });
          }
        }
      }

      setServices(Array.from(existingServicesMap.values()));
      toast.success("Đã tải thông tin đặt sân");
    } catch (error) {
      logger.error("Failed to load booking:", error);
      toast.error("Không thể tải thông tin đặt sân");
    } finally {
      setLoading(false);
    }
  };

  const handleAddServices = (newServices: ServiceItem[]) => {
    setServices((prev) => {
      const updated = [...prev];
      for (const newService of newServices) {
        const existingIndex = updated.findIndex(
          (s) => s.branch_service_id === newService.branch_service_id
        );
        if (existingIndex >= 0) {
          // Update quantity if exists
          updated[existingIndex].quantity += newService.quantity;
        } else {
          // Add new service
          updated.push(newService);
        }
      }
      return updated;
    });
    toast.success("Đã thêm dịch vụ");
  };

  const handleRemoveService = (branchServiceId: number) => {
    setServices((prev) =>
      prev.filter((s) => s.branch_service_id !== branchServiceId)
    );
  };

  const handleQuantityChange = (branchServiceId: number, delta: number) => {
    setServices((prev) =>
      prev.map((s) =>
        s.branch_service_id === branchServiceId
          ? { ...s, quantity: Math.max(1, s.quantity + delta) }
          : s
      )
    );
  };

  const handleConfirmPayment = async () => {
    if (!booking) {
      toast.error("Vui lòng tải thông tin đặt sân trước");
      return;
    }

    setIsSubmitting(true);
    try {
      // Calculate discount percent
      let discountPercent = 0;
      if (discount === "student") {
        discountPercent = 10;
      } else if (discount === "platinum") {
        discountPercent = 20;
      }

      // Create invoice
      const invoiceId = await createInvoice({
        court_booking_id: booking.bookingId,
        service_items: services.map((s) => ({
          branch_service_id: s.branch_service_id,
          quantity: s.quantity,
        })),
        discount_percent: discountPercent > 0 ? discountPercent : undefined,
        payment_method:
          paymentMethod === "cash"
            ? "Tiền mặt"
            : paymentMethod === "transfer"
            ? "Chuyển khoản"
            : "Thẻ",
      });

      toast.success("Đã tạo hóa đơn thành công");

      // Reset form
      setBooking(null);
      setServices([]);
      setDiscount("none");
      setPaymentMethod("cash");
      setBookingCode("");
    } catch (error) {
      logger.error("Failed to create invoice:", error);
      toast.error("Không thể tạo hóa đơn");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate totals
  const basePrice = booking?.basePrice || 0;
  const servicesTotal = services.reduce(
    (sum, s) => sum + s.unit_price * s.quantity,
    0
  );
  const discountPercent =
    discount === "student" ? 10 : discount === "platinum" ? 20 : 0;
  const subtotal = basePrice + servicesTotal;
  const discountAmount = (subtotal * discountPercent) / 100;
  const total = subtotal - discountAmount;

  return (
    <RequireRole
      roles={["cashier", "manager"]}
      fallback={<p className="p-6">Không có quyền truy cập</p>}
    >
      <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Thanh toán hóa đơn
          </h1>
          <p className="text-muted-foreground">
            Tạo hóa đơn và xác nhận thanh toán cho khách hàng
          </p>
        </div>

        <Separator />

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Invoice Builder */}
          <div className="lg:col-span-2 space-y-6">
            <BookingInfoCard
              bookingCode={bookingCode}
              onBookingCodeChange={setBookingCode}
              onLoadBooking={handleLoadBooking}
              booking={booking}
              loading={loading}
            />

            <ServicesCard
              services={services}
              onAddClick={() => setAddServiceDialogOpen(true)}
              onRemove={handleRemoveService}
              onQuantityChange={handleQuantityChange}
              hasBooking={!!booking}
            />

            <DiscountCard discount={discount} onDiscountChange={setDiscount} />
          </div>

          {/* Right Column - Payment Summary */}
          <div className="space-y-6">
            <InvoiceSummaryCard
              basePrice={basePrice}
              servicesTotal={servicesTotal}
              discountPercent={discountPercent}
              discountAmount={discountAmount}
              total={total}
              paymentMethod={paymentMethod}
              onPaymentMethodChange={setPaymentMethod}
              onConfirm={handleConfirmPayment}
              onPrint={handlePrint}
              disabled={!booking || total === 0}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>

        {/* Add Service Dialog */}
        {booking && (
          <AddServiceDialog
            open={addServiceDialogOpen}
            onOpenChange={setAddServiceDialogOpen}
            branchId={booking.branchId}
            existingServices={services}
            onAdd={handleAddServices}
          />
        )}
      </div>
    </RequireRole>
  );
}
