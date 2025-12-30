"use client";

import * as React from "react";
import { format } from "date-fns";
import {
  useCourts, // Renamed from useBranchCourts
  useCourtBookingSlots,
  useBranches,
  useCalculatePrice,
} from "@/lib/api/use-bookings";
import type { BookingSlot, TimeSlot } from "@/types";
import { formatTime } from "@/features/booking/utils/pricing";
import { generateRealTimeSlots } from "@/features/booking/utils/slot-utils";

// Internal interface for Court from API
interface CourtItem {
  id: number;
  name: string;
  branch_id: number;
  court_type_id: number;
  rent_duration: number; // Assuming SP returns this
  court_type_name: string;
  status: string;
  base_hourly_price: number;
}

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface TimeSlotEdit {
  id?: number;
  start_time: string;
  end_time: string;
}

export type EditorMode = "view" | "addTime" | "changeCourt";

export interface UseCourtTimeEditorProps {
  bookingId: number;
  initialCourtId: number;
  initialSlots: BookingSlot[];
  branchId: number;
  // Add initial court details to seed the display immediately
  initialCourt?: {
    id: number;
    name: string;
    branch?: { name: string };
    court_type?: { name: string };
    base_hourly_price?: number;
  };
  onChange: (courtId: number, slots: TimeSlotEdit[]) => void;
}

// -----------------------------------------------------------------------------
// Custom Hook: useCourtTimeEditor
// -----------------------------------------------------------------------------

const EMPTY_ARRAY: any[] = [];

