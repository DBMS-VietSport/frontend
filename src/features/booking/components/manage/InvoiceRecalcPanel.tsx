"use client";

import * as React from "react";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Separator } from "@/ui/separator";
import { ArrowRight, Save, X } from "lucide-react";
import { formatVND } from "@/features/booking/utils/pricing";
import type { PricingCalculation } from "@/types";
import { motion } from "framer-motion";

interface InvoiceRecalcPanelProps {
  oldCalculation: PricingCalculation;
  newCalculation: PricingCalculation;
  hasChanges: boolean;
  onSave: () => void;
  onCancel: () => void;
  isSaving?: boolean;
  onCancelBooking?: () => void;
  bookingStatus?: string;
  bookingId?: number;
}

export function InvoiceRecalcPanel({
  oldCalculation,
  newCalculation,
  hasChanges,
  onSave,
  onCancel,
  isSaving = false,
  onCancelBooking,
  bookingStatus,
  bookingId,
}: InvoiceRecalcPanelProps) {
  const courtFeeChanged = oldCalculation.courtFee !== newCalculation.courtFee;
  const serviceFeeChanged =
    oldCalculation.serviceFee !== newCalculation.serviceFee;
  const difference = newCalculation.difference;

  return (
    <Card className="p-6 rounded-2xl sticky top-4 space-y-6">
      <h3 className="text-xl font-bold">Tổng hợp thanh toán</h3>

      <div className="space-y-4">
        {/* Court Fee */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Phí sân</span>
            {courtFeeChanged && hasChanges && (
              <Badge variant="outline" className="text-xs">
                Thay đổi
              </Badge>
            )}
          </div>
          {courtFeeChanged && hasChanges ? (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground line-through">
                {formatVND(oldCalculation.courtFee)}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <motion.span
                className="font-semibold text-primary"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.3 }}
              >
                {formatVND(newCalculation.courtFee)}
              </motion.span>
            </div>
          ) : (
            <div className="font-semibold">
              {formatVND(newCalculation.courtFee)}
            </div>
          )}
        </div>

        {/* Service Fee */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Phí dịch vụ</span>
            {serviceFeeChanged && hasChanges && (
              <Badge variant="outline" className="text-xs">
                Thay đổi
              </Badge>
            )}
          </div>
          {serviceFeeChanged && hasChanges ? (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground line-through">
                {formatVND(oldCalculation.serviceFee)}
              </span>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
              <motion.span
                className="font-semibold text-primary"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.3 }}
              >
                {formatVND(newCalculation.serviceFee)}
              </motion.span>
            </div>
          ) : (
            <div className="font-semibold">
              {formatVND(newCalculation.serviceFee)}
            </div>
          )}
        </div>

        <Separator />

        {/* Total Amount */}
        <div className="space-y-2">
          <div className="text-sm text-muted-foreground">Tổng cộng</div>
          <div className="text-2xl font-bold text-primary">
            {formatVND(newCalculation.totalAmount)}
          </div>
        </div>

        <Separator />

        {/* Already Paid */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Đã thanh toán</span>
          <span className="font-semibold">
            {formatVND(newCalculation.alreadyPaid)}
          </span>
        </div>

        {/* Difference */}
        {difference !== 0 && (
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Chênh lệch</span>
              <Badge
                variant={difference > 0 ? "default" : "secondary"}
                className={difference > 0 ? "bg-orange-500" : "bg-green-500"}
              >
                {difference > 0 ? "Cần thanh toán thêm" : "Hoàn lại"}
              </Badge>
            </div>
            <div className="text-xl font-bold">
              {formatVND(Math.abs(difference))}
            </div>
          </div>
        )}

        {/* Change Summary */}
        {hasChanges && (
          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              Bạn đang có thay đổi chưa lưu. Nhấn &quot;Lưu thay đổi&quot; để
              cập nhật.
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          onClick={onSave}
          disabled={!hasChanges || isSaving}
          className="w-full"
          size="lg"
        >
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
        <Button
          onClick={onCancel}
          variant="outline"
          className="w-full"
          size="lg"
          disabled={isSaving}
        >
          <X className="h-4 w-4 mr-2" />
          Hủy
        </Button>

        {/* Cancel Booking Button */}
        {onCancelBooking && (
          <div className="pt-4 border-t">
            <Button
              variant="destructive"
              className="w-full"
              size="lg"
              onClick={onCancelBooking}
              disabled={
                isSaving ||
                bookingStatus === "Paid" ||
                bookingStatus === "Đã thanh toán" ||
                bookingStatus === "Cancelled" ||
                bookingStatus === "Đã hủy"
              }
            >
              Hủy phiếu đặt sân
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
