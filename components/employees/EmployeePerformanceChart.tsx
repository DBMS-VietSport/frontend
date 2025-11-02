"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import type { PerformanceRecord } from "@/lib/employees/types";

interface EmployeePerformanceChartProps {
  data: PerformanceRecord[];
}

export function EmployeePerformanceChart({
  data,
}: EmployeePerformanceChartProps) {
  // Format month for display
  const formatMonth = (month: string) => {
    const [year, monthNum] = month.split("-");
    const date = new Date(parseInt(year), parseInt(monthNum) - 1);
    return date.toLocaleDateString("vi-VN", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <Card className="p-6 rounded-2xl">
      <h3 className="text-lg font-semibold mb-4">Hiệu suất làm việc</h3>

      <div className="space-y-4">
        {data.map((record) => (
          <div key={record.month} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{formatMonth(record.month)}</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Ca trực</p>
                <p className="text-xl font-bold">{record.shift_count}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Đặt sân xử lý</p>
                <p className="text-xl font-bold">{record.booking_handled}</p>
              </div>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Độ hài lòng</p>
                <p className="text-xl font-bold">
                  {record.customer_satisfaction}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Tổng ca trực</p>
          <p className="text-2xl font-bold">
            {data.reduce((sum, r) => sum + r.shift_count, 0)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Tổng đặt sân</p>
          <p className="text-2xl font-bold">
            {data.reduce((sum, r) => sum + r.booking_handled, 0)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">TB độ hài lòng</p>
          <p className="text-2xl font-bold">
            {Math.round(
              data.reduce((sum, r) => sum + r.customer_satisfaction, 0) /
                data.length
            )}
            %
          </p>
        </div>
      </div>
    </Card>
  );
}
