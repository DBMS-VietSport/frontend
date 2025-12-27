"use client";

import * as React from "react";
import { Check, Circle } from "lucide-react";
import { cn } from "@/utils";
import { useAuth } from "@/features/auth/lib/useAuth";

interface BookingProgressProps {
  currentStep: number;
}

const steps = [
  {
    id: 1,
    label: { customer: "Đặt sân", receptionist: "Lập phiếu đặt sân" },
    key: "court",
  },
  {
    id: 2,
    label: { customer: "Đặt dịch vụ", receptionist: "Lập phiếu dịch vụ" },
    key: "services",
  },
  {
    id: 3,
    label: { customer: "Thanh toán", receptionist: "Thanh toán" },
    key: "payment",
  },
];

export function BookingProgress({ currentStep }: BookingProgressProps) {
  const { user } = useAuth();
  const isReceptionist = user?.role === "receptionist";
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => {
        const isCompleted = step.id < currentStep;
        const isCurrent = step.id === currentStep;

        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2">
              {isCompleted ? (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                  <Check className="h-4 w-4" />
                </div>
              ) : (
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors",
                    isCurrent
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-muted text-muted-foreground"
                  )}
                >
                  {isCurrent ? (
                    <span className="text-sm font-semibold">{step.id}</span>
                  ) : (
                    <Circle className="h-4 w-4" />
                  )}
                </div>
              )}
              <span
                className={cn(
                  "text-sm font-medium transition-colors hidden sm:inline-block",
                  isCurrent && "text-primary",
                  isCompleted && "text-primary",
                  !isCurrent && !isCompleted && "text-muted-foreground"
                )}
              >
                {isReceptionist ? step.label.receptionist : step.label.customer}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "h-px w-8 transition-colors hidden sm:block",
                  isCompleted ? "bg-primary" : "bg-border"
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}
