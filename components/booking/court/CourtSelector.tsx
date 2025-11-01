"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { mockCourts } from "../mockData";
import type { Court } from "../types";

interface CourtSelectorProps {
  courtTypeId: string;
  facilityId: string;
  selectedCourtId: string | null;
  onCourtSelect: (court: Court) => void;
}

export function CourtSelector({
  courtTypeId,
  facilityId,
  selectedCourtId,
  onCourtSelect,
}: CourtSelectorProps) {
  const filteredCourts = React.useMemo(() => {
    if (!courtTypeId) return [];
    return mockCourts.filter(
      (court) =>
        court.type === courtTypeId &&
        (facilityId ? court.facilityId === facilityId : true)
    );
  }, [courtTypeId, facilityId]);

  if (!courtTypeId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Vui lòng chọn loại sân để xem danh sách sân
      </div>
    );
  }

  if (filteredCourts.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Không có sân nào khả dụng
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Chọn sân</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {filteredCourts.map((court) => (
          <Card
            key={court.id}
            className={cn(
              "relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-md border-2 p-0 group",
              selectedCourtId === court.id
                ? "ring-2 ring-primary border-primary shadow-lg"
                : "hover:border-primary/50"
            )}
            onClick={() => onCourtSelect(court)}
          >
            <div className="aspect-4/3 relative">
              <img
                src={court.imageUrl}
                alt={court.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-black/20 transition-opacity duration-300 group-hover:opacity-90" />
              <div className="absolute inset-0 border-2 border-transparent rounded-xl">
                {selectedCourtId === court.id && (
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-full p-2 shadow-lg animate-in zoom-in-50 duration-200">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h4 className="text-white font-semibold text-base drop-shadow-lg">
                  {court.name}
                </h4>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
