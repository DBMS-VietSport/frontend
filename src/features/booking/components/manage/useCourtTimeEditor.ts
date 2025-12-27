"use client";

import * as React from "react";
import {
  mockCourts,
  mockCourtTypes,
  mockBranches,
  hasConflict,
} from "@/features/booking/mock/mockRepo";
import type { BookingSlot } from "@/types";
import { formatTime } from "@/features/booking/utils/pricing";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface TimeSlotEdit {
  id?: number;
  start_time: string;
  end_time: string;
}

export interface TimeSlot {
  start: string;
  end: string;
  status: "available" | "booked" | "pending" | "past";
  startISO?: string;
  endISO?: string;
}

export type EditorMode = "view" | "addTime" | "changeCourt";

export interface UseCourtTimeEditorProps {
  bookingId: number;
  initialCourtId: number;
  initialSlots: BookingSlot[];
  onChange: (courtId: number, slots: TimeSlotEdit[]) => void;
}

// -----------------------------------------------------------------------------
// Custom Hook: useCourtTimeEditor
// -----------------------------------------------------------------------------

export function useCourtTimeEditor({
  bookingId,
  initialCourtId,
  initialSlots,
  onChange,
}: UseCourtTimeEditorProps) {
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
  const [tempSelectedSlots, setTempSelectedSlots] = React.useState<TimeSlot[]>([]);
  const [tempCourtId, setTempCourtId] = React.useState<number | null>(null);
  const [conflictError, setConflictError] = React.useState<string | null>(null);

  // Derived data
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

  // Generate time slots for grid display
  const generateTimeSlots = React.useCallback(
    (
      court: typeof mockCourts[0],
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

      const currentSlotsForDate =
        currentSlots?.filter((s) => {
          const slotDate = new Date(s.start_time);
          return (
            slotDate.getFullYear() === date.getFullYear() &&
            slotDate.getMonth() === date.getMonth() &&
            slotDate.getDate() === date.getDate() &&
            court.id === courtId
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

        const isCurrentSlot = currentSlotsForDate.some((s) => {
          const sStart = new Date(s.start_time);
          const sEnd = new Date(s.end_time);
          return (
            Math.abs(sStart.getTime() - slotDate.getTime()) < 60000 &&
            Math.abs(sEnd.getTime() - slotEndDate.getTime()) < 60000
          );
        });

        let status: TimeSlot["status"] = "available";
        if (slotDate < now) {
          status = "past";
        } else if (
          !isCurrentSlot &&
          hasConflict(court.id, startISO, endISO, excludeBookingId)
        ) {
          status = "booked";
        }

        timeSlots.push({
          start: `${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}`,
          end: `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`,
          status,
          startISO,
          endISO,
        });

        currentTime += slotDuration;
      }

      return timeSlots;
    },
    [courtType, courtId]
  );

  // Get time slots for current mode
  const timeSlots = React.useMemo(() => {
    if (mode === "view") return [];
    const targetCourt =
      mode === "changeCourt" && tempCourtId
        ? mockCourts.find((c) => c.id === tempCourtId)
        : currentCourt;
    if (!targetCourt) return [];
    const currentSlotsToPass = mode === "addTime" ? slots : [];
    return generateTimeSlots(
      targetCourt,
      selectedDate,
      bookingId,
      currentSlotsToPass
    );
  }, [mode, currentCourt, tempCourtId, selectedDate, generateTimeSlots, slots, bookingId]);

  // Slot selection helpers
  const isSlotSelected = React.useCallback((slot: TimeSlot) => {
    return tempSelectedSlots.some(
      (s) => s.startISO === slot.startISO && s.endISO === slot.endISO
    );
  }, [tempSelectedSlots]);

  // Handle slot selection
  const handleSlotSelect = React.useCallback((slot: TimeSlot) => {
    if (slot.status !== "available" || !slot.startISO || !slot.endISO) return;

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
  }, [tempSelectedSlots]);

  // Mode handlers
  const handleAddTime = React.useCallback(() => {
    setMode("addTime");
    setTempSelectedSlots([]);
    setSelectedDate(slots[0] ? new Date(slots[0].start_time) : new Date());
  }, [slots]);

  const handleChangeCourt = React.useCallback(() => {
    setMode("changeCourt");
    setTempCourtId(null);
    const firstDate = slots[0] ? new Date(slots[0].start_time) : new Date();
    setSelectedDate(firstDate);
    setTempSelectedSlots([]);
  }, [slots]);

  const handleCancel = React.useCallback(() => {
    setMode("view");
    setTempSelectedSlots([]);
    setTempCourtId(null);
    setConflictError(null);
  }, []);

  const handleConfirm = React.useCallback(() => {
    setConflictError(null);

    if (mode === "addTime") {
      if (tempSelectedSlots.length === 0) {
        setConflictError("Vui lòng chọn ít nhất một khung giờ");
        return;
      }
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
      const updatedSlots = [...slots, ...newSlots];
      setSlots(updatedSlots);
      onChange(courtId, updatedSlots);
      handleCancel();
    } else if (mode === "changeCourt") {
      const targetCourtId = tempCourtId || courtId;

      if (tempSelectedSlots.length === 0) {
        setConflictError("Vui lòng chọn ít nhất một khung giờ");
        return;
      }
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

      if (tempCourtId && tempCourtId !== courtId) {
        setCourtId(tempCourtId);
      }
      setSlots(newSlots);
      onChange(targetCourtId, newSlots);
      handleCancel();
    }
  }, [mode, tempSelectedSlots, courtId, tempCourtId, bookingId, slots, onChange, handleCancel]);

  const handleDateSelect = React.useCallback((date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      const slotsFromOtherDates = tempSelectedSlots.filter((s) => {
        if (!s.startISO) return false;
        const slotDate = new Date(s.startISO);
        return (
          slotDate.getFullYear() !== date.getFullYear() ||
          slotDate.getMonth() !== date.getMonth() ||
          slotDate.getDate() !== date.getDate()
        );
      });
      setTempSelectedSlots(slotsFromOtherDates);
    }
  }, [tempSelectedSlots]);

  const handleCourtChange = React.useCallback((value: string) => {
    const newCourtId = parseInt(value);
    if (newCourtId === courtId) {
      setTempCourtId(null);
    } else {
      setTempCourtId(newCourtId);
    }
    setTempSelectedSlots([]);
    setSelectedDate(slots[0] ? new Date(slots[0].start_time) : new Date());
  }, [courtId, slots]);

  const removeSelectedSlot = React.useCallback((slot: TimeSlot) => {
    setTempSelectedSlots(
      tempSelectedSlots.filter(
        (s) => !(s.startISO === slot.startISO && s.endISO === slot.endISO)
      )
    );
  }, [tempSelectedSlots]);

  // Validate slots in view mode
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

  return {
    // State
    courtId,
    slots,
    mode,
    selectedDate,
    tempSelectedSlots,
    tempCourtId,
    conflictError,
    
    // Derived
    currentCourt,
    courtType,
    branch,
    availableCourts,
    timeSlots,
    
    // Helpers
    isSlotSelected,
    
    // Handlers
    handleSlotSelect,
    handleAddTime,
    handleChangeCourt,
    handleCancel,
    handleConfirm,
    handleDateSelect,
    handleCourtChange,
    removeSelectedSlot,
  };
}
