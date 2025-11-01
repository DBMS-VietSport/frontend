// Mock data for development
import { City, Facility, CourtType, Staff, Court } from "./types";

export const mockCities: City[] = [
  { id: "1", name: "Hà Nội" },
  { id: "2", name: "Hồ Chí Minh" },
  { id: "3", name: "Đồng Tháp" },
  { id: "4", name: "Tây Ninh" },
];

export const mockFacilities: Facility[] = [
  { id: "1", name: "Hà Nội (Hồ Gươm)", cityId: "1" },
  { id: "1-2", name: "Hà Nội (Cầu Giấy)", cityId: "1" },
  { id: "1-3", name: "Hà Nội (Đống Đa)", cityId: "1" },
  { id: "2", name: "Hồ Chí Minh (Quận 1)", cityId: "2" },
  { id: "2-2", name: "Hồ Chí Minh (Thủ Đức)", cityId: "2" },
  { id: "2-3", name: "Hồ Chí Minh (Bình Thạnh)", cityId: "2" },
  { id: "3", name: "Đồng Tháp (Sa Đéc)", cityId: "3" },
  { id: "3-2", name: "Đồng Tháp (Cao Lãnh)", cityId: "3" },
  { id: "4", name: "Tây Ninh (Trung tâm)", cityId: "4" },
  { id: "4-2", name: "Tây Ninh (Gò Dầu)", cityId: "4" },
];

export const mockCourtTypes: CourtType[] = [
  { id: "badminton", name: "Sân cầu lông", slotDuration: 60 },
  { id: "tennis", name: "Sân tennis", slotDuration: 120 },
  { id: "football", name: "Sân bóng đá mini", slotDuration: 90 },
  { id: "basketball", name: "Sân bóng rổ", slotDuration: 60 },
];

export const mockCourts: Court[] = [
  {
    id: "1",
    name: "Sân 1",
    type: "badminton",
    facilityId: "1",
    imageUrl:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&h=300&fit=crop",
  },
  {
    id: "2",
    name: "Sân 2",
    type: "badminton",
    facilityId: "1",
    imageUrl:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&h=300&fit=crop",
  },
  {
    id: "3",
    name: "Sân 3",
    type: "badminton",
    facilityId: "1",
    imageUrl:
      "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=500&h=300&fit=crop",
  },
  {
    id: "4",
    name: "Sân Tennis 1",
    type: "tennis",
    facilityId: "1",
    imageUrl:
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500&h=300&fit=crop",
  },
  {
    id: "5",
    name: "Sân Tennis 2",
    type: "tennis",
    facilityId: "1",
    imageUrl:
      "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=500&h=300&fit=crop",
  },
  {
    id: "6",
    name: "Sân Bóng Đá 1",
    type: "football",
    facilityId: "1",
    imageUrl:
      "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=500&h=300&fit=crop",
  },
  {
    id: "7",
    name: "Sân Bóng Rổ 1",
    type: "basketball",
    facilityId: "1",
    imageUrl:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&h=300&fit=crop",
  },
];

// Generate time slots based on sport type
export function generateTimeSlots(
  courtType: CourtType,
  selectedDate: Date
): any[] {
  const slots = [];
  const slotDuration = courtType.slotDuration;
  const startHour = 6;
  const endHour = 22;
  const now = new Date();

  let currentTime = startHour * 60; // minutes from midnight
  const endTime = endHour * 60;

  while (currentTime < endTime) {
    const startH = Math.floor(currentTime / 60);
    const startM = currentTime % 60;
    const endMinutes = currentTime + slotDuration;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;

    const startStr = `${String(startH).padStart(2, "0")}:${String(
      startM
    ).padStart(2, "0")}`;
    const endStr = `${String(endH).padStart(2, "0")}:${String(endM).padStart(
      2,
      "0"
    )}`;

    // Check if slot is in the past
    const slotDate = new Date(selectedDate);
    slotDate.setHours(startH, startM, 0, 0);
    const isPast = slotDate < now;

    // Randomly assign status for demo
    let status: "available" | "booked" | "pending" | "past";
    if (isPast) {
      status = "past";
    } else {
      const random = Math.random();
      if (random < 0.6) {
        status = "available";
      } else if (random < 0.8) {
        status = "booked";
      } else {
        status = "pending";
      }
    }

    slots.push({
      start: startStr,
      end: endStr,
      status,
      bookedBy: status === "booked" ? "Nguyễn Văn X" : undefined,
      phone: status === "booked" ? "0912345678" : undefined,
    });

    currentTime += slotDuration;
  }

  return slots;
}
