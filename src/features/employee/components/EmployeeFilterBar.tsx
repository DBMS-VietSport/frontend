"use client";

import * as React from "react";
import { Card } from "@/ui/card";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Search, UserPlus } from "lucide-react";
import { mockRoles } from "@/features/employee/mockRepo";

interface EmployeeFilterBarProps {
  searchText: string;
  selectedRole: string | null;
  onSearchChange: (text: string) => void;
  onRoleChange: (role: string | null) => void;
  onAddClick: () => void;
}

export function EmployeeFilterBar({
  searchText,
  selectedRole,
  onSearchChange,
  onRoleChange,
  onAddClick,
}: EmployeeFilterBarProps) {
  return (
    <Card className="p-4 rounded-2xl">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên hoặc số điện thoại"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={selectedRole || "all"}
          onValueChange={(value) =>
            onRoleChange(value === "all" ? null : value)
          }
        >
          <SelectTrigger className="sm:w-[200px] w-full">
            <SelectValue placeholder="Tất cả chức vụ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả chức vụ</SelectItem>
            {mockRoles.map((role) => (
              <SelectItem key={role.id} value={role.name}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={onAddClick} className="sm:w-auto w-full">
          <UserPlus className="h-4 w-4 mr-2" />
          Thêm nhân viên
        </Button>
      </div>
    </Card>
  );
}
