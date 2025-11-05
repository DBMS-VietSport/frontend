"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingRow } from "@/lib/booking/types";

interface BookingTableProps {
  rows: BookingRow[];
  onRowClick: (row: BookingRow) => void;
}

export function BookingTable({ rows, onRowClick }: BookingTableProps) {
  const router = useRouter();

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "Đã thanh toán":
        return <Badge className="bg-green-500">Đã thanh toán</Badge>;
      case "Chưa thanh toán":
        return <Badge variant="secondary">Chưa thanh toán</Badge>;
      case "Đã hủy":
        return <Badge variant="destructive">Đã hủy</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getCourtStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <Badge className="bg-green-500">Đã thanh toán</Badge>;
      case "Held":
        return <Badge className="bg-blue-500">Đã giữ</Badge>;
      case "Booked":
        return <Badge className="bg-yellow-500">Đã đặt</Badge>;
      case "Cancelled":
        return <Badge variant="destructive">Đã hủy</Badge>;
      case "Pending":
        return <Badge variant="secondary">Chờ xử lý</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleEdit = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    router.push(`/booking/manage/${id}/edit`);
  };

  if (rows.length === 0) {
    return (
      <Card className="p-12 rounded-2xl">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-12 h-12 text-muted-foreground"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Không tìm thấy booking nào
          </h3>
          <p className="text-muted-foreground max-w-md">
            Thử điều chỉnh bộ lọc hoặc tìm kiếm với từ khóa khác
          </p>
        </div>
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
                  {getPaymentStatusBadge(row.paymentStatus)}
                </TableCell>
                <TableCell>{getCourtStatusBadge(row.courtStatus)}</TableCell>
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
