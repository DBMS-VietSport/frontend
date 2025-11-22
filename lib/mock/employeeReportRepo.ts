import {
  employees as baseEmployees,
  roles,
  branches,
  workShifts as baseWorkShifts,
  shiftAssignments as baseAssignments,
  invoices as baseInvoices,
  Employee,
  WorkShift,
  ShiftAssignment,
  Invoice,
} from "@/lib/mock";
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isWithinInterval,
  subMonths,
  addDays,
  subDays,
} from "date-fns";

// --- Extended Mock Data Generation ---

export interface EmployeeReportLeaveRequest {
  id: number;
  employee_id: number;
  start_date: string;
  end_date: string;
  status: "Approved" | "Pending" | "Rejected";
  reason: string;
}

export interface SalaryHistory {
  id: number;
  employee_id: number;
  month: number;
  year: number;
  gross_pay: number;
  net_pay: number;
  commission: number;
  status: "Paid" | "Pending";
}

let cachedMockData: {
  employees: Employee[];
  workShifts: WorkShift[];
  shiftAssignments: ShiftAssignment[];
  leaveRequests: EmployeeReportLeaveRequest[];
  salaryHistory: SalaryHistory[];
  invoices: Invoice[];
} | null = null;

function generateMockEmployeeReportData() {
  if (cachedMockData) return cachedMockData;

  const employees: Employee[] = [...baseEmployees];
  const workShifts: WorkShift[] = [...baseWorkShifts];
  const shiftAssignments: ShiftAssignment[] = [...baseAssignments];
  const leaveRequests: EmployeeReportLeaveRequest[] = [];
  const salaryHistory: SalaryHistory[] = [];
  const invoices: Invoice[] = [...baseInvoices]; // We'll use base invoices for revenue linking

  // Generate ~20 employees total
  let empIdCounter = 100;
  const extraRoles = ["Thu ngân", "Lễ tân", "Kỹ thuật", "Huấn luyện viên"];

  for (let i = 0; i < 17; i++) {
    const role =
      roles.find(
        (r) =>
          r.name === extraRoles[Math.floor(Math.random() * extraRoles.length)]
      ) || roles[1];
    const branch = branches[Math.floor(Math.random() * branches.length)];

    employees.push({
      id: empIdCounter++,
      full_name: `Nhân viên ${i + 1}`,
      gender: Math.random() > 0.5 ? "Nam" : "Nữ",
      dob: "1995-01-01",
      address: "HCM",
      phone_number: "0901234567",
      email: `nv${i}@vs.com`,
      status:
        Math.random() > 0.8
          ? "OnLeave"
          : Math.random() > 0.9
          ? "Inactive"
          : "Active",
      commission_rate: role.name === "Huấn luyện viên" ? 0.3 : 0.05,
      base_salary: 5000000 + Math.floor(Math.random() * 5000000),
      base_allowance: 500000,
      branch_id: branch.id,
      user_id: `user_nv${i}`,
      role_id: role.id,
    });
  }

  // Generate Shifts & Assignments for last 3 months
  const today = new Date();
  const startDate = subMonths(startOfMonth(today), 2);
  const endDate = endOfMonth(today);
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  let shiftIdCounter = 1000;

  days.forEach((day) => {
    // 3 shifts per day
    const shiftsForDay = [
      { start: "06:00", end: "14:00" },
      { start: "14:00", end: "22:00" },
      { start: "08:00", end: "17:00" }, // Office hours
    ];

    shiftsForDay.forEach((s) => {
      const shiftId = shiftIdCounter++;
      workShifts.push({
        id: shiftId,
        date: format(day, "yyyy-MM-dd"),
        start_time: s.start,
        end_time: s.end,
        required_count: 3,
      });

      // Assign random employees
      const potentialEmployees = employees.filter((e) => e.status === "Active");
      // Pick 2-3 employees
      const count = 2 + Math.floor(Math.random() * 2);
      for (let k = 0; k < count; k++) {
        const emp =
          potentialEmployees[
            Math.floor(Math.random() * potentialEmployees.length)
          ];
        shiftAssignments.push({
          employee_id: emp.id,
          work_shift_id: shiftId,
          status: Math.random() > 0.95 ? "absent" : "confirmed", // 5% absent
          note: "",
        });
      }
    });
  });

  // Generate Leave Requests
  let leaveIdCounter = 1;
  employees.forEach((emp) => {
    if (Math.random() > 0.7) {
      // 30% employees took leave
      const leaveStart = addDays(startDate, Math.floor(Math.random() * 60));
      const duration = 1 + Math.floor(Math.random() * 3);
      leaveRequests.push({
        id: leaveIdCounter++,
        employee_id: emp.id,
        start_date: format(leaveStart, "yyyy-MM-dd"),
        end_date: format(addDays(leaveStart, duration), "yyyy-MM-dd"),
        status: Math.random() > 0.2 ? "Approved" : "Pending",
        reason: "Việc cá nhân",
      });
    }
  });

  // Generate Salary History (Mock calculation)
  // For each month in range
  const months = [0, 1, 2].map((diff) => subMonths(today, diff));
  let salIdCounter = 1;

  months.forEach((m) => {
    const mNum = m.getMonth() + 1;
    const yNum = m.getFullYear();

    employees.forEach((emp) => {
      const gross = emp.base_salary + emp.base_allowance;
      // Mock commission based on role
      const commission =
        emp.role_id === 3 ? Math.floor(Math.random() * 2000000) : 0;
      const net = gross + commission - gross * 0.105; // Approx insurance

      salaryHistory.push({
        id: salIdCounter++,
        employee_id: emp.id,
        month: mNum,
        year: yNum,
        gross_pay: gross,
        net_pay: net,
        commission: commission,
        status: mNum < today.getMonth() + 1 ? "Paid" : "Pending",
      });
    });
  });

  // Mock Invoices linkage for Cashier KPI
  // We already have base invoices, let's pretend some employees (cashiers) created them
  // In base mock, invoices don't strictly have `employee_id` (created_by), but bookings do have `employee_id`.
  // We'll use booking.employee_id to attribute revenue.

  cachedMockData = {
    employees,
    workShifts,
    shiftAssignments,
    leaveRequests,
    salaryHistory,
    invoices,
  };
  return cachedMockData;
}

