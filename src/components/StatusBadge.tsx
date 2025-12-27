import * as React from "react";
import { Badge } from "@/ui/badge";
import { cn } from "@/utils";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

/** Status categories supported by StatusBadge */
export type StatusCategory = "payment" | "booking" | "system" | "custom";

/** Pre-defined status mappings for each category */
const statusConfig: Record<
  StatusCategory,
  Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; className?: string }>
> = {
  payment: {
    Paid: { label: "Đã thanh toán", variant: "default", className: "bg-green-500 hover:bg-green-600" },
    "Đã thanh toán": { label: "Đã thanh toán", variant: "default", className: "bg-green-500 hover:bg-green-600" },
    Unpaid: { label: "Chưa thanh toán", variant: "secondary", className: "bg-amber-500 hover:bg-amber-600 text-white" },
    Pending: { label: "Chờ xử lý", variant: "secondary", className: "bg-amber-500 hover:bg-amber-600 text-white" },
    "Chưa thanh toán": { label: "Chưa thanh toán", variant: "secondary", className: "bg-amber-500 hover:bg-amber-600 text-white" },
    Cancelled: { label: "Đã hủy", variant: "destructive" },
    "Đã hủy": { label: "Đã hủy", variant: "destructive" },
    Refunded: { label: "Đã hoàn tiền", variant: "default", className: "bg-blue-500 hover:bg-blue-600" },
    "Đã hoàn tiền": { label: "Đã hoàn tiền", variant: "default", className: "bg-blue-500 hover:bg-blue-600" },
    PartiallyRefunded: { label: "Hoàn tiền một phần", variant: "default", className: "bg-blue-500 hover:bg-blue-600" },
    "Partially Refunded": { label: "Hoàn tiền một phần", variant: "default", className: "bg-blue-500 hover:bg-blue-600" },
  },
  booking: {
    Confirmed: { label: "Đã xác nhận", variant: "default", className: "bg-green-500 hover:bg-green-600" },
    "Đã xác nhận": { label: "Đã xác nhận", variant: "default", className: "bg-green-500 hover:bg-green-600" },
    Pending: { label: "Chờ xác nhận", variant: "secondary", className: "bg-amber-500 hover:bg-amber-600 text-white" },
    "Chờ xác nhận": { label: "Chờ xác nhận", variant: "secondary", className: "bg-amber-500 hover:bg-amber-600 text-white" },
    Cancelled: { label: "Đã hủy", variant: "destructive" },
    "Đã hủy": { label: "Đã hủy", variant: "destructive" },
    Completed: { label: "Hoàn thành", variant: "default", className: "bg-emerald-500 hover:bg-emerald-600" },
    "Hoàn thành": { label: "Hoàn thành", variant: "default", className: "bg-emerald-500 hover:bg-emerald-600" },
    InProgress: { label: "Đang diễn ra", variant: "default", className: "bg-blue-500 hover:bg-blue-600" },
    "Đang diễn ra": { label: "Đang diễn ra", variant: "default", className: "bg-blue-500 hover:bg-blue-600" },
    Paid: { label: "Đã thanh toán", variant: "default", className: "bg-green-500 hover:bg-green-600" },
    Held: { label: "Đã giữ", variant: "default", className: "bg-blue-500 hover:bg-blue-600" },
    Booked: { label: "Đã đặt", variant: "default", className: "bg-yellow-500 hover:bg-yellow-600" },
  },
  system: {
    Active: { label: "Hoạt động", variant: "default", className: "bg-green-500 hover:bg-green-600" },
    Inactive: { label: "Không hoạt động", variant: "secondary" },
    Enabled: { label: "Đã bật", variant: "default", className: "bg-green-500 hover:bg-green-600" },
    Disabled: { label: "Đã tắt", variant: "secondary" },
    Error: { label: "Lỗi", variant: "destructive" },
  },
  custom: {},
};

// -----------------------------------------------------------------------------
// Props Interface
// -----------------------------------------------------------------------------

export interface StatusBadgeProps {
  /** The raw status value (e.g., "Paid", "Pending", "Confirmed") */
  status: string;
  /** Category of status to determine styling */
  category?: StatusCategory;
  /** Override label (if not using pre-defined mappings) */
  label?: string;
  /** Override className */
  className?: string;
  /** Override variant */
  variant?: "default" | "secondary" | "destructive" | "outline";
}

// -----------------------------------------------------------------------------
// StatusBadge Component
// -----------------------------------------------------------------------------

export function StatusBadge({
  status,
  category = "payment",
  label,
  className,
  variant,
}: StatusBadgeProps) {
  const config = statusConfig[category]?.[status];

  const displayLabel = label ?? config?.label ?? status;
  const displayVariant = variant ?? config?.variant ?? "secondary";
  const displayClassName = className ?? config?.className;

  return (
    <Badge variant={displayVariant} className={cn(displayClassName)}>
      {displayLabel}
    </Badge>
  );
}
