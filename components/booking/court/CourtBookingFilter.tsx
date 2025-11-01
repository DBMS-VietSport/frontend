"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { mockCities, mockFacilities, mockCourtTypes } from "../mockData";

interface CourtBookingFilterProps {
  onFilterChange: (filters: {
    cityId: string;
    facilityId: string;
    courtTypeId: string;
    date: Date;
  }) => void;
}

export function CourtBookingFilter({
  onFilterChange,
}: CourtBookingFilterProps) {
  const [date, setDate] = React.useState<Date>(new Date());
  const [cityId, setCityId] = React.useState<string>("");
  const [facilityId, setFacilityId] = React.useState<string>("");
  const [courtTypeId, setCourtTypeId] = React.useState<string>("");

  const filteredFacilities = React.useMemo(() => {
    if (!cityId) return mockFacilities;
    return mockFacilities.filter((f) => f.cityId === cityId);
  }, [cityId]);

  // Handlers with cascading reset
  const handleCityChange = React.useCallback((value: string) => {
    setCityId(value);
    setFacilityId("");
    setCourtTypeId("");
  }, []);

  const handleFacilityChange = React.useCallback((value: string) => {
    setFacilityId(value);
    setCourtTypeId("");
  }, []);

  React.useEffect(() => {
    onFilterChange({
      cityId,
      facilityId,
      courtTypeId,
      date,
    });
  }, [cityId, facilityId, courtTypeId, date, onFilterChange]);

  return (
    <Card className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Date Picker */}
        <div className="space-y-2">
          <Label htmlFor="date">Ngày đặt</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date
                  ? format(date, "dd/MM/yyyy", { locale: vi })
                  : "Chọn ngày"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(newDate) => newDate && setDate(newDate)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* City */}
        <div className="space-y-2">
          <Label htmlFor="city">Tỉnh thành</Label>
          <Select value={cityId} onValueChange={handleCityChange}>
            <SelectTrigger id="city" className="w-full">
              <SelectValue placeholder="Chọn tỉnh thành" />
            </SelectTrigger>
            <SelectContent>
              {mockCities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Facility */}
        <div className="space-y-2">
          <Label htmlFor="facility">Cơ sở</Label>
          <Select
            value={facilityId}
            onValueChange={handleFacilityChange}
            disabled={!cityId}
          >
            <SelectTrigger id="facility" className="w-full">
              <SelectValue placeholder="Chọn cơ sở" />
            </SelectTrigger>
            <SelectContent>
              {filteredFacilities.map((facility) => (
                <SelectItem key={facility.id} value={facility.id}>
                  {facility.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Court Type */}
        <div className="space-y-2">
          <Label htmlFor="courtType">Loại sân</Label>
          <Select
            value={courtTypeId}
            onValueChange={setCourtTypeId}
            disabled={!cityId || !facilityId}
          >
            <SelectTrigger id="courtType" className="w-full">
              <SelectValue placeholder="Chọn loại sân" />
            </SelectTrigger>
            <SelectContent>
              {mockCourtTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}
