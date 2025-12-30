"use client";

import * as React from "react";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import { Separator } from "@/ui/separator";
import { formatWeekday } from "@/utils/date";
import { ArrowRight, Calendar, Clock, MapPin, DollarSign } from "lucide-react";
import type { CustomerCourt as Court, CustomerCourtType as CourtType, TimeSlot } from "@/types/customer-flow";

interface CourtBookingSummaryCardProps {
  date: Date;
  timeSlots: TimeSlot[];
  court: Court;
  courtType: CourtType;
  onContinue: () => void;
}

export function CourtBookingSummaryCard({
  date,
  timeSlots,
  court,
  courtType,
  onContinue,
}: CourtBookingSummaryCardProps) {
  const duration = (courtType.slotDuration || (courtType as any).rent_duration || 60) / 60; // hours per slot
  const totalSlots = timeSlots.length;
  const totalPrice = timeSlots.reduce((sum, slot) => {
    const price = typeof slot.price === 'string' ? parseFloat(slot.price) : (slot.price || 0);
    return sum + price;
  }, 0);

  const formatCurrency = (amount: any) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(numericAmount || 0);
  };
  return (
    <Card className="p-6 bg-linear-to-br from-primary/5 to-primary/10 border-primary/20 shadow-lg animate-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-primary">Thông tin đặt sân</h3>
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Mới
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
              <div className="mt-1 space-y-2">
                {timeSlots.map((slot, idx) => (
                  <div key={idx} className="flex justify-between items-center text-base font-semibold">
                    <span>{slot.start} - {slot.end}</span>
                    <span className="text-primary">{formatCurrency(slot.price || 0)}</span>
                  </div>
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
