// =============================================================================
// Customer Flow Mock Data
// =============================================================================
// Mock data for customer-facing booking flow.
// Uses string IDs for frontend-only entities.
// Moved from components/booking/mockData.ts for centralized mock data management.
// =============================================================================

import type {
  City,
  Facility,
  CustomerCourtType,
  Staff,
  CustomerCourt,
  ServiceItem,
  Coach,
  TimeSlotStatus,
} from "@/lib/types";

// -----------------------------------------------------------------------------
// Location Data
// -----------------------------------------------------------------------------

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

// -----------------------------------------------------------------------------
// Court Data
// -----------------------------------------------------------------------------

export const mockCustomerCourtTypes: CustomerCourtType[] = [
  { id: "badminton", name: "Sân cầu lông", slotDuration: 60 },
  { id: "tennis", name: "Sân tennis", slotDuration: 120 },
  { id: "football", name: "Sân bóng đá mini", slotDuration: 90 },
  { id: "basketball", name: "Sân bóng rổ", slotDuration: 60 },
];

export const mockCustomerCourts: CustomerCourt[] = [
  { id: "1", name: "Sân 1", type: "badminton", facilityId: "1", imageUrl: "/badminton-court.jpg" },
  { id: "2", name: "Sân 2", type: "badminton", facilityId: "1", imageUrl: "/badminton-court.jpg" },
  { id: "3", name: "Sân 3", type: "badminton", facilityId: "1", imageUrl: "/badminton-court.jpg" },
  { id: "4", name: "Sân Tennis 1", type: "tennis", facilityId: "1", imageUrl: "/tennis-court.jpg" },
  { id: "5", name: "Sân Tennis 2", type: "tennis", facilityId: "1", imageUrl: "/tennis-court.jpg" },
  { id: "6", name: "Sân Bóng Đá 1", type: "football", facilityId: "1", imageUrl: "/soccer-sourt.jpg" },
  { id: "7", name: "Sân Bóng Rổ 1", type: "basketball", facilityId: "1", imageUrl: "/basketball-court.jpg" },
];

// -----------------------------------------------------------------------------
// Time Slot Generator
// -----------------------------------------------------------------------------

interface TimeSlotData {
  start: string;
  end: string;
  status: TimeSlotStatus;
  bookedBy?: string;
  phone?: string;
  email?: string;
}

