"use client";

import * as React from "react";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import { Separator } from "@/ui/separator";
import { formatDate } from "@/utils/date";
import { ArrowRight, Calendar, Clock, MapPin, DollarSign } from "lucide-react";
import type { CustomerCourt as Court, CustomerCourtType as CourtType, ServiceItem, Coach, TimeSlot } from "@/types/customer-flow";

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
          // For hour-based equipment with hourEntries, sum all hours
          if (service.hourEntries && service.hourEntries.length > 0) {
            const totalHours = service.hourEntries.reduce(
              (sum: number, entry: { hours: number }) => sum + entry.hours,
              0
            );
            total += service.price * totalHours;
          } else {
            // Fallback to durationHours for backward compatibility
            total +=
              service.price * service.quantity * (service.durationHours || 1);
          }
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
      // For coaches, quantity represents hours
      const coachHours = coach.quantity || 0;
      if (coachHours > 0) {
        total += coach.pricePerHour * coachHours;
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
                  {formatDate(date)}
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
                let displayText = service.name;

                if (service.unit !== "free") {
                  if (service.unit === "hour") {
                    // For hour-based equipment with hourEntries
                    if (service.hourEntries && service.hourEntries.length > 0) {
                      const totalHours = service.hourEntries.reduce(
                        (sum: number, entry: { hours: number }) => sum + entry.hours,
                        0
                      );
                      itemTotal = service.price * totalHours;
                      displayText = `${service.name} (${totalHours}h)`;
                    } else {
                      // Fallback
                      const hours = service.durationHours || 1;
                      itemTotal = service.price * service.quantity * hours;
                      displayText = `${service.name} × ${service.quantity} (${hours}h)`;
                    }
                  } else {
                    itemTotal = service.price * service.quantity;
                    displayText = `${service.name} × ${service.quantity}`;
                  }
                } else {
                  displayText = `${service.name} × ${service.quantity}`;
                }

                return (
                  <div
                    key={service.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>{displayText}</span>
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
                // For coaches, quantity represents hours
                const coachHours = coach.quantity || 0;
                const coachTotal =
                  coachHours > 0 ? coach.pricePerHour * coachHours : 0;
                return (
                  <div
                    key={coach.id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span>
                      {coach.name} ({coachHours}h)
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
