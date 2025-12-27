"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, X, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/ui/dialog";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Alert, AlertDescription } from "@/ui/alert";
import { Separator } from "@/ui/separator";
import { ScrollArea } from "@/ui/scroll-area";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/popover";
import { cn } from "@/utils";
import { ShiftCellData, Employee, RoleRequirement } from "@/features/shifts/types";
import {
  getEmployeesByRole,
  assignEmployeeToShift,
  removeAssignment,
} from "@/features/shifts";
import { toast } from "sonner";

interface ShiftCellAssignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shiftData: ShiftCellData | null;
  onUpdate: () => void;
}

export function ShiftCellAssignDialog({
  open,
  onOpenChange,
  shiftData,
  onUpdate,
}: ShiftCellAssignDialogProps) {
  if (!shiftData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Phân ca – {shiftData.weekdayLabel}</DialogTitle>
          <DialogDescription>{shiftData.timeRange}</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {shiftData.required_per_role.map((roleReq: RoleRequirement) => (
              <RoleAssignmentSection
                key={roleReq.role_id}
                roleRequirement={roleReq}
                shiftId={shiftData.id}
                onUpdate={onUpdate}
              />
            ))}

            {/* Warning if not fully staffed */}
            {shiftData.required_per_role.some(
              (r: RoleRequirement) => r.assigned < r.required
            ) && (
              <Alert variant="destructive">
                <AlertDescription>
                  Chưa đủ nhân sự cho ca này. Vui lòng phân thêm nhân viên.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button
            onClick={() => {
              toast.success("Đã lưu phân ca");
              onOpenChange(false);
            }}
          >
            Lưu
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface RoleAssignmentSectionProps {
  roleRequirement: RoleRequirement;
  shiftId: number;
  onUpdate: () => void;
}

function RoleAssignmentSection({
  roleRequirement,
  shiftId,
  onUpdate,
}: RoleAssignmentSectionProps) {
  const [open, setOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null
  );

  const availableEmployees = getEmployeesByRole(roleRequirement.role_id);
  const assignedEmployeeIds = new Set(
    roleRequirement.employees.map((e: Employee) => e.id)
  );

  // Filter out already assigned employees
  const unassignedEmployees = availableEmployees.filter(
    (e: Employee) => !assignedEmployeeIds.has(e.id)
  );

  const handleAddEmployee = () => {
    if (!selectedEmployeeId) {
      toast.error("Vui lòng chọn nhân viên");
      return;
    }

    try {
      assignEmployeeToShift(shiftId, selectedEmployeeId, "confirmed");
      toast.success("Đã thêm nhân viên vào ca");
      setSelectedEmployeeId(null);
      setOpen(false);
      onUpdate();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm nhân viên");
    }
  };

  const handleRemoveEmployee = (employeeId: number) => {
    try {
      removeAssignment(shiftId, employeeId);
      toast.success("Đã xóa nhân viên khỏi ca");
      onUpdate();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi xóa nhân viên");
    }
  };

  const isFull = roleRequirement.assigned >= roleRequirement.required;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">
          {roleRequirement.role_name}{" "}
          <span
            className={cn(
              "text-sm",
              isFull ? "text-green-600" : "text-red-600"
            )}
          >
            ({roleRequirement.assigned}/{roleRequirement.required})
          </span>
        </h4>
      </div>

      {/* Add employee section */}
      {!isFull && unassignedEmployees.length > 0 && (
        <div className="flex gap-2">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="flex-1 justify-between"
              >
                {selectedEmployeeId
                  ? availableEmployees.find((e) => e.id === selectedEmployeeId)
                      ?.full_name
                  : "Chọn nhân viên..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0">
              <Command>
                <CommandInput placeholder="Tìm nhân viên..." />
                <CommandList>
                  <CommandEmpty>Không tìm thấy nhân viên.</CommandEmpty>
                  <CommandGroup>
                    {unassignedEmployees.map((employee: Employee) => (
                      <CommandItem
                        key={employee.id}
                        value={employee.full_name}
                        onSelect={() => {
                          setSelectedEmployeeId(employee.id);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedEmployeeId === employee.id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{employee.full_name}</span>
                          <span className="text-xs text-gray-500">
                            {employee.phone_number}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          <Button onClick={handleAddEmployee} size="icon">
            <UserPlus className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Assigned employees list */}
      {roleRequirement.employees.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {roleRequirement.employees.map((employee: Employee) => (
            <Badge key={employee.id} variant="secondary" className="gap-1 pr-1">
              <span>{employee.full_name}</span>
              <button
                onClick={() => handleRemoveEmployee(employee.id)}
                className="ml-1 rounded-full hover:bg-gray-300 p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {roleRequirement.employees.length === 0 && (
        <p className="text-sm text-gray-500 italic">
          Chưa có nhân viên được phân.
        </p>
      )}

      <Separator />
    </div>
  );
}
