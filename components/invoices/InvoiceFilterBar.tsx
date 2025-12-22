"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { CalendarIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils/date";
import type { InvoiceSearchFilters } from "@/lib/mock/invoiceManagerRepo";
import type { MockUser } from "@/lib/mock/authMock";

interface InvoiceFilterBarProps {
  filters: InvoiceSearchFilters;
  onFiltersChange: (filters: InvoiceSearchFilters) => void;
  dateFrom?: Date;
  dateTo?: Date;
  onDateFromChange: (date: Date | undefined) => void;
  onDateToChange: (date: Date | undefined) => void;
  onSearch: () => void;
  cashierOptions: MockUser[];
}

export function InvoiceFilterBar({
  filters,
  onFiltersChange,
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange,
  onSearch,
  cashierOptions,
}: InvoiceFilterBarProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bộ lọc</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Date From */}
          <div className="space-y-2">
            <Label>Từ ngày</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? (
                    formatDate(dateFrom)
                  ) : (
                    <span>Chọn ngày</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={onDateFromChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Date To */}
          <div className="space-y-2">
            <Label>Đến ngày</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? (
                    formatDate(dateTo)
                  ) : (
                    <span>Chọn ngày</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={onDateToChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Trạng thái</Label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) =>
                onFiltersChange({ ...filters, status: value as any })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="Paid">Đã thanh toán</SelectItem>
                <SelectItem value="Unpaid">Chưa thanh toán</SelectItem>
                <SelectItem value="Cancelled">Đã hủy</SelectItem>
                <SelectItem value="Refunded">Đã hoàn tiền</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cashier */}
          <div className="space-y-2">
            <Label>Thu ngân</Label>
            <Select
              value={filters.cashierName || "all"}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  cashierName: value === "all" ? undefined : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                {cashierOptions.map((cashier) => (
                  <SelectItem key={cashier.username} value={cashier.fullName}>
                    {cashier.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Text */}
          <div className="space-y-2 md:col-span-2 lg:col-span-4">
            <Label>Tìm kiếm (Mã HĐ / Tên KH)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Nhập mã hóa đơn hoặc tên khách hàng"
                value={filters.searchText || ""}
                onChange={(e) =>
                  onFiltersChange({ ...filters, searchText: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    onSearch();
                  }
                }}
              />
              <Button onClick={onSearch}>
                <Search className="h-4 w-4 mr-2" />
                Tìm kiếm
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
