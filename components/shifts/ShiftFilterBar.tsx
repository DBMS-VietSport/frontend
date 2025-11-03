'use client';

import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ShiftFilters } from '@/lib/shifts/types';
import { getWeeksInMonth } from '@/lib/shifts/utils';

interface ShiftFilterBarProps {
  filters: ShiftFilters;
  onFiltersChange: (filters: ShiftFilters) => void;
}

export function ShiftFilterBar({ filters, onFiltersChange }: ShiftFilterBarProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 3 }, (_, i) => currentYear - 1 + i);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Get available weeks for selected month
  const weeks = getWeeksInMonth(filters.year, filters.month);
  
  const handleYearChange = (value: string) => {
    const newYear = parseInt(value);
    onFiltersChange({ ...filters, year: newYear, week: 1 });
  };
  
  const handleMonthChange = (value: string) => {
    const newMonth = parseInt(value);
    onFiltersChange({ ...filters, month: newMonth, week: 1 });
  };
  
  const handleWeekChange = (value: string) => {
    const newWeek = parseInt(value);
    onFiltersChange({ ...filters, week: newWeek });
  };
  
  return (
    <Card className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Year selector */}
        <div className="space-y-2">
          <Label htmlFor="year-select">Năm</Label>
          <Select value={filters.year.toString()} onValueChange={handleYearChange}>
            <SelectTrigger id="year-select">
              <SelectValue placeholder="Chọn năm" />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Month selector */}
        <div className="space-y-2">
          <Label htmlFor="month-select">Tháng</Label>
          <Select value={filters.month.toString()} onValueChange={handleMonthChange}>
            <SelectTrigger id="month-select">
              <SelectValue placeholder="Chọn tháng" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month) => (
                <SelectItem key={month} value={month.toString()}>
                  Tháng {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Week selector */}
        <div className="space-y-2">
          <Label htmlFor="week-select">Tuần</Label>
          <Select value={filters.week.toString()} onValueChange={handleWeekChange}>
            <SelectTrigger id="week-select">
              <SelectValue placeholder="Chọn tuần" />
            </SelectTrigger>
            <SelectContent>
              {weeks.map((week) => (
                <SelectItem key={week.week} value={week.week.toString()}>
                  Tuần {week.week} ({week.startDate} → {week.endDate})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