export function generateTimeSlots(
  courtType: CustomerCourtType,
  selectedDate: Date
): TimeSlotData[] {
  const slots: TimeSlotData[] = [];
  const slotDuration = courtType.slotDuration;
  const startHour = 6;
  const endHour = 22;
  const now = new Date();

  let currentTime = startHour * 60;
  const endTime = endHour * 60;

  while (currentTime < endTime) {
    const startH = Math.floor(currentTime / 60);
    const startM = currentTime % 60;
    const endMinutes = currentTime + slotDuration;
    const endH = Math.floor(endMinutes / 60);
    const endM = endMinutes % 60;

    const startStr = `${String(startH).padStart(2, "0")}:${String(startM).padStart(2, "0")}`;
    const endStr = `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;

    const slotDate = new Date(selectedDate);
    slotDate.setHours(startH, startM, 0, 0);
    const isPast = slotDate < now;

    let status: TimeSlotStatus;
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
      bookedBy: status === "booked" || status === "pending" ? "Nguyễn Văn X" : undefined,
      phone: status === "booked" || status === "pending" ? "0912345678" : undefined,
      email: status === "booked" || status === "pending" ? "nguyenvanx@example.com" : undefined,
    });

    currentTime += slotDuration;
  }

  return slots;
}

// -----------------------------------------------------------------------------
// Service Items
// -----------------------------------------------------------------------------

export const mockServiceItems: ServiceItem[] = [
  // Equipment
  { id: "eq-1", name: "Vợt cầu lông", category: "equipment", price: 10000, unit: "turn", quantity: 0, imageUrl: "/badminton-racket.jpg" },
  { id: "eq-2", name: "Vợt tennis", category: "equipment", price: 10000, unit: "hour", quantity: 0, imageUrl: "/tennis-racket.jpg" },
  { id: "eq-3", name: "Bóng đá", category: "equipment", price: 0, unit: "free", quantity: 0, imageUrl: "/soccer-ball.jpg" },
  { id: "eq-4", name: "Bóng rổ", category: "equipment", price: 0, unit: "free", quantity: 0, imageUrl: "/basket-ball.jpg" },
  // Facilities
  { id: "fac-1", name: "Tủ đồ", category: "facility", price: 10000, unit: "turn", quantity: 0, imageUrl: "/locker.jpg" },
  { id: "fac-2", name: "Nhà tắm", category: "facility", price: 10000, unit: "turn", quantity: 0, imageUrl: "/bathroom.jpg" },
  // Drinks
  { id: "dr-1", name: "7 UP", category: "drink", price: 10000, unit: "turn", quantity: 0, imageUrl: "/revive.jpg" },
  { id: "dr-2", name: "Aquafina", category: "drink", price: 10000, unit: "turn", quantity: 0, imageUrl: "/aquafina.jpg" },
  { id: "dr-3", name: "Coca Cola", category: "drink", price: 10000, unit: "turn", quantity: 0, imageUrl: "/coca.jpg" },
  { id: "dr-4", name: "Pepsi", category: "drink", price: 10000, unit: "turn", quantity: 0, imageUrl: "/pepsi.jpg" },
];

// -----------------------------------------------------------------------------
// Coaches
// -----------------------------------------------------------------------------

export const mockCoaches: Coach[] = [
  { id: "coach-1", name: "Hà Anh", sport: "Cầu lông", pricePerHour: 100000, quantity: 0, avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop", degree: "Cử nhân Thể dục Thể thao", bio: "Hơn 10 năm kinh nghiệm giảng dạy cầu lông, từng đạt nhiều giải thưởng quốc gia.", studentsTrained: 150, expertise: ["Kỹ thuật cơ bản", "Chiến thuật đánh đôi", "Phát triển thể lực"] },
  { id: "coach-2", name: "Quân Ngọc", sport: "Cầu lông", pricePerHour: 200000, quantity: 0, avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop", degree: "Thạc sĩ Thể dục Thể thao", bio: "Vận động viên cấp 1, huấn luyện viên đội tuyển cầu lông trẻ.", studentsTrained: 80, expertise: ["Đào tạo chuyên nghiệp", "Kỹ thuật nâng cao", "Thi đấu cấp cao"] },
  { id: "coach-2-1", name: "Thanh Hà", sport: "Cầu lông", pricePerHour: 130000, quantity: 0, avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop", degree: "Cử nhân Thể dục Thể thao", bio: "Huấn luyện viên cầu lông với 6 năm kinh nghiệm, chuyên đào tạo trẻ em.", studentsTrained: 95, expertise: ["Đào tạo cơ bản", "Phát triển kỹ năng trẻ em", "Tư vấn dinh dưỡng thể thao"] },
  { id: "coach-2-2", name: "Đức Minh", sport: "Cầu lông", pricePerHour: 160000, quantity: 0, avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop", degree: "Cử nhân Thể dục Thể thao", bio: "Cựu vận động viên cầu lông, từng thi đấu giải quốc gia.", studentsTrained: 110, expertise: ["Kỹ thuật đánh đơn", "Chiến thuật thi đấu", "Tâm lý thể thao"] },
  { id: "coach-2-3", name: "Linh Chi", sport: "Cầu lông", pricePerHour: 140000, quantity: 0, avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop", degree: "Thạc sĩ Thể dục Thể thao", bio: "Huấn luyện viên nữ chuyên nghiệp.", studentsTrained: 125, expertise: ["Đào tạo nữ giới", "Kỹ thuật di chuyển", "Phòng tránh chấn thương"] },
  { id: "coach-3", name: "Minh Tuấn", sport: "Tennis", pricePerHour: 150000, quantity: 0, avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop", degree: "Cử nhân Thể dục Thể thao", bio: "Huấn luyện viên tennis chuyên nghiệp, kinh nghiệm 8 năm.", studentsTrained: 120, expertise: ["Kỹ thuật forehand/backhand", "Chiến thuật giao bóng", "Thể lực"] },
  { id: "coach-3-1", name: "Văn Đức", sport: "Tennis", pricePerHour: 180000, quantity: 0, avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop", degree: "Thạc sĩ Thể dục Thể thao", bio: "Huấn luyện viên tennis với 12 năm kinh nghiệm.", studentsTrained: 180, expertise: ["Kỹ thuật nâng cao", "Chiến thuật đánh đôi", "Tâm lý thi đấu"] },
  { id: "coach-3-2", name: "Hương Lan", sport: "Tennis", pricePerHour: 135000, quantity: 0, avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop", degree: "Cử nhân Thể dục Thể thao", bio: "Huấn luyện viên tennis nữ.", studentsTrained: 100, expertise: ["Đào tạo cơ bản", "Kỹ thuật volley", "Phát triển thể chất"] },
  { id: "coach-3-3", name: "Quốc Trung", sport: "Tennis", pricePerHour: 165000, quantity: 0, avatarUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop", degree: "Cử nhân Thể dục Thể thao", bio: "Huấn luyện viên tennis nhiệt tình.", studentsTrained: 145, expertise: ["Kỹ thuật serve", "Chiến thuật phòng thủ", "Rèn luyện sức bền"] },
  { id: "coach-4", name: "Hoàng Long", sport: "Bóng đá", pricePerHour: 120000, quantity: 0, avatarUrl: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop", degree: "Huấn luyện viên FIFA C", bio: "Cựu cầu thủ chuyên nghiệp.", studentsTrained: 200, expertise: ["Kỹ thuật cá nhân", "Chiến thuật đồng đội", "Rèn luyện thể lực"] },
  { id: "coach-4-1", name: "Văn Toàn", sport: "Bóng đá", pricePerHour: 110000, quantity: 0, avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop", degree: "Cử nhân Thể dục Thể thao", bio: "Huấn luyện viên bóng đá trẻ.", studentsTrained: 160, expertise: ["Kỹ thuật cơ bản", "Đào tạo trẻ em", "Phát triển tốc độ"] },
  { id: "coach-4-2", name: "Thị Mai", sport: "Bóng đá", pricePerHour: 115000, quantity: 0, avatarUrl: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop", degree: "Cử nhân Thể dục Thể thao", bio: "Huấn luyện viên bóng đá nữ.", studentsTrained: 85, expertise: ["Kỹ thuật sút bóng", "Chiến thuật tấn công", "Đào tạo nữ giới"] },
  { id: "coach-4-3", name: "Đình Hùng", sport: "Bóng đá", pricePerHour: 125000, quantity: 0, avatarUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&h=200&fit=crop", degree: "Huấn luyện viên FIFA B", bio: "15 năm kinh nghiệm huấn luyện.", studentsTrained: 250, expertise: ["Chiến thuật phòng thủ", "Kỹ thuật thủ môn", "Phân tích trận đấu"] },
  { id: "coach-5", name: "Thảo Vy", sport: "Bóng rổ", pricePerHour: 110000, quantity: 0, avatarUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop", degree: "Cử nhân Thể dục Thể thao", bio: "Huấn luyện viên bóng rổ nữ.", studentsTrained: 90, expertise: ["Kỹ thuật ném bóng", "Di chuyển không bóng", "Chiến thuật phòng thủ"] },
  { id: "coach-5-1", name: "Minh Đức", sport: "Bóng rổ", pricePerHour: 125000, quantity: 0, avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop", degree: "Cử nhân Thể dục Thể thao", bio: "9 năm kinh nghiệm huấn luyện.", studentsTrained: 140, expertise: ["Kỹ thuật dẫn bóng", "Ném xa 3 điểm", "Chiến thuật tấn công"] },
  { id: "coach-5-2", name: "Ngọc Anh", sport: "Bóng rổ", pricePerHour: 105000, quantity: 0, avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop", degree: "Cử nhân Thể dục Thể thao", bio: "Chuyên kỹ thuật cơ bản.", studentsTrained: 75, expertise: ["Kỹ thuật cơ bản", "Phát triển thể lực", "Đào tạo trẻ em"] },
  { id: "coach-5-3", name: "Quang Huy", sport: "Bóng rổ", pricePerHour: 130000, quantity: 0, avatarUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop", degree: "Thạc sĩ Thể dục Thể thao", bio: "Cựu vận động viên chuyên nghiệp.", studentsTrained: 165, expertise: ["Kỹ thuật nâng cao", "Chiến thuật đồng đội", "Phòng tránh chấn thương"] },
];
