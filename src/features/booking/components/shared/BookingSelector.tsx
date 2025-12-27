"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Calendar, Clock } from "lucide-react";
import { cn } from "@/utils";
import { Button } from "@/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/popover";
import { Badge } from "@/ui/badge";

export interface CourtBookingOption {
  id: string;
  bookingRef: string;
  courtName: string;
  courtType: string;
  date: Date;
  timeRange: string;
  status: "held" | "pending" | "confirmed" | "paid";
  totalAmount: number;
}

interface BookingSelectorProps {
  value: string | null;
  onChange: (bookingId: string | null) => void;
  bookings: CourtBookingOption[];
  placeholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
}

const STATUS_LABELS: Record<CourtBookingOption["status"], string> = {
  held: "Đang giữ",
  pending: "Chờ thanh toán",
  confirmed: "Đã xác nhận",
  paid: "Đã thanh toán",
};

const STATUS_COLORS: Record<
  CourtBookingOption["status"],
  "default" | "secondary" | "destructive" | "outline"
> = {
  held: "secondary",
  pending: "outline",
  confirmed: "default",
  paid: "default",
};

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

export function BookingSelector({
  value,
  onChange,
  bookings,
  placeholder = "Chọn phiếu đặt sân...",
  emptyMessage = "Không tìm thấy phiếu đặt sân",
  disabled = false,
}: BookingSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const selectedBooking = React.useMemo(
    () => bookings.find((b) => b.id === value),
    [bookings, value]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-auto min-h-10 py-2"
          disabled={disabled}
        >
          {selectedBooking ? (
            <span className="font-medium">{selectedBooking.bookingRef}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[500px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Tìm mã đặt sân hoặc tên sân..." />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {bookings.map((booking) => (
                <CommandItem
                  key={booking.id}
                  value={`${booking.bookingRef} ${booking.courtName}`}
                  onSelect={() => {
                    onChange(booking.id === value ? null : booking.id);
                    setOpen(false);
                  }}
                  className="py-3"
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4 shrink-0",
                      value === booking.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col gap-1.5 flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">
                          {booking.bookingRef}
                        </span>
                        <Badge
                          variant={STATUS_COLORS[booking.status]}
                          className="text-xs"
                        >
                          {STATUS_LABELS[booking.status]}
                        </Badge>
                      </div>
                      <span className="font-medium text-sm">
                        {formatCurrency(booking.totalAmount)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(booking.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {booking.timeRange}
                      </span>
                    </div>
                    <div className="text-xs">
                      <span className="font-medium">{booking.courtName}</span>
                      <span className="text-muted-foreground">
                        {" "}
                        • {booking.courtType}
                      </span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
