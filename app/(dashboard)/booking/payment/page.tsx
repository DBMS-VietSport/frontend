"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { BookingProgress } from "@/components/booking/shared/BookingProgress";
import { Separator } from "@/components/ui/separator";
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

  // Mock booking data - in production, fetch from context/API
  const [bookingData] = React.useState({
    date: new Date(),
    court: mockCourts[0],
    courtType: mockCourtTypes[0],
    timeSlots: [
      { start: "08:00", end: "09:00" },
      { start: "09:00", end: "10:00" },
    ],
    pricePerHour: 50000,
  });

  const [services] = React.useState<ServiceItem[]>([...mockServiceItems]);
  const [coaches] = React.useState<Coach[]>([...mockCoaches]);
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

  const handleBack = React.useCallback(() => {
    router.push("/booking/services");
  }, [router]);

  const handleContinue = React.useCallback(() => {
    if (paymentMethod === "online") {
      if (!isOnlinePaid) {
        // Show payment panel
        return;
      }
      // Navigate to confirmation page
      router.push("/booking/confirmation");
    } else {
      // Counter payment - handle based on deposit
      if (depositRequired && !isDepositPaid) {
        // Show deposit panel
        return;
      }
      // Navigate to confirmation
      router.push("/booking/confirmation");
    }
  }, [paymentMethod, isOnlinePaid, isDepositPaid, depositRequired, router]);

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
          <h1 className="text-3xl font-bold tracking-tight">Thanh toán</h1>
          <p className="text-muted-foreground">
            Chọn phương thức thanh toán và hoàn tất đặt chỗ
          </p>
        </div>
        <div className="shrink-0">
          <BookingProgress currentStep={3} />
        </div>
      </div>

      <Separator />

      {/* Main Content */}
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
            courtFee={courtFee}
            servicesFee={servicesFee}
            grandTotal={grandTotal}
            depositRequired={depositRequired}
            depositAmount={depositAmount}
            paymentMethod={paymentMethod}
            onContinue={handleContinue}
            onBack={handleBack}
          />
        </div>
      </div>
    </div>
  );
}
