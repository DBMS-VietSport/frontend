"use client";

import { useState, useCallback, useMemo } from "react";
import { useDebouncedValue } from "./useDebouncedValue";

/**
 * Generic filter state type
 */
export interface TableFilterState<T = Record<string, unknown>> {
  searchText: string;
  sortField: string | null;
  sortDirection: "asc" | "desc";
  page: number;
  pageSize: number;
  filters: T;
}

/**
 * Options for useTableFilter hook
 */
export interface UseTableFilterOptions<T> {
  initialFilters?: Partial<T>;
  initialPageSize?: number;
  searchDebounce?: number;
}

/**
 * Hook for managing table filtering, sorting, and pagination state
 *
 * @example
 * const {
 *   searchText,
 *   debouncedSearchText,
 *   setSearchText,
 *   sortField,
 *   sortDirection,
 *   handleSort,
 *   page,
 *   pageSize,
 *   setPage,
 *   filters,
 *   setFilter,
 *   resetFilters,
 * } = useTableFilter<{ status: string | null }>();
 */
export function useTableFilter<T extends Record<string, unknown> = Record<string, unknown>>(
  options: UseTableFilterOptions<T> = {}
) {
  const {
    initialFilters = {} as Partial<T>,
    initialPageSize = 10,
    searchDebounce = 300,
  } = options;

  // Search state
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebouncedValue(searchText, searchDebounce);

  // Sort state
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  // Custom filters state
  const [filters, setFilters] = useState<T>(initialFilters as T);

  // Handle sort column click
  const handleSort = useCallback((field: string) => {
    setSortField((prevField) => {
      if (prevField === field) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        return field;
      }
      setSortDirection("asc");
      return field;
    });
    setPage(1); // Reset to first page on sort change
  }, []);

  // Set individual filter
  const setFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1); // Reset to first page on filter change
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setSearchText("");
    setSortField(null);
    setSortDirection("asc");
    setPage(1);
    setFilters(initialFilters as T);
  }, [initialFilters]);

  // Combined state object
  const state = useMemo<TableFilterState<T>>(
    () => ({
      searchText: debouncedSearchText,
      sortField,
      sortDirection,
      page,
      pageSize,
      filters,
    }),
    [debouncedSearchText, sortField, sortDirection, page, pageSize, filters]
  );

  return {
    // Search
    searchText,
    debouncedSearchText,
    setSearchText,

    // Sort
    sortField,
    sortDirection,
    handleSort,

    // Pagination
    page,
    pageSize,
    setPage,
    setPageSize,

    // Custom filters
    filters,
    setFilter,
    setFilters,

    // Actions
    resetFilters,

    // Combined state
    state,
  };
}

export default useTableFilter;
