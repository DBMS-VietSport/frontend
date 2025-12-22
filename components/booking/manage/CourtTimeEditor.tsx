"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Plus,
  X,
  AlertCircle,
  CalendarIcon,
  Clock,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import type { BookingSlot } from "@/lib/types";
import { formatTime } from "@/lib/booking/pricing";

import {
  useCourtTimeEditor,
  type TimeSlot,
  type TimeSlotEdit,
} from "./useCourtTimeEditor";

// -----------------------------------------------------------------------------
// Props Interface
// -----------------------------------------------------------------------------

interface CourtTimeEditorProps {
  bookingId: number;
  initialCourtId: number;
  initialSlots: BookingSlot[];
  onChange: (courtId: number, slots: TimeSlotEdit[]) => void;
}

// -----------------------------------------------------------------------------
// CourtTimeEditor Component (Refactored)
// -----------------------------------------------------------------------------

export function CourtTimeEditor({
  bookingId,
  initialCourtId,
  initialSlots,
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
            const slotDate = new Date(slot.start_time);
            return (
              <Card key={index} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">
                        {format(slotDate, "dd/MM/yyyy", { locale: vi })}
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">
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

      {/* Time Slot Grid */}
      <TimeSlotGrid
        timeSlots={timeSlots}
        isSlotSelected={isSlotSelected}
        onSlotSelect={onSlotSelect}
      />

      {/* Selected Slots Summary */}
      {tempSelectedSlots.length > 0 && (
        <SelectedSlotsSummary
          slots={tempSelectedSlots}
          onConfirm={onConfirm}
          onRemove={onRemoveSlot}
        />
      )}

      {/* Error */}
      {conflictError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{conflictError}</AlertDescription>
        </Alert>
      )}
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
        <SelectTrigger>
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
              "w-full justify-start text-left font-normal",
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
      <Card className="p-6">
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-sm">Không có khung giờ nào</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Legend */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Chọn các khung giờ trống (màu trắng)
          </span>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border-2 border-gray-300 rounded" />
              <span className="text-xs">Trống</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-50 border-2 border-green-500 rounded ring-2 ring-green-500 ring-offset-1" />
              <span className="text-xs">Đã chọn</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-100 border-2 border-red-300 rounded" />
              <span className="text-xs">Đã đặt</span>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
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
    switch (slot.status) {
      case "available":
        return cn(
          "bg-white hover:bg-green-50 border-gray-300 hover:border-green-500 text-gray-900",
          isSelected && "bg-green-50 border-green-500 ring-2 ring-green-500 ring-offset-1"
        );
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

  const getStatusLabel = () => {
    if (slot.status === "available" && isSelected) return "Đã chọn";
    if (slot.status === "available") return "Trống";
    if (slot.status === "booked") return "Đã đặt";
    if (slot.status === "pending") return "Chờ xác nhận";
    if (slot.status === "past") return "Đã qua";
    return "";
  };

  return (
    <Button
      variant="outline"
      className={cn(
        "h-auto py-3 px-4 flex flex-col items-center justify-center gap-1 transition-all duration-200",
        getClassName()
      )}
      onClick={onClick}
      disabled={slot.status === "past" || slot.status === "booked"}
    >
      <span className="font-semibold text-sm">
        {slot.start} - {slot.end}
      </span>
      <span className="text-xs">{getStatusLabel()}</span>
    </Button>
  );
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
    <Card className="p-4 bg-green-50 border-green-200">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-green-900">
            Đã chọn {slots.length} khung giờ
          </p>
          <Button onClick={onConfirm} size="sm">
            Xác nhận
          </Button>
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {slots.map((s, idx) => {
            const slotDate = s.startISO ? new Date(s.startISO) : null;
            return (
              <div
                key={idx}
                className="flex items-center justify-between text-xs text-green-700"
              >
                <span>
                  {slotDate ? format(slotDate, "dd/MM/yyyy", { locale: vi }) : ""}{" "}
                  {s.start} - {s.end}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => onRemove(s)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
