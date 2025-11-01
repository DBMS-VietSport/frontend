"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ArrowRight, Calendar, Clock, MapPin, DollarSign } from "lucide-react";
import type { TimeSlot, Court, CourtType, ServiceItem, Coach } from "./types";

interface ServiceSummaryCardProps {
  date: Date;
  timeSlots: TimeSlot[];
  court: Court;
  courtType: CourtType;
  pricePerHour?: number;
  services: ServiceItem[];
  coaches: Coach[];
  onContinue: () => void;
}

export function ServiceSummaryCard({
  date,
  timeSlots,
  court,
  courtType,
  pricePerHour = 50000,
  services,
  coaches,
  onContinue,
}: ServiceSummaryCardProps) {
  const duration = courtType.slotDuration / 60; // hours per slot
  const totalSlots = timeSlots.length;
  const courtPrice = pricePerHour * duration * totalSlots;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Calculate service total
  const calculateServiceTotal = () => {
    let total = 0;
    services.forEach((service) => {
      if (service.quantity > 0 && service.unit !== "free") {
        if (service.unit === "hour") {
          total +=
            service.price * service.quantity * (service.durationHours || 1);
        } else {
          total += service.price * service.quantity;
        }
      }
    });
    return total;
  };

  // Calculate coach total
  const calculateCoachTotal = () => {
    let total = 0;
    coaches.forEach((coach) => {
      if (coach.quantity > 0) {
        total +=
          coach.pricePerHour * coach.quantity * (coach.durationHours || 1);
      }
    });
    return total;
  };

  const serviceTotal = calculateServiceTotal();
  const coachTotal = calculateCoachTotal();
  const totalPrice = courtPrice + serviceTotal + coachTotal;

  const selectedServices = services.filter((s) => s.quantity > 0);
  const selectedCoaches = coaches.filter((c) => c.quantity > 0);

  return (
    <Card className="p-6 bg-linear-to-br from-primary/5 to-primary/10 border-primary/20 shadow-lg sticky top-4">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-primary">Tóm tắt đặt chỗ</h3>
        </div>

        <Separator />

        <div className="space-y-4 max-h-[400px] overflow-y-auto">
          {/* Court Info */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Ngày đặt
                </p>
                <p className="text-base font-semibold">
                  {format(date, "dd/MM/yyyy", { locale: vi })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 bg-primary/10 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Khung giờ ({totalSlots} khung)
                </p>
                <p className="text-base font-semibold">
                  {timeSlots[0]?.start} - {timeSlots[timeSlots.length - 1]?.end}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 bg-primary/10 rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">Sân</p>
                <p className="text-base font-semibold">{court.name}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Selected Services */}
          {selectedServices.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">
                Dịch vụ đã chọn:
              </p>
              {selectedServices.map((service) => {
                let itemTotal = 0;
                if (service.unit !== "free") {
                  if (service.unit === "hour") {
                    itemTotal =
                      service.price *
                      service.quantity *
                      (service.durationHours || 1);
                  } else {
                    itemTotal = service.price * service.quantity;
                  }
                }
                return (
                  <div
                    key={service.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {service.name} × {service.quantity}
                      {service.unit === "hour" &&
                        ` (${service.durationHours || 1}h)`}
                    </span>
                    {service.unit !== "free" && (
                      <span className="font-semibold">
                        {formatCurrency(itemTotal)}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Selected Coaches */}
          {selectedCoaches.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold text-muted-foreground">
                Huấn luyện viên:
              </p>
              {selectedCoaches.map((coach) => {
                const coachTotal =
                  coach.pricePerHour *
                  coach.quantity *
                  (coach.durationHours || 1);
                return (
                  <div
                    key={coach.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {coach.name} × {coach.quantity}h
                    </span>
                    <span className="font-semibold">
                      {formatCurrency(coachTotal)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Separator />

        {/* Price Breakdown */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Thuê sân:</span>
            <span className="font-semibold">{formatCurrency(courtPrice)}</span>
          </div>
          {serviceTotal > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Dịch vụ bổ sung:</span>
              <span className="font-semibold">
                {formatCurrency(serviceTotal)}
              </span>
            </div>
          )}
          {coachTotal > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Huấn luyện viên:</span>
              <span className="font-semibold">
                {formatCurrency(coachTotal)}
              </span>
            </div>
          )}
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
          Bấm "Tiếp tục" để xác nhận thanh toán
        </p>
      </div>
    </Card>
  );
}
