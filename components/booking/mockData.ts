// Mock data for development
import {
  City,
  Facility,
  CourtType,
  Staff,
  Court,
  ServiceItem,
  Coach,
} from "./types";

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

// Mock service data
export const mockServiceItems: ServiceItem[] = [
  // Equipment
  {
    id: "eq-1",
    name: "Vợt cầu lông",
    category: "equipment",
    price: 10000,
    unit: "turn",
    quantity: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1566876046715-4abc871a9e18?w=200&h=150&fit=crop",
  },
  {
    id: "eq-2",
    name: "Vợt tennis",
    category: "equipment",
    price: 10000,
    unit: "hour",
    quantity: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=200&h=150&fit=crop",
  },
  {
    id: "eq-3",
    name: "Bóng đá",
    category: "equipment",
    price: 0,
    unit: "free",
    quantity: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=200&h=150&fit=crop",
  },
  {
    id: "eq-4",
    name: "Bóng rổ",
    category: "equipment",
    price: 0,
    unit: "free",
    quantity: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=200&h=150&fit=crop",
  },
  // Facilities
  {
    id: "fac-1",
    name: "Tủ đồ",
    category: "facility",
    price: 10000,
    unit: "turn",
    quantity: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1618641662184-bafefb91a542?w=200&h=150&fit=crop",
  },
  {
    id: "fac-2",
    name: "Nhà tắm",
    category: "facility",
    price: 10000,
    unit: "turn",
    quantity: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=200&h=150&fit=crop",
  },
  // Drinks
  {
    id: "dr-1",
    name: "7 UP",
    category: "drink",
    price: 10000,
    unit: "turn",
    quantity: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=200&h=150&fit=crop",
  },
  {
    id: "dr-2",
    name: "Aquafina",
    category: "drink",
    price: 10000,
    unit: "turn",
    quantity: 0,
    imageUrl:
      "https://images.unsplash.com/photo-1580375608366-882e72b7b654?w=200&h=150&fit=crop",
  },
];

export const mockCoaches: Coach[] = [
  {
    id: "coach-1",
    name: "Hà Anh",
    sport: "Cầu lông",
    pricePerHour: 100000,
    quantity: 0,
    avatarUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    degree: "Cử nhân Thể dục Thể thao",
    bio: "Hơn 10 năm kinh nghiệm giảng dạy cầu lông, từng đạt nhiều giải thưởng quốc gia.",
    studentsTrained: 150,
    expertise: [
      "Kỹ thuật cơ bản",
      "Chiến thuật đánh đôi",
      "Phát triển thể lực",
    ],
  },
  {
    id: "coach-2",
    name: "Quân Ngọc",
    sport: "Cầu lông",
    pricePerHour: 200000,
    quantity: 0,
    avatarUrl:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
    degree: "Thạc sĩ Thể dục Thể thao",
    bio: "Vận động viên cấp 1, huấn luyện viên đội tuyển cầu lông trẻ.",
    studentsTrained: 80,
    expertise: [
      "Đào tạo chuyên nghiệp",
      "Kỹ thuật nâng cao",
      "Thi đấu cấp cao",
    ],
  },
  {
    id: "coach-3",
    name: "Minh Tuấn",
    sport: "Tennis",
    pricePerHour: 150000,
    quantity: 0,
    avatarUrl:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
    degree: "Cử nhân Thể dục Thể thao",
    bio: "Huấn luyện viên tennis chuyên nghiệp, kinh nghiệm 8 năm.",
    studentsTrained: 120,
    expertise: [
      "Kỹ thuật forehand/backhand",
      "Chiến thuật giao bóng",
      "Thể lực",
    ],
  },
  {
    id: "coach-4",
    name: "Hoàng Long",
    sport: "Bóng đá",
    pricePerHour: 120000,
    quantity: 0,
    avatarUrl:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop",
    degree: "Huấn luyện viên FIFA C",
    bio: "Cựu cầu thủ chuyên nghiệp, chuyển sang huấn luyện 5 năm nay.",
    studentsTrained: 200,
    expertise: [
      "Kỹ thuật cá nhân",
      "Chiến thuật đồng đội",
      "Rèn luyện thể lực",
    ],
  },
  {
    id: "coach-5",
    name: "Thảo Vy",
    sport: "Bóng rổ",
    pricePerHour: 110000,
    quantity: 0,
    avatarUrl:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    degree: "Cử nhân Thể dục Thể thao",
    bio: "Huấn luyện viên bóng rổ nữ, từng chơi cho đội tuyển thành phố.",
    studentsTrained: 90,
    expertise: [
      "Kỹ thuật ném bóng",
      "Di chuyển không bóng",
      "Chiến thuật phòng thủ",
    ],
  },
];
