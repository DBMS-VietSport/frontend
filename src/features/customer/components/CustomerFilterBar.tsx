"use client";

import * as React from "react";
import { Card } from "@/ui/card";
import { Input } from "@/ui/input";
import { Button } from "@/ui/button";
import { Search, UserPlus } from "lucide-react";

interface CustomerFilterBarProps {
  searchText: string;
  onSearchChange: (text: string) => void;
  onAddClick: () => void;
}

export function CustomerFilterBar({
  searchText,
  onSearchChange,
  onAddClick,
}: CustomerFilterBarProps) {
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
        <Button onClick={onAddClick} className="sm:w-auto w-full">
          <UserPlus className="h-4 w-4 mr-2" />
          Thêm khách hàng
        </Button>
      </div>
    </Card>
  );
}
