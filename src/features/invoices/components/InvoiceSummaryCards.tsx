"use client";

import * as React from "react";
import { Card, CardContent } from "@/ui/card";
import type { InvoiceSummary } from "@/features/invoices/mock/invoiceManagerRepo";
import { formatVND } from "@/features/booking/utils/pricing";

interface InvoiceSummaryCardsProps {
  summary: InvoiceSummary;
}

export function InvoiceSummaryCards({ summary }: InvoiceSummaryCardsProps) {

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">Tổng hóa đơn</div>
          <div className="text-2xl font-bold">{summary.totalInvoices}</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">
            Tổng đã thanh toán
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatVND(summary.totalPaid)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">
            Tổng chưa thanh toán
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {formatVND(summary.totalUnpaid)}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground">Tổng đã hủy</div>
          <div className="text-2xl font-bold text-red-600">
            {formatVND(summary.totalCancelled)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
