"use client";

import * as React from "react";
import { Card } from "@/ui/card";
import { Label } from "@/ui/label";
import { RadioGroup, RadioGroupItem } from "@/ui/radio-group";
import { CreditCard, Wallet } from "lucide-react";
import { cn } from "@/utils";

export type PaymentMethod = "online" | "counter";

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  className?: string;
}

export function PaymentMethodSelector({
  value,
  onChange,
  className,
}: PaymentMethodSelectorProps) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Chọn phương thức thanh toán</h3>
        <RadioGroup
          value={value}
          onValueChange={(val) => onChange(val as PaymentMethod)}
          className="space-y-4"
        >
          {/* Online Payment */}
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="online" id="online" className="mt-1" />
            <div className="flex-1 space-y-1.5">
              <Label
                htmlFor="online"
                className="flex items-center gap-2 cursor-pointer font-medium"
              >
                <CreditCard className="h-4 w-4" />
                Thanh toán online
              </Label>
              <p className="text-sm text-muted-foreground ml-6">
                Chuyển khoản ngân hàng để giữ chỗ ngay. Chúng tôi sẽ xác nhận
                sau vài phút.
              </p>
            </div>
          </div>

          {/* Counter Payment */}
          <div className="flex items-start space-x-3">
            <RadioGroupItem value="counter" id="counter" className="mt-1" />
            <div className="flex-1 space-y-1.5">
              <Label
                htmlFor="counter"
                className="flex items-center gap-2 cursor-pointer font-medium"
              >
                <Wallet className="h-4 w-4" />
                Thanh toán tại quầy
              </Label>
              <p className="text-sm text-muted-foreground ml-6">
                Giữ chỗ và thanh toán khi đến. Có thể yêu cầu đặt cọc tùy theo
                thời gian còn lại.
              </p>
            </div>
          </div>
        </RadioGroup>
      </div>
    </Card>
  );
}
