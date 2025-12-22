"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { FileText, Search, Users, Calendar, LucideIcon } from "lucide-react";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface EmptyStateProps {
  /**
   * Title text to display
   * @default "Không tìm thấy dữ liệu"
   */
  title?: string;
  /**
   * Optional description below the title
   */
  description?: string;
  /**
   * Icon to display
   * @default FileText
   */
  icon?: LucideIcon;
  /**
   * Hide the icon
   * @default false
   */
  hideIcon?: boolean;
  /**
   * Optional action element (e.g., buttons)
   */
  action?: React.ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Preset variant for common use cases
   */
  variant?: "default" | "search" | "table" | "list";
}

// Preset configurations for common variants
const variantConfig: Record<string, { icon: LucideIcon; title: string }> = {
  default: { icon: FileText, title: "Không tìm thấy dữ liệu" },
  search: { icon: Search, title: "Không tìm thấy kết quả" },
  table: { icon: FileText, title: "Chưa có dữ liệu" },
  list: { icon: Calendar, title: "Danh sách trống" },
};

// -----------------------------------------------------------------------------
// EmptyState Component
// -----------------------------------------------------------------------------

/**
 * A reusable empty state component for displaying "no data" messages.
 * Use this instead of inline empty state implementations for consistency.
 *
 * @example
 * ```tsx
 * // Simple usage
 * <EmptyState title="Không tìm thấy booking" />
 *
 * // With description
 * <EmptyState
 *   title="Không tìm thấy kết quả"
 *   description="Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm"
 * />
 *
 * // With action
 * <EmptyState
 *   title="Chưa có dữ liệu"
 *   action={<Button>Thêm mới</Button>}
 * />
 *
 * // Using variant preset
 * <EmptyState variant="search" />
 * ```
 */
export function EmptyState({
  title,
  description,
  icon,
  hideIcon = false,
  action,
  className,
  variant = "default",
}: EmptyStateProps) {
  const config = variantConfig[variant];
  const Icon = icon ?? config.icon;
  const displayTitle = title ?? config.title;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 gap-3",
        className
      )}
    >
      {!hideIcon && (
        <div className="rounded-full bg-muted p-3">
          <Icon className="h-6 w-6 text-muted-foreground" />
        </div>
      )}
      <div className="space-y-1">
        <p className="text-muted-foreground font-medium">{displayTitle}</p>
        {description && (
          <p className="text-sm text-muted-foreground/80">{description}</p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// -----------------------------------------------------------------------------
// TableEmptyState - Convenience wrapper for table usage
// -----------------------------------------------------------------------------

export interface TableEmptyStateProps {
  /**
   * Name of the entity (e.g., "booking", "khách hàng", "sân")
   */
  entityName: string;
  /**
   * Additional CSS classes
   */
  className?: string;
}

/**
 * A convenience component for empty table states.
 *
 * @example
 * ```tsx
 * <TableEmptyState entityName="booking" />
 * // Renders: "Không tìm thấy booking nào"
 * ```
 */
export function TableEmptyState({ entityName, className }: TableEmptyStateProps) {
  return (
    <EmptyState
      title={`Không tìm thấy ${entityName} nào`}
      hideIcon
      className={className}
    />
  );
}
