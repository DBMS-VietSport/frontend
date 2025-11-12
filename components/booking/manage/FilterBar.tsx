"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/booking/pricing";
import { mockCourtTypes } from "@/lib/booking/mockRepo";
import type { PaymentStatusUI } from "@/lib/booking/types";

export interface FilterValues {
  date: Date | null;
  courtTypeId: number | null;
  paymentStatus: PaymentStatusUI | null;
  searchText: string;
}

interface FilterBarProps {
  filters: FilterValues;
  onFiltersChange: (filters: FilterValues) => void;
}

export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
  const [searchInput, setSearchInput] = React.useState(filters.searchText);

  // Debounce search
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== filters.searchText) {
        onFiltersChange({ ...filters, searchText: searchInput });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleDateChange = (date: Date | undefined) => {
    onFiltersChange({ ...filters, date: date || null });
  };

  const handleCourtTypeChange = (value: string) => {
    onFiltersChange({
      ...filters,
      courtTypeId: value === "all" ? null : parseInt(value),
    });
  };

  const handlePaymentStatusChange = (value: string) => {
    onFiltersChange({
      ...filters,
      paymentStatus: value === "all" ? null : (value as PaymentStatusUI),
    });
  };

  const handleClearFilters = () => {
    setSearchInput("");
    onFiltersChange({
      date: new Date(),
      courtTypeId: null,
      paymentStatus: null,
      searchText: "",
    });
  };

  const hasActiveFilters =
    filters.courtTypeId !== null ||
    filters.paymentStatus !== null ||
    filters.searchText !== "";

  return (
    <Card className="p-6 rounded-2xl">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Bộ lọc</h3>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="h-7"
            >
              <X className="h-4 w-4 mr-2" />
              Xóa bộ lọc
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date Filter */}
          <div className="space-y-2">
            <Label>Ngày đặt</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.date ? formatDate(filters.date) : "Chọn ngày"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={filters.date || undefined}
                  onSelect={handleDateChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Court Type Filter */}
          <div className="space-y-2">
            <Label>Loại sân</Label>
            <Select
              value={filters.courtTypeId?.toString() || "all"}
              onValueChange={handleCourtTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả loại sân" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả loại sân</SelectItem>
                {mockCourtTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status Filter */}
          <div className="space-y-2">
            <Label>Trạng thái thanh toán</Label>
            <Select
              value={filters.paymentStatus || "all"}
              onValueChange={handlePaymentStatusChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="Chưa thanh toán">Chưa thanh toán</SelectItem>
                <SelectItem value="Đã thanh toán">Đã thanh toán</SelectItem>
                <SelectItem value="Đã hủy">Đã hủy</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Input */}
          <div className="space-y-2">
            <Label>Tìm kiếm</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Khách hàng, mã đơn..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
