"use client";

import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ServiceCategorySection } from "./ServiceCategorySection";
import { CoachDetailDialog } from "./CoachDetailDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Minus, Plus, Info } from "lucide-react";
import type { ServiceItem, Coach } from "./types";

interface ServiceBookingFormProps {
  services: ServiceItem[];
  coaches: Coach[];
  onServiceUpdate: (
    id: string,
    quantity: number,
    durationHours?: number
  ) => void;
  onCoachUpdate: (id: string, quantity: number, durationHours?: number) => void;
}

export function ServiceBookingForm({
  services,
  coaches,
  onServiceUpdate,
  onCoachUpdate,
}: ServiceBookingFormProps) {
  const [selectedCoach, setSelectedCoach] = React.useState<Coach | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const equipmentItems = services.filter((s) => s.category === "equipment");
  const facilityItems = services.filter(
    (s) => s.category === "facility" || s.category === "drink"
  );

  // Group coaches by sport
  const coachesBySport = coaches.reduce((acc, coach) => {
    if (!acc[coach.sport]) {
      acc[coach.sport] = [];
    }
    acc[coach.sport].push(coach);
    return acc;
  }, {} as Record<string, Coach[]>);

  const handleQuantityChange = (coach: Coach, delta: number) => {
    const newQuantity = Math.max(0, coach.quantity + delta);
    onCoachUpdate(coach.id, newQuantity, coach.durationHours);
  };

  const handleDurationChange = (coach: Coach, hours: string) => {
    const durationHours = parseInt(hours) || 1;
    onCoachUpdate(coach.id, coach.quantity, durationHours);
  };

  const handleCoachDetailClick = (coach: Coach) => {
    setSelectedCoach(coach);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Accordion
        type="multiple"
        defaultValue={["equipment", "coach", "facility"]}
      >
        {/* Equipment Section */}
        <AccordionItem value="equipment">
          <AccordionTrigger className="text-xl font-bold">
            Thuê dụng cụ
          </AccordionTrigger>
          <AccordionContent>
            <ServiceCategorySection
              items={equipmentItems}
              title="Thuê dụng cụ"
              onUpdateQuantity={onServiceUpdate}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Coach Section */}
        <AccordionItem value="coach">
          <AccordionTrigger className="text-xl font-bold">
            Thuê huấn luyện viên
          </AccordionTrigger>
          <AccordionContent>
            <div className="space-y-6">
              {Object.entries(coachesBySport).map(([sport, sportCoaches]) => (
                <div key={sport} className="space-y-4">
                  <h4 className="font-semibold text-lg text-muted-foreground">
                    {sport}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sportCoaches.map((coach) => (
                      <Card key={coach.id} className="overflow-hidden">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Coach Info */}
                            <div className="flex items-start gap-3">
                              <Avatar className="size-16">
                                <AvatarImage
                                  src={coach.avatarUrl}
                                  alt={coach.name}
                                />
                                <AvatarFallback>
                                  {coach.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-semibold truncate">
                                  {coach.name}
                                </h5>
                                <p className="text-sm text-muted-foreground">
                                  {formatCurrency(coach.pricePerHour)}/giờ
                                </p>
                              </div>
                            </div>

                            {/* Controls */}
                            <div className="space-y-2">
                              {/* Hour selector */}
                              {coach.quantity > 0 && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                                    Số giờ:
                                  </span>
                                  <Select
                                    value={
                                      coach.durationHours?.toString() || "1"
                                    }
                                    onValueChange={(value) =>
                                      handleDurationChange(coach, value)
                                    }
                                  >
                                    <SelectTrigger className="w-full">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {[1, 2, 3, 4, 5, 6].map((hour) => (
                                        <SelectItem
                                          key={hour}
                                          value={hour.toString()}
                                        >
                                          {hour} giờ
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              )}

                              {/* Quantity counter */}
                              <div className="flex items-center gap-3">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    handleQuantityChange(coach, -1)
                                  }
                                  disabled={coach.quantity === 0}
                                  className="size-8"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="text-base font-semibold flex-1 text-center">
                                  {coach.quantity}h
                                </span>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleQuantityChange(coach, 1)}
                                  className="size-8"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Detail button */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCoachDetailClick(coach)}
                                className="w-full"
                              >
                                <Info className="h-4 w-4 mr-2" />
                                Chi tiết
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Facility & Drink Section */}
        <AccordionItem value="facility">
          <AccordionTrigger className="text-xl font-bold">
            Thuê cơ sở vật chất & Mua nước
          </AccordionTrigger>
          <AccordionContent>
            <ServiceCategorySection
              items={facilityItems}
              title="Cơ sở vật chất & Nước"
              onUpdateQuantity={onServiceUpdate}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* Coach Detail Dialog */}
      <CoachDetailDialog
        coach={selectedCoach}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
