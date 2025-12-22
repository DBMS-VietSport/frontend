/**
 * React Query Client Configuration
 *
 * Centralized QueryClient setup with optimized defaults for the application.
 * Provides consistent caching, retry logic, and error handling.
 */

import { QueryClient } from "@tanstack/react-query";
import { ApiError, NetworkError } from "./client";

/**
 * Default stale time for queries (5 minutes)
 * Data is considered fresh for this duration
 */
const DEFAULT_STALE_TIME = 5 * 60 * 1000;

/**
 * Default cache time (30 minutes)
 * Unused data is garbage collected after this duration
 */
const DEFAULT_GC_TIME = 30 * 60 * 1000;

/**
 * Retry configuration
 * Determines if and how many times to retry failed requests
 */
function shouldRetry(failureCount: number, error: Error): boolean {
  // Don't retry on authentication errors
  if (error instanceof ApiError) {
    if (error.statusCode === 401 || error.statusCode === 403) {
      return false;
    }
    // Don't retry on client errors (4xx)
    if (error.statusCode >= 400 && error.statusCode < 500) {
      return false;
    }
  }

  // Retry up to 3 times for network/server errors
  return failureCount < 3;
}

/**
 * Retry delay with exponential backoff
 */
function retryDelay(attemptIndex: number): number {
  return Math.min(1000 * 2 ** attemptIndex, 30000);
}

/**
 * Create and configure the QueryClient
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data freshness
        staleTime: DEFAULT_STALE_TIME,
        gcTime: DEFAULT_GC_TIME,

        // Retry configuration
        retry: shouldRetry,
        retryDelay: retryDelay,

        // Refetch behavior
        refetchOnWindowFocus: false, // Disable auto-refetch on window focus
        refetchOnReconnect: true, // Refetch when network reconnects
        refetchOnMount: true, // Refetch when component mounts

        // Error handling - let components handle errors
        throwOnError: false,
      },
      mutations: {
        // Retry mutations only once for network errors
        retry: (failureCount, error) => {
          if (error instanceof NetworkError && failureCount < 1) {
            return true;
          }
          return false;
        },
        retryDelay: 1000,

        // Error handling
        throwOnError: false,
      },
    },
  });
}

/**
 * Singleton QueryClient instance
 * Use this for server-side rendering or when you need direct access
 */
let queryClient: QueryClient | null = null;

export function getQueryClient(): QueryClient {
  if (!queryClient) {
    queryClient = createQueryClient();
  }
  return queryClient;
}

/**
 * Query key factory helpers
 * Provides consistent query key structure across the app
 */
export const queryKeys = {
  // Booking domain
  bookings: {
    all: ["bookings"] as const,
    lists: () => [...queryKeys.bookings.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.bookings.lists(), filters] as const,
    details: () => [...queryKeys.bookings.all, "detail"] as const,
    detail: (id: number | string) =>
      [...queryKeys.bookings.details(), id] as const,
  },

  // Courts domain
  courts: {
    all: ["courts"] as const,
    lists: () => [...queryKeys.courts.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.courts.lists(), filters] as const,
    details: () => [...queryKeys.courts.all, "detail"] as const,
    detail: (id: number | string) =>
      [...queryKeys.courts.details(), id] as const,
    availability: (courtId: number | string, date: string) =>
      [...queryKeys.courts.all, "availability", courtId, date] as const,
  },

  // Services domain
  services: {
    all: ["services"] as const,
    lists: () => [...queryKeys.services.all, "list"] as const,
    list: (branchId?: number) =>
      [...queryKeys.services.lists(), { branchId }] as const,
    details: () => [...queryKeys.services.all, "detail"] as const,
    detail: (id: number | string) =>
      [...queryKeys.services.details(), id] as const,
  },

  // Customers domain
  customers: {
    all: ["customers"] as const,
    lists: () => [...queryKeys.customers.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.customers.lists(), filters] as const,
    details: () => [...queryKeys.customers.all, "detail"] as const,
    detail: (id: number | string) =>
      [...queryKeys.customers.details(), id] as const,
  },

  // Employees domain
  employees: {
    all: ["employees"] as const,
    lists: () => [...queryKeys.employees.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.employees.lists(), filters] as const,
    details: () => [...queryKeys.employees.all, "detail"] as const,
    detail: (id: number | string) =>
      [...queryKeys.employees.details(), id] as const,
  },

  // Invoices domain
  invoices: {
    all: ["invoices"] as const,
    lists: () => [...queryKeys.invoices.all, "list"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.invoices.lists(), filters] as const,
    details: () => [...queryKeys.invoices.all, "detail"] as const,
    detail: (id: number | string) =>
      [...queryKeys.invoices.details(), id] as const,
    forBooking: (bookingId: number | string) =>
      [...queryKeys.invoices.all, "booking", bookingId] as const,
  },
} as const;

export default getQueryClient;
