"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface ColumnDef<T> {
  /** Unique key for the column, used for accessing data and React keys */
  accessorKey: keyof T | string;
  /** Header label */
  header: React.ReactNode;
  /** Custom cell renderer. Receives the row data. */
  cell?: (row: T) => React.ReactNode;
  /** Optional className for the header cell */
  headerClassName?: string;
  /** Optional className for the body cell */
  cellClassName?: string;
}

export interface DataTableProps<T> {
  /** Array of data to display */
  data: T[];
  /** Column definitions */
  columns: ColumnDef<T>[];
  /** Whether the data is loading */
  isLoading?: boolean;
  /** Number of skeleton rows to show when loading */
  loadingRows?: number;
  /** Message to show when data is empty */
  emptyMessage?: string;
  /** Icon to show in empty state */
  emptyIcon?: React.ReactNode;
  /** Callback when a row is clicked */
  onRowClick?: (row: T) => void;
  /** Key extractor for each row. Defaults to using `id` property */
  rowKey?: (row: T) => string | number;
  /** Additional className for the table container */
  className?: string;
}

// -----------------------------------------------------------------------------
// DataTable Component
// -----------------------------------------------------------------------------

export function DataTable<T extends Record<string, unknown>>({
  data,
  columns,
  isLoading = false,
  loadingRows = 5,
  emptyMessage = "Không có dữ liệu",
  emptyIcon,
  onRowClick,
  rowKey,
  className,
}: DataTableProps<T>) {
  // Helper to get cell value using accessorKey
  const getCellValue = (row: T, accessorKey: string): React.ReactNode => {
    const keys = accessorKey.split(".");
    let value: unknown = row;
    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        value = undefined;
        break;
      }
    }
    if (value === null || value === undefined) return "-";
    if (typeof value === "string" || typeof value === "number") return value;
    return String(value);
  };

  // Helper to get row key
  const getRowKey = (row: T, index: number): string | number => {
    if (rowKey) return rowKey(row);
    if ("id" in row) return row.id as string | number;
    return index;
  };

  return (
    <div className={cn("rounded-md border", className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, idx) => (
              <TableHead key={String(col.accessorKey) || idx} className={col.headerClassName}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            // Loading skeleton rows
            Array.from({ length: loadingRows }).map((_, rowIdx) => (
              <TableRow key={`skeleton-${rowIdx}`}>
                {columns.map((col, colIdx) => (
                  <TableCell key={colIdx} className={col.cellClassName}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            // Empty state
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  {emptyIcon}
                  <span>{emptyMessage}</span>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            // Data rows
            data.map((row, rowIdx) => (
              <TableRow
                key={getRowKey(row, rowIdx)}
                onClick={() => onRowClick?.(row)}
                className={cn(onRowClick && "cursor-pointer")}
              >
                {columns.map((col, colIdx) => (
                  <TableCell key={colIdx} className={col.cellClassName}>
                    {col.cell ? col.cell(row) : getCellValue(row, String(col.accessorKey))}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
