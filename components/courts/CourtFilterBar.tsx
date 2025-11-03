"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus } from "lucide-react";
import { courtTypes } from "@/lib/mock";

interface CourtFilterBarProps {
  searchText: string;
  selectedType: number | null;
  onSearchChange: (text: string) => void;
  onTypeChange: (typeId: number | null) => void;
  onAddClick: () => void;
}

export function CourtFilterBar({
  searchText,
  selectedType,
  onSearchChange,
  onTypeChange,
  onAddClick,
}: CourtFilterBarProps) {
  return (
    <Card className="p-4 rounded-2xl">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo mã sân hoặc tên sân"
            value={searchText}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={selectedType?.toString() || "all"}
          onValueChange={(value) =>
            onTypeChange(value === "all" ? null : parseInt(value))
          }
        >
          <SelectTrigger className="sm:w-[200px] w-full">
            <SelectValue placeholder="Tất cả loại sân" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả loại sân</SelectItem>
            {courtTypes.map((type) => (
              <SelectItem key={type.id} value={type.id.toString()}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={onAddClick} className="sm:w-auto w-full">
          <Plus className="h-4 w-4 mr-2" />
          Thêm sân mới
        </Button>
      </div>
    </Card>
  );
}
