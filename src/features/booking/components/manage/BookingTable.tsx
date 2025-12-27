"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { Button } from "@/ui/button";
import { Edit, LayoutGrid } from "lucide-react";
import { StatusBadge, EmptyState } from "@/components";
import type { BookingRow } from "@/types";

interface BookingTableProps {
  rows: BookingRow[];
  onRowClick: (row: BookingRow) => void;
}

export function BookingTable({ rows, onRowClick }: BookingTableProps) {
  const router = useRouter();

  const handleEdit = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    router.push(`/booking/manage/${id}/edit`);
  };

  if (rows.length === 0) {
    return (
      <Card className="p-12 rounded-2xl">
        <EmptyState
          icon={LayoutGrid}
          title="Không tìm thấy booking nào"
          description="Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác"
        />
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mã booking</TableHead>
              <TableHead>Sân</TableHead>
              <TableHead>Loại sân</TableHead>
              <TableHead>Khách hàng</TableHead>
              <TableHead>Nhân viên</TableHead>
              <TableHead>Thời gian</TableHead>
              <TableHead>TT Thanh toán</TableHead>
              <TableHead>TT Đơn hàng</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.id}
                className="cursor-pointer"
                onClick={() => onRowClick(row)}
              >
                <TableCell className="font-medium">{row.code}</TableCell>
                <TableCell>{row.courtName}</TableCell>
                <TableCell>{row.courtType}</TableCell>
                <TableCell>{row.customerName}</TableCell>
                <TableCell className="text-muted-foreground">
                  {row.employeeName || "-"}
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {row.timeRange}
                </TableCell>
                <TableCell>
                  <StatusBadge status={row.paymentStatus} category="payment" />
                </TableCell>
                <TableCell>
                  <StatusBadge status={row.courtStatus} category="booking" />
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => handleEdit(e, row.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

