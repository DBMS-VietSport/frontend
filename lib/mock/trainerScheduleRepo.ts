export type TrainerShift = {
  type: "shift";
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  branch: string;
  note: string;
};

export type TrainerBooking = {
  type: "booking";
  date: string; // YYYY-MM-DD
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  customer_name: string;
  service_name: string;
  branch: string;
  court_name: string;
  status: "Booked" | "Cancelled";
};

export type TrainerSlot = TrainerShift | TrainerBooking;

const FIXED_SHIFTS: (TrainerShift & { username: string })[] = [
  {
    username: "trainer.hcm",
    type: "shift",
    date: "2025-11-05",
    start_time: "07:00",
    end_time: "15:00",
    branch: "VietSport TP.HCM",
    note: "Ca trực bảo trì / hỗ trợ HLV",
  },
  {
    username: "trainer.hcm",
    type: "shift",
    date: "2025-11-07",
    start_time: "14:00",
    end_time: "22:00",
    branch: "VietSport TP.HCM",
    note: "Ca chiều",
  },
];

const BOOKED_SESSIONS: (TrainerBooking & { username: string })[] = [
  {
    username: "trainer.hcm",
    type: "booking",
    date: "2025-11-05",
    start_time: "16:00",
    end_time: "17:00",
    customer_name: "Khách hàng Platinum",
    service_name: "Huấn luyện viên Cầu lông",
    branch: "VietSport TP.HCM",
    court_name: "Sân Cầu Lông HCM 1",
    status: "Booked",
  },
  {
    username: "trainer.hcm",
    type: "booking",
    date: "2025-11-06",
    start_time: "19:00",
    end_time: "20:00",
    customer_name: "Nguyễn Văn B",
    service_name: "HLV Tennis",
    branch: "VietSport Hà Nội",
    court_name: "Sân Tennis HN 2",
    status: "Booked",
  },
];

const filterByMonthYear = (
  items: { date: string }[],
  month?: number,
  year?: number
) => {
  return items.filter((item) => {
    const d = new Date(item.date);
    const m = d.getMonth() + 1;
    const y = d.getFullYear();
    return (!month || m === month) && (!year || y === year);
  });
};

export const trainerScheduleRepo = {
  getFixedShifts(
    username: string,
    month?: number,
    year?: number
  ): TrainerShift[] {
    const filtered = FIXED_SHIFTS.filter((s) => s.username === username);
    return filterByMonthYear(filtered, month, year) as TrainerShift[];
  },

  getBookedSessions(
    username: string,
    month?: number,
    year?: number
  ): TrainerBooking[] {
    const filtered = BOOKED_SESSIONS.filter((s) => s.username === username);
    return filterByMonthYear(filtered, month, year) as TrainerBooking[];
  },

  getAllForMonth(
    username: string,
    month?: number,
    year?: number
  ): TrainerSlot[] {
    const shifts = this.getFixedShifts(username, month, year);
    const bookings = this.getBookedSessions(username, month, year);
    return [...shifts, ...bookings].sort((a, b) => {
      const dc = a.date.localeCompare(b.date);
      if (dc !== 0) return dc;
      return a.start_time.localeCompare(b.start_time);
    });
  },
};
