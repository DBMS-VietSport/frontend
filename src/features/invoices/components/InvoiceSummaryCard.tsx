"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Label } from "@/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Separator } from "@/ui/separator";
import { Printer } from "lucide-react";
import { formatVND } from "@/features/booking/utils/pricing";

interface InvoiceSummaryCardProps {
  basePrice: number;
  servicesTotal: number;
  discountPercent: number;
  discountAmount: number;
  total: number;
  paymentMethod: string;
  onPaymentMethodChange: (value: string) => void;
  onConfirm: () => void;
  onPrint: () => void;
  disabled: boolean;
  isSubmitting: boolean;
}

export function InvoiceSummaryCard({
  basePrice,
  servicesTotal,
  discountPercent,
  discountAmount,
  total,
  paymentMethod,
  onPaymentMethodChange,
  onConfirm,
  onPrint,
  disabled,
  isSubmitting,
}: InvoiceSummaryCardProps) {

  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle>Hóa đơn</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tiền sân</span>
            <span className="font-medium">{formatVND(basePrice)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tổng dịch vụ</span>
            <span className="font-medium">{formatVND(servicesTotal)}</span>
          </div>
          {discountPercent > 0 && (
            <div className="flex justify-between text-destructive">
              <span>Giảm giá ({discountPercent}%)</span>
              <span>-{formatVND(discountAmount)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between text-lg font-bold">
            <span>Tổng thanh toán</span>
            <span>{formatVND(total)}</span>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Phương thức thanh toán</Label>
          <Select value={paymentMethod} onValueChange={onPaymentMethodChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Tiền mặt</SelectItem>
              <SelectItem value="transfer">Chuyển khoản</SelectItem>
              <SelectItem value="card">Thẻ</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Button
            className="w-full"
            onClick={onConfirm}
            disabled={disabled || isSubmitting}
          >
            Xác nhận thanh toán
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={onPrint}
            disabled={disabled}
          >
            <Printer className="h-4 w-4 mr-2" />
            In hóa đơn
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
