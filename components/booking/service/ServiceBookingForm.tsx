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
import { Minus, Plus, Info } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { ServiceItem, Coach } from "../types";

interface ServiceBookingFormProps {
  services: ServiceItem[];
  coaches: Coach[];
  onServiceUpdate: (
    id: string,
    quantity: number,
    durationHours?: number,
    hourEntries?: Array<{ id: string; hours: number }>
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
  const facilityItems = services.filter((s) => s.category === "facility");
  const drinkItems = services.filter((s) => s.category === "drink");

  // Group coaches by sport
  const coachesBySport = coaches.reduce((acc, coach) => {
    if (!acc[coach.sport]) {
      acc[coach.sport] = [];
    }
    acc[coach.sport].push(coach);
    return acc;
  }, {} as Record<string, Coach[]>);

  const handleCoachHoursChange = (coach: Coach, delta: number) => {
    const currentHours = coach.quantity || 0;
    const newHours = Math.max(0, currentHours + delta);
    // For coaches, quantity represents hours
    onCoachUpdate(coach.id, newHours, 1);
  };

  const handleCoachDetailClick = (coach: Coach) => {
    setSelectedCoach(coach);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <Accordion
        type="multiple"
        defaultValue={["equipment", "coach", "facility", "drinks"]}
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
                    {sportCoaches.map((coach) => {
                      const coachHours = coach.quantity || 0;
                      const coachTotal =
                        coachHours > 0 ? coach.pricePerHour * coachHours : 0;

                      return (
                        <Card
                          key={coach.id}
                          className="overflow-hidden relative"
                        >
                          <CardContent className="p-4">
                            <div className="space-y-3">
                              {/* Coach Info with Info Button */}
                              <div className="flex items-start gap-3">
                                <Avatar className="size-16 shrink-0">
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
                                  <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-semibold truncate">
                                        {coach.name}
                                      </h5>
                                      <p className="text-sm font-medium text-primary">
                                        {formatCurrency(coach.pricePerHour)}/giờ
                                      </p>
                                    </div>
                                    {/* Info Icon Button */}
                                    <Popover>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="size-8 shrink-0"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                          }}
                                        >
                                          <Info className="h-4 w-4" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-80">
                                        <div className="space-y-3">
                                          <div className="flex items-center gap-3">
                                            <Avatar className="size-12">
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
                                            <div>
                                              <p className="font-semibold">
                                                {coach.name}
                                              </p>
                                              <p className="text-sm text-muted-foreground">
                                                {coach.sport}
                                              </p>
                                            </div>
                                          </div>
                                          {coach.degree && (
                                            <div>
                                              <p className="text-xs text-muted-foreground">
                                                Bằng cấp
                                              </p>
                                              <p className="text-sm font-medium">
                                                {coach.degree}
                                              </p>
                                            </div>
                                          )}
                                          {coach.bio && (
                                            <div>
                                              <p className="text-xs text-muted-foreground">
                                                Giới thiệu
                                              </p>
                                              <p className="text-sm">
                                                {coach.bio}
                                              </p>
                                            </div>
                                          )}
                                          {coach.studentsTrained && (
                                            <div>
                                              <p className="text-xs text-muted-foreground">
                                                Học viên đã đào tạo
                                              </p>
                                              <p className="text-sm font-medium">
                                                {coach.studentsTrained}+ học
                                                viên
                                              </p>
                                            </div>
                                          )}
                                          {coach.expertise &&
                                            coach.expertise.length > 0 && (
                                              <div>
                                                <p className="text-xs text-muted-foreground mb-1">
                                                  Chuyên môn
                                                </p>
                                                <div className="flex flex-wrap gap-1">
                                                  {coach.expertise.map(
                                                    (skill, idx) => (
                                                      <Badge
                                                        key={idx}
                                                        variant="secondary"
                                                        className="text-xs"
                                                      >
                                                        {skill}
                                                      </Badge>
                                                    )
                                                  )}
                                                </div>
                                              </div>
                                            )}
                                        </div>
                                      </PopoverContent>
                                    </Popover>
                                  </div>
                                </div>
                              </div>

                              <div className="h-px bg-border" />

                              {/* Hour Controls */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium">
                                    Số giờ dạy:
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() =>
                                        handleCoachHoursChange(coach, -1)
                                      }
                                      disabled={coachHours === 0}
                                      className="size-8"
                                    >
                                      <Minus className="h-4 w-4" />
                                    </Button>
                                    <span className="text-base font-semibold w-12 text-center">
                                      {coachHours}h
                                    </span>
                                    <Button
                                      variant="outline"
                                      size="icon"
                                      onClick={() =>
                                        handleCoachHoursChange(coach, 1)
                                      }
                                      className="size-8"
                                    >
                                      <Plus className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                {coachHours > 0 && (
                                  <div className="pt-2 border-t">
                                    <div className="flex items-center justify-between">
                                      <span className="text-sm text-muted-foreground">
                                        Tổng:
                                      </span>
                                      <span className="text-base font-bold text-primary">
                                        {formatCurrency(coachTotal)}
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Facility Section */}
        <AccordionItem value="facility">
          <AccordionTrigger className="text-xl font-bold">
            Thuê cơ sở vật chất
          </AccordionTrigger>
          <AccordionContent>
            <ServiceCategorySection
              items={facilityItems}
              title="Cơ sở vật chất"
              onUpdateQuantity={onServiceUpdate}
            />
          </AccordionContent>
        </AccordionItem>

        {/* Drink Section */}
        <AccordionItem value="drinks">
          <AccordionTrigger className="text-xl font-bold">
            Mua nước
          </AccordionTrigger>
          <AccordionContent>
            <ServiceCategorySection
              items={drinkItems}
              title="Mua nước"
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
