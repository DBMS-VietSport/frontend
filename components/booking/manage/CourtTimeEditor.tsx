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
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { formatTime } from "@/lib/booking/pricing";

interface TimeSlotEdit {
  id?: number; // existing slot ID
  start_time: string;
  end_time: string;
}

interface CourtTimeEditorProps {
  bookingId: number;
  initialCourtId: number;
  initialSlots: BookingSlot[];
  onChange: (courtId: number, slots: TimeSlotEdit[]) => void;
}

export function CourtTimeEditor({
  bookingId,
  initialCourtId,
  initialSlots,
  onChange,
}: CourtTimeEditorProps) {
  const [selectedCourtId, setSelectedCourtId] = React.useState(initialCourtId);
  const [slots, setSlots] = React.useState<TimeSlotEdit[]>(
    initialSlots.map((s) => ({
      id: s.id,
      start_time: s.start_time,
      end_time: s.end_time,
    }))
  );
  const [conflictError, setConflictError] = React.useState<string | null>(null);

  const selectedCourt = mockCourts.find((c) => c.id === selectedCourtId);
  const courtType = selectedCourt
    ? mockCourtTypes.find((ct) => ct.id === selectedCourt.court_type_id)
    : null;
  const branch = selectedCourt
    ? mockBranches.find((b) => b.id === selectedCourt.branch_id)
    : null;

  // Get courts of the same type in the same branch
  const availableCourts = React.useMemo(() => {
    if (!selectedCourt) return [];
    return mockCourts.filter(
      (c) =>
        c.court_type_id === selectedCourt.court_type_id &&
        c.branch_id === selectedCourt.branch_id
    );
  }, [selectedCourt]);

  // Validate and notify parent of changes
  React.useEffect(() => {
    // Check for conflicts
    let hasError = false;
    for (const slot of slots) {
      if (
        hasConflict(selectedCourtId, slot.start_time, slot.end_time, bookingId)
      ) {
        setConflictError(
          `Khung giờ ${formatTime(slot.start_time)} - ${formatTime(
            slot.end_time
          )} đã được đặt`
        );
        hasError = true;
        break;
      }
    }

    if (!hasError) {
      setConflictError(null);
      onChange(selectedCourtId, slots);
    }
  }, [selectedCourtId, slots, bookingId]);

  const handleCourtChange = (courtId: string) => {
    setSelectedCourtId(parseInt(courtId));
  };

  const handleSlotChange = (
    index: number,
    field: "start_time" | "end_time",
    value: string
  ) => {
    const newSlots = [...slots];

    // Parse the time input and construct ISO string
    const baseDate = new Date(
      slots[index][field === "start_time" ? "start_time" : "end_time"]
    );
    const [hours, minutes] = value.split(":").map(Number);
    baseDate.setHours(hours, minutes, 0, 0);

    newSlots[index][field] = baseDate.toISOString();
    setSlots(newSlots);
  };

  const handleAddSlot = () => {
    // Add a new slot based on court type duration
    const lastSlot = slots[slots.length - 1];
    const duration = courtType?.rent_duration || 60;

    let newStart: Date;
    let newEnd: Date;

    if (lastSlot) {
      newStart = new Date(lastSlot.end_time);
      newEnd = new Date(newStart.getTime() + duration * 60000);
    } else {
      // Default to today at 8 AM
      newStart = new Date();
      newStart.setHours(8, 0, 0, 0);
      newEnd = new Date(newStart.getTime() + duration * 60000);
    }

    setSlots([
      ...slots,
      {
        start_time: newStart.toISOString(),
        end_time: newEnd.toISOString(),
      },
    ]);
  };

  const handleRemoveSlot = (index: number) => {
    if (slots.length === 1) return; // Must have at least one slot
    setSlots(slots.filter((_, i) => i !== index));
  };

  // Format ISO string to HH:mm for input
  const formatTimeForInput = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toTimeString().slice(0, 5);
  };

  // Format ISO string to YYYY-MM-DD for input
  const formatDateForInput = (isoString: string): string => {
    const date = new Date(isoString);
    return date.toISOString().split("T")[0];
  };

  const handleDateChange = (index: number, newDate: string) => {
    const newSlots = [...slots];
    const slot = newSlots[index];

    // Update both start and end time to the new date
    const startDate = new Date(slot.start_time);
    const endDate = new Date(slot.end_time);

    const [year, month, day] = newDate.split("-").map(Number);
    startDate.setFullYear(year, month - 1, day);
    endDate.setFullYear(year, month - 1, day);

    newSlots[index].start_time = startDate.toISOString();
    newSlots[index].end_time = endDate.toISOString();

    setSlots(newSlots);
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
        </div>
      </Card>

      {/* Court Selector */}
      <div className="space-y-2">
        <Label>Chọn sân</Label>
        <Select
          value={selectedCourtId.toString()}
          onValueChange={handleCourtChange}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableCourts.map((court) => (
              <SelectItem key={court.id} value={court.id.toString()}>
                {court.name || `Sân ${court.id}`} -{" "}
                {court.base_hourly_price.toLocaleString()} VNĐ/giờ
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Conflict Warning */}
      {conflictError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{conflictError}</AlertDescription>
        </Alert>
      )}

      {/* Time Slots Editor */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Khung giờ</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleAddSlot}
          >
            <Plus className="h-4 w-4 mr-2" />
            Thêm khung giờ
          </Button>
        </div>

        <div className="space-y-3">
          {slots.map((slot, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-end gap-3">
                <div className="flex-1 grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label className="text-xs">Ngày</Label>
                    <Input
                      type="date"
                      value={formatDateForInput(slot.start_time)}
                      onChange={(e) => handleDateChange(index, e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Giờ bắt đầu</Label>
                    <Input
                      type="time"
                      value={formatTimeForInput(slot.start_time)}
                      onChange={(e) =>
                        handleSlotChange(index, "start_time", e.target.value)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Giờ kết thúc</Label>
                    <Input
                      type="time"
                      value={formatTimeForInput(slot.end_time)}
                      onChange={(e) =>
                        handleSlotChange(index, "end_time", e.target.value)
                      }
                    />
                  </div>
                </div>
                {slots.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveSlot(index)}
                    className="shrink-0"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
