"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { BookingProgress } from "@/components/booking";
import {
  PaymentMethodSelector,
  type PaymentMethod,
} from "@/components/booking/payment/PaymentMethodSelector";
import { PaymentSummaryCard } from "@/components/booking/payment/PaymentSummaryCard";
import { BankTransferPanel } from "@/components/booking/payment/BankTransferPanel";
import { CounterPaymentPanel } from "@/components/booking/payment/CounterPaymentPanel";
import {
  mockCourts,
  mockCourtTypes,
  mockServiceItems,
  mockCoaches,
} from "@/components/booking/mockData";
import type { ServiceItem, Coach } from "@/components/booking/types";
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
import { setLastBooking } from "@/lib/mock/bookingFlowStore";
import {
  MOCK_CUSTOMERS,
  MOCK_COURT_BOOKINGS,
} from "@/lib/mock/bookingFlowMock";
import { useSearchParams } from "next/navigation";
import {
  getBooking,
  getInvoicesFor,
  mockBranchServices,
  mockServices,
} from "@/lib/booking/mockRepo";

interface BookingPricingRules {
  cancelWindowMinutes: number;
  depositRatio: number;
}

const PRICING_RULES: BookingPricingRules = {
  cancelWindowMinutes: 30,
  depositRatio: 0.5,
};

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const {
    courtBookingData,
    serviceBookingData,
    selectedCourtBookingId,
    selectedCustomerId,
    setSelectedCourtBookingId,
    setSelectedCustomerId,
    resetFlow,
  } = useBookingFlowStore();

  const isReceptionist =
    user?.role === "receptionist" || user?.role === "cashier";

  // Check if this is edit flow (adding services to existing booking)
  const bookingIdFromQuery = searchParams.get("bookingId");
  const isEditFlow = !!bookingIdFromQuery;

  // State for edit flow data
  const [existingBooking, setExistingBooking] = React.useState<any>(null);
  const [existingInvoices, setExistingInvoices] = React.useState<any[]>([]);
  const [alreadyPaid, setAlreadyPaid] = React.useState(0);

  // Load existing booking data for edit flow
  React.useEffect(() => {
    if (isEditFlow && bookingIdFromQuery) {
      const loadExistingData = async () => {
        try {
          const booking = await getBooking(parseInt(bookingIdFromQuery));
          const invoices = await getInvoicesFor(parseInt(bookingIdFromQuery));

          if (booking) {
            setExistingBooking(booking);
            setExistingInvoices(invoices);

            // Calculate already paid amount
            const paid = invoices
              .filter((inv) => inv.status === "Paid")
              .reduce((sum, inv) => sum + inv.total_amount, 0);
            setAlreadyPaid(paid);
          }
        } catch (error) {
          console.error("Failed to load existing booking:", error);
        }
      };
      loadExistingData();
    }
  }, [isEditFlow, bookingIdFromQuery]);

  // Local state for customer and booking selection
  const [localCustomerId, setLocalCustomerId] = React.useState<string | null>(
    selectedCustomerId
  );
  const [localBookingId, setLocalBookingId] = React.useState<string | null>(
    selectedCourtBookingId
  );

  // Initialize booking data
  const [bookingData, setBookingData] = React.useState(() => {
    if (courtBookingData) {
      return {
        date: courtBookingData.date,
        court: mockCourts[0],
        courtType: mockCourtTypes[0],
        timeSlots: courtBookingData.timeSlots.map((slot) => ({
          start: slot.start,
          end: slot.end,
        })),
        pricePerHour: courtBookingData.pricePerHour,
      };
    }
    return {
      date: new Date(),
      court: mockCourts[0],
      courtType: mockCourtTypes[0],
      timeSlots: [
        { start: "08:00", end: "09:00" },
        { start: "09:00", end: "10:00" },
      ],
      pricePerHour: 50000,
    };
  });

  // Initialize services from store
  const [services, setServices] = React.useState<ServiceItem[]>(() => {
    if (serviceBookingData) {
      return mockServiceItems.map((item) => {
        const serviceFromStore = serviceBookingData.services.find(
          (s) => s.id === item.id
        );
        if (serviceFromStore) {
          return {
            ...item,
            quantity: serviceFromStore.quantity,
            durationHours: serviceFromStore.durationHours,
          };
        }
        return item;
      });
    }
    return [...mockServiceItems];
  });

  const [coaches, setCoaches] = React.useState<Coach[]>(() => {
    if (serviceBookingData) {
      return mockCoaches.map((coach) => {
        const coachFromStore = serviceBookingData.coaches.find(
          (c) => c.id === coach.id
        );
        if (coachFromStore) {
          return {
            ...coach,
            quantity: coachFromStore.quantity,
            durationHours: coachFromStore.durationHours,
          };
        }
        return coach;
      });
    }
    return [...mockCoaches];
  });
  const [paymentMethod, setPaymentMethod] =
    React.useState<PaymentMethod>("online");
  const [isOnlinePaid, setIsOnlinePaid] = React.useState(false);
  const [isDepositPaid, setIsDepositPaid] = React.useState(false);

  // Generate booking reference
  const bookingRef = React.useMemo(() => {
    const date = new Date().toISOString().split("T")[0].replace(/-/g, "");
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `VS-${date}-${bookingData.court.id}-${random}`;
  }, [bookingData.court.id]);

  // Calculate fees
  const calculateFees = React.useCallback(() => {
    const durationHours =
      bookingData.timeSlots.length * (bookingData.courtType.slotDuration / 60);
    const courtFee = bookingData.pricePerHour * durationHours;

    let servicesFee = 0;
    services.forEach((service) => {
      if (service.quantity > 0 && service.unit !== "free") {
        if (service.unit === "hour") {
          servicesFee +=
            service.price * service.quantity * (service.durationHours || 1);
        } else {
          servicesFee += service.price * service.quantity;
        }
      }
    });

    coaches.forEach((coach) => {
      if (coach.quantity > 0) {
        servicesFee +=
          coach.pricePerHour * coach.quantity * (coach.durationHours || 1);
      }
    });

    return { courtFee, servicesFee, grandTotal: courtFee + servicesFee };
  }, [bookingData, services, coaches]);

  const { courtFee, servicesFee, grandTotal } = calculateFees();

  // For edit flow, only charge for new services (difference)
  const amountToPay = isEditFlow
    ? servicesFee // Only new services fee
    : grandTotal; // Full amount for new booking

  // Calculate time until slot start
  const minutesUntil = React.useCallback((slotDate: Date) => {
    const now = new Date();
    const diffMs = slotDate.getTime() - now.getTime();
    return diffMs / (1000 * 60);
  }, []);

  const [minutesLeft, setMinutesLeft] = React.useState(() => {
    const slotStart = new Date(bookingData.date);
    slotStart.setHours(8, 0, 0, 0); // First slot starts at 08:00
    return minutesUntil(slotStart);
  });

  // Update minutes left every minute
  React.useEffect(() => {
    const interval = setInterval(() => {
      const slotStart = new Date(bookingData.date);
      slotStart.setHours(8, 0, 0, 0);
      setMinutesLeft(minutesUntil(slotStart));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [bookingData.date, minutesUntil]);

  // Determine if deposit is required
  const depositRequired = React.useMemo(() => {
    return (
      paymentMethod === "counter" &&
      minutesLeft > PRICING_RULES.cancelWindowMinutes
    );
  }, [paymentMethod, minutesLeft]);

  const depositAmount = React.useMemo(() => {
    if (!depositRequired) return 0;
    return Math.round(courtFee * PRICING_RULES.depositRatio);
  }, [depositRequired, courtFee]);

  // Format time slots for display
  const timeSlotRanges = bookingData.timeSlots.map(
    (slot) => `${slot.start} - ${slot.end}`
  );

  // Handle customer change (receptionist/cashier only)
  const handleCustomerChange = React.useCallback(
    (customerId: string | null) => {
      setLocalCustomerId(customerId);
      setSelectedCustomerId(customerId);
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

      if (bookingId) {
        const booking = MOCK_COURT_BOOKINGS.find((b) => b.id === bookingId);
        if (booking) {
          setBookingData({
            date: booking.date,
            court: mockCourts[0],
            courtType: mockCourtTypes[0],
            timeSlots: [
              {
                start: booking.timeRange.split(" - ")[0],
                end: booking.timeRange.split(" - ")[1],
              },
            ],
            pricePerHour: 50000,
          });
        }
      }
    },
    [setSelectedCourtBookingId]
  );

  // Filter bookings
  const availableBookings = React.useMemo(() => {
    if (isReceptionist && localCustomerId) {
      return MOCK_COURT_BOOKINGS.filter(
        (b) => b.status === "pending" || b.status === "held"
      );
    }
    if (!isReceptionist) {
      return MOCK_COURT_BOOKINGS.filter(
        (b) => b.status === "pending" || b.status === "held"
      );
    }
    return [];
  }, [isReceptionist, localCustomerId]);

  const handleBack = React.useCallback(() => {
    router.push("/booking/services");
  }, [router]);

  const handleContinue = React.useCallback(() => {
    if (!localBookingId) {
      alert("Vui lòng chọn phiếu đặt sân");
      return;
    }

    if (paymentMethod === "online") {
      if (!isOnlinePaid) {
        return;
      }
    } else {
      if (depositRequired && !isDepositPaid) {
        return;
      }
    }

    // Save confirmation data
    const booking = MOCK_COURT_BOOKINGS.find((b) => b.id === localBookingId);
    if (booking) {
      setLastBooking({
        bookingId: booking.bookingRef,
        branch: "VietSport TP. Hồ Chí Minh - Quận 1",
        courtName: booking.courtName,
        courtType: booking.courtType,
        date: booking.date.toISOString(),
        timeRange: booking.timeRange,
        services: services
          .filter((s) => s.quantity > 0)
          .map((s) => ({
            name: s.name,
            qty: s.quantity,
            price: s.price,
            unit: s.unit,
          })),
        subtotal: isEditFlow ? servicesFee : courtFee + servicesFee,
        total: isEditFlow ? servicesFee : grandTotal,
        paymentMethod,
        status: paymentMethod === "online" ? "success" : "pending",
      });
    }

    // For edit flow, redirect back to edit page after payment
    if (isEditFlow && bookingIdFromQuery) {
      // In production, save the new services here
      toast.success("Đã thêm dịch vụ và thanh toán thành công");
      router.push(`/booking/manage/${bookingIdFromQuery}/edit`);
      return;
    }

    // Reset flow and navigate to confirmation
    resetFlow();
    router.push("/booking/confirmation");
  }, [
    paymentMethod,
    isOnlinePaid,
    isDepositPaid,
    depositRequired,
    router,
    localBookingId,
    courtFee,
    servicesFee,
    grandTotal,
    services,
    resetFlow,
    isEditFlow,
    bookingIdFromQuery,
  ]);

  const handleOnlinePaid = React.useCallback(() => {
    setIsOnlinePaid(true);
  }, []);

  const handleDepositPaid = React.useCallback(() => {
    setIsDepositPaid(true);
  }, []);

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
              <h1 className="text-3xl font-bold tracking-tight">Thanh toán</h1>
              <p className="text-muted-foreground">
                {isReceptionist
                  ? "Chọn phiếu đặt sân và xử lý thanh toán"
                  : "Chọn phương thức thanh toán và hoàn tất đặt chỗ"}
              </p>
            </div>
          </div>
        </div>
        <div className="shrink-0">
          <BookingProgress currentStep={3} />
        </div>
      </div>

      <Separator />

      {/* Customer & Booking Selection - Combined Filter (hidden in edit flow) */}
      {!isEditFlow && (
        <>
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
                    {/* 1. Khách hàng (chỉ cho receptionist/cashier) */}
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
                        placeholder="Chọn phiếu đặt sân cần thanh toán..."
                        emptyMessage={
                          isReceptionist && !localCustomerId
                            ? "Vui lòng chọn khách hàng trước"
                            : "Không tìm thấy phiếu đặt sân cần thanh toán"
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
        </>
      )}

      {/* Main Content - Only show if booking is selected */}
      {localBookingId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Method & Instructions */}
          <div className="lg:col-span-2 space-y-6">
            <PaymentMethodSelector
              value={paymentMethod}
              onChange={setPaymentMethod}
            />

            {/* Payment Instructions */}
            {paymentMethod === "online" ? (
              <BankTransferPanel
                amount={grandTotal}
                title="Thanh toán online"
                note="Chúng tôi sẽ xác nhận thanh toán của bạn trong vài phút."
                bookingRef={bookingRef}
                onPaid={handleOnlinePaid}
                isPaid={isOnlinePaid}
              />
            ) : (
              <CounterPaymentPanel
                minutesLeft={minutesLeft}
                depositRequired={depositRequired}
                depositAmount={depositAmount}
                rules={PRICING_RULES}
                bookingRef={bookingRef}
                onDepositPaid={handleDepositPaid}
                isDepositPaid={isDepositPaid}
              />
            )}
          </div>

          {/* Summary Card */}
          <div className="lg:col-span-1">
            <PaymentSummaryCard
              date={bookingData.date}
              timeSlots={timeSlotRanges}
              court={bookingData.court}
              courtType={bookingData.courtType}
              pricePerHour={bookingData.pricePerHour}
              services={services}
              coaches={coaches}
              courtFee={isEditFlow ? 0 : courtFee} // Don't show court fee in edit flow
              servicesFee={servicesFee}
              grandTotal={isEditFlow ? servicesFee : grandTotal}
              depositRequired={depositRequired}
              depositAmount={depositAmount}
              paymentMethod={paymentMethod}
              onContinue={handleContinue}
              onBack={handleBack}
              alreadyPaid={alreadyPaid}
              isEditFlow={isEditFlow}
            />
          </div>
        </div>
      )}
    </div>
  );
}
