"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Users, Award } from "lucide-react";
import type { Coach } from "../types";

interface CoachDetailDialogProps {
  coach: Coach | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CoachDetailDialog({
  coach,
  open,
  onOpenChange,
}: CoachDetailDialogProps) {
  if (!coach) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4 mb-2">
            <Avatar className="size-16">
              <AvatarImage src={coach.avatarUrl} alt={coach.name} />
              <AvatarFallback>
                {coach.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-2xl">{coach.name}</DialogTitle>
              <DialogDescription className="text-base">
                Huấn luyện viên {coach.sport}
              </DialogDescription>
              <p className="text-lg font-bold text-primary mt-1">
                {formatCurrency(coach.pricePerHour)}/giờ
              </p>
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-4" />

        <div className="space-y-6">
          {/* Degree */}
          {coach.degree && (
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 bg-primary/10 rounded-lg">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Bằng cấp
                </p>
                <p className="text-base font-semibold">{coach.degree}</p>
              </div>
            </div>
          )}

          {/* Bio */}
          {coach.bio && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Giới thiệu
              </p>
              <p className="text-base leading-relaxed">{coach.bio}</p>
            </div>
          )}

          {/* Students Trained */}
          {coach.studentsTrained && (
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Học viên đã đào tạo
                </p>
                <p className="text-base font-semibold">
                  {coach.studentsTrained}+ học viên
                </p>
              </div>
            </div>
          )}

          {/* Expertise */}
          {coach.expertise && coach.expertise.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Award className="h-5 w-5 text-primary" />
                <p className="text-sm font-medium text-muted-foreground">
                  Chuyên môn
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {coach.expertise.map((skill, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