export function useCourtTimeEditor({
  bookingId,
  initialCourtId,
  initialSlots,
  branchId,
  initialCourt,
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
  const [prices, setPrices] = React.useState<any[]>([]);

  // API Hooks
  const { mutate: calculatePrice } = useCalculatePrice();

  // Fetch branch details for open/close times
  // Use EMPTY_ARRAY fallback to ensure stable reference when undefined
  const { data: branches } = useBranches();
  const safeBranches = branches || EMPTY_ARRAY;

  const currentBranch = React.useMemo(() => {
    return safeBranches.find((b: any) => b.id === branchId) || { id: branchId, open_time: "06:00:00", close_time: "22:00:00" };
  }, [safeBranches, branchId]);

  // Fetch available courts
  const { data: rawCourts } = useCourts(branchId);
  const safeRawCourts = rawCourts || EMPTY_ARRAY;

  // Normalize court data to ensure base_hourly_price is available
  const availableCourts = React.useMemo(() => {
    return safeRawCourts.map((c: any) => ({
      ...c,
      rent_duration: c.rent_duration || c.rentDuration || 60,
      base_hourly_price: Number(c.base_hourly_price || c.baseHourlyPrice || 0),
      court_type_name: c.court_type_name || c.courtType?.name || '',
    })) as CourtItem[];
  }, [safeRawCourts]);

  // Derived data
  // Use initialCourt as fallback if courtId matches initial and not found in available list (e.g. loading)
  const currentCourt = React.useMemo(() => {
    const found = availableCourts.find((c) => c.id === courtId);
    if (found) return found;

    if (courtId === initialCourtId && initialCourt) {
      // Adapt initialCourt to CourtItem shape if needed, mostly for display
      return {
        id: initialCourt.id,
        name: initialCourt.name,
        branch_id: branchId,
        court_type_id: 0, // Placeholder
        rent_duration: 60, // Placeholder
        court_type_name: initialCourt.court_type?.name || '',
        status: 'Available',
        base_hourly_price: Number(initialCourt.base_hourly_price || 0) // Ensure numeric
      } as unknown as CourtItem;
    }
    return undefined;
  }, [availableCourts, courtId, initialCourtId, initialCourt, branchId]);

  // Derive display info
  const branch = React.useMemo(() => {
    // If we have initialCourt and it matches, use its branch info
    if (courtId === initialCourtId && initialCourt?.branch) {
      return initialCourt.branch;
    }
    return { name: currentBranch?.name || `Chi nhánh ${branchId}` };
  }, [courtId, initialCourtId, initialCourt, branchId, currentBranch]);

  const courtType = React.useMemo(() => {
    if (currentCourt?.court_type_name) return { name: currentCourt.court_type_name };
    if (courtId === initialCourtId && initialCourt?.court_type) return initialCourt.court_type;
    return { name: '-' };
  }, [currentCourt, courtId, initialCourtId, initialCourt]);


  // Fetch booked slots for the active court and date
  const targetCourtId = (mode === "changeCourt" && tempCourtId) ? tempCourtId : courtId;
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const { data: bookedSlots = [], isLoading: isLoadingBooked } = useCourtBookingSlots(targetCourtId, dateStr);

  // Check conflict helper - REFACTORED to use slot-utils logic equivalent or just rely on status
  // But we still need explicit conflict check for "tempSelectedSlots" against "bookedSlots"
  const hasConflict = React.useCallback((startISO: string, endISO: string, excludeBookingId?: number) => {
    // startISO/endISO are Local ISO strings (no Z)
    const start = new Date(startISO).getTime();
    const end = new Date(endISO).getTime();

    return bookedSlots.some((bs) => {
      // Check ID to exclude current booking's slots if needed ("current booking" slots are already in DB)
      if (bs.court_booking_id && bs.court_booking_id === excludeBookingId) return false;

      // Normalize backend slot times (which have Z) to Local ISO (remove Z)
      const bsStartStr = bs.start_time.endsWith('Z') ? bs.start_time.slice(0, -1) : bs.start_time;
      const bsEndStr = bs.end_time.endsWith('Z') ? bs.end_time.slice(0, -1) : bs.end_time;

      const bsStart = new Date(bsStartStr).getTime();
      const bsEnd = new Date(bsEndStr).getTime();

      return (start < bsEnd && end > bsStart);
    });
  }, [bookedSlots]);


  // Generate time slots for grid display
  // NOW USING generateRealTimeSlots from utils
  const generateTimeSlots = React.useCallback(
    (
      court: CourtItem,
      date: Date,
      excludeBookingId?: number,
      currentSlots?: TimeSlotEdit[]
    ): TimeSlot[] => {
      if (!court) return [];

      const openTime = currentBranch.open_time || "06:00:00";
      const closeTime = currentBranch.close_time || "22:00:00";
      const slotDuration = court.rent_duration || 60; // Use court duration

      // Use the util to generate slots based on branch hours and bookings
      const generated = generateRealTimeSlots({
        openTime,
        closeTime,
        slotDuration,
        selectedDate: date,
        bookedSlots: bookedSlots.filter(bs => bs.court_booking_id !== excludeBookingId) // Filter out current booking's slots from "booked" status so they appear available/editable?
        // actually if we are editing, current slots are passed in `currentSlots`.
        // generateRealTimeSlots will mark anything in `bookedSlots` as "booked".
        // We want our own booking's slots to be FREE so we can "re-select" or move them?
        // YES. So we exclude our own bookingId from the "booked" set passed to generator.
      });

      // Now we need to merge "currentSlots" (which are the ones actively in state)
      // `currentSlots` are TimeSlotEdit[] {id, start_time, end_time}
      // If a generated slot matches a currentSlot, it implies it is "selected" or "part of this booking"
      // But `generateRealTimeSlots` returns "available", "booked", "pending".
      // We will rely on `isSlotSelected` or manual mapping?
      // Actually `generateTimeSlots` is just returning the GRID.
      // The "Selected" state is handled by `isSlotSelected` in the UI which checks `tempSelectedSlots`.
      // BUT `slots` (the persisted ones) need to be visualized too?
      // In "addTime" mode, `slots` are just displayed in View Mode.
      // In Edit Mode, we are selecting NEW slots or changing.
      // If mode is "addTime", we want to see existing slots as... blocked? or selected?
      // Usually "addTime" implies adding MORE. Existing slots are already there.
      // Taking a cue from `generateTimeSlots` old code:
      /*
         const isCurrentSlot = currentSlotsForDate.some(...)
         if (!isCurrentSlot && hasConflict(...)) status = "booked"
      */
      // `generateRealTimeSlots` marks as booked if in `bookedSlots`.
      // Since we filtered out our own booking from `bookedSlots` passed to it, our slots will come back as "available".
      // This is good! It means we *could* select them.
      // But wait, if they are already in `slots`, they shouldn't be selectable again?
      // Or should they be shown as "Mine"?
      // For "addTime", we just want to select NEW available slots.
      // We should probably mark existing `slots` as "booked" (visualized as "Your Booking"?) or just blocked.
      // Let's stick to standard `generateRealTimeSlots` output.

      // Post-process for Past Time Logic & Price Merging
      const now = new Date();
      const slotsWithPriceAndStatus = generated.map(slot => {
        // Price Merging
        const priceData = prices.find(p => {
          // Robustly get HH:mm from p.start_time
          let pTime = "";
          if (typeof p.start_time === "string") {
            if (p.start_time.includes("T")) {
              pTime = p.start_time.split("T")[1].substring(0, 5);
            } else {
              pTime = p.start_time.substring(0, 5);
            }
          }
          return pTime === slot.start;
        });

        // Past Time Logic
        // startISO is Local ISO "YYYY-MM-DDTHH:mm:00.000"
        let status = slot.status;
        if (slot.startISO) {
          const slotStartTime = new Date(slot.startISO);
          // We need to be careful with Timezones.
          // `now` is browser local. `slotStartTime` is constructed from Local components.
          // So direct comparison is valid.
          if (slotStartTime < now && status === "available") { // Only mark available past slots as "past" (booked past slots remain "booked" usually, or maybe "past" is fine?)
            // Generally "past" implies unselectable.
            // If it was already booked, it stays booked status? Or becomes "past" (and disabled)?
            // `CourtTimeSlotGrid` uses logic: if (status === "available") ...
            // Let's use "past" status.
            status = "past";
          }
        }

        return {
          ...slot,
          status: status,
          price: priceData?.total_price || court.base_hourly_price, // Use fetched price or fallback
        };
      });

      return slotsWithPriceAndStatus;
    },
    [currentBranch, bookedSlots, prices]
  );

  // Calculate Prices Effect
  React.useEffect(() => {
    // Determine the court to fetch prices for
    const effectiveTargetCourt =
      mode === "changeCourt" && tempCourtId
        ? availableCourts.find((c) => c.id === tempCourtId)
        : currentCourt;

    // Deconstruct primitives for dependency array stability
    const courtIdForPrice = effectiveTargetCourt?.id;
    const rentDurationForPrice = effectiveTargetCourt?.rent_duration || 60;
    const openTimeForPrice = currentBranch.open_time || "06:00:00";
    const closeTimeForPrice = currentBranch.close_time || "22:00:00";
    const dateString = format(selectedDate, "yyyy-MM-dd");

    if (courtIdForPrice && selectedDate) {
      // Generate basic slots just for the API call (HH:mm)
      // Quick gen. `generateRealTimeSlots` is fine.
      // NOTE: generateRealTimeSlots relies on open/close time parsing potentially?
      // Just pass primitives.
      const basicSlots = generateRealTimeSlots({
        openTime: openTimeForPrice,
        closeTime: closeTimeForPrice,
        slotDuration: rentDurationForPrice,
        selectedDate: selectedDate,
        bookedSlots: [],
      }).map(s => ({
        start_time: s.start,
        end_time: s.end,
      }));

      calculatePrice({
        courtId: courtIdForPrice,
        date: dateString,
        slots: basicSlots,
      }, {
        onSuccess: (data) => {
          setPrices(data);
        }
      });
    }
  }, [
    mode,
    tempCourtId,
    // Dependencies that determine "effectiveTargetCourt"
    availableCourts, currentCourt,
    // Primitives derived inside (or used) should be deps?
    // Actually, we should depend on the variables we USE.
    // If we use `effectiveTargetCourt` inside, we depend on it.
    // But stable reference of `effectiveTargetCourt` is tricky.
    // Let's depend on its ID and reference `availableCourts`?
    // Actually, usually it's fine if `availableCourts` is stable.
    currentBranch.open_time,
    currentBranch.close_time,
    format(selectedDate, "yyyy-MM-dd"), // String is primitive
    calculatePrice // Stable function from useMutation
  ]);
  // Removing selectedDate (object) and ensuring only primitives or stable references are used.
  // Note: `availableCourts` and `currentBranch` are memoized above now with safe inputs.

  // Get time slots for current mode
  const timeSlots = React.useMemo(() => {
    if (mode === "view") return [];

    const effectiveTargetCourt =
      mode === "changeCourt" && tempCourtId
        ? availableCourts.find((c) => c.id === tempCourtId)
        : currentCourt;

    if (!effectiveTargetCourt) return [];

    return generateTimeSlots(
      effectiveTargetCourt,
      selectedDate,
      bookingId,
      slots
    );
  }, [mode, currentCourt, tempCourtId, selectedDate, generateTimeSlots, slots, bookingId, availableCourts]);

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
          slot.endISO &&
          hasConflict(slot.startISO, slot.endISO, bookingId)
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
          slot.endISO &&
          hasConflict(slot.startISO, slot.endISO, bookingId)
        ) {
          setConflictError(
            `Khung giờ ${slot.start} - ${slot.end} đã được đặt${tempCourtId ? " trên sân mới" : ""
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
        if (hasConflict(slot.start_time, slot.end_time, bookingId)) {
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
