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
import { StatusBadge } from "@/components/shared";
import type { InvoiceRow } from "@/lib/mock/invoiceCashierRepo";
import { formatVND } from "@/lib/booking/pricing";

interface ShiftInvoicesCardProps {
  invoices: InvoiceRow[];
}

export function ShiftInvoicesCard({ invoices }: ShiftInvoicesCardProps) {

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
                      <StatusBadge status={invoice.status} category="payment" />
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
