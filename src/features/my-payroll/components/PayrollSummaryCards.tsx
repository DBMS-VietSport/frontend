import { Card, CardContent, CardHeader, CardTitle } from "@/ui/card";
import { DollarSign, Calendar, Receipt } from "lucide-react";
import type { PayrollRecord } from "@/features/employee/mock/payrollRepo";
import { formatVND, formatMonthYear } from "../utils";

interface PayrollSummary {
  latestNetPay: number;
  totalYearPay: number;
  paidCount: number;
}

interface PayrollSummaryCardsProps {
  summary: PayrollSummary;
  payroll: PayrollRecord[];
}

export function PayrollSummaryCards({
  summary,
  payroll,
}: PayrollSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="rounded-xl border bg-background/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Lương tháng gần nhất
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <p className="text-2xl font-semibold">
              {formatVND(summary.latestNetPay)}
            </p>
          </div>
          {payroll.length > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {formatMonthYear(payroll[0].year, payroll[0].month)}
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-xl border bg-background/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Tổng lương đã nhận trong năm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-green-600" />
            <p className="text-2xl font-semibold text-green-600">
              {formatVND(summary.totalYearPay)}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Năm {new Date().getFullYear()}
          </p>
        </CardContent>
      </Card>

      <Card className="rounded-xl border bg-background/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Số kỳ đã trả
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <p className="text-2xl font-semibold text-blue-600">
              {summary.paidCount}
            </p>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Tổng {payroll.length} kỳ lương
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
