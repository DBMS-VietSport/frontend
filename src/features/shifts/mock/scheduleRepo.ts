/**
 * Mock Schedule Repository
 * Get personal shift schedule for employees
 */

import { workShifts, shiftAssignments, employees, branches } from "../../../mock/data";
import { MOCK_USERS } from "../../auth/mock/authMock";
import type { WorkShift, ShiftAssignment, Employee } from "../../../mock/types";

export interface MyShift {
  date: string; // "2025-11-05"
  start_time: string; // "07:00"
  end_time: string; // "15:00"
  role: string; // "Lễ tân"
  branch: string; // "VietSport TP.HCM"
  status: "Assigned" | "Pending" | "Cancelled";
  note?: string;
  work_shift_id: number;
}

/**
 * Map username from auth to employee_id
 * This is a simple mapping - in real app, this would be in database
 */
function getEmployeeIdByUsername(username: string): number | null {
  // Find user in MOCK_USERS
  const user = MOCK_USERS.find((u) => u.username === username);
  if (!user) return null;

  // Try to find employee by fullName match
  const employee = employees.find((e) => {
    // Simple matching - can be improved
    const nameMatch = e.full_name
      .toLowerCase()
      .includes(user.fullName.toLowerCase().split(" ")[0]);
    return nameMatch;
  });

  // If not found by name, try to map by role and branch
  if (!employee) {
    // Map common usernames to employee IDs
    const usernameToEmployeeId: Record<string, number> = {
      "manager.hcm": 1,
      "receptionist.hcm": 2,
      "cashier.hcm": 3,
      "technical.hcm": 4,
      "manager.hn": 1, // Fallback
      "receptionist.hn": 2, // Fallback
    };

    if (usernameToEmployeeId[username]) {
      return usernameToEmployeeId[username];
    }

    // Default: return first employee if user is not customer
    if (user.role !== "customer" && employees.length > 0) {
      return employees[0].id;
    }
  }

  return employee?.id || null;
}

/**
 * Get role name by role_id
 */
function getRoleName(roleId: number | undefined): string {
  const roleMap: Record<number, string> = {
    1: "Quản lý",
    2: "Lễ tân",
    3: "Kỹ thuật",
    4: "Thu ngân",
    5: "Khách hàng/Member",
    6: "Quản trị hệ thống",
  };
  return roleMap[roleId || 0] || "Nhân viên";
}

/**
 * Get branch name by branch_id
 */
function getBranchName(branchId: number): string {
  const branch = branches.find((b) => b.id === branchId);
  return branch?.name || "Chưa xác định";
}

/**
 * Format time from "HH:MM:SS" or "HH:MM" to "HH:MM"
 */
function formatTime(time: string): string {
  return time.substring(0, 5); // "07:00:00" -> "07:00"
}

/**
 * Get my shifts for a user
 * @param userIdOrUsername - username from auth
 * @param month - optional month filter (1-12)
 * @param year - optional year filter
 */
export function getMyShifts(
  userIdOrUsername: string,
  month?: number,
  year?: number
): MyShift[] {
  // Get employee_id from username
  const employeeId = getEmployeeIdByUsername(userIdOrUsername);
  if (!employeeId) {
    return [];
  }

  // Get employee info
  const employee = employees.find((e) => e.id === employeeId);
  if (!employee) {
    return [];
  }

  // Get all shift assignments for this employee
  const myAssignments = shiftAssignments.filter(
    (a) => a.employee_id === employeeId
  );

  // Get work shifts for these assignments
  const myShifts: MyShift[] = myAssignments
    .map((assignment) => {
      const workShift = workShifts.find(
        (ws) => ws.id === assignment.work_shift_id
      );
      if (!workShift) return null;

      // Filter by month/year if provided
      if (month || year) {
        const shiftDate = new Date(workShift.date);
        const shiftMonth = shiftDate.getMonth() + 1; // getMonth() returns 0-11
        const shiftYear = shiftDate.getFullYear();

        if (month && shiftMonth !== month) return null;
        if (year && shiftYear !== year) return null;
      }

      return {
        date: workShift.date,
        start_time: formatTime(workShift.start_time),
        end_time: formatTime(workShift.end_time),
        role: getRoleName(employee.role_id),
        branch: getBranchName(employee.branch_id || 0),
        status:
          assignment.status === "confirmed" || assignment.status === "Assigned"
            ? "Assigned"
            : assignment.status === "pending" || assignment.status === "Pending"
            ? "Pending"
            : "Cancelled",
        note: assignment.note || undefined,
        work_shift_id: workShift.id,
      } as MyShift;
    })
    .filter((shift): shift is MyShift => shift !== null)
    .sort((a, b) => {
      // Sort by date, then by start_time
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.start_time.localeCompare(b.start_time);
    });

  return myShifts;
}
