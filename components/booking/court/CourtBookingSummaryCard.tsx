"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatWeekday } from "@/lib/utils/date";
import { ArrowRight, Calendar, Clock, MapPin, DollarSign } from "lucide-react";
import type { TimeSlot, Court, CourtType } from "../types";

interface CourtBookingSummaryCardProps {
  date: Date;
  timeSlots: TimeSlot[];
  court: Court;
  courtType: CourtType;
  pricePerHour?: number;
  onContinue: () => void;
}

export function CourtBookingSummaryCard({
  date,
  timeSlots,
  court,
  courtType,
  pricePerHour = 50000,
  onContinue,
}: CourtBookingSummaryCardProps) {
  const duration = courtType.slotDuration / 60; // hours per slot
  const totalSlots = timeSlots.length;
  const totalPrice = pricePerHour * duration * totalSlots;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <Card className="p-6 bg-linear-to-br from-primary/5 to-primary/10 border-primary/20 shadow-lg animate-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-primary">Thông tin đặt sân</h3>
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Trống
          </div>
        </div>

        <Separator />

        <div className="space-y-4">
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
                Khung giờ đã chọn ({totalSlots} khung)
              </p>
              <div className="mt-1 space-y-1">
                {timeSlots.map((slot, idx) => (
                  <p key={idx} className="text-base font-semibold">
                    {slot.start} - {slot.end} ({duration}h)
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

          {/* Price */}
          <div className="flex items-start gap-3">
            <div className="mt-1 p-2 bg-primary/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground">
                Giá thuê
              </p>
              <p className="text-sm text-muted-foreground">
                {formatCurrency(pricePerHour)}/giờ × {duration}h × {totalSlots}{" "}
                khung
              </p>
            </div>
          </div>
        </div>

        <Separator />

        {/* Total */}
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Tổng tiền</span>
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(totalPrice)}
          </span>
        </div>

        {/* Continue Button */}
        <Button
          onClick={onContinue}
          className="w-full h-12 text-base font-semibold group"
          size="lg"
        >
          Tiếp tục
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>

        <p className="text-xs text-center text-muted-foreground">
          Bấm "Tiếp tục" để chọn dịch vụ bổ sung
        </p>
      </div>
    </Card>
  );
}
