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
import type { InvoiceRow } from "@/lib/mock/invoiceCashierRepo";

interface ShiftInvoicesCardProps {
  invoices: InvoiceRow[];
}

export function ShiftInvoicesCard({ invoices }: ShiftInvoicesCardProps) {
  const formatVND = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    if (status === "Paid") {
      return <Badge variant="default">Đã thanh toán</Badge>;
    }
    return <Badge variant="destructive">Chưa thanh toán</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Hóa đơn trong ca</CardTitle>
      </CardHeader>
      <CardContent>
        {invoices.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Chưa có hóa đơn nào trong ca
          </p>
        ) : (
          <div className="space-y-2">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Mã HĐ</TableHead>
                  <TableHead>Khách hàng</TableHead>
                  <TableHead className="text-right">Tổng tiền</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">
                      {invoice.code}
                    </TableCell>
                    <TableCell>{invoice.customerName}</TableCell>
                    <TableCell className="text-right">
                      {formatVND(invoice.totalAmount)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(invoice.status)}
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
