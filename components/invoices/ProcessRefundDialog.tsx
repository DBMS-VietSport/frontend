"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { InvoiceDetail } from "@/lib/mock/invoiceManagerRepo";
import { formatVND } from "@/lib/booking/pricing";

const REFUND_REASONS = [
  { value: "court_unavailable", label: "Hết sân / sân không thể phục vụ" },
  { value: "maintenance", label: "Sân đang bảo trì" },
  { value: "customer_cancelled", label: "Khách hủy trước giờ quy định" },
  { value: "wrong_invoice", label: "Nhập sai hóa đơn" },
  { value: "other", label: "Khác" },
] as const;

interface ProcessRefundDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceDetail;
  onConfirm: (amount: number, reason: string, reasonType: string) => void;
}

export function ProcessRefundDialog({
  open,
  onOpenChange,
  invoice,
  onConfirm,
}: ProcessRefundDialogProps) {
  const [amount, setAmount] = React.useState(invoice.total_amount.toString());
  const [reasonType, setReasonType] = React.useState<string>("");
  const [customReason, setCustomReason] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleConfirm = async () => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0 || amountNum > invoice.total_amount) {
      return;
    }
    if (!reasonType) {
      return;
    }
    if (reasonType === "other" && !customReason.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Build reason string
      const reasonLabel =
        REFUND_REASONS.find((r) => r.value === reasonType)?.label || "";
      const finalReason =
        reasonType === "other" ? customReason.trim() : reasonLabel;

      await onConfirm(amountNum, finalReason, reasonType);
      // Reset form
      setAmount(invoice.total_amount.toString());
      setReasonType("");
      setCustomReason("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setAmount(invoice.total_amount.toString());
    setReasonType("");
    setCustomReason("");
    onOpenChange(false);
  };

  const amountNum = parseFloat(amount) || 0;
  const isValidAmount =
    amountNum > 0 &&
    amountNum <= invoice.total_amount &&
    reasonType &&
    (reasonType !== "other" || customReason.trim());

  const showCustomReason = reasonType === "other";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xử lý hoàn tiền - {invoice.code}</DialogTitle>
          <DialogDescription>
            Nhập thông tin hoàn tiền cho hóa đơn này. Có thể hoàn một phần hoặc
            toàn bộ.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reasonType">Lý do hoàn tiền *</Label>
            <Select value={reasonType} onValueChange={setReasonType}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn lý do hoàn tiền" />
              </SelectTrigger>
              <SelectContent>
                {REFUND_REASONS.map((reason) => (
                  <SelectItem key={reason.value} value={reason.value}>
                    {reason.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {showCustomReason && (
            <div className="space-y-2">
              <Label htmlFor="customReason">Ghi chú lý do *</Label>
              <Textarea
                id="customReason"
                placeholder="Nhập lý do hoàn tiền..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Số tiền hoàn lại (VND) *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Nhập số tiền"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={0}
              max={invoice.total_amount}
            />
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAmount(invoice.total_amount.toString())}
              >
                Hoàn toàn bộ
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tối đa: {formatVND(invoice.total_amount)}
            </p>
            {amountNum > invoice.total_amount && (
              <p className="text-xs text-destructive">
                Số tiền không được vượt quá tổng hóa đơn
              </p>
            )}
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-semibold mb-2">Thông tin hóa đơn</p>
            <div className="text-sm space-y-1">
              <p>
                Khách hàng:{" "}
                <span className="font-medium">{invoice.customerName}</span>
              </p>
              <p>
                Tổng tiền:{" "}
                <span className="font-medium">
                  {formatVND(invoice.total_amount)}
                </span>
              </p>
              {amountNum > 0 && (
                <p>
                  Số tiền hoàn lại:{" "}
                  <span className="font-medium text-blue-600">
                    {formatVND(amountNum)}
                  </span>
                </p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValidAmount || isSubmitting}
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận hoàn tiền"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
