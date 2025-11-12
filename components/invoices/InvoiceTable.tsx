"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Eye } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { InvoiceSearchResult } from "@/lib/mock/invoiceManagerRepo";

interface InvoiceTableProps {
  invoices: InvoiceSearchResult[];
  loading: boolean;
  onRowClick: (invoice: InvoiceSearchResult) => void;
}

export function InvoiceTable({
  invoices,
  loading,
  onRowClick,
}: InvoiceTableProps) {
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return <Badge className="bg-green-500">Đã thanh toán</Badge>;
      case "Unpaid":
      case "Pending":
        return <Badge className="bg-amber-500">Chưa thanh toán</Badge>;
      case "Cancelled":
        return <Badge variant="destructive">Đã hủy</Badge>;
      case "Refunded":
      case "Partially Refunded":
        return <Badge className="bg-blue-500">Đã hoàn tiền</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách hóa đơn</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-12">
            <p className="text-muted-foreground">Không tìm thấy hóa đơn nào</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mã HĐ</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                  <TableHead>Hình thức thanh toán</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thu ngân</TableHead>
                  <TableHead>Ngày tạo</TableHead>
                  <TableHead className="text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow
                    key={invoice.id}
                    className="cursor-pointer"
                    onClick={() => onRowClick(invoice)}
                  >
                    <TableCell className="font-medium">
                      {invoice.code}
                    </TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell className="text-right">
                      {formatVND(invoice.totalAmount)}
                    </TableCell>
                    <TableCell>{invoice.paymentMethod}</TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell>{invoice.cashierName || "-"}</TableCell>
                    <TableCell>
                      {format(new Date(invoice.createdAt), "dd/MM/yyyy HH:mm", {
                        locale: vi,
                      })}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRowClick(invoice);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
