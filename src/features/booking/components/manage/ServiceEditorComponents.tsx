"use client";

import * as React from "react";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import { Plus, Minus, Trash2 } from "lucide-react";
import { formatVND } from "@/features/booking/utils/pricing";
import type { ServiceItemEdit } from "./useServiceEditor";
import { getServiceInfo } from "./useServiceEditor";

// -----------------------------------------------------------------------------
// TempServiceItemCard - Used in the Add Service Dialog
// -----------------------------------------------------------------------------

interface TempServiceItemCardProps {
  item: ServiceItemEdit;
  index: number;
  itemTotal: number;
  onQuantityChange: (index: number, delta: number) => void;
  onRemove: (index: number) => void;
}

export function TempServiceItemCard({
  item,
  index,
  itemTotal,
  onQuantityChange,
  onRemove,
}: TempServiceItemCardProps) {
  const { branchService, service } = getServiceInfo(item.branch_service_id);
  
  if (!branchService || !service) return null;

  return (
    <Card className="p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex-1">
          <div className="font-medium">{service.name}</div>
          <div className="text-sm text-muted-foreground">
            {formatVND(branchService.unit_price)}/{service.unit}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => onQuantityChange(index, -1)}
              disabled={item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm font-medium">
              {item.quantity}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => onQuantityChange(index, 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
          <div className="text-sm font-semibold text-primary w-24 text-right">
            {formatVND(itemTotal)}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive"
            onClick={() => onRemove(index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// QuantityControl - Reusable quantity +/- control
// -----------------------------------------------------------------------------

interface QuantityControlProps {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  disabled?: boolean;
}

export function QuantityControl({
  quantity,
  onIncrease,
  onDecrease,
  disabled = false,
}: QuantityControlProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={onDecrease}
        disabled={disabled || quantity <= 1}
        className="size-8"
      >
        <Minus className="h-4 w-4" />
      </Button>
      <span className="text-base font-semibold w-12 text-center">
        {quantity}
      </span>
      <Button
        variant="outline"
        size="icon"
        onClick={onIncrease}
        disabled={disabled}
        className="size-8"
      >
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  );
}

// -----------------------------------------------------------------------------
// EmptyServiceState - Shown when no services exist
// -----------------------------------------------------------------------------

export function EmptyServiceState({ message }: { message: string }) {
  return (
    <Card className="p-6">
      <div className="text-center text-muted-foreground">{message}</div>
    </Card>
  );
}
