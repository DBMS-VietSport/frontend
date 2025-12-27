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
import { Search, Plus, Package } from "lucide-react";
import type { ServiceRentalType } from "@/features/services/types";

interface ServiceFilterBarProps {
  searchText: string;
  selectedType: ServiceRentalType | "Tất cả";
  onSearchChange: (text: string) => void;
  onTypeChange: (type: ServiceRentalType | "Tất cả") => void;
  onAddClick: () => void;
  lowStockCount?: number;
}

const rentalTypes: Array<ServiceRentalType | "Tất cả"> = [
  "Tất cả",
  "Dụng cụ",
  "Nhân sự",
  "Tiện ích",
];

export function ServiceFilterBar({
  searchText,
  selectedType,
  onSearchChange,
  onTypeChange,
  onAddClick,
  lowStockCount = 0,
}: ServiceFilterBarProps) {
  return (
    <Card className="p-4 rounded-2xl">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên dịch vụ"
              value={searchText}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedType} onValueChange={onTypeChange}>
            <SelectTrigger className="sm:w-[200px] w-full">
              <SelectValue placeholder="Loại dịch vụ" />
            </SelectTrigger>
            <SelectContent>
              {rentalTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={onAddClick} className="sm:w-auto w-full">
            <Plus className="h-4 w-4 mr-2" />
            Thêm dịch vụ
          </Button>
        </div>

        {lowStockCount > 0 && (
          <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 p-3 rounded-lg">
            <Package className="h-4 w-4" />
            <span>
              <span className="font-semibold">{lowStockCount}</span> dịch vụ
              đang dưới ngưỡng tồn kho cảnh báo
            </span>
          </div>
        )}
      </div>
    </Card>
  );
}
