"use client";

import * as React from "react";
import { Card } from "@/ui/card";
import { Label } from "@/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Button } from "@/ui/button";
import { Alert, AlertDescription } from "@/ui/alert";
import { Calendar } from "@/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/ui/tooltip";
import {
  Plus,
  X,
  AlertCircle,
  CalendarIcon,
  Clock,
  MapPin,
} from "lucide-react";
import { cn } from "@/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { BookingSlot, TimeSlot } from "@/types";
import { formatTime } from "@/features/booking/utils/pricing";

import {
  useCourtTimeEditor,
  type TimeSlotEdit,
} from "./useCourtTimeEditor";

// -----------------------------------------------------------------------------
// Props Interface
// -----------------------------------------------------------------------------

interface CourtTimeEditorProps {
  bookingId: number;
  initialCourtId: number;
  initialSlots: BookingSlot[];
  branchId: number;
  initialCourtDetails?: {
    id: number;
    name: string;
    branch?: { name: string };
    court_type?: { name: string };
    base_hourly_price?: number;
  };
  onChange: (courtId: number, slots: TimeSlotEdit[]) => void;
}

// -----------------------------------------------------------------------------
// CourtTimeEditor Component (Refactored)
// -----------------------------------------------------------------------------

export function CourtTimeEditor({
  bookingId,
  initialCourtId,
  initialSlots,
  branchId,
  initialCourtDetails,
  onChange,
}: CourtTimeEditorProps) {
  const {
    courtId,
    slots,
    mode,
    selectedDate,
    tempSelectedSlots,
    tempCourtId,
    conflictError,
    currentCourt,
    courtType,
    branch,
    availableCourts,
    timeSlots,
    isSlotSelected,
    handleSlotSelect,
    handleAddTime,
    handleChangeCourt,
    handleCancel,
    handleConfirm,
    handleDateSelect,
    handleCourtChange,
    removeSelectedSlot,
  } = useCourtTimeEditor({
    bookingId,
    initialCourtId,
    initialSlots,
    branchId,
    initialCourt: initialCourtDetails,
    onChange,
  });

  return (
    <div className="space-y-6">
      {/* Court Info Display */}
      <CourtInfoCard
        branch={branch}
        courtType={courtType}
        currentCourt={currentCourt}
        courtId={courtId}
      />

      {/* Conflict Warning in View Mode */}
      {conflictError && mode === "view" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{conflictError}</AlertDescription>
        </Alert>
      )}

      {/* View Mode */}
      {mode === "view" && (
        <ViewMode
          slots={slots}
          onAddTime={handleAddTime}
          onChangeCourt={handleChangeCourt}
        />
      )}

      {/* Edit Modes */}
      {(mode === "addTime" || mode === "changeCourt") && (
        <EditMode
          mode={mode}
          courtId={courtId}
          tempCourtId={tempCourtId}
          selectedDate={selectedDate}
          timeSlots={timeSlots}
          tempSelectedSlots={tempSelectedSlots}
          availableCourts={availableCourts}
          conflictError={conflictError}
          isSlotSelected={isSlotSelected}
          onCourtChange={handleCourtChange}
          onDateSelect={handleDateSelect}
          onSlotSelect={handleSlotSelect}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          onRemoveSlot={removeSelectedSlot}
        />
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// CourtInfoCard Sub-component
// -----------------------------------------------------------------------------

interface CourtInfoCardProps {
  branch?: { name: string } | null;
  courtType?: { name: string } | null;
  currentCourt?: { name?: string; base_hourly_price: number } | null;
  courtId: number;
}

function CourtInfoCard({ branch, courtType, currentCourt, courtId }: CourtInfoCardProps) {
  return (
    <Card className="p-4 bg-muted/50">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Chi nhánh</p>
          <p className="font-semibold">{branch?.name || "-"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Loại sân</p>
          <p className="font-semibold">{courtType?.name || "-"}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Sân</p>
          <p className="font-semibold">{currentCourt?.name || `Sân ${courtId}`}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Giá</p>
          <p className="font-semibold">
            {currentCourt?.base_hourly_price.toLocaleString() || 0} VNĐ/giờ
          </p>
        </div>
      </div>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// ViewMode Sub-component
// -----------------------------------------------------------------------------

interface ViewModeProps {
  slots: TimeSlotEdit[];
  onAddTime: () => void;
  onChangeCourt: () => void;
}

function ViewMode({ slots, onAddTime, onChangeCourt }: ViewModeProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Khung giờ hiện tại</Label>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onAddTime}>
            <Plus className="h-4 w-4 mr-2" />
            Thêm giờ
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={onChangeCourt}>
            <MapPin className="h-4 w-4 mr-2" />
            Đổi sân / giờ
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {slots.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            Chưa có khung giờ nào
          </p>
        ) : (
          slots.map((slot, index) => {
            // Check formatted string validity
            const d = new Date(slot.start_time);
            const isValidDate = !isNaN(d.getTime());
            return (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {isValidDate ? format(d, "dd/MM/yyyy") : "Invalid Date"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// EditMode Sub-component
// -----------------------------------------------------------------------------

interface EditModeProps {
  mode: "addTime" | "changeCourt";
  courtId: number;
  tempCourtId: number | null;
  selectedDate: Date;
  timeSlots: TimeSlot[];
  tempSelectedSlots: TimeSlot[];
  availableCourts: Array<{ id: number; name?: string; base_hourly_price: number }>;
  conflictError: string | null;
  isSlotSelected: (slot: TimeSlot) => boolean;
  onCourtChange: (value: string) => void;
  onDateSelect: (date: Date | undefined) => void;
  onSlotSelect: (slot: TimeSlot) => void;
  onConfirm: () => void;
  onCancel: () => void;
  onRemoveSlot: (slot: TimeSlot) => void;
}

function EditMode({
  mode,
  courtId,
  tempCourtId,
  selectedDate,
  timeSlots,
  tempSelectedSlots,
  availableCourts,
  conflictError,
  isSlotSelected,
  onCourtChange,
  onDateSelect,
  onSlotSelect,
  onConfirm,
  onCancel,
  onRemoveSlot,
}: EditModeProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold">
            {mode === "addTime" && "Thêm khung giờ"}
            {mode === "changeCourt" && "Đổi sân / khung giờ"}
          </h3>
          {mode === "changeCourt" && (
            <p className="text-sm text-muted-foreground mt-1">
              Có thể chọn sân mới (hoặc giữ nguyên sân hiện tại) và chọn các khung giờ trống.
            </p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Hủy
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col: Controls */}
        <div className="space-y-6 md:col-span-1">
          {/* Court Selector (changeCourt mode only) */}
          {mode === "changeCourt" && (
            <CourtSelector
              courtId={courtId}
              tempCourtId={tempCourtId}
              availableCourts={availableCourts}
              onChange={onCourtChange}
            />
          )}

          {/* Date Selector */}
          <DateSelector selectedDate={selectedDate} onSelect={onDateSelect} />

          {/* Selected Slots Summary */}
          {tempSelectedSlots.length > 0 && (
            <SelectedSlotsSummary
              slots={tempSelectedSlots}
              onConfirm={onConfirm}
              onRemove={onRemoveSlot}
            />
          )}
        </div>

        {/* Right Col: Grid */}
        <div className="md:col-span-2">
          {/* Time Slot Grid */}
          <TimeSlotGrid
            timeSlots={timeSlots}
            isSlotSelected={isSlotSelected}
            onSlotSelect={onSlotSelect}
          />

          {/* Error */}
          {conflictError && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{conflictError}</AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// CourtSelector Sub-component
// -----------------------------------------------------------------------------

interface CourtSelectorProps {
  courtId: number;
  tempCourtId: number | null;
  availableCourts: Array<{ id: number; name?: string; base_hourly_price: number }>;
  onChange: (value: string) => void;
}

function CourtSelector({ courtId, tempCourtId, availableCourts, onChange }: CourtSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Chọn sân (tùy chọn)</Label>
      <Select
        value={tempCourtId?.toString() || courtId.toString()}
        onValueChange={onChange}
      >
        <SelectTrigger className="h-10 text-base">
          <SelectValue placeholder="Chọn sân" />
        </SelectTrigger>
        <SelectContent>
          {availableCourts.map((court) => (
            <SelectItem key={court.id} value={court.id.toString()}>
              {court.name || `Sân ${court.id}`} - {court.base_hourly_price.toLocaleString()} VNĐ/giờ
              {court.id === courtId && " (Sân hiện tại)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        {tempCourtId && tempCourtId !== courtId
          ? "Đã chọn sân mới. Vui lòng chọn các khung giờ trống cho sân mới."
          : "Có thể giữ nguyên sân hiện tại hoặc chọn sân mới."}
      </p>
    </div>
  );
}

// -----------------------------------------------------------------------------
// DateSelector Sub-component
// -----------------------------------------------------------------------------

interface DateSelectorProps {
  selectedDate: Date;
  onSelect: (date: Date | undefined) => void;
}

function DateSelector({ selectedDate, onSelect }: DateSelectorProps) {
  return (
    <div className="space-y-2">
      <Label>Chọn ngày</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-10 text-base",
              !selectedDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {selectedDate
              ? format(selectedDate, "dd/MM/yyyy", { locale: vi })
              : "Chọn ngày"}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onSelect}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

// -----------------------------------------------------------------------------
// TimeSlotGrid Sub-component
// -----------------------------------------------------------------------------

interface TimeSlotGridProps {
  timeSlots: TimeSlot[];
  isSlotSelected: (slot: TimeSlot) => boolean;
  onSlotSelect: (slot: TimeSlot) => void;
}

function TimeSlotGrid({ timeSlots, isSlotSelected, onSlotSelect }: TimeSlotGridProps) {
  if (timeSlots.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center py-12 text-muted-foreground">
          <Clock className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Không có khung giờ nào</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 h-full">
      <div className="space-y-6">
        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-sm gap-4">
          <span className="text-muted-foreground font-medium">
            Chọn các khung giờ trống (màu trắng)
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-white border-2 border-gray-300 rounded" />
              <span className="text-sm">Trống</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-green-50 border-2 border-green-500 rounded ring-2 ring-green-500 ring-offset-1" />
              <span className="text-sm">Đã chọn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-red-100 border-2 border-red-300 rounded" />
              <span className="text-sm">Đã đặt</span>
            </div>
          </div>
        </div>

        {/* Grid - Bigger Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {timeSlots.map((slot, index) => (
            <SlotButton
              key={index}
              slot={slot}
              isSelected={isSlotSelected(slot)}
              onClick={() => onSlotSelect(slot)}
            />
          ))}
        </div>
      </div>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// SlotButton Sub-component
// -----------------------------------------------------------------------------

interface SlotButtonProps {
  slot: TimeSlot;
  isSelected: boolean;
  onClick: () => void;
}

function SlotButton({ slot, isSelected, onClick }: SlotButtonProps) {
  const getClassName = () => {
    // Handle mapped statuses including standard and Vietnamese ones
    if (slot.status === "available" || slot.status === "Trống") {
      return cn(
        "bg-white hover:bg-green-50 border-gray-200 hover:border-green-500 text-gray-900 shadow-sm hover:shadow-md hover:-translate-y-0.5",
        isSelected && "bg-green-50 border-green-500 ring-2 ring-green-500 ring-offset-1 shadow-md"
      );
    }
    if (slot.status === "pending" || slot.status === "Đang giữ chỗ") {
      return "bg-yellow-100 border-yellow-300 text-yellow-900 cursor-not-allowed opacity-80";
    }
    if (slot.status === "past") {
      return "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-60";
    }
    // All other statuses are booked/unavailable
    return "bg-red-50 border-red-200 text-red-900 cursor-not-allowed opacity-80";
  };

  const getStatusLabel = () => {
    const s = slot.status;
    if ((s === "available" || s === "Trống") && isSelected) return "Đã chọn";
    if (s === "available" || s === "Trống") return "Trống";
    if (s === "booked" || s === "Đã đặt") return "Đã đặt";
    if (s === "pending" || s === "Đang giữ chỗ") return "Chờ";
    if (s === "past") return "Đã qua";
    return s;
  };

  const button = (
    <Button
      variant="outline"
      className={cn(
        "h-20 py-2 px-3 flex flex-col items-center justify-center gap-1 transition-all duration-200 w-full",
        getClassName()
      )}
      onClick={onClick}
      disabled={slot.status !== "available" && slot.status !== "Trống"}
    >
      <span className="font-bold text-lg text-foreground/90">
        {slot.start}
        <span className="text-xs font-normal text-muted-foreground ml-1">- {slot.end}</span>
      </span>
      <span className="text-sm font-semibold text-primary">
        {slot.price ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(slot.price) : '-'}
      </span>
      <span className="text-[10px] uppercase tracking-wider opacity-70">
        {getStatusLabel()}
      </span>
    </Button>
  );

  // Add tooltip if booked and info available
  if ((slot.status === "booked" || slot.status === "Đã đặt") && (slot.bookedBy || slot.phone)) {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent className="p-3">
            <div className="space-y-1 text-sm">
              <p className="font-semibold text-base mb-1">Đã đặt bởi:</p>
              {slot.bookedBy && <p><span className="text-muted-foreground">Tên:</span> {slot.bookedBy}</p>}
              {slot.phone && <p><span className="text-muted-foreground">SĐT:</span> {slot.phone}</p>}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Tooltip for past slots
  if (slot.status === "past") {
    return (
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="w-full relative cursor-not-allowed">
              {/* Overlay to ensure tooltip triggers even if button disabled (though disabled buttons usually swallow events in React, trigger wrapper handles it) */}
              {button}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Khung giờ đã qua</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return button;
}

// -----------------------------------------------------------------------------
// SelectedSlotsSummary Sub-component
// -----------------------------------------------------------------------------

interface SelectedSlotsSummaryProps {
  slots: TimeSlot[];
  onConfirm: () => void;
  onRemove: (slot: TimeSlot) => void;
}

function SelectedSlotsSummary({ slots, onConfirm, onRemove }: SelectedSlotsSummaryProps) {
  return (
    <Card className="p-4 bg-green-50 border-green-200 shadow-sm sticky top-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-green-200 pb-3">
          <p className="font-semibold text-green-900">
            Đã chọn <span className="text-lg">{slots.length}</span> khung giờ
          </p>
        </div>

        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
          {slots.map((s, idx) => {
            const slotDate = s.startISO ? new Date(s.startISO) : null;
            return (
              <div
                key={idx}
                className="flex items-center justify-between p-2 bg-white rounded border border-green-100 shadow-sm"
              >
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground font-medium">
                    {slotDate ? format(slotDate, "dd/MM/yyyy", { locale: vi }) : ""}
                  </span>
                  <span className="text-sm font-bold text-green-700">
                    {s.start} - {s.end}
                  </span>
                  {s.price && (
                    <span className="text-xs text-green-600">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(s.price)}
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => onRemove(s)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-green-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-medium text-green-800">Tạm tính:</span>
            <span className="text-lg font-bold text-green-800">
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                slots.reduce((sum, s) => sum + (s.price || 0), 0)
              )}
            </span>
          </div>
          <Button onClick={onConfirm} className="w-full bg-green-600 hover:bg-green-700 text-white shadow-md transition-all hover:-translate-y-0.5">
            Xác nhận thay đổi
          </Button>
        </div>
      </div>
    </Card>
  );
}
