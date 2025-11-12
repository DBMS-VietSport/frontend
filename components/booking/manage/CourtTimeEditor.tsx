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
  RefreshCw,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  mockCourts,
  mockCourtTypes,
  mockBranches,
  hasConflict,
} from "@/lib/booking/mockRepo";
import type {
  Court,
  CourtType,
  Branch,
  BookingSlot,
} from "@/lib/booking/types";
import { formatTime, formatDate } from "@/lib/booking/pricing";

interface TimeSlotEdit {
  id?: number;
  start_time: string;
  end_time: string;
}

interface TimeSlot {
  start: string;
  end: string;
  status: "available" | "booked" | "pending" | "past";
  startISO?: string;
  endISO?: string;
}

interface CourtTimeEditorProps {
  bookingId: number;
  initialCourtId: number;
  initialSlots: BookingSlot[];
  onChange: (courtId: number, slots: TimeSlotEdit[]) => void;
}

type EditorMode = "view" | "addTime" | "changeCourt";

export function CourtTimeEditor({
  bookingId,
  initialCourtId,
  initialSlots,
  onChange,
}: CourtTimeEditorProps) {
  const [courtId, setCourtId] = React.useState(initialCourtId);
  const [slots, setSlots] = React.useState<TimeSlotEdit[]>(
    initialSlots.map((s) => ({
      id: s.id,
      start_time: s.start_time,
      end_time: s.end_time,
    }))
  );
  const [mode, setMode] = React.useState<EditorMode>("view");
  const [selectedDate, setSelectedDate] = React.useState<Date>(
    initialSlots[0] ? new Date(initialSlots[0].start_time) : new Date()
  );
  const [tempSelectedSlots, setTempSelectedSlots] = React.useState<TimeSlot[]>(
    []
  );
  const [tempCourtId, setTempCourtId] = React.useState<number | null>(null);
  const [conflictError, setConflictError] = React.useState<string | null>(null);

  const currentCourt = mockCourts.find((c) => c.id === courtId);
  const courtType = currentCourt
    ? mockCourtTypes.find((ct) => ct.id === currentCourt.court_type_id)
    : null;
  const branch = currentCourt
    ? mockBranches.find((b) => b.id === currentCourt.branch_id)
    : null;

  // Get available courts (same type, same branch)
  const availableCourts = React.useMemo(() => {
    if (!currentCourt) return [];
    return mockCourts.filter(
      (c) =>
        c.court_type_id === currentCourt.court_type_id &&
        c.branch_id === currentCourt.branch_id
    );
  }, [currentCourt]);

  // Convert TimeSlotEdit to TimeSlot format for display
  const timeSlotEditToTimeSlot = (slot: TimeSlotEdit): TimeSlot => {
    const startDate = new Date(slot.start_time);
    const endDate = new Date(slot.end_time);
    const now = new Date();

    let status: "available" | "booked" | "pending" | "past" = "available";
    if (startDate < now) {
      status = "past";
    } else if (
      hasConflict(courtId, slot.start_time, slot.end_time, bookingId)
    ) {
      status = "booked";
    }

    return {
      start: formatTime(slot.start_time),
      end: formatTime(slot.end_time),
      status,
      startISO: slot.start_time,
      endISO: slot.end_time,
    };
  };

  // Generate time slots for grid display
  const generateTimeSlots = React.useCallback(
    (
      court: Court,
      date: Date,
      excludeBookingId?: number,
      currentSlots?: TimeSlotEdit[]
    ): TimeSlot[] => {
      if (!courtType) return [];

      const timeSlots: TimeSlot[] = [];
      const slotDuration = courtType.rent_duration;
      const startHour = 6;
      const endHour = 22;
      const now = new Date();

      // Get current booking slots for this date (to mark them as available)
      const currentSlotsForDate =
        currentSlots?.filter((s) => {
          const slotDate = new Date(s.start_time);
          return (
            slotDate.getFullYear() === date.getFullYear() &&
            slotDate.getMonth() === date.getMonth() &&
            slotDate.getDate() === date.getDate() &&
            court.id === courtId // Only for same court
          );
        }) || [];

      let currentTime = startHour * 60;

      while (currentTime < endHour * 60) {
        const startH = Math.floor(currentTime / 60);
        const startM = currentTime % 60;
        const endMinutes = currentTime + slotDuration;
        const endH = Math.floor(endMinutes / 60);
        const endM = endMinutes % 60;

        const slotDate = new Date(date);
        slotDate.setHours(startH, startM, 0, 0);
        const slotEndDate = new Date(date);
        slotEndDate.setHours(endH, endM, 0, 0);

        const startISO = slotDate.toISOString();
        const endISO = slotEndDate.toISOString();

        // Check if this is a current booking slot
        const isCurrentSlot = currentSlotsForDate.some((s) => {
          const sStart = new Date(s.start_time);
          const sEnd = new Date(s.end_time);
          return (
            Math.abs(sStart.getTime() - slotDate.getTime()) < 60000 &&
            Math.abs(sEnd.getTime() - slotEndDate.getTime()) < 60000
          );
        });

        let status: "available" | "booked" | "pending" | "past" = "available";
        if (slotDate < now) {
          status = "past";
        } else if (
          !isCurrentSlot &&
          hasConflict(court.id, startISO, endISO, excludeBookingId)
        ) {
          status = "booked";
        }

        timeSlots.push({
          start: `${String(startH).padStart(2, "0")}:${String(startM).padStart(
            2,
            "0"
          )}`,
          end: `${String(endH).padStart(2, "0")}:${String(endM).padStart(
            2,
            "0"
          )}`,
          status,
          startISO,
          endISO,
        });

        currentTime += slotDuration;
      }

      return timeSlots;
    },
    [courtType, bookingId, courtId]
  );

  // Get time slots for current mode
  const timeSlots = React.useMemo(() => {
    if (mode === "view") return [];
    const targetCourt =
      mode === "changeCourt" && tempCourtId
        ? mockCourts.find((c) => c.id === tempCourtId)
        : currentCourt;
    if (!targetCourt) return [];
    // Pass current slots to show them as available (only when adding time, not when changing court)
    const currentSlotsToPass = mode === "addTime" ? slots : [];
    return generateTimeSlots(
      targetCourt,
      selectedDate,
      bookingId,
      currentSlotsToPass
    );
  }, [mode, currentCourt, tempCourtId, selectedDate, generateTimeSlots, slots]);

  // Handle slot selection in grid
  const handleSlotSelect = (slot: TimeSlot) => {
    if (slot.status !== "available" || !slot.startISO || !slot.endISO) return;

    if (mode === "addTime") {
      // Add new slot
      const newSlot: TimeSlotEdit = {
        start_time: slot.startISO,
        end_time: slot.endISO,
      };
      // Check if already selected
      const exists = tempSelectedSlots.some(
        (s) => s.startISO === slot.startISO && s.endISO === slot.endISO
      );
      if (exists) {
        setTempSelectedSlots(
          tempSelectedSlots.filter(
            (s) => !(s.startISO === slot.startISO && s.endISO === slot.endISO)
          )
        );
      } else {
        setTempSelectedSlots([...tempSelectedSlots, slot]);
      }
    } else if (mode === "changeCourt") {
      // Replace all slots
      const exists = tempSelectedSlots.some(
        (s) => s.startISO === slot.startISO && s.endISO === slot.endISO
      );
      if (exists) {
        setTempSelectedSlots(
          tempSelectedSlots.filter(
            (s) => !(s.startISO === slot.startISO && s.endISO === slot.endISO)
          )
        );
      } else {
        setTempSelectedSlots([...tempSelectedSlots, slot]);
      }
    }
  };

  // Check if slot is selected
  const isSlotSelected = (slot: TimeSlot) => {
    return tempSelectedSlots.some(
      (s) => s.startISO === slot.startISO && s.endISO === slot.endISO
    );
  };

  // Get slot className
  const getSlotClassName = (slot: TimeSlot) => {
    const isSelected = isSlotSelected(slot);
    switch (slot.status) {
      case "available":
        return cn(
          "bg-white hover:bg-green-50 border-gray-300 hover:border-green-500 text-gray-900",
          isSelected &&
            "bg-green-50 border-green-500 ring-2 ring-green-500 ring-offset-1"
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

  // Handle mode changes
  const handleAddTime = () => {
    setMode("addTime");
    setTempSelectedSlots([]);
    setSelectedDate(slots[0] ? new Date(slots[0].start_time) : new Date());
  };

  const handleChangeCourt = () => {
    setMode("changeCourt");
    setTempCourtId(null);
    // Pre-select current slots for the first date to help user see what they had
    const firstDate = slots[0] ? new Date(slots[0].start_time) : new Date();
    setSelectedDate(firstDate);
    // Don't pre-select slots initially - user needs to choose new court first
    setTempSelectedSlots([]);
  };

  const handleCancel = () => {
    setMode("view");
    setTempSelectedSlots([]);
    setTempCourtId(null);
    setConflictError(null);
  };

  const handleConfirm = () => {
    setConflictError(null);

    if (mode === "addTime") {
      // Add new slots
      if (tempSelectedSlots.length === 0) {
        setConflictError("Vui lòng chọn ít nhất một khung giờ");
        return;
      }
      // Check for conflicts
      for (const slot of tempSelectedSlots) {
        if (
          slot.startISO &&
          slot.endISO &&
          hasConflict(courtId, slot.startISO, slot.endISO, bookingId)
        ) {
          setConflictError(`Khung giờ ${slot.start} - ${slot.end} đã được đặt`);
          return;
        }
      }
      const newSlots: TimeSlotEdit[] = tempSelectedSlots.map((s) => ({
        start_time: s.startISO!,
        end_time: s.endISO!,
      }));
      setSlots([...slots, ...newSlots]);
      onChange(courtId, [...slots, ...newSlots]);
      handleCancel();
    } else if (mode === "changeCourt") {
      // Change court and/or time slots
      // If tempCourtId is null, user is changing time slots for current court
      // If tempCourtId is set, user is changing to a new court
      const targetCourtId = tempCourtId || courtId;

      if (tempSelectedSlots.length === 0) {
        setConflictError("Vui lòng chọn ít nhất một khung giờ");
        return;
      }
      // Check for conflicts with target court
      for (const slot of tempSelectedSlots) {
        if (
          slot.startISO &&
          slot.endISO &&
          hasConflict(targetCourtId, slot.startISO, slot.endISO, bookingId)
        ) {
          setConflictError(
            `Khung giờ ${slot.start} - ${slot.end} đã được đặt${
              tempCourtId ? " trên sân mới" : ""
            }`
          );
          return;
        }
      }
      const newSlots: TimeSlotEdit[] = tempSelectedSlots.map((s) => ({
        start_time: s.startISO!,
        end_time: s.endISO!,
      }));

      // Update court if changed
      if (tempCourtId && tempCourtId !== courtId) {
        setCourtId(tempCourtId);
      }
      setSlots(newSlots);
      onChange(targetCourtId, newSlots);
      handleCancel();
    }
  };

  // Validate slots when they change
  React.useEffect(() => {
    if (mode === "view") {
      let hasError = false;
      for (const slot of slots) {
        if (hasConflict(courtId, slot.start_time, slot.end_time, bookingId)) {
          setConflictError(
            `Khung giờ ${formatTime(slot.start_time)} - ${formatTime(
              slot.end_time
            )} có thể đã được đặt`
          );
          hasError = true;
          break;
        }
      }
      if (!hasError) {
        setConflictError(null);
      }
    }
  }, [slots, courtId, bookingId, mode]);

  // Slot Button Component
  const SlotButton = ({ slot }: { slot: TimeSlot }) => {
    const isSelected = isSlotSelected(slot);
    return (
      <Button
        variant="outline"
        className={cn(
          "h-auto py-3 px-4 flex flex-col items-center justify-center gap-1 transition-all duration-200",
          getSlotClassName(slot)
        )}
        onClick={() => handleSlotSelect(slot)}
        disabled={slot.status === "past" || slot.status === "booked"}
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
  };

  return (
    <div className="space-y-6">
      {/* Court Info Display */}
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
            <p className="font-semibold">
              {currentCourt?.name || `Sân ${courtId}`}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Giá</p>
            <p className="font-semibold">
              {currentCourt?.base_hourly_price.toLocaleString() || 0} VNĐ/giờ
            </p>
          </div>
        </div>
      </Card>

      {/* Conflict Warning */}
      {conflictError && mode === "view" && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{conflictError}</AlertDescription>
        </Alert>
      )}

      {/* View Mode: Display current slots */}
      {mode === "view" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold">Khung giờ hiện tại</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTime}
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm giờ
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleChangeCourt}
              >
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
                            {formatTime(slot.start_time)} -{" "}
                            {formatTime(slot.end_time)}
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
      )}

      {/* Edit Modes: Time Slot Grid */}
      {(mode === "addTime" || mode === "changeCourt") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {mode === "addTime" && "Thêm khung giờ"}
                {mode === "changeCourt" && "Đổi sân / khung giờ"}
              </h3>
              {mode === "changeCourt" && (
                <p className="text-sm text-muted-foreground mt-1">
                  Có thể chọn sân mới (hoặc giữ nguyên sân hiện tại) và chọn các
                  khung giờ trống. Tất cả khung giờ sẽ được thay thế.
                </p>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
          </div>

          {/* Court Selector for changeCourt mode */}
          {mode === "changeCourt" && (
            <div className="space-y-2">
              <Label>Chọn sân (tùy chọn)</Label>
              <Select
                value={tempCourtId?.toString() || courtId.toString()}
                onValueChange={(value) => {
                  const newCourtId = parseInt(value);
                  // If selecting current court, set to null (meaning keep current court)
                  if (newCourtId === courtId) {
                    setTempCourtId(null);
                  } else {
                    setTempCourtId(newCourtId);
                  }
                  // Clear selected slots when changing court
                  setTempSelectedSlots([]);
                  // Update selected date to first slot date or today
                  setSelectedDate(
                    slots[0] ? new Date(slots[0].start_time) : new Date()
                  );
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn sân" />
                </SelectTrigger>
                <SelectContent>
                  {availableCourts.map((court) => (
                    <SelectItem key={court.id} value={court.id.toString()}>
                      {court.name || `Sân ${court.id}`} -{" "}
                      {court.base_hourly_price.toLocaleString()} VNĐ/giờ
                      {court.id === courtId && " (Sân hiện tại)"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {tempCourtId && tempCourtId !== courtId
                  ? "Đã chọn sân mới. Vui lòng chọn các khung giờ trống cho sân mới."
                  : "Có thể giữ nguyên sân hiện tại hoặc chọn sân mới. Chọn các khung giờ mới để thay thế tất cả khung giờ hiện tại."}
              </p>
            </div>
          )}

          {/* Date Selector */}
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
                  onSelect={(date) => {
                    if (date) {
                      setSelectedDate(date);
                      // Keep selected slots from other dates, clear slots for this date
                      // User can select new slots for the new date
                      const slotsFromOtherDates = tempSelectedSlots.filter(
                        (s) => {
                          if (!s.startISO) return false;
                          const slotDate = new Date(s.startISO);
                          return (
                            slotDate.getFullYear() !== date.getFullYear() ||
                            slotDate.getMonth() !== date.getMonth() ||
                            slotDate.getDate() !== date.getDate()
                          );
                        }
                      );
                      setTempSelectedSlots(slotsFromOtherDates);
                    }
                  }}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time Slot Grid */}
          {timeSlots.length > 0 ? (
            <Card className="p-6">
              <div className="space-y-4">
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {timeSlots.map((slot, index) => (
                    <SlotButton key={index} slot={slot} />
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6">
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">Không có khung giờ nào</p>
              </div>
            </Card>
          )}

          {/* Selected Slots Summary */}
          {tempSelectedSlots.length > 0 && (
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-green-900">
                    Đã chọn {tempSelectedSlots.length} khung giờ
                  </p>
                  <Button onClick={handleConfirm} size="sm">
                    Xác nhận
                  </Button>
                </div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {tempSelectedSlots.map((s, idx) => {
                    const slotDate = s.startISO ? new Date(s.startISO) : null;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs text-green-700"
                      >
                        <span>
                          {slotDate
                            ? format(slotDate, "dd/MM/yyyy", { locale: vi })
                            : ""}{" "}
                          {s.start} - {s.end}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-5 w-5"
                          onClick={() => {
                            setTempSelectedSlots(
                              tempSelectedSlots.filter(
                                (slot) =>
                                  !(
                                    slot.startISO === s.startISO &&
                                    slot.endISO === s.endISO
                                  )
                              )
                            );
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}

          {conflictError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{conflictError}</AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}
