"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { Button } from "@/ui/button";
import { Plus, Minus } from "lucide-react";
import { formatVND } from "@/features/booking/utils/pricing";
import type { ServiceItem } from "./AddServiceDialog";

interface ServicesCardProps {
  services: ServiceItem[];
  onAddClick: () => void;
  onRemove: (branchServiceId: number) => void;
  onQuantityChange: (branchServiceId: number, delta: number) => void;
  hasBooking: boolean;
}

export function ServicesCard({
  services,
  onAddClick,
  onRemove,
  onQuantityChange,
  hasBooking,
}: ServicesCardProps) {

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Dịch vụ phát sinh</CardTitle>
          {hasBooking && (
            <Button variant="outline" size="sm" onClick={onAddClick}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm dịch vụ
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {services.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            {hasBooking
              ? "Chưa có dịch vụ nào. Nhấn 'Thêm dịch vụ' để thêm."
              : "Vui lòng tải thông tin đặt sân trước"}
          </p>
        ) : (
          <div className="space-y-3">
            {services.map((service) => (
              <div
                key={service.branch_service_id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium">{service.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatVND(service.unit_price)} / {service.unit}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        onQuantityChange(service.branch_service_id, -1)
                      }
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">
                      {service.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() =>
                        onQuantityChange(service.branch_service_id, 1)
                      }
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <p className="font-medium w-24 text-right">
                    {formatVND(service.unit_price * service.quantity)}
                  </p>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => onRemove(service.branch_service_id)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
