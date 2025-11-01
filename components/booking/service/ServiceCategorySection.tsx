"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Minus, Plus, ImageIcon } from "lucide-react";
import type { ServiceItem } from "../types";

interface ServiceCategorySectionProps {
  items: ServiceItem[];
  title: string;
  onUpdateQuantity: (
    id: string,
    quantity: number,
    durationHours?: number
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

  const getUnitText = (unit: "hour" | "turn" | "free") => {
    switch (unit) {
      case "hour":
        return "giờ";
      case "turn":
        return "lượt";
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

  const handleDurationChange = (item: ServiceItem, hours: string) => {
    const durationHours = parseInt(hours) || 1;
    onUpdateQuantity(item.id, item.quantity, durationHours);
  };

  return (
    <div className="space-y-4">
      {items.map((item) => (
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
                        {getUnitText(item.unit) && (
                          <span className="text-sm text-muted-foreground">
                            / {getUnitText(item.unit)}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-4">
                  {/* Hour selector for hour-based items */}
                  {item.unit === "hour" && item.quantity > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground whitespace-nowrap">
                        Số giờ:
                      </span>
                      <Select
                        value={item.durationHours?.toString() || "1"}
                        onValueChange={(value) =>
                          handleDurationChange(item, value)
                        }
                      >
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((hour) => (
                            <SelectItem key={hour} value={hour.toString()}>
                              {hour}h
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

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
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
