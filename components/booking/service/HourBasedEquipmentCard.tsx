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
import { Minus, Plus, ImageIcon, X } from "lucide-react";
import type { ServiceItem } from "../types";

// Simple ID generator for client-side use
const generateId = () =>
  `hour-entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

interface HourBasedEquipmentCardProps {
  item: ServiceItem;
  onUpdate: (
    id: string,
    quantity: number,
    hourEntries: Array<{ id: string; hours: number }>
  ) => void;
}

export function HourBasedEquipmentCard({
  item,
  onUpdate,
}: HourBasedEquipmentCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const hourEntries = item.hourEntries || [];

  const addHourEntry = () => {
    const newEntry = { id: generateId(), hours: 1 };
    const newEntries = [...hourEntries, newEntry];
    // Update quantity to match number of entries
    onUpdate(item.id, newEntries.length, newEntries);
  };

  const updateHourEntry = (entryId: string, hours: number) => {
    const newEntries = hourEntries.map((entry) =>
      entry.id === entryId ? { ...entry, hours: Math.max(1, hours) } : entry
    );
    onUpdate(item.id, newEntries.length, newEntries);
  };

  const removeHourEntry = (entryId: string) => {
    const newEntries = hourEntries.filter((entry) => entry.id !== entryId);
    onUpdate(item.id, newEntries.length, newEntries);
  };

  const totalHours = hourEntries.reduce((sum, entry) => sum + entry.hours, 0);
  const totalPrice = item.price * totalHours;

  return (
    <Card className="overflow-hidden">
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
                <span className="text-lg font-bold text-primary">
                  {formatCurrency(item.price)}
                </span>
                <span className="text-sm text-muted-foreground">/ giờ</span>
              </div>
            </div>

            {/* Hour Entries List */}
            {hourEntries.length > 0 && (
              <div className="space-y-2">
                {hourEntries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
                  >
                    <span className="text-sm text-muted-foreground min-w-[60px]">
                      Vợt #{index + 1}:
                    </span>
                    <div className="flex items-center gap-2 flex-1">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          updateHourEntry(entry.id, entry.hours - 1)
                        }
                        className="size-7"
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Select
                        value={entry.hours.toString()}
                        onValueChange={(value) =>
                          updateHourEntry(entry.id, parseInt(value))
                        }
                      >
                        <SelectTrigger className="w-16 h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((hour) => (
                            <SelectItem key={hour} value={hour.toString()}>
                              {hour}h
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          updateHourEntry(entry.id, entry.hours + 1)
                        }
                        className="size-7"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeHourEntry(entry.id)}
                      className="size-7 text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <div className="pt-2 mt-2 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Tổng ({totalHours}h):
                    </span>
                    <span className="text-base font-bold text-primary">
                      {formatCurrency(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Add Equipment Button */}
            <Button
              onClick={addHourEntry}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm vợt
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
