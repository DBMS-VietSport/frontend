"use client";

import { Card } from "@/ui/card";
import { Separator } from "@/ui/separator";
import { Calendar, Clock, MapPin, BadgeDollarSign } from "lucide-react";
import type { BookingConfirmationData } from "@/features/booking/mock/bookingFlowStore";

interface BookingInfoCardProps {
  data: BookingConfirmationData;
  formattedDate: string;
}

export function BookingInfoCard({ data, formattedDate }: BookingInfoCardProps) {
  return (
    <Card className="p-6 space-y-4">
      <h3 className="text-lg font-semibold">Thông tin sân</h3>
      <Separator />
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Cơ sở</p>
            <p className="font-medium">{data.branch}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <BadgeDollarSign className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Sân</p>
            <p className="font-medium">
              {data.courtName} ({data.courtType})
            </p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Ngày</p>
            <p className="font-medium">{formattedDate}</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-sm text-muted-foreground">Khung giờ</p>
            <p className="font-medium">{data.timeRange}</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
