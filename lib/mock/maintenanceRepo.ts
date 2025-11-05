"use client";

export type MaintenanceStatus = "Scheduled" | "InProgress" | "Done";

export interface MaintenanceScheduleItem {
  id: number;
  courtId: number;
  courtName: string;
  branch: string;
  plannedDate: string; // YYYY-MM-DD
  status: MaintenanceStatus;
  note?: string;
}

export interface MaintenanceReportItem {
  id: number;
  courtId: number;
  courtName: string;
  branch: string;
  created_at: string; // ISO
  work_description: string;
  cost: number;
  material_used: string;
  post_maintenance_status: "Available" | "Maintenance" | "Limited";
  repairer_username: string;
}

// Mock courts (subset for selects)
const COURTS = [
  { id: 101, name: "Sân Cầu Lông HCM 1", branch: "VietSport TP.HCM" },
  { id: 102, name: "Sân Cầu Lông HCM 2", branch: "VietSport TP.HCM" },
  { id: 201, name: "Sân Cầu Lông HN 1", branch: "VietSport Hà Nội" },
  { id: 202, name: "Sân Futsal CT 1", branch: "VietSport Cần Thơ" },
  { id: 301, name: "Sân Tennis ĐN 1", branch: "VietSport Đà Nẵng" },
];

let MAINTENANCE_SCHEDULE: MaintenanceScheduleItem[] = [
  {
    id: 1,
    courtId: 101,
    courtName: "Sân Cầu Lông HCM 1",
    branch: "VietSport TP.HCM",
    plannedDate: "2025-11-10",
    status: "Scheduled",
    note: "Thay lưới định kỳ",
  },
  {
    id: 2,
    courtId: 202,
    courtName: "Sân Futsal CT 1",
    branch: "VietSport Cần Thơ",
    plannedDate: "2025-11-12",
    status: "Scheduled",
    note: "Sơn lại vạch sân",
  },
];

let MAINTENANCE_REPORTS: MaintenanceReportItem[] = [
  {
    id: 1,
    courtId: 101,
    courtName: "Sân Cầu Lông HCM 1",
    branch: "VietSport TP.HCM",
    created_at: "2025-11-01T09:15:00Z",
    work_description: "Thay lưới và sơn lại vạch sân",
    cost: 2500000,
    material_used: "Lưới mới, sơn chịu nhiệt",
    post_maintenance_status: "Available",
    repairer_username: "technical.hcm",
  },
];

let nextReportId = 100;

export const maintenanceRepo = {
  listBranches(): string[] {
    return [
      "VietSport TP.HCM",
      "VietSport Hà Nội",
      "VietSport Cần Thơ",
      "VietSport Đà Nẵng",
    ];
  },

  listCourts(branch?: string) {
    return COURTS.filter((c) => (branch ? c.branch === branch : true));
  },

  listSchedule(
    branch?: string,
    month?: number,
    year?: number
  ): MaintenanceScheduleItem[] {
    return MAINTENANCE_SCHEDULE.filter((item) => {
      if (branch && item.branch !== branch) return false;
      if (month || year) {
        const d = new Date(item.plannedDate);
        const m = d.getMonth() + 1;
        const y = d.getFullYear();
        if (month && m !== month) return false;
        if (year && y !== year) return false;
      }
      return true;
    }).sort((a, b) => a.plannedDate.localeCompare(b.plannedDate));
  },

  listReports(username?: string): MaintenanceReportItem[] {
    return MAINTENANCE_REPORTS.filter((r) =>
      username ? r.repairer_username === username : true
    ).sort((a, b) => b.created_at.localeCompare(a.created_at));
  },

  createReport(payload: Omit<MaintenanceReportItem, "id" | "created_at">) {
    const created: MaintenanceReportItem = {
      id: nextReportId++,
      created_at: new Date().toISOString(),
      ...payload,
    };
    MAINTENANCE_REPORTS.push(created);
    return created;
  },
};

export type { MaintenanceReportItem as MaintenanceReport };
