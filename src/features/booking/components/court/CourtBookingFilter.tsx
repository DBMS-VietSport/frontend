"use client";

import * as React from "react";
import { Card, CardContent } from "@/ui/card";
import { Label } from "@/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/ui/select";
import { Calendar } from "@/ui/calendar";
import { Button } from "@/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/ui/popover";
import { CalendarIcon } from "lucide-react";
import { useAuth } from "@/features/auth/lib/useAuth";
import { isCustomer, ROLES } from "@/lib/role-labels";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/utils";
import { CustomerSelector, type Customer } from "../shared/CustomerSelector";

interface CourtBookingFilterProps {
  onFilterChange: (filters: {
    cityId: string;
    facilityId: string;
    courtTypeId: string;
    date: Date;
  }) => void;
  // Data props
  cities?: any[];
  branches?: any[];
  courtTypes?: any[];
  // Customer selection props (for receptionist)
  selectedCustomerId?: string | null;
  onCustomerChange?: (customerId: string | null) => void;
  customers?: Customer[];
  selectedFilters?: {
    cityId: string;
    facilityId: string;
    courtTypeId: string;
    date: Date;
  };
}

export function CourtBookingFilter({
  onFilterChange,
  cities = [],
  branches = [],
  courtTypes = [],
  selectedCustomerId,
  onCustomerChange,
  customers = [],
  selectedFilters,
}: CourtBookingFilterProps) {
  const { user } = useAuth();
  const isCustomerUser = isCustomer(user);
  const isReceptionist = user?.role === ROLES.RECEPTIONIST || user?.role?.toLowerCase() === "receptionist";
  // Use props as source of truth with fallbacks
  const currentFilters = selectedFilters || {
    cityId: "",
    facilityId: user?.branchId?.toString() || "",
    courtTypeId: "",
    date: new Date(),
  };

  const { cityId, facilityId, courtTypeId, date } = currentFilters;

  const filteredBranches = React.useMemo(() => {
    if (!cityId) return branches;
    return branches;
  }, [cityId, branches]);

  // Handlers that call parent with full filter object
  const handleCityChange = (value: string) => {
    onFilterChange({
      ...currentFilters,
      cityId: value,
      facilityId: "",
      courtTypeId: "",
    });
  };

  const handleFacilityChange = (value: string) => {
    onFilterChange({
      ...currentFilters,
      facilityId: value,
      courtTypeId: "",
    });
  };

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      onFilterChange({
        ...currentFilters,
        date: newDate,
      });
    }
  };

  const handleCourtTypeChange = (value: string) => {
    onFilterChange({
      ...currentFilters,
      courtTypeId: value,
    });
  };

  // Calculate grid columns based on role
  const gridCols = React.useMemo(() => {
    if (isCustomerUser) {
      // Customer: Tỉnh thành, Cơ sở, Ngày đặt, Loại sân = 4 columns
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    } else if (isReceptionist) {
      // Receptionist: Cơ sở, Khách hàng, Ngày đặt, Loại sân = 4 columns
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-4";
    } else {
      // Other roles: Cơ sở mặc định, Ngày đặt, Loại sân = 3 columns
      return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    }
  }, [isCustomerUser, isReceptionist]);

  return (
    <Card className="p-6 rounded-2xl">
      <CardContent className="px-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Bộ lọc</h3>
          </div>
          <div className={cn("grid gap-4", gridCols)}>
            {/* 1. Cơ sở */}
            {isCustomerUser ? (
              <>
                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="city">Tỉnh thành</Label>
                  <Select value={cityId} onValueChange={handleCityChange}>
                    <SelectTrigger id="city">
                      <SelectValue placeholder="Chọn tỉnh thành" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.length > 0 ? (
                        cities.map((city: any) => (
                          <SelectItem key={city.id} value={city.id.toString()}>
                            {city.name}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="none" disabled>Hệ thống - Miền Nam</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* Facility */}
                <div className="space-y-2">
                  <Label htmlFor="facility">Cơ sở</Label>
                  <Select
                    value={facilityId}
                    onValueChange={handleFacilityChange}
                  >
                    <SelectTrigger id="facility">
                      <SelectValue placeholder="Chọn cơ sở" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredBranches.map((branch: any) => (
                        <SelectItem key={branch.id} value={branch.id.toString()}>
                          {branch.name}
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
                  {user?.branchName || branches.find(b => b.id.toString() === facilityId)?.name || "N/A"}
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
                    onSelect={handleDateChange}
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
                onValueChange={handleCourtTypeChange}
                disabled={isCustomerUser && !facilityId}
              >
                <SelectTrigger id="courtType">
                  <SelectValue placeholder="Chọn loại sân" />
                </SelectTrigger>
                <SelectContent>
                  {courtTypes.map((type: any) => (
                    <SelectItem key={type.id} value={type.id.toString()}>
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
