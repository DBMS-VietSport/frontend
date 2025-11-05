"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { BookingDetailView } from "@/lib/booking/types";
import { formatVND, formatTimeRange, formatDate } from "@/lib/booking/pricing";
import Link from "next/link";

interface BookingDetailDialogProps {
  booking: BookingDetailView | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BookingDetailDialog({
  booking,
  open,
  onOpenChange,
}: BookingDetailDialogProps) {
  if (!booking) return null;

  const statusBadgeClass =
    booking.courtStatus === "Paid"
      ? "bg-green-500"
      : booking.courtStatus === "Held"
      ? "bg-blue-500"
      : booking.courtStatus === "Booked"
      ? "bg-yellow-500"
      : booking.courtStatus === "Cancelled"
      ? "bg-red-500"
      : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] lg:max-w-7xl max-h-[95vh]">
        <DialogHeader className="pb-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <DialogTitle className="text-3xl font-bold">
                Chi tiết đặt sân
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Xem thông tin chi tiết và quản lý đơn đặt sân
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-base px-3 py-1">
                #{booking.code}
              </Badge>
              <Badge className={`${statusBadgeClass} text-base px-3 py-1`}>
                {booking.courtStatus}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(95vh-12rem)] pr-4">
          <div className="space-y-8 py-2">
            {/* Top Row - Booking & Customer Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Booking Info */}
              <Card className="p-6 rounded-xl border-2">
                <h3 className="font-bold text-xl mb-5 flex items-center gap-2">
                  <span className="w-2 h-6 bg-primary rounded-full"></span>
                  Thông tin đơn hàng
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-start py-2 border-b">
                    <span className="text-muted-foreground">Ngày tạo</span>
                    <span className="font-semibold text-lg">
                      {formatDate(booking.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-start py-2 border-b">
                    <span className="text-muted-foreground">Chi nhánh</span>
                    <span className="font-semibold text-lg">
                      {booking.branchName}
                    </span>
                  </div>
                  <div className="flex justify-between items-start py-2 border-b">
                    <span className="text-muted-foreground">Loại sân</span>
                    <span className="font-semibold text-lg">
                      {booking.courtType}
                    </span>
                  </div>
                  <div className="flex justify-between items-start py-2">
                    <span className="text-muted-foreground">Sân</span>
                    <span className="font-semibold text-lg">
                      {booking.courtName}
                    </span>
                  </div>
                </div>
              </Card>

              {/* Customer Info */}
              <Card className="p-6 rounded-xl border-2">
                <h3 className="font-bold text-xl mb-5 flex items-center gap-2">
                  <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
                  Thông tin khách hàng
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-start py-2 border-b">
                    <span className="text-muted-foreground">
                      Tên khách hàng
                    </span>
                    <span className="font-semibold text-lg">
                      {booking.customer.full_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-start py-2 border-b">
                    <span className="text-muted-foreground">Số điện thoại</span>
                    <span className="font-semibold text-lg">
                      {booking.customer.phone_number}
                    </span>
                  </div>
                  <div className="flex justify-between items-start py-2 border-b">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-semibold text-lg break-all">
                      {booking.customer.email}
                    </span>
                  </div>
                  {booking.employee && (
                    <div className="flex justify-between items-start py-2">
                      <span className="text-muted-foreground">
                        Nhân viên xử lý
                      </span>
                      <span className="font-semibold text-lg">
                        {booking.employee.full_name}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* Middle Row - Time Slots & Payment */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Time Slots */}
              <Card className="p-6 rounded-xl border-2">
                <h3 className="font-bold text-xl mb-5 flex items-center gap-2">
                  <span className="w-2 h-6 bg-green-500 rounded-full"></span>
                  Khung giờ đặt
                </h3>
                <div className="space-y-3">
                  {booking.slots.map((slot, index) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted rounded-xl border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary">
                            {index + 1}
                          </span>
                        </div>
                        <span className="font-semibold text-lg">
                          {formatTimeRange(slot.start_time, slot.end_time)}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-sm px-3 py-1">
                        {slot.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Payment Summary */}
              <Card className="p-6 rounded-xl border-2 bg-gradient-to-br from-background to-muted/20">
                <h3 className="font-bold text-xl mb-5 flex items-center gap-2">
                  <span className="w-2 h-6 bg-amber-500 rounded-full"></span>
                  Chi tiết thanh toán
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-muted-foreground text-base">
                      Phí sân
                    </span>
                    <span className="font-semibold text-xl">
                      {formatVND(booking.courtFee)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-muted-foreground text-base">
                      Phí dịch vụ
                    </span>
                    <span className="font-semibold text-xl">
                      {formatVND(booking.serviceFee)}
                    </span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                    <span className="font-bold text-xl">Tổng cộng</span>
                    <span className="font-bold text-2xl text-primary">
                      {formatVND(booking.totalAmount)}
                    </span>
                  </div>
                </div>

                {booking.invoices.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h4 className="font-bold text-lg mb-3">Hóa đơn</h4>
                    <div className="space-y-3">
                      {booking.invoices.map((invoice) => (
                        <div
                          key={invoice.id}
                          className="flex items-center justify-between p-3 bg-background rounded-lg border"
                        >
                          <div>
                            <p className="font-medium">#{invoice.id}</p>
                            <p className="text-sm text-muted-foreground">
                              {invoice.payment_method}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-lg">
                              {formatVND(invoice.total_amount)}
                            </span>
                            <Badge
                              variant={
                                invoice.status === "Paid"
                                  ? "default"
                                  : "secondary"
                              }
                              className={
                                invoice.status === "Paid"
                                  ? "bg-green-500 text-sm px-3 py-1"
                                  : "text-sm px-3 py-1"
                              }
                            >
                              {invoice.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Bottom Row - Services */}
            {booking.serviceItems.length > 0 && (
              <Card className="p-6 rounded-xl border-2">
                <h3 className="font-bold text-xl mb-5 flex items-center gap-2">
                  <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
                  Dịch vụ bổ sung
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {booking.serviceItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-muted/50 to-muted rounded-xl border"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-lg">
                          {item.service.name}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Số lượng: {item.quantity} {item.service.unit}
                        </p>
                      </div>
                      <div className="text-right ml-4">
                        <p className="font-bold text-xl text-primary">
                          {formatVND(
                            item.branchService.unit_price * item.quantity
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="text-base px-6"
          >
            Đóng
          </Button>
          <Button asChild className="text-base px-6">
            <Link href={`/booking/manage/${booking.id}/edit`}>
              Chỉnh sửa đơn hàng
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
