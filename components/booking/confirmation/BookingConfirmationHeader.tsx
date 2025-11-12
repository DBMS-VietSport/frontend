"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { CheckCircle2, CircleAlert } from "lucide-react";
import type { BookingConfirmationData } from "@/lib/mock/bookingFlowStore";

interface BookingConfirmationHeaderProps {
  data: BookingConfirmationData;
}

export function BookingConfirmationHeader({
  data,
}: BookingConfirmationHeaderProps) {
  const isOnline = data.paymentMethod === "online";
  const isCounter = data.paymentMethod === "counter";

  return (
    <Card className="p-6 space-y-3">
      <div>
        <h1 className="text-2xl font-bold">Xác nhận đặt sân</h1>
        <p className="text-muted-foreground">
          Cảm ơn bạn đã đặt sân tại VietSport. Thông tin chi tiết được liệt kê
          bên dưới.
        </p>
      </div>

      {isOnline && data.status === "success" ? (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="h-5 w-5 text-green-600" />
          <AlertTitle className="text-green-700 font-semibold">
            Thanh toán thành công
          </AlertTitle>
          <AlertDescription className="text-green-700/90">
            Mã đặt sân: {data.bookingId}. Chúng tôi đã ghi nhận đặt sân của bạn.
          </AlertDescription>
        </Alert>
      ) : null}

      {isCounter && (
        <Alert className="border-amber-200 bg-amber-50">
          <CircleAlert className="h-5 w-5 text-amber-600" />
          <AlertTitle className="text-amber-700 font-semibold">
            Đặt sân thành công - chờ thanh toán tại quầy
          </AlertTitle>
          <AlertDescription className="text-amber-700/90">
            Vui lòng thanh toán trong vòng 30 phút kể từ khi đặt, nếu không hệ
            thống sẽ tự hủy theo quy định chi nhánh.
          </AlertDescription>
        </Alert>
      )}
    </Card>
  );
}
