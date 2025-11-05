"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  date: Date;
  onDateChange: (newDate: Date) => void;
}

export function MonthSwitcher({ date, onDateChange }: Props) {
  const handlePrev = () => {
    onDateChange(new Date(date.getFullYear(), date.getMonth() - 1, 1));
  };
  const handleNext = () => {
    onDateChange(new Date(date.getFullYear(), date.getMonth() + 1, 1));
  };

  const monthLabel = date.toLocaleString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={handlePrev}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span className="w-40 text-center font-semibold">{monthLabel}</span>
      <Button variant="outline" size="icon" onClick={handleNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