// --- Filter Logic ---

export interface EmployeeReportFilter {
  branchId: number | null; // 0 or null for all
  roleId: number | null;
  month: number;
  year: number;
  status: "All" | "Working" | "Inactive" | "OnLeave";
}

function filterData(filter: EmployeeReportFilter) {
  const {
    employees,
    workShifts,
    shiftAssignments,
    leaveRequests,
    salaryHistory,
    invoices,
  } = generateMockEmployeeReportData();

  // Filter Employees
  const filteredEmployees = employees.filter((e) => {
    if (filter.branchId && e.branch_id !== filter.branchId) return false;
    if (filter.roleId && e.role_id !== filter.roleId) return false;

    // Status mapping
    // Mock data has "Active", "Inactive", "OnLeave".
    // Filter has "Working" (Active), "Inactive", "OnLeave".
    if (filter.status !== "All") {
      if (filter.status === "Working" && e.status !== "Active") return false;
      if (filter.status === "Inactive" && e.status !== "Inactive") return false;
      if (filter.status === "OnLeave" && e.status !== "OnLeave") return false;
    }
    return true;
  });

  const empIds = new Set(filteredEmployees.map((e) => e.id));

  // Filter Shifts in Period (Month/Year)
  // We need shifts that happened in the selected Month/Year
  const startPeriod = startOfMonth(new Date(filter.year, filter.month - 1));
  const endPeriod = endOfMonth(new Date(filter.year, filter.month - 1));

  const periodShifts = workShifts.filter((s) => {
    const d = new Date(s.date);
    return isWithinInterval(d, { start: startPeriod, end: endPeriod });
  });
  const periodShiftIds = new Set(periodShifts.map((s) => s.id));

  // Filter Assignments: Must be in period AND belong to filtered employees
  const relevantAssignments = shiftAssignments.filter(
    (a) => periodShiftIds.has(a.work_shift_id) && empIds.has(a.employee_id)
  );

  // Filter Leave Requests in Period
  const relevantLeaves = leaveRequests.filter((l) => {
    if (!empIds.has(l.employee_id)) return false;
    const start = new Date(l.start_date);
    // Simple overlap check or just start date in month
    return (
      start.getMonth() + 1 === filter.month &&
      start.getFullYear() === filter.year &&
      l.status === "Approved"
    );
  });

  // Filter Salary History
  const relevantSalaries = salaryHistory.filter(
    (s) =>
      s.month === filter.month &&
      s.year === filter.year &&
      empIds.has(s.employee_id)
  );

  return {
    filteredEmployees,
    relevantAssignments,
    relevantLeaves,
    relevantSalaries,
    periodShifts,
  };
}

// --- KPIs ---

