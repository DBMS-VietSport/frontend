"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/ui/table";
import { Button } from "@/ui/button";
import { StatusBadge, LoadingSpinner, TableEmptyState } from "@/components";
import { Eye } from "lucide-react";
import { formatDateTime } from "@/utils/date";
import type { InvoiceSearchResult } from "@/features/invoices/mock/invoiceManagerRepo";
import { formatVND } from "@/features/booking/utils/pricing";

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Danh sách hóa đơn</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : invoices.length === 0 ? (
          <TableEmptyState entityName="hóa đơn" className="py-12" />
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
                    <TableCell><StatusBadge status={invoice.status} category="payment" /></TableCell>
                    <TableCell>{invoice.cashierName || "-"}</TableCell>
                    <TableCell>
                      {formatDateTime(invoice.createdAt)}
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
