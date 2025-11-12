"use client";

import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { BookingConfirmationData } from "@/lib/mock/bookingFlowStore";

interface BookingServicesCardProps {
  data: BookingConfirmationData;
  formatCurrency: (amount: number) => string;
}

export function BookingServicesCard({
  data,
  formatCurrency,
}: BookingServicesCardProps) {
  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Dịch vụ kèm theo</h3>
      <Separator />
      {data.services && data.services.length > 0 ? (
        <div className="space-y-3">
          {data.services.map((service, index) => (
            <div
              key={`${service.name}-${index}`}
              className="flex items-center justify-between text-sm"
            >
              <span>
                {service.name}{" "}
                <span className="text-muted-foreground">
                  (x{service.qty}
                  {service.unit ? ` ${service.unit}` : ""})
                </span>
              </span>
              <span className="font-semibold">
                {formatCurrency(service.price * service.qty)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">
          Không có dịch vụ kèm theo
        </p>
      )}
    </Card>
  );
}