export function getEmployeeReportKPIs(filter: EmployeeReportFilter) {
  const {
    filteredEmployees,
    relevantAssignments,
    relevantLeaves,
    relevantSalaries,
    periodShifts,
  } = filterData(filter);

  const totalEmployees = filteredEmployees.length;

  // Role distribution for card
  const roleDist = new Map<string, number>();
  filteredEmployees.forEach((e) => {
    const rName = roles.find((r) => r.id === e.role_id)?.name || "Unknown";
    roleDist.set(rName, (roleDist.get(rName) || 0) + 1);
  });

  const totalShifts = relevantAssignments.length;

  // Estimate hours
  let totalHours = 0;
  relevantAssignments.forEach((a) => {
    const shift = periodShifts.find((s) => s.id === a.work_shift_id);
    if (shift && a.status === "confirmed") {
      const start = parseInt(shift.start_time.split(":")[0]);
      const end = parseInt(shift.end_time.split(":")[0]);
      totalHours += end - start; // simplified
    }
  });

  // Leaves
  // Count total days of leave approved in this month
  let totalLeaveDays = 0;
  relevantLeaves.forEach((l) => {
    const start = new Date(l.start_date);
    const end = new Date(l.end_date);
    const diff = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
    totalLeaveDays += Math.ceil(diff);
  });

  const totalNetPay = relevantSalaries.reduce((acc, s) => acc + s.net_pay, 0);

  return {
    totalEmployees,
    roleDistribution: Array.from(roleDist.entries()).map(([name, count]) => ({
      name,
      count,
    })),
    totalShifts,
    totalHours,
    totalLeaveDays,
    totalNetPay,
  };
}

// --- Charts ---

export function getTopEmployeesByHours(filter: EmployeeReportFilter) {
  const { relevantAssignments, periodShifts, filteredEmployees } =
    filterData(filter);
  const map = new Map<number, number>(); // empId -> hours

  relevantAssignments.forEach((a) => {
    if (a.status !== "confirmed") return;
    const shift = periodShifts.find((s) => s.id === a.work_shift_id);
    if (shift) {
      const start = parseInt(shift.start_time.split(":")[0]);
      const end = parseInt(shift.end_time.split(":")[0]);
      const hours = end - start;
      map.set(a.employee_id, (map.get(a.employee_id) || 0) + hours);
    }
  });

  return (
    Array.from(map.entries())
      .map(([id, hours]) => {
        const emp = filteredEmployees.find((e) => e.id === id);
        return emp ? { name: emp.full_name, hours } : null;
      })
      .filter((x) => x !== null)
      // @ts-ignore
      .sort((a, b) => b.hours - a.hours)
      .slice(0, 5)
  );
}

export function getDailyWorkHours(filter: EmployeeReportFilter) {
  const { relevantAssignments, periodShifts } = filterData(filter);
  // Aggregate hours by day
  const dayMap = new Map<string, number>();

  relevantAssignments.forEach((a) => {
    if (a.status !== "confirmed") return;
    const shift = periodShifts.find((s) => s.id === a.work_shift_id);
    if (shift) {
      const start = parseInt(shift.start_time.split(":")[0]);
      const end = parseInt(shift.end_time.split(":")[0]);
      const hours = end - start;
      const day = format(new Date(shift.date), "dd/MM");
      dayMap.set(day, (dayMap.get(day) || 0) + hours);
    }
  });

  // Sort by date (string sort works for dd/MM if in same month roughly, but better to map to day number)
  return Array.from(dayMap.entries())
    .map(([day, hours]) => ({ day, hours }))
    .sort((a, b) => a.day.localeCompare(b.day));
}

// --- Data Table ---

export function getEmployeeDetailsTable(filter: EmployeeReportFilter) {
  const {
    filteredEmployees,
    relevantAssignments,
    relevantLeaves,
    relevantSalaries,
    periodShifts,
  } = filterData(filter);

  return filteredEmployees.map((emp) => {
    const assignments = relevantAssignments.filter(
      (a) => a.employee_id === emp.id
    );
    const shiftsCount = assignments.length;

    let hours = 0;
    let absences = 0;

    assignments.forEach((a) => {
      if (a.status === "confirmed") {
        const shift = periodShifts.find((s) => s.id === a.work_shift_id);
        if (shift) {
          const start = parseInt(shift.start_time.split(":")[0]);
          const end = parseInt(shift.end_time.split(":")[0]);
          hours += end - start;
        }
      } else if (a.status === "absent") {
        absences++;
      }
    });

    const leaves = relevantLeaves.filter(
      (l) => l.employee_id === emp.id
    ).length; // Count requests, not days for simplicity in table column
    const salary = relevantSalaries.find((s) => s.employee_id === emp.id);

    const branch = branches.find((b) => b.id === emp.branch_id);
    const role = roles.find((r) => r.id === emp.role_id);

    return {
      id: emp.id,
      full_name: emp.full_name,
      branch_name: branch?.name || "",
      role_name: role?.name || "",
      shiftsCount,
      hours,
      leaves,
      absences,
      gross_pay: salary?.gross_pay || 0,
      net_pay: salary?.net_pay || 0,
      commission: salary?.commission || 0,
      status: emp.status,
    };
  });
}
