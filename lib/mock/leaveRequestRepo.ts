/**
 * Mock Leave Request Repository
 * In-memory storage for employee leave requests
 */

export interface LeaveRequest {
  id: number;
  employeeUsername: string;
  start_date: string; // ISO date
  end_date: string; // ISO date
  approval_status: "Pending" | "Approved" | "Rejected";
  reason: string;
  created_at: string;
}

const LEAVE_REQUESTS: LeaveRequest[] = [];

let counter = 1;

export const leaveRequestRepo = {
  listByUser(username: string): LeaveRequest[] {
    return LEAVE_REQUESTS.filter((r) => r.employeeUsername === username).sort(
      (a, b) => (a.created_at < b.created_at ? 1 : -1)
    );
  },

  create(
    username: string,
    payload: { start_date: string; end_date: string; reason: string }
  ): LeaveRequest {
    const req: LeaveRequest = {
      id: counter++,
      employeeUsername: username,
      start_date: payload.start_date,
      end_date: payload.end_date,
      reason: payload.reason,
      approval_status: "Pending",
      created_at: new Date().toISOString(),
    };
    LEAVE_REQUESTS.push(req);
    return req;
  },

  // Helper to get all requests (for admin/manager if needed later)
  listAll(): LeaveRequest[] {
    return [...LEAVE_REQUESTS].sort((a, b) =>
      a.created_at < b.created_at ? 1 : -1
    );
  },
};
