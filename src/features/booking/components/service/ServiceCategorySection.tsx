"use client";

import * as React from "react";
import { Card, CardContent } from "@/ui/card";
import { Button } from "@/ui/button";
import { Minus, Plus, ImageIcon } from "lucide-react";
import type { ServiceItem, ServiceItemUnit } from "@/features/booking/types";
import { HourBasedEquipmentCard } from "./HourBasedEquipmentCard";

interface ServiceCategorySectionProps {
  items: ServiceItem[];
  title: string;
  onUpdateQuantity: (
    id: string,
    quantity: number,
    durationHours?: number,
    hourEntries?: Array<{ id: string; hours: number }>
  ) => void;
}

export function ServiceCategorySection({
  items,
  title,
  onUpdateQuantity,
}: ServiceCategorySectionProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getUnitText = (unit: ServiceItemUnit, category?: string) => {
    if (category === "drink") {
      return "chai";
    }
    switch (unit) {
      case "hour":
        return "giờ";
      case "turn":
        return "lượt";
      case "piece":
        return "cái";
      case "set":
        return "bộ";
      case "free":
        return "";
      default:
        return "";
    }
  };

  const handleQuantityChange = (item: ServiceItem, delta: number) => {
    const newQuantity = Math.max(0, item.quantity + delta);
    onUpdateQuantity(item.id, newQuantity, item.durationHours);
  };

  const handleHourBasedUpdate = (
    id: string,
    quantity: number,
    hourEntries: Array<{ id: string; hours: number }>
  ) => {
    // Calculate total hours for durationHours (for backward compatibility)
    const totalHours = hourEntries.reduce((sum, entry) => sum + entry.hours, 0);
    onUpdateQuantity(id, quantity, totalHours, hourEntries);
  };

  return (
    <div className="space-y-4">
      {items.map((item) => {
        // For hour-based equipment, use special component
        if (item.category === "equipment" && item.unit === "hour") {
          return (
            <HourBasedEquipmentCard
              key={item.id}
              item={item}
              onUpdate={handleHourBasedUpdate}
            />
          );
        }

        // For other items (per-use equipment, facility, drinks)
        return (
          <Card key={item.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex gap-4">
                {/* Image */}
                <div className="shrink-0">
                  {item.imageUrl ? (
                    <div className="size-24 rounded-lg overflow-hidden bg-muted">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="size-24 rounded-lg bg-muted flex items-center justify-center">
                      <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-3">
                  <div>
                    <h4 className="font-semibold text-lg">{item.name}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      {item.unit === "free" ? (
                        <span className="text-sm text-green-600 font-medium">
                          Miễn phí
                        </span>
                      ) : (
                        <>
                          <span className="text-lg font-bold text-primary">
                            {formatCurrency(item.price)}
                          </span>
                          {getUnitText(item.unit, item.category) && (
                            <span className="text-sm text-muted-foreground">
                              / {getUnitText(item.unit, item.category)}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      {/* Quantity counter */}
                      <div className="flex items-center gap-3 ml-auto">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(item, -1)}
                          disabled={item.quantity === 0}
                          className="size-8"
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-lg font-semibold w-8 text-center">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleQuantityChange(item, 1)}
                          className="size-8"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Total Price Display */}
                    {item.quantity > 0 && item.unit !== "free" && (
                      <div className="pt-1 border-t">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            Tổng:
                          </span>
                          <span className="text-base font-bold text-primary">
                            {formatCurrency(item.price * item.quantity)}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
