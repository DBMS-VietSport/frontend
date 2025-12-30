import { format, addMinutes, isPast, setHours, setMinutes } from "date-fns";
import type { TimeSlotStatus, TimeSlot } from "@/types";

export interface GenerateSlotsOptions {
    openTime: string; // "HH:mm:ss" or "HH:mm"
    closeTime: string; // "HH:mm:ss" or "HH:mm"
    slotDuration: number; // in minutes
    selectedDate: Date;
    bookedSlots: any[]; // Raw data from sp_receptionist_get_booking_slots_of_court
}

export function generateRealTimeSlots({
    openTime,
    closeTime,
    slotDuration,
    selectedDate,
    bookedSlots = [],
}: GenerateSlotsOptions): TimeSlot[] {
    const slots: TimeSlot[] = [];

    const parseTime = (time: any, label: string) => {
        console.log(`Parsing ${label}:`, time, typeof time);
        if (!time) return [6, 0];
        if (time instanceof Date) {
            console.log(`Parsed Date ${label} as:`, [time.getHours(), time.getMinutes()]);
            return [time.getHours(), time.getMinutes()];
        }
        if (typeof time === "string") {
            // Handle ISO string like 1970-01-01T06:00:00.000Z or HH:mm:ss
            if (time.includes("T")) {
                const timePart = time.split("T")[1];
                const parts = timePart.split(":").map(Number);
                console.log(`Parsed literal ISO ${label} as:`, parts.slice(0, 2));
                return [parts[0], parts[1]];
            }
            const parts = time.split(":").map(Number);
            console.log(`Parsed string ${label} as:`, parts);
            return parts;
        }
        return [6, 0]; // Default
    };

    const [openH, openM] = parseTime(openTime, "openTime");
    const [closeH, closeM] = parseTime(closeTime, "closeTime");

    let current = setMinutes(setHours(new Date(selectedDate), openH), openM);
    const end = setMinutes(setHours(new Date(selectedDate), closeH), closeM);

    console.log("Slot Generation Range:", {
        current: format(current, "yyyy-MM-dd HH:mm:ss"),
        end: format(end, "yyyy-MM-dd HH:mm:ss"),
        duration: slotDuration
    });

    const now = new Date();

    while (current < end) {
        const slotStart = new Date(current);
        const slotEnd = addMinutes(slotStart, slotDuration);

        if (slotEnd > end) {
            console.log("Slot end exceeds branch closing time:", format(slotEnd, "HH:mm"), ">", format(end, "HH:mm"));
            break;
        }

        const startStr = format(slotStart, "HH:mm");
        const endStr = format(slotEnd, "HH:mm");

        // Check if slot is in the past
        // const isSlotPast = isPast(slotStart) && format(slotStart, "yyyy-MM-dd") === format(now, "yyyy-MM-dd");
        // Also check if the date is in the past
        // const isDatePast = selectedDate < new Date(now.setHours(0, 0, 0, 0));

        let status: TimeSlotStatus = "available"; // (isSlotPast || isDatePast) ? "past" : "available";
        let bookedBy: string | undefined;
        let phone: string | undefined;

        // Check if slot overlaps with any booked slot
        const overlappingBooking = bookedSlots.find(bs => {
            // Extract HH:mm from booked slots as well to be timezone-safe
            const parseISO = (isoStr: string) => {
                const timePart = isoStr.includes("T") ? isoStr.split("T")[1] : isoStr;
                const [h, m] = timePart.split(":").map(Number);
                return [h, m];
            };

            const [bStartH, bStartM] = parseISO(bs.start_time);
            const [bEndH, bEndM] = parseISO(bs.end_time);

            const bStart = setMinutes(setHours(new Date(selectedDate), bStartH), bStartM);
            const bEnd = setMinutes(setHours(new Date(selectedDate), bEndH), bEndM);

            // Overlap logic: (StartA < EndB) and (EndA > StartB)
            return slotStart < bEnd && slotEnd > bStart;
        });

        if (overlappingBooking) {
            // DB returns status like "Đã đặt", "Đã hủy", "Đang giữ chỗ"
            // Map to internal English status
            if (overlappingBooking.status === "Đang giữ chỗ") status = "pending";
            else status = "booked";

            bookedBy = overlappingBooking.customer_name;
            phone = overlappingBooking.customer_phone_number;
        }

        // MANUALLY construct ISO string using LOCAL time
        const pad = (n: number) => n.toString().padStart(2, '0');
        const formatLocalISO = (d: Date) => {
            return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00.000`;
        };

        slots.push({
            start: startStr,
            end: endStr,
            status,
            bookedBy,
            phone,
            startISO: formatLocalISO(slotStart),
            endISO: formatLocalISO(slotEnd),
        });

        current = slotEnd;
    }

    return slots;
}
