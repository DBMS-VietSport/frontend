"use client";

import * as React from "react";
import { Card } from "@/ui/card";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";
import { Avatar, AvatarFallback } from "@/ui/avatar";
import { Edit } from "lucide-react";
import type { Employee } from "@/features/employee/types";
import {
  getRoleColor,
  getStatusVariant,
  calculateAge,
  formatDate,
} from "@/features/employee/utils";

interface EmployeeInfoCardProps {
  employee: Employee;
  onEdit: () => void;
}

export function EmployeeInfoCard({ employee, onEdit }: EmployeeInfoCardProps) {
  const initials = employee.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const age = employee.dob ? calculateAge(employee.dob) : null;

  return (
    <Card className="p-6 rounded-2xl">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Avatar */}
        <Avatar className="h-20 w-20">
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>

        {/* Info */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold">{employee.full_name}</h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span>{employee.phone_number}</span>
                <span>•</span>
                <span>{employee.email}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Chức vụ</p>
              <Badge className={`${getRoleColor(employee.role_name)} mt-1`}>
                {employee.role_name}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chi nhánh</p>
              <p className="font-semibold mt-1">{employee.branch_name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Trạng thái</p>
              <Badge
                variant={getStatusVariant(employee.status)}
                className="mt-1"
              >
                {employee.status === "Working" ? "Đang làm việc" : "Nghỉ việc"}
              </Badge>
            </div>
            {employee.dob && (
              <div>
                <p className="text-sm text-muted-foreground">Ngày sinh</p>
                <p className="font-semibold mt-1">
                  {formatDate(employee.dob)}
                  {age && ` (${age} tuổi)`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
