"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountdownBadgeProps {
  minutesLeft: number;
  onExpire?: () => void;
  className?: string;
}

export function CountdownBadge({
  minutesLeft: initialMinutes,
  onExpire,
  className,
}: CountdownBadgeProps) {
  const [timeLeft, setTimeLeft] = React.useState(initialMinutes);

  React.useEffect(() => {
    if (timeLeft <= 0) {
      onExpire?.();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        const newTime = prev - 1 / 60; // decrement by 1 second (1/60 minute)
        if (newTime <= 0) {
          onExpire?.();
          return 0;
        }
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, onExpire]);

  const minutes = Math.floor(timeLeft);
  const seconds = Math.floor((timeLeft - minutes) * 60);

  const isWarning = timeLeft <= 5 && timeLeft > 2;
  const isCritical = timeLeft <= 2;

  const formatTime = () => {
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${seconds}s`;
  };

  return (
    <Badge
      variant={isCritical ? "destructive" : isWarning ? "default" : "secondary"}
      className={cn(
        "flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5",
        className
      )}
    >
      <Clock className="h-3.5 w-3.5" />
      <span>{formatTime()}</span>
    </Badge>
  );
}
