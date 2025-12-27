import { Role, Employee, WorkShift, ShiftAssignment } from "../types";

// Mock data store
let roles: Role[] = [
  { id: 1, name: "Quản lý" },
  { id: 2, name: "Lễ tân" },
  { id: 3, name: "Kỹ thuật" },
  { id: 4, name: "Thu ngân" },
  { id: 5, name: "Khách hàng/Member" },
];

let employees: Employee[] = [
  // Quản lý
  {
    id: 1,
    full_name: "Nguyễn Văn An",
    phone_number: "0901234567",
    email: "an.nguyen@vietsport.vn",
    role_id: 1,
    role_name: "Quản lý",
    branch_id: 1,
  },
  {
    id: 2,
    full_name: "Trần Thị Bình",
    phone_number: "0901234568",
    email: "binh.tran@vietsport.vn",
    role_id: 1,
    role_name: "Quản lý",
    branch_id: 1,
  },

  // Lễ tân
  {
    id: 3,
    full_name: "Lê Văn Cường",
    phone_number: "0901234569",
    email: "cuong.le@vietsport.vn",
    role_id: 2,
    role_name: "Lễ tân",
    branch_id: 1,
  },
  {
    id: 4,
    full_name: "Phạm Thị Dung",
    phone_number: "0901234570",
    email: "dung.pham@vietsport.vn",
    role_id: 2,
    role_name: "Lễ tân",
    branch_id: 1,
  },
  {
    id: 5,
    full_name: "Hoàng Văn Em",
    phone_number: "0901234571",
    email: "em.hoang@vietsport.vn",
    role_id: 2,
    role_name: "Lễ tân",
    branch_id: 1,
  },
  {
    id: 6,
    full_name: "Đỗ Thị Phương",
    phone_number: "0901234572",
    email: "phuong.do@vietsport.vn",
    role_id: 2,
    role_name: "Lễ tân",
    branch_id: 1,
  },

  // Kỹ thuật
  {
    id: 7,
    full_name: "Vũ Văn Giang",
    phone_number: "0901234573",
    email: "giang.vu@vietsport.vn",
    role_id: 3,
    role_name: "Kỹ thuật",
    branch_id: 1,
  },
  {
    id: 8,
    full_name: "Ngô Thị Hà",
    phone_number: "0901234574",
    email: "ha.ngo@vietsport.vn",
    role_id: 3,
    role_name: "Kỹ thuật",
    branch_id: 1,
  },
  {
    id: 9,
    full_name: "Bùi Văn Hùng",
    phone_number: "0901234575",
    email: "hung.bui@vietsport.vn",
    role_id: 3,
    role_name: "Kỹ thuật",
    branch_id: 1,
  },
  {
    id: 10,
    full_name: "Lý Thị Hương",
    phone_number: "0901234576",
    email: "huong.ly@vietsport.vn",
    role_id: 3,
    role_name: "Kỹ thuật",
    branch_id: 1,
  },

  // Thu ngân
  {
    id: 11,
    full_name: "Đinh Văn Khoa",
    phone_number: "0901234577",
    email: "khoa.dinh@vietsport.vn",
    role_id: 4,
    role_name: "Thu ngân",
    branch_id: 1,
  },
  {
    id: 12,
    full_name: "Mai Thị Lan",
    phone_number: "0901234578",
    email: "lan.mai@vietsport.vn",
    role_id: 4,
    role_name: "Thu ngân",
    branch_id: 1,
  },
  {
    id: 13,
    full_name: "Trịnh Văn Minh",
    phone_number: "0901234579",
    email: "minh.trinh@vietsport.vn",
    role_id: 4,
    role_name: "Thu ngân",
    branch_id: 1,
  },
];

let workShifts: WorkShift[] = [
  // November 2025 - Week 1 (Mon Nov 3 - Sun Nov 9)
  // Monday Nov 3
  {
    id: 1,
    date: "2025-11-03",
    start_time: "07:00:00",
    end_time: "15:00:00",
    required_count: 6,
  },
  {
    id: 2,
    date: "2025-11-03",
    start_time: "14:00:00",
    end_time: "22:00:00",
    required_count: 8,
  },

  // Tuesday Nov 4
  {
    id: 3,
    date: "2025-11-04",
    start_time: "07:00:00",
    end_time: "15:00:00",
    required_count: 6,
  },
  {
    id: 4,
    date: "2025-11-04",
    start_time: "14:00:00",
    end_time: "22:00:00",
    required_count: 8,
  },

  // Wednesday Nov 5
  {
    id: 5,
    date: "2025-11-05",
    start_time: "07:00:00",
    end_time: "15:00:00",
    required_count: 6,
  },
  {
    id: 6,
    date: "2025-11-05",
    start_time: "14:00:00",
    end_time: "22:00:00",
    required_count: 8,
  },

  // Thursday Nov 6
  {
    id: 7,
    date: "2025-11-06",
    start_time: "07:00:00",
    end_time: "15:00:00",
    required_count: 6,
  },
  {
    id: 8,
    date: "2025-11-06",
    start_time: "14:00:00",
    end_time: "22:00:00",
    required_count: 8,
  },

  // Friday Nov 7
  {
    id: 9,
    date: "2025-11-07",
    start_time: "07:00:00",
    end_time: "15:00:00",
    required_count: 6,
  },
  {
    id: 10,
    date: "2025-11-07",
    start_time: "14:00:00",
    end_time: "22:00:00",
    required_count: 10,
  },

  // Saturday Nov 8
  {
    id: 11,
    date: "2025-11-08",
    start_time: "07:00:00",
    end_time: "15:00:00",
    required_count: 8,
  },
  {
    id: 12,
    date: "2025-11-08",
    start_time: "14:00:00",
    end_time: "22:00:00",
    required_count: 10,
  },

  // Sunday Nov 9
  {
    id: 13,
    date: "2025-11-09",
    start_time: "07:00:00",
    end_time: "15:00:00",
    required_count: 8,
  },
  {
    id: 14,
    date: "2025-11-09",
    start_time: "14:00:00",
    end_time: "22:00:00",
    required_count: 10,
  },
];

