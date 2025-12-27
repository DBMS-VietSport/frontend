import * as React from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/ui/breadcrumb";
import { cn } from "@/utils";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface BreadcrumbItemDef {
  /** Label to display */
  label: string;
  /** URL to link to. If undefined, item is treated as current page */
  href?: string;
}

export interface PageHeaderProps {
  /** Main title of the page */
  title: string;
  /** Optional subtitle / description */
  subtitle?: string;
  /** Optional breadcrumb items */
  breadcrumbs?: BreadcrumbItemDef[];
  /** Optional action buttons/elements to display on the right */
  action?: React.ReactNode;
  /** Additional className for the container */
  className?: string;
}

// -----------------------------------------------------------------------------
// PageHeader Component
// -----------------------------------------------------------------------------

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  action,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((item, index) => (
              <React.Fragment key={index}>
                <BreadcrumbItem>
                  {item.href ? (
                    <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Title Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
