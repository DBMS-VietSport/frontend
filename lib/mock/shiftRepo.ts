import { workShifts, shiftAssignments } from "./data";
import type { WorkShift, ShiftAssignment } from "./types";

export const shiftRepo = {
  listShifts: (): WorkShift[] => workShifts,
  listAssignments: (work_shift_id: number): ShiftAssignment[] =>
    shiftAssignments.filter((a) => a.work_shift_id === work_shift_id),
  assignEmployee: (
    work_shift_id: number,
    employee_id: number
  ): ShiftAssignment => {
    const assignment: ShiftAssignment = {
      work_shift_id,
      employee_id,
      status: "Assigned",
    };
    shiftAssignments.push(assignment);
    return assignment;
  },
};
