"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { CourtCard } from "./CourtCard";
import type { CourtCardData } from "@/lib/courts/types";

interface CourtCardGridProps {
  courts: CourtCardData[];
  onCourtClick: (court: CourtCardData) => void;
}

export function CourtCardGrid({ courts, onCourtClick }: CourtCardGridProps) {
  if (courts.length === 0) {
    return (
      <Card className="p-12 rounded-2xl">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="rounded-full bg-muted p-6 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-12 h-12 text-muted-foreground"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" />
              <path d="M3 9h18" />
              <path d="M9 21V9" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold mb-2">
            Không tìm thấy sân phù hợp
          </h3>
          <p className="text-muted-foreground max-w-md">
            Thử tìm kiếm với từ khóa khác hoặc thêm sân mới
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {courts.map((court) => (
        <CourtCard
          key={court.id}
          court={court}
          onClick={() => onCourtClick(court)}
        />
      ))}
    </div>
  );
}
