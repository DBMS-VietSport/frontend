"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Info, AlertTriangle } from "lucide-react";
import { CountdownBadge } from "./CountdownBadge";
import { BankTransferPanel } from "./BankTransferPanel";

interface BookingPricingRules {
  cancelWindowMinutes: number;
  depositRatio: number;
}

interface CounterPaymentPanelProps {
  minutesLeft: number;
  depositRequired: boolean;
  depositAmount?: number;
  rules: BookingPricingRules;
  bookingRef: string;
  onHoldExpired?: () => void;
  onDepositPaid?: () => void;
  isDepositPaid?: boolean;
}

export function CounterPaymentPanel({
  minutesLeft,
  depositRequired,
  depositAmount = 0,
  rules,
  bookingRef,
  onHoldExpired,
  onDepositPaid,
  isDepositPaid = false,
}: CounterPaymentPanelProps) {
  const [showDepositPanel, setShowDepositPanel] = React.useState(false);

  if (!depositRequired) {
    // No deposit required - show hold warning with countdown
    return (
      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5" />
          <div className="flex-1 space-y-2">
            <h4 className="font-semibold text-orange-900">Giữ chỗ tạm thời</h4>
            <p className="text-sm text-muted-foreground">
              Vui lòng thanh toán tại quầy trong vòng{" "}
              <span className="font-semibold">
                {rules.cancelWindowMinutes} phút
              </span>{" "}
              sau khi đặt chỗ, nếu không đặt chỗ sẽ bị hủy tự động.
            </p>
            <div className="flex items-center gap-2 pt-2">
              <span className="text-sm font-medium">Thời gian còn lại:</span>
              <CountdownBadge
                minutesLeft={Math.min(minutesLeft, rules.cancelWindowMinutes)}
                onExpire={onHoldExpired}
              />
            </div>
          </div>
        </div>

        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Bạn sẽ nhận được thông báo xác nhận qua tin nhắn. Mang theo mã đặt
            chỗ <strong>{bookingRef}</strong> khi đến để thanh toán.
          </AlertDescription>
        </Alert>
      </Card>
    );
  }

  // Deposit required - show option to pay deposit
  return (
    <div className="space-y-4">
      <Card className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1 space-y-2">
            <h4 className="font-semibold">Yêu cầu đặt cọc</h4>
            <p className="text-sm text-muted-foreground">
              Do bạn đặt chỗ trước hơn{" "}
              <span className="font-semibold">
                {rules.cancelWindowMinutes} phút
              </span>
              , chúng tôi yêu cầu đặt cọc{" "}
              <span className="font-semibold">
                {Math.round(rules.depositRatio * 100)}%
              </span>{" "}
              giá trị sân bãi để giữ chỗ.
            </p>
            <p className="text-sm text-muted-foreground">
              Số tiền còn lại (50% phí sân + tất cả dịch vụ) sẽ được thanh toán
              tại quầy khi bạn đến.
            </p>
          </div>
        </div>

        {!showDepositPanel && !isDepositPaid && (
          <Button
            onClick={() => setShowDepositPanel(true)}
            className="w-full"
            variant="outline"
          >
            Xem thông tin đặt cọc
          </Button>
        )}

        {isDepositPaid && (
          <Alert>
            <Info className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-sm text-green-700">
              Đã nhận đặt cọc! Bạn có thể thanh toán số tiền còn lại tại quầy
              khi đến.
            </AlertDescription>
          </Alert>
        )}
      </Card>

      {showDepositPanel && (
        <BankTransferPanel
          amount={depositAmount}
          title="Đặt cọc 50% (Phí sân bãi)"
          note="Số tiền còn lại + dịch vụ sẽ thanh toán tại quầy khi đến."
          bookingRef={bookingRef}
          onPaid={onDepositPaid}
          isPaid={isDepositPaid}
        />
      )}
    </div>
  );
}
