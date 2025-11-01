"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Copy, CheckCircle2, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BankTransferPanelProps {
  amount: number;
  title: string;
  note?: string;
  bookingRef: string;
  onPaid?: () => void;
  isPaid?: boolean;
  className?: string;
}

const MOCK_BANK_ACCOUNT = {
  bank: "Vietcombank",
  accountNumber: "0123456789",
  accountName: "VIETSPORT CO.",
};

export function BankTransferPanel({
  amount,
  title,
  note,
  bookingRef,
  onPaid,
  isPaid = false,
  className,
}: BankTransferPanelProps) {
  const [copied, setCopied] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(value);
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`Đã sao chép ${label}`);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Không thể sao chép");
    }
  };

  const handlePaid = async () => {
    setProcessing(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setProcessing(false);
    onPaid?.();
    toast.success("Cảm ơn! Chúng tôi sẽ xác nhận trong vài phút.");
  };

  return (
    <Card className={cn("p-6 space-y-6", className)}>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-primary" />
          <h4 className="text-lg font-semibold">{title}</h4>
        </div>
        {note && <p className="text-sm text-muted-foreground">{note}</p>}
      </div>

      <Separator />

      {/* QR Code Placeholder */}
      <div className="flex justify-center">
        <div className="w-48 h-48 border-2 border-dashed border-muted rounded-lg flex items-center justify-center bg-muted/20">
          <div className="text-center space-y-2">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              QR Code sẽ hiển thị tại đây
            </p>
          </div>
        </div>
      </div>

      {/* Bank Information */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">Ngân hàng</span>
          <span className="text-sm font-semibold">
            {MOCK_BANK_ACCOUNT.bank}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">Số tài khoản</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">
              {MOCK_BANK_ACCOUNT.accountNumber}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() =>
                handleCopy(MOCK_BANK_ACCOUNT.accountNumber, "số tài khoản")
              }
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">Chủ tài khoản</span>
          <span className="text-sm font-semibold">
            {MOCK_BANK_ACCOUNT.accountName}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <span className="text-sm font-medium">Nội dung chuyển khoản</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold">{bookingRef}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleCopy(bookingRef, "mã đặt chỗ")}
            >
              {copied ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg border-2 border-primary/20">
          <span className="text-sm font-medium">Số tiền</span>
          <span className="text-base font-bold text-primary">
            {formatCurrency(amount)}
          </span>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Vui lòng chuyển đúng số tiền và nội dung chuyển khoản để chúng tôi có
          thể xác nhận nhanh chóng.
        </AlertDescription>
      </Alert>

      {/* Payment Button */}
      {isPaid ? (
        <Alert>
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-sm text-green-700">
            Thanh toán thành công! Chúng tôi đang xử lý yêu cầu của bạn.
          </AlertDescription>
        </Alert>
      ) : (
        <Button
          onClick={handlePaid}
          disabled={processing}
          className="w-full h-12 text-base font-semibold"
          size="lg"
        >
          {processing ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Đang xử lý...
            </>
          ) : (
            "Tôi đã chuyển khoản"
          )}
        </Button>
      )}
    </Card>
  );
}
