"use client";

import * as React from "react";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import { Separator } from "@/ui/separator";
import { formatWeekday } from "@/utils/date";
import { ArrowLeft, Calendar, Clock, MapPin, DollarSign } from "lucide-react";
import type { CustomerCourt as Court, CustomerCourtType as CourtType, ServiceItem, Coach } from "@/types/customer-flow";

export type PaymentMethod = "online" | "counter";

interface PaymentSummaryCardProps {
  date: Date;
  timeSlots: string[]; // array of time range strings like "08:00-09:00"
  court: Court;
  courtType: CourtType;
  pricePerHour?: number;
  services: ServiceItem[];
  coaches: Coach[];
  courtFee: number;
  servicesFee: number;
  grandTotal: number;
  depositRequired?: boolean;
  depositAmount?: number;
  paymentMethod: PaymentMethod;
  onContinue: () => void;
  onBack: () => void;
  // For edit flow: show already paid and difference
  alreadyPaid?: number;
  isEditFlow?: boolean;
}

export function PaymentSummaryCard({
  date,
  timeSlots,
  court,
  courtType,
  pricePerHour = 50000,
  services,
  coaches,
  courtFee,
  servicesFee,
  grandTotal,
  depositRequired = false,
  depositAmount = 0,
  paymentMethod,
  onContinue,
  onBack,
  alreadyPaid = 0,
  isEditFlow = false,
}: PaymentSummaryCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const selectedServices = services.filter((s) => s.quantity > 0);
  const selectedCoaches = coaches.filter((c) => c.quantity > 0);

  const getButtonText = () => {
    // For online payment, the confirmation is handled elsewhere → no primary button here
    if (paymentMethod === "online") return "";
    if (paymentMethod === "counter" && depositRequired) {
      return "Tôi đã đặt cọc";
    }
    return "Xác nhận giữ chỗ";
  };

  return (
    <Card className="p-6 bg-linear-to-br from-primary/5 to-primary/10 border-primary/20 shadow-lg sticky top-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-primary">Tóm tắt đặt chỗ</h3>
        </div>

        <Separator />

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {/* Date */}
          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                Ngày đặt
              </p>
              <p className="text-base font-semibold">
                {formatWeekday(date)}
              </p>
            </div>
          </div>

          {/* Time Slots */}
          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 bg-primary/10 rounded-lg">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                Khung giờ đã chọn ({timeSlots.length} khung)
              </p>
              <div className="mt-1 space-y-1">
                {timeSlots.map((slot, idx) => (
                  <p key={idx} className="text-base font-semibold">
                    {slot}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Court Info */}
          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 bg-primary/10 rounded-lg">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                Thông tin sân
              </p>
              <p className="text-base font-semibold">{court.name}</p>
              <p className="text-sm text-muted-foreground">{courtType.name}</p>
            </div>
          </div>

          {/* Pricing */}
          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                Chi phí
              </p>
              <div className="space-y-1 text-sm">
                {!isEditFlow && (
                  <div className="flex justify-between">
                    <span>Phí sân bãi</span>
                    <span className="font-semibold">
                      {formatCurrency(courtFee)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>
                    {isEditFlow ? "Dịch vụ mới thêm" : "Dịch vụ bổ sung"}
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(servicesFee)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Tổng cộng</span>
                  <span className="font-bold text-primary">
                    {formatCurrency(grandTotal)}
                  </span>
                </div>

                {/* Edit Flow: Show already paid and difference */}
                {isEditFlow && alreadyPaid > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between text-green-600">
                        <span>Đã thanh toán</span>
                        <span className="font-semibold">
                          {formatCurrency(alreadyPaid)}
                        </span>
                      </div>
                      <div className="flex justify-between text-orange-600">
                        <span>Cần thanh toán thêm</span>
                        <span className="font-bold">
                          {formatCurrency(grandTotal - alreadyPaid)}
                        </span>
                      </div>
                    </div>
                  </>
                )}

                {/* Deposit Info */}
                {depositRequired && depositAmount > 0 && (
                  <>
                    <div className="flex justify-between text-blue-700">
                      <span>Đặt cọc (50% sân bãi)</span>
                      <span className="font-semibold">
                        {formatCurrency(depositAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Còn lại tại quầy</span>
                      <span className="font-semibold">
                        {formatCurrency(grandTotal - depositAmount)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="space-y-3">
          {getButtonText() && (
            <Button
              onClick={onContinue}
              className="w-full h-12 text-base font-semibold"
              size="lg"
            >
              {getButtonText()}
            </Button>
          )}

          <Button variant="ghost" onClick={onBack} className="w-full" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Quay lại
          </Button>
        </div>
      </div>
    </Card>
  );
}
