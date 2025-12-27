"use client";

import { Badge } from "@/ui/badge";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "Paid":
      return (
        <Badge variant="default" className="bg-green-600">
          Đã thanh toán
        </Badge>
      );
    case "Held":
      return (
        <Badge variant="secondary" className="bg-amber-500">
          Giữ chỗ
        </Badge>
      );
    case "Cancelled":
      return <Badge variant="destructive">Đã hủy</Badge>;
    default:
      return (
        <Badge variant="secondary" className="bg-amber-500">
          Giữ chỗ
        </Badge>
      );
  }
}
