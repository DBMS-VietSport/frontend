"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/useAuth";
import { getMyPayroll, type PayrollRecord } from "@/lib/mock/payrollRepo";
import {
  PayrollSummaryCards,
  PayrollHistoryTable,
  PayrollDetailDialog,
} from "@/components/my-payroll";

export default function MyPayrollPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [payroll, setPayroll] = useState<PayrollRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<PayrollRecord | null>(
    null
  );

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.replace("/");
      return;
    }

    if (user && user.username) {
      const myPayroll = getMyPayroll(user.username);
      setPayroll(myPayroll);
    }
  }, [user, loading, router]);

  // Calculate summary stats
  const summary = useMemo(() => {
    if (payroll.length === 0) {
      return {
        latestNetPay: 0,
        totalYearPay: 0,
        paidCount: 0,
      };
    }

    const currentYear = new Date().getFullYear();
    const currentYearPayroll = payroll.filter((p) => p.year === currentYear);
    const paidRecords = payroll.filter((p) => p.payment_status === "Paid");

    return {
      latestNetPay: payroll[0]?.net_pay || 0,
      totalYearPay: currentYearPayroll.reduce(
        (sum, p) => sum + (p.payment_status === "Paid" ? p.net_pay : 0),
        0
      ),
      paidCount: paidRecords.length,
    };
  }, [payroll]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-4 md:p-6">
        <div className="text-center py-12">Đang tải...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Bảng lương của tôi</h1>
        <p className="text-muted-foreground">
          Xem chi tiết lương, phụ cấp, hoa hồng và khấu trừ theo tháng.
        </p>
      </div>

      {/* Summary Cards */}
      <PayrollSummaryCards summary={summary} payroll={payroll} />

      {/* Payroll History Table */}
      <PayrollHistoryTable
        payroll={payroll}
        onRecordClick={setSelectedRecord}
      />

      {/* Detail Dialog */}
      {selectedRecord && (
        <PayrollDetailDialog
          record={selectedRecord}
          open={!!selectedRecord}
          onOpenChange={(open) => !open && setSelectedRecord(null)}
        />
      )}
    </div>
  );
}
