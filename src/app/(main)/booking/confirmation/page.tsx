"use client";

import * as React from "react";
import { useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/ui/button";
import { Home } from "lucide-react";
import { useAuth } from "@/features/auth/lib/useAuth";
import {
  getLastBooking,
  type BookingConfirmationData,
} from "@/features/booking/mock/bookingFlowStore";
import { BookingConfirmationHeader } from "@/features/booking/components/confirmation/BookingConfirmationHeader";
import { BookingInfoCard } from "@/features/booking/components/confirmation/BookingInfoCard";
import { BookingPaymentSummaryCard } from "@/features/booking/components/confirmation/BookingPaymentSummaryCard";
import { BookingServicesCard } from "@/features/booking/components/confirmation/BookingServicesCard";
import { Separator } from "@/ui/separator";
import { isCustomer } from "@/lib/role-labels";

function formatCurrencyVND(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function formatDateVN(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("vi-VN", {
      weekday: "long",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const data: BookingConfirmationData = useMemo(() => {
    const mock = getLastBooking();
    const bookingId = searchParams.get("bookingId") || mock.bookingId;
    const paymentMethodParam = searchParams.get("paymentMethod");
    const statusParam = searchParams.get("status");

    const paymentMethod =
      paymentMethodParam === "online" || paymentMethodParam === "counter"
        ? paymentMethodParam
        : mock.paymentMethod;

    const status =
      statusParam === "success" || statusParam === "pending"
        ? statusParam
        : mock.status;

    return {
      ...mock,
      bookingId,
      paymentMethod: paymentMethod as BookingConfirmationData["paymentMethod"],
      status: status as BookingConfirmationData["status"],
    };
  }, [searchParams]);

  const formattedDate = formatDateVN(data.date);

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Xác nhận đặt sân</h1>
        <p className="text-muted-foreground">
          Kiểm tra thông tin đặt sân của bạn
        </p>
      </div>

      <Separator />

      <BookingConfirmationHeader data={data} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BookingInfoCard data={data} formattedDate={formattedDate} />
        <BookingServicesCard data={data} formatCurrency={formatCurrencyVND} />
      </div>

      <BookingPaymentSummaryCard
        data={data}
        formatCurrency={formatCurrencyVND}
      />

      <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
        <Button
          variant="secondary"
          className="w-full sm:w-auto"
          onClick={() => router.push("/")}
        >
          <Home className="h-4 w-4 mr-2" />
          Về trang chủ
        </Button>
        <Button
          className="w-full sm:w-auto"
          onClick={() =>
            router.push(
              isCustomer(user) ? "/dashboard" : "/booking/manage"
            )
          }
        >
          Xem lịch đặt của tôi
        </Button>
      </div>
    </div>
  );
}
