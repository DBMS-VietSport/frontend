"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { useAuth } from "@/lib/auth/useAuth";
import { CustomerSelector, type Customer } from "../shared/CustomerSelector";

interface CourtBookingFilterProps {
  onFilterChange: (filters: {
    cityId: string;
    facilityId: string;
    courtTypeId: string;
    date: Date;
  }) => void;
  // Customer selection props (for receptionist)
  selectedCustomerId?: string | null;
  onCustomerChange?: (customerId: string | null) => void;
  customers?: Customer[];
}

export function CourtBookingFilter({
  onFilterChange,
  selectedCustomerId,
  onCustomerChange,
  customers = [],
}: CourtBookingFilterProps) {
  const { user } = useAuth();
  const isCustomer = user?.role === "customer";
  const isReceptionist = user?.role === "receptionist";
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

  // Calculate grid columns based on role
  const gridCols = React.useMemo(() => {
    if (isCustomer) {
      // Customer: Tỉnh thành, Cơ sở, Ngày đặt, Loại sân = 4 columns
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    } else if (isReceptionist) {
      // Receptionist: Cơ sở, Khách hàng, Ngày đặt, Loại sân = 4 columns
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    } else {
      // Other roles: Cơ sở mặc định, Ngày đặt, Loại sân = 3 columns
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  }, [isCustomer, isReceptionist]);

  return (
    <Card className="p-6 rounded-2xl">
      <CardContent className="px-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Bộ lọc</h3>
          </div>
          <div className={cn("grid gap-4", gridCols)}>
            {/* 1. Cơ sở */}
            {isCustomer ? (
              <>
                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city">Tỉnh thành</Label>
                  <Select value={cityId} onValueChange={handleCityChange}>
                    <SelectTrigger id="city">
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
                    <SelectTrigger id="facility">
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
              </>
            ) : (
              <div className="space-y-2">
                <Label>Cơ sở</Label>
                <div
                  aria-disabled
                  className="rounded-md border px-3 py-2 text-sm bg-muted text-muted-foreground opacity-60 cursor-not-allowed select-none"
                >
                  {user?.branch ?? "N/A"}
                </div>
              </div>
            )}

            {/* 2. Khách hàng (chỉ cho receptionist) */}
            {isReceptionist && onCustomerChange && (
              <div className="space-y-2">
                <Label htmlFor="customer">Khách hàng</Label>
                <CustomerSelector
                  value={selectedCustomerId || null}
                  onChange={onCustomerChange}
                  customers={customers}
                  placeholder="Chọn khách hàng..."
                />
              </div>
            )}

            {/* 3. Ngày đặt */}
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

            {/* 4. Loại sân */}
            <div className="space-y-2">
              <Label htmlFor="courtType">Loại sân</Label>
              <Select
                value={courtTypeId}
                onValueChange={setCourtTypeId}
                disabled={isCustomer ? !cityId || !facilityId : false}
              >
                <SelectTrigger id="courtType">
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
        </div>
      </CardContent>
    </Card>
  );
}
