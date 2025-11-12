"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { BookingConfirmationData } from "@/lib/mock/bookingFlowStore";

interface BookingPaymentSummaryCardProps {
  data: BookingConfirmationData;
  formatCurrency: (amount: number) => string;
}

export function BookingPaymentSummaryCard({
  data,
  formatCurrency,
}: BookingPaymentSummaryCardProps) {
  const isOnline = data.paymentMethod === "online";
  const servicesTotal =
    (data.services || []).reduce((sum, s) => sum + s.price * s.qty, 0) || 0;
  const courtTotal = Math.max((data.subtotal || 0) - servicesTotal, 0);

  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Thanh toán</h3>
      <Separator />
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Phí sân bãi</span>
          <span className="font-semibold">{formatCurrency(courtTotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Dịch vụ bổ sung</span>
          <span className="font-semibold">{formatCurrency(servicesTotal)}</span>
        </div>
        <Separator className="my-2" />
        <div className="flex items-center justify-between">
          <span className="font-medium">Tạm tính</span>
          <span className="font-semibold">{formatCurrency(data.subtotal)}</span>
        </div>
        {typeof data.discount === "number" && data.discount > 0 && (
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Giảm giá</span>
            <span className="font-semibold">
              - {formatCurrency(data.discount)}
            </span>
          </div>
        )}
        <Separator className="my-2" />
        <div className="flex items-center justify-between text-base">
          <span className="font-medium">Tổng tiền</span>
          <span className="font-bold text-primary">
            {formatCurrency(data.total)}
          </span>
        </div>
      </div>

      <div className="pt-4 space-y-1 text-sm">
        <p className="text-muted-foreground">Phương thức</p>
        <p className="font-medium">
          {isOnline ? "Thanh toán online" : "Thanh toán tại quầy"}
        </p>
        <p className="text-muted-foreground">
          {isOnline
            ? "Bạn đã thanh toán xong."
            : "Vui lòng đến quầy để hoàn tất."}
        </p>
      </div>
    </Card>
  );
}