function pickRandom<T>(array: T[], shouldShuffle = false): T[] {
  const items = shouldShuffle ? [...array] : array;
  if (shouldShuffle) {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [items[i], items[j]] = [items[j], items[i]];
    }
  }
  return items;
}

function generateRandomAssignments(): ShiftAssignment[] {
  const assignments: ShiftAssignment[] = [];
  let id = 1;
  const statusPool: Array<ShiftAssignment["status"]> = [
    "confirmed",
    "confirmed",
    "confirmed",
    "pending",
  ];

  for (const shift of workShifts) {
    const requirements = getShiftRoleRequirements(shift);
    for (const req of requirements) {
      const candidates = pickRandom(
        employees.filter((emp) => emp.role_id === req.role_id),
        true
      );
      if (candidates.length === 0) continue;

      // allow some random shortage to reflect reality
      const maxAssignable = Math.min(req.required, candidates.length);
      const shortage = Math.random() < 0.2 ? 1 : 0;
      const toAssign = Math.max(0, maxAssignable - shortage);

      for (let i = 0; i < toAssign; i++) {
        const employee = candidates[i];
        assignments.push({
          id: id++,
          employee_id: employee.id,
          work_shift_id: shift.id,
          status: statusPool[Math.floor(Math.random() * statusPool.length)],
        });
      }

      // chance to mark an additional employee as cancelled/no-show
      if (Math.random() < 0.1 && candidates[toAssign]) {
        assignments.push({
          id: id++,
          employee_id: candidates[toAssign].id,
          work_shift_id: shift.id,
          status: "cancelled",
          note: "Vắng ca",
        });
      }
    }
  }

  return assignments;
}

let shiftAssignments: ShiftAssignment[] = generateRandomAssignments();

let nextAssignmentId = shiftAssignments.length + 1;

// Repository functions

export function listRoles(): Role[] {
  return [...roles];
}

export function listEmployees(): Employee[] {
  return [...employees];
}

export function getEmployeesByRole(roleId: number): Employee[] {
  return employees.filter((e) => e.role_id === roleId);
}

export function getEmployee(employeeId: number): Employee | undefined {
  return employees.find((e) => e.id === employeeId);
}

export function listWorkShiftsByDateRange(
  startDate: string,
  endDate: string
): WorkShift[] {
  return workShifts.filter(
    (shift) => shift.date >= startDate && shift.date <= endDate
  );
}

export function getWorkShift(shiftId: number): WorkShift | undefined {
  return workShifts.find((s) => s.id === shiftId);
}

export function listAssignmentsByWorkShiftIds(
  shiftIds: number[]
): ShiftAssignment[] {
  return shiftAssignments.filter((a) => shiftIds.includes(a.work_shift_id));
}

export function getAssignmentsForShift(shiftId: number): ShiftAssignment[] {
  return shiftAssignments.filter((a) => a.work_shift_id === shiftId);
}

export function assignEmployeeToShift(
  workShiftId: number,
  employeeId: number,
  status: "confirmed" | "pending" | "cancelled" = "confirmed",
  note?: string
): ShiftAssignment {
  // Check if already assigned
  const existing = shiftAssignments.find(
    (a) => a.work_shift_id === workShiftId && a.employee_id === employeeId
  );

  if (existing) {
    // Update existing assignment
    existing.status = status;
    if (note !== undefined) existing.note = note;
    return existing;
  }

  // Create new assignment
  const newAssignment: ShiftAssignment = {
    id: nextAssignmentId++,
    employee_id: employeeId,
    work_shift_id: workShiftId,
    status,
    note,
  };

  shiftAssignments.push(newAssignment);
  return newAssignment;
}

export function removeAssignment(
  workShiftId: number,
  employeeId: number
): boolean {
  const index = shiftAssignments.findIndex(
    (a) => a.work_shift_id === workShiftId && a.employee_id === employeeId
  );

  if (index !== -1) {
    shiftAssignments.splice(index, 1);
    return true;
  }

  return false;
}

export function updateAssignmentStatus(
  workShiftId: number,
  employeeId: number,
  status: "confirmed" | "pending" | "cancelled"
): ShiftAssignment | null {
  const assignment = shiftAssignments.find(
    (a) => a.work_shift_id === workShiftId && a.employee_id === employeeId
  );

  if (assignment) {
    assignment.status = status;
    return assignment;
  }

  return null;
}

// Helper: Get role distribution requirements for a shift
// This is a simple heuristic - in real app, you'd have shift_role_requirements table
export function getShiftRoleRequirements(
  shift: WorkShift
): Array<{ role_id: number; required: number }> {
  const total = shift.required_count;

  // Example distribution logic:
  // 1 manager, 30% receptionists, 30% technicians, rest cashiers
  const distribution = [
    { role_id: 1, required: 1 }, // Quản lý
    { role_id: 2, required: Math.ceil(total * 0.3) }, // Lễ tân
    { role_id: 3, required: Math.ceil(total * 0.3) }, // Kỹ thuật
    {
      role_id: 4,
      required: Math.max(
        1,
        total - 1 - Math.ceil(total * 0.3) - Math.ceil(total * 0.3)
      ),
    }, // Thu ngân
  ];

  return distribution;
}
