"use client";

import { cn } from "@/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  /**
   * Size variant of the spinner
   * @default "md"
   */
  size?: "sm" | "md" | "lg";
  /**
   * Optional label text to display below the spinner
   */
  label?: string;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Variant style of the spinner
   * @default "border"
   */
  variant?: "border" | "icon";
}

const sizeClasses = {
  sm: { spinner: "h-4 w-4", icon: "h-4 w-4" },
  md: { spinner: "h-8 w-8", icon: "h-8 w-8" },
  lg: { spinner: "h-12 w-12", icon: "h-12 w-12" },
};

/**
 * A reusable loading spinner component.
 * Use this instead of inline spinner implementations for consistency.
 *
 * @example
 * ```tsx
 * // Simple spinner
 * <LoadingSpinner />
 *
 * // With label
 * <LoadingSpinner label="Đang tải..." />
 *
 * // Different size
 * <LoadingSpinner size="lg" />
 *
 * // Icon variant (uses Loader2 from lucide)
 * <LoadingSpinner variant="icon" />
 * ```
 */
export function LoadingSpinner({
  size = "md",
  label,
  className,
  variant = "border",
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
    >
      {variant === "border" ? (
        <div
          className={cn(
            "animate-spin rounded-full border-b-2 border-primary",
            sizeClasses[size].spinner
          )}
        />
      ) : (
        <Loader2
          className={cn(
            "animate-spin text-primary",
            sizeClasses[size].icon
          )}
        />
      )}
      {label && (
        <p className="text-sm text-muted-foreground">{label}</p>
      )}
    </div>
  );
}

interface PageLoadingStateProps {
  /**
   * Loading message to display
   * @default "Đang tải..."
   */
  message?: string;
  /**
   * Container height class
   * @default "py-12"
   */
  heightClass?: string;
}

/**
 * A full-width loading state component for page-level loading.
 * Center-aligned with configurable message.
 *
 * @example
 * ```tsx
 * if (isLoading) {
 *   return <PageLoadingState />;
 * }
 *
 * // Custom message
 * <PageLoadingState message="Đang tải dữ liệu..." />
 * ```
 */
export function PageLoadingState({
  message = "Đang tải...",
  heightClass = "py-12",
}: PageLoadingStateProps) {
  return (
    <div className={cn("flex items-center justify-center", heightClass)}>
      <LoadingSpinner label={message} />
    </div>
  );
}
