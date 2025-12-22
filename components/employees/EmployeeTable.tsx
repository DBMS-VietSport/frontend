"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Users } from "lucide-react";
import { EmptyState } from "@/components/shared";
import type { Employee } from "@/lib/employees/types";
import { getRoleColor, getStatusVariant } from "@/lib/employees/utils";

interface EmployeeTableProps {
  employees: Employee[];
  onEdit?: (employee: Employee) => void;
}

export function EmployeeTable({ employees, onEdit }: EmployeeTableProps) {
  const router = useRouter();

  const handleRowClick = (employee: Employee) => {
    router.push(`/employees/${employee.id}`);
  };

  const handleEditClick = (e: React.MouseEvent, employee: Employee) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(employee);
    }
  };

  if (employees.length === 0) {
    return (
      <Card className="p-12 rounded-2xl">
        <EmptyState
          icon={Users}
          title="Không tìm thấy nhân viên phù hợp"
          description="Thử tìm kiếm với từ khóa khác hoặc thêm nhân viên mới"
        />
      </Card>
    );
  }

  return (
    <Card className="rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Số điện thoại</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Chức vụ</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.map((employee) => (
              <TableRow
                key={employee.id}
                className="cursor-pointer"
                onClick={() => handleRowClick(employee)}
              >
                <TableCell className="font-medium">
                  {employee.full_name}
                </TableCell>
                <TableCell>{employee.phone_number}</TableCell>
                <TableCell>{employee.email}</TableCell>
                <TableCell>
                  <Badge className={getRoleColor(employee.role_name)}>
                    {employee.role_name}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(employee.status)}>
                    {employee.status === "Working"
                      ? "Đang làm việc"
                      : "Nghỉ việc"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => handleEditClick(e, employee)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
