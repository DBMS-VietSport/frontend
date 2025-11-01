"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { generateTimeSlots } from "../mockData";
import type { Court, CourtType, TimeSlot } from "../types";

interface CourtTimeSlotGridProps {
  court: Court | null;
  courtType: CourtType | null;
  selectedDate: Date;
  selectedSlots?: TimeSlot[];
  isEmployee?: boolean;
  onSlotSelect: (slot: TimeSlot) => void;
}

export function CourtTimeSlotGrid({
  court,
  courtType,
  selectedDate,
  selectedSlots = [],
  isEmployee = false,
  onSlotSelect,
}: CourtTimeSlotGridProps) {
  const [dialogSlot, setDialogSlot] = React.useState<TimeSlot | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const timeSlots = React.useMemo(() => {
    if (!courtType) return [];
    return generateTimeSlots(courtType, selectedDate);
  }, [courtType, selectedDate]);

  if (!court || !courtType) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Vui lòng chọn sân để xem lịch trống
      </div>
    );
  }

  const handleSlotClick = (slot: TimeSlot) => {
    if (slot.status === "available") {
      onSlotSelect(slot);
    } else if (isEmployee && slot.status === "booked") {
      setDialogSlot(slot);
      setDialogOpen(true);
    }
  };

  const isSlotSelected = (slot: TimeSlot) => {
    return selectedSlots.some(
      (s) => s.start === slot.start && s.end === slot.end
    );
  };

  const getSlotClassName = (status: TimeSlot["status"]) => {
    switch (status) {
      case "available":
        return "bg-white hover:bg-green-50 border-gray-300 hover:border-green-500 text-gray-900";
      case "booked":
        return "bg-red-100 border-red-300 text-red-900 cursor-not-allowed";
      case "pending":
        return "bg-yellow-100 border-yellow-300 text-yellow-900 cursor-not-allowed";
      case "past":
        return "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed opacity-50";
      default:
        return "";
    }
  };

  const SlotButton = ({ slot }: { slot: TimeSlot }) => {
    const isSelected = isSlotSelected(slot);
    const button = (
      <Button
        variant="outline"
        className={cn(
          "h-auto py-3 px-4 flex flex-col items-center justify-center gap-1 transition-all duration-200",
          getSlotClassName(slot.status),
          isSelected &&
            slot.status === "available" &&
            "bg-green-50 border-green-500 "
        )}
        onClick={() => handleSlotClick(slot)}
        disabled={slot.status === "past"}
      >
        <span className="font-semibold text-sm">
          {slot.start} - {slot.end}
        </span>
        <span className="text-xs">
          {slot.status === "available" && isSelected && "Đã chọn"}
          {slot.status === "available" && !isSelected && "Trống"}
          {slot.status === "booked" && "Đã đặt"}
          {slot.status === "pending" && "Chờ xác nhận"}
          {slot.status === "past" && "Đã qua"}
        </span>
      </Button>
    );

    if (isEmployee && slot.status === "booked" && slot.bookedBy) {
      return (
        <TooltipProvider delayDuration={200}>
          <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                <p className="font-semibold">{slot.bookedBy}</p>
                <p className="text-sm text-muted-foreground">{slot.phone}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return button;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Lịch trống - {court.name} ({courtType.name})
        </h3>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded" />
            <span>Trống</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border-2 border-green-500 rounded ring-2 ring-green-500 ring-offset-1" />
            <span>Đã chọn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded" />
            <span>Đã đặt</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-300 rounded" />
            <span>Chờ xác nhận</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-100 border-2 border-gray-200 rounded opacity-50" />
            <span>Đã qua</span>
          </div>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
          {timeSlots.map((slot, index) => (
            <SlotButton key={index} slot={slot} />
          ))}
        </div>
      </Card>

      {/* Employee Dialog for Booking Details */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chi tiết đặt sân</DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về lượt đặt sân này
            </DialogDescription>
          </DialogHeader>
          {dialogSlot && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Khung giờ
                  </p>
                  <p className="text-base font-semibold">
                    {dialogSlot.start} - {dialogSlot.end}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Trạng thái
                  </p>
                  <p className="text-base font-semibold">
                    {dialogSlot.status === "booked" && "Đã đặt"}
                    {dialogSlot.status === "pending" && "Chờ xác nhận"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Tên khách hàng
                  </p>
                  <p className="text-base font-semibold">
                    {dialogSlot.bookedBy}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Số điện thoại
                  </p>
                  <p className="text-base font-semibold">{dialogSlot.phone}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Sân
                  </p>
                  <p className="text-base font-semibold">{court.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Loại sân
                  </p>
                  <p className="text-base font-semibold">{courtType.name}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
