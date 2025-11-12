"use client";

import * as React from "react";
import { Separator } from "@/components/ui/separator";
import { RequireRole } from "@/components/auth/RequireRole";
import { useAuth } from "@/lib/auth/useAuth";
import {
  searchInvoices,
  getInvoiceDetail,
  cancelInvoice,
  createRefund,
  processRefund,
  adjustInvoice,
  getInvoiceSummary,
  type InvoiceSearchResult,
  type InvoiceSearchFilters,
  type InvoiceDetail,
  type InvoiceSummary,
} from "@/lib/mock/invoiceManagerRepo";
import { MOCK_USERS } from "@/lib/mock/authMock";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  InvoiceFilterBar,
  InvoiceSummaryCards,
  InvoiceTable,
  InvoiceDetailDialog,
  CancelInvoiceDialog,
  RefundInvoiceDialog,
  ProcessRefundDialog,
} from "@/components/invoices";

export default function InvoiceManagePage() {
  const { user } = useAuth();
  const [filters, setFilters] = React.useState<InvoiceSearchFilters>({
    status: "all",
  });
  const [dateFrom, setDateFrom] = React.useState<Date | undefined>();
  const [dateTo, setDateTo] = React.useState<Date | undefined>();
  const [invoices, setInvoices] = React.useState<InvoiceSearchResult[]>([]);
  const [summary, setSummary] = React.useState<InvoiceSummary | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [selectedInvoice, setSelectedInvoice] =
    React.useState<InvoiceDetail | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = React.useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = React.useState(false);
  const [refundDialogOpen, setRefundDialogOpen] = React.useState(false);
  const [processRefundDialogOpen, setProcessRefundDialogOpen] =
    React.useState(false);

  // Load invoices on mount and when filters change
  React.useEffect(() => {
    loadInvoices();
  }, [filters]);

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const searchFilters: InvoiceSearchFilters = {
        ...filters,
        dateFrom: dateFrom ? format(dateFrom, "yyyy-MM-dd") : undefined,
        dateTo: dateTo ? format(dateTo, "yyyy-MM-dd") : undefined,
      };

      const [results, summaryData] = await Promise.all([
        searchInvoices(searchFilters),
        getInvoiceSummary(searchFilters),
      ]);

      setInvoices(results);
      setSummary(summaryData);
    } catch (error) {
      console.error("Failed to load invoices:", error);
      toast.error("Không thể tải danh sách hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    loadInvoices();
  };

  const handleRowClick = async (invoice: InvoiceSearchResult) => {
    try {
      const detail = await getInvoiceDetail(invoice.id);
      if (detail) {
        setSelectedInvoice(detail);
        setDetailDialogOpen(true);
      }
    } catch (error) {
      console.error("Failed to load invoice detail:", error);
      toast.error("Không thể tải chi tiết hóa đơn");
    }
  };

  const handleCancel = async (reason: string) => {
    if (!selectedInvoice) return;

    try {
      await cancelInvoice(selectedInvoice.id, reason, user?.fullName || "");
      toast.success("Đã hủy hóa đơn thành công");
      setCancelDialogOpen(false);
      setDetailDialogOpen(false);
      await loadInvoices();
    } catch (error) {
      console.error("Failed to cancel invoice:", error);
      toast.error("Không thể hủy hóa đơn");
    }
  };

  const handleRefund = async (amount: number, reason: string) => {
    if (!selectedInvoice) return;

    try {
      await createRefund(
        selectedInvoice.id,
        amount,
        reason,
        user?.fullName || ""
      );
      toast.success("Đã tạo yêu cầu hoàn tiền thành công");
      setRefundDialogOpen(false);
      setDetailDialogOpen(false);
      await loadInvoices();
    } catch (error) {
      console.error("Failed to create refund:", error);
      toast.error("Không thể tạo yêu cầu hoàn tiền");
    }
  };

  const handleMarkAsPaid = async (invoiceId: number) => {
    try {
      await adjustInvoice(invoiceId, {
        status: "Paid",
        paymentMethod: "Tiền mặt",
      });
      toast.success("Đã cập nhật trạng thái hóa đơn");
      await loadInvoices();
      if (selectedInvoice && selectedInvoice.id === invoiceId) {
        const detail = await getInvoiceDetail(invoiceId);
        if (detail) {
          setSelectedInvoice(detail);
        }
      }
    } catch (error) {
      console.error("Failed to mark as paid:", error);
      toast.error("Không thể cập nhật trạng thái");
    }
  };

  const handleProcessRefund = async (
    amount: number,
    reason: string,
    reasonType: string
  ) => {
    if (!selectedInvoice) return;

    try {
      await processRefund(
        selectedInvoice.id,
        amount,
        reason,
        reasonType,
        user?.fullName || ""
      );
      toast.success("Đã xử lý hoàn tiền thành công");
      setProcessRefundDialogOpen(false);

      // Refresh invoice detail
      const detail = await getInvoiceDetail(selectedInvoice.id);
      if (detail) {
        setSelectedInvoice(detail);
      }

      // Refresh invoice list
      await loadInvoices();
    } catch (error) {
      console.error("Failed to process refund:", error);
      toast.error("Không thể xử lý hoàn tiền");
    }
  };

  const handleRefreshInvoiceDetail = async () => {
    if (!selectedInvoice) return;

    try {
      const detail = await getInvoiceDetail(selectedInvoice.id);
      if (detail) {
        setSelectedInvoice(detail);
        toast.success("Đã làm mới thông tin hóa đơn");
      }
    } catch (error) {
      console.error("Failed to refresh invoice detail:", error);
      toast.error("Không thể làm mới thông tin");
    }
  };

  // Get cashier options
  const cashierOptions = MOCK_USERS.filter((u) => u.role === "cashier");

  return (
    <RequireRole
      roles={["manager", "cashier"]}
      fallback={<p className="p-6">Không có quyền truy cập</p>}
    >
      <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
        {/* Page Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Quản lý hóa đơn</h1>
          <p className="text-muted-foreground">
            Xem, tìm kiếm và quản lý tất cả hóa đơn trong hệ thống
          </p>
        </div>

        <Separator />

        <InvoiceFilterBar
          filters={filters}
          onFiltersChange={setFilters}
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
          onSearch={handleSearch}
          cashierOptions={cashierOptions}
        />

        {summary && <InvoiceSummaryCards summary={summary} />}

        <InvoiceTable
          invoices={invoices}
          loading={loading}
          onRowClick={handleRowClick}
        />

        {/* Dialogs */}
        {selectedInvoice && (
          <>
            <InvoiceDetailDialog
              open={detailDialogOpen}
              onOpenChange={setDetailDialogOpen}
              invoice={selectedInvoice}
              onCancel={() => {
                setDetailDialogOpen(false);
                setCancelDialogOpen(true);
              }}
              onRefund={() => {
                setDetailDialogOpen(false);
                setRefundDialogOpen(true);
              }}
              onMarkAsPaid={() => handleMarkAsPaid(selectedInvoice.id)}
              onProcessRefund={() => {
                setProcessRefundDialogOpen(true);
              }}
              onRefresh={handleRefreshInvoiceDetail}
            />

            <CancelInvoiceDialog
              open={cancelDialogOpen}
              onOpenChange={setCancelDialogOpen}
              invoice={selectedInvoice}
              onConfirm={handleCancel}
            />

            <RefundInvoiceDialog
              open={refundDialogOpen}
              onOpenChange={setRefundDialogOpen}
              invoice={selectedInvoice}
              onConfirm={handleRefund}
            />

            <ProcessRefundDialog
              open={processRefundDialogOpen}
              onOpenChange={setProcessRefundDialogOpen}
              invoice={selectedInvoice}
              onConfirm={handleProcessRefund}
            />
          </>
        )}
      </div>
    </RequireRole>
  );
}
