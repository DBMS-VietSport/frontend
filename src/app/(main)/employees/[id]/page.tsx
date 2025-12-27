"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import { Separator } from "@/ui/separator";
import { Button } from "@/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { EmployeeInfoCard } from "@/features/employee/components/EmployeeInfoCard";
import { EmployeeDetailTabs } from "@/features/employee/components/EmployeeDetailTabs";
import { EmployeeFormDialog } from "@/features/employee/components/EmployeeFormDialog";
import type {
  Employee,
  WorkShift,
  SalaryHistory,
  PerformanceRecord,
  UpdateEmployeePayload,
  CreateEmployeePayload,
} from "@/features/employee/types";
import {
  getEmployee,
  getWorkShifts,
  getSalaryHistory,
  getPerformanceStats,
  updateEmployee,
} from "@/features/employee/mockRepo";
import { LoadingSpinner } from "@/components/shared";
import { logger } from "@/lib/utils/logger";

export default function EmployeeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = parseInt(params.id as string);

  const [employee, setEmployee] = React.useState<Employee | null>(null);
  const [workShifts, setWorkShifts] = React.useState<WorkShift[]>([]);
  const [salaryHistory, setSalaryHistory] = React.useState<SalaryHistory[]>([]);
  const [performanceStats, setPerformanceStats] = React.useState<
    PerformanceRecord[]
  >([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  // Load employee data
  React.useEffect(() => {
    loadEmployeeData();
  }, [employeeId]);

  const loadEmployeeData = async () => {
    setIsLoading(true);
    try {
      const [employeeData, shiftsData, salaryData, performanceData] =
        await Promise.all([
          getEmployee(employeeId),
          getWorkShifts(employeeId),
          getSalaryHistory(employeeId),
          getPerformanceStats(employeeId),
        ]);

      if (!employeeData) {
        toast.error("Không tìm thấy nhân viên");
        router.push("/employees");
        return;
      }

      setEmployee(employeeData);
      setWorkShifts(shiftsData);
      setSalaryHistory(salaryData);
      setPerformanceStats(performanceData);
    } catch (error) {
      logger.error("Failed to load employee data:", error);
      toast.error("Không thể tải thông tin nhân viên");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleEditClick = () => {
    setDialogOpen(true);
  };

  const handleSave = async (payload: UpdateEmployeePayload) => {
    if (!employee) return;

    try {
      const updated = await updateEmployee(employee.id, payload);
      setEmployee(updated);
      setIsEditing(false);
      toast.success("Cập nhật thông tin thành công");
    } catch (error) {
      logger.error("Failed to update employee:", error);
      toast.error("Không thể cập nhật thông tin");
    }
  };

  const handleSaveFromDialog = async (payload: CreateEmployeePayload) => {
    if (!employee) return;

    try {
      const updatePayload: UpdateEmployeePayload = {
        full_name: payload.full_name,
        gender: payload.gender,
        dob: payload.dob,
        id_card_number: payload.id_card_number,
        address: payload.address,
        phone_number: payload.phone_number,
        email: payload.email,
        commission_rate: payload.commission_rate,
        base_salary: payload.base_salary,
        base_allowance: payload.base_allowance,
        branch_id: payload.branch_id,
        role_id: payload.role_id,
      };

      const updated = await updateEmployee(employee.id, updatePayload);
      setEmployee(updated);
      setDialogOpen(false);
      toast.success("Cập nhật thông tin thành công");
    } catch (error) {
      logger.error("Failed to update employee:", error);
      toast.error("Không thể cập nhật thông tin");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (!employee) {
    return null;
  }

  return (
    <div className="container mx-auto py-6 space-y-8 max-w-screen-2xl">
      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/employees")}
            className="shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Chi tiết nhân viên
            </h1>
            <p className="text-muted-foreground">
              Thông tin chi tiết và lịch sử làm việc
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Employee Info Card */}
      <EmployeeInfoCard employee={employee} onEdit={handleEditClick} />

      {/* Tabs */}
      <EmployeeDetailTabs
        employee={employee}
        workShifts={workShifts}
        salaryHistory={salaryHistory}
        performanceStats={performanceStats}
        isEditing={isEditing}
        onEditToggle={handleEditToggle}
        onSave={handleSave}
      />

      {/* Edit Dialog */}
      <EmployeeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        employee={employee}
        onSave={handleSaveFromDialog}
      />
    </div>
  );
}
