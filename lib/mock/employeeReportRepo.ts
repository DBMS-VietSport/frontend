import { branches, employees, workShifts, shiftAssignments } from "./data";

export interface EmployeeRoleCount {
  roleName: string;
  count: number;
}

export interface WorkHoursQuery {
  period: "month" | "quarter" | "year";
  year: number;
  month?: number;
  quarter?: number;
  branchId?: number | null;
}

export interface EmployeeWorkHourRecord {
  employeeId: number;
  employeeName: string;
  roleName: string;
  branchId: number;
  branchName: string;
  totalHours: number;
  shiftCount: number;
  absenceCount: number;
}

const ROLE_NAME_MAP: Record<number, string> = {
  1: "Quản lý",
  2: "Lễ tân",
  3: "Kỹ thuật",
  4: "Thu ngân",
  5: "Khách hàng/Member",
  6: "Quản trị hệ thống",
};

const ROLE_DISPLAY_ORDER = [
  "Quản lý",
  "Lễ tân",
  "Kỹ thuật",
  "Thu ngân",
  "Huấn luyện viên",
];

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map((v) => parseInt(v, 10));
  return h * 60 + m;
}

function calcShiftMinutes(shiftId: number): number {
  const shift = workShifts.find((ws) => ws.id === shiftId);
  if (!shift) return 0;
  const start = toMinutes(shift.start_time);
  const end = toMinutes(shift.end_time);
  let diff = end - start;
  if (diff < 0) {
    diff += 24 * 60;
  }
  return diff;
}

function getRoleNameForEmployee(employeeName: string, roleId?: number) {
  const lowerName = employeeName.toLowerCase();
  if (
    lowerName.includes("hlv") ||
    lowerName.includes("huấn luyện") ||
    lowerName.includes("coach")
  ) {
    return "Huấn luyện viên";
  }
  return ROLE_NAME_MAP[roleId || 0] || "Nhân viên";
}

function getBranchName(branchId: number) {
  return branches.find((b) => b.id === branchId)?.name || "Chưa xác định";
}

function isInQueryPeriod(query: WorkHoursQuery, dateIso: string) {
  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return false;
  const year = date.getFullYear();
  if (year !== query.year) return false;
  const month = date.getMonth() + 1;
  if (query.period === "month") {
    if (!query.month) return false;
    return month === query.month;
  }
  if (query.period === "quarter") {
    if (!query.quarter) return false;
    const quarter = Math.floor((month - 1) / 3) + 1;
    return quarter === query.quarter;
  }
  return true;
}

export async function getEmployeeCountByRole(options?: {
  branchId?: number | null;
}): Promise<EmployeeRoleCount[]> {
  await new Promise((resolve) => setTimeout(resolve, 60));
  const counts = new Map<string, number>();
  ROLE_DISPLAY_ORDER.forEach((role) => counts.set(role, 0));

  for (const emp of employees) {
    if (options?.branchId && emp.branch_id !== options.branchId) continue;
    const roleName = getRoleNameForEmployee(emp.full_name, emp.role_id);
    counts.set(roleName, (counts.get(roleName) || 0) + 1);
  }

  return ROLE_DISPLAY_ORDER.map((roleName) => ({
    roleName,
    count: counts.get(roleName) || 0,
  })).filter(
    (item) => item.count > 0 || ROLE_DISPLAY_ORDER.includes(item.roleName)
  );
}

export async function getWorkHoursByPeriod(
  query: WorkHoursQuery
): Promise<EmployeeWorkHourRecord[]> {
  await new Promise((resolve) => setTimeout(resolve, 80));

  const stats = new Map<number, EmployeeWorkHourRecord>();

  for (const assignment of shiftAssignments) {
    const employee = employees.find((e) => e.id === assignment.employee_id);
    if (!employee) continue;
    if (query.branchId && employee.branch_id !== query.branchId) continue;

    const shift = workShifts.find((ws) => ws.id === assignment.work_shift_id);
    if (!shift) continue;
    if (!isInQueryPeriod(query, shift.date)) continue;

    const record =
      stats.get(employee.id) ||
      ({
        employeeId: employee.id,
        employeeName: employee.full_name,
        roleName: getRoleNameForEmployee(employee.full_name, employee.role_id),
        branchId: employee.branch_id,
        branchName: getBranchName(employee.branch_id),
        totalHours: 0,
        shiftCount: 0,
        absenceCount: 0,
      } as EmployeeWorkHourRecord);

    record.shiftCount += 1;
    if (assignment.status?.toLowerCase() === "confirmed") {
      record.totalHours += calcShiftMinutes(assignment.work_shift_id) / 60;
    } else {
      record.absenceCount += 1;
    }

    stats.set(employee.id, record);
  }

  // Ensure employees with zero shifts still appear
  for (const employee of employees) {
    if (query.branchId && employee.branch_id !== query.branchId) continue;
    if (!stats.has(employee.id)) {
      stats.set(employee.id, {
        employeeId: employee.id,
        employeeName: employee.full_name,
        roleName: getRoleNameForEmployee(employee.full_name, employee.role_id),
        branchId: employee.branch_id,
        branchName: getBranchName(employee.branch_id),
        totalHours: 0,
        shiftCount: 0,
        absenceCount: 0,
      });
    }
  }

  return Array.from(stats.values())
    .map((record) => ({
      ...record,
      totalHours: Math.round(record.totalHours * 10) / 10,
    }))
    .sort((a, b) => b.totalHours - a.totalHours);
}

export async function getTopActiveEmployees(
  query: WorkHoursQuery & { limit?: number }
): Promise<EmployeeWorkHourRecord[]> {
  const data = await getWorkHoursByPeriod(query);
  const limit = query.limit ?? 5;
  return data.filter((item) => item.totalHours > 0).slice(0, limit);
}
