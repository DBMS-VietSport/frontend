/**
 * Booking React Query Hooks
 *
 * Custom hooks for booking data fetching and mutations using React Query.
 * These hooks provide caching, loading states, and error handling out of the box.
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
} from "@tanstack/react-query";

import { queryKeys } from "@/lib/api/queryClient";
import type {
  BookingRow,
  BookingDetailView,
  UpdateCourtTimePayload,
  UpdateServicesPayload,
} from "@/types/booking";

import {
  fetchBookings,
  fetchBookingById,
  updateCourtTime,
  updateBookingServices,
  cancelBooking,
  fetchBranches,
  fetchCourtTypes,
  fetchCourts,
  fetchCustomers,
  fetchEmployees,
  type BookingsFilter,
  type CreateBookingInput,
  createBooking,
} from "./service";

// -----------------------------------------------------------------------------
// Query Hooks
// -----------------------------------------------------------------------------

/**
 * Fetch list of bookings with filters
 */
export function useBookingsQuery(
  filters?: BookingsFilter,
  options?: Omit<UseQueryOptions<BookingRow[], Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.bookings.list(filters),
    queryFn: () => fetchBookings(filters),
    ...options,
  });
}

/**
 * Fetch a single booking by ID
 */
export function useBookingDetailQuery(
  id: number | undefined,
  options?: Omit<UseQueryOptions<BookingDetailView | null, Error>, "queryKey" | "queryFn">
) {
  return useQuery({
    queryKey: queryKeys.bookings.detail(id ?? 0),
    queryFn: () => (id ? fetchBookingById(id) : Promise.resolve(null)),
    enabled: !!id,
    ...options,
  });
}

/**
 * Fetch branches (reference data)
 */
export function useBranchesQuery() {
  return useQuery({
    queryKey: ["branches"],
    queryFn: fetchBranches,
    staleTime: Infinity, // Reference data rarely changes
  });
}

/**
 * Fetch court types (reference data)
 */
export function useCourtTypesQuery() {
  return useQuery({
    queryKey: ["courtTypes"],
    queryFn: fetchCourtTypes,
    staleTime: Infinity,
  });
}

/**
 * Fetch courts, optionally filtered by branch
 */
export function useCourtsQuery(branchId?: number) {
  return useQuery({
    queryKey: queryKeys.courts.list({ branchId }),
    queryFn: () => fetchCourts(branchId),
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Fetch customers (reference data)
 */
export function useCustomersQuery() {
  return useQuery({
    queryKey: queryKeys.customers.lists(),
    queryFn: fetchCustomers,
    staleTime: 60 * 1000,
  });
}

/**
 * Fetch employees (reference data)
 */
export function useEmployeesQuery() {
  return useQuery({
    queryKey: queryKeys.employees.lists(),
    queryFn: fetchEmployees,
    staleTime: 60 * 1000,
  });
}

// -----------------------------------------------------------------------------
// Mutation Hooks
// -----------------------------------------------------------------------------

/**
 * Create a new booking
 */
export function useCreateBookingMutation(
  options?: Omit<UseMutationOptions<{ id: number }, Error, CreateBookingInput>, "mutationFn">
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      // Invalidate bookings list to refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
    },
    ...options,
  });
}

/**
 * Update court time for a booking
 */
export function useUpdateCourtTimeMutation(
  options?: Omit<
    UseMutationOptions<void, Error, { bookingId: number; payload: UpdateCourtTimePayload }>,
    "mutationFn"
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, payload }) => updateCourtTime(bookingId, payload),
    onSuccess: (_, variables) => {
      // Invalidate specific booking and list
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.detail(variables.bookingId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
    },
    ...options,
  });
}

/**
 * Update services for a booking
 */
export function useUpdateServicesMutation(
  options?: Omit<
    UseMutationOptions<void, Error, { bookingId: number; payload: UpdateServicesPayload }>,
    "mutationFn"
  >
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, payload }) => updateBookingServices(bookingId, payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.detail(variables.bookingId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
    },
    ...options,
  });
}

/**
 * Cancel a booking
 */
export function useCancelBookingMutation(
  options?: Omit<UseMutationOptions<void, Error, number>, "mutationFn">
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: (_, bookingId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.bookings.detail(bookingId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.bookings.lists() });
    },
    ...options,
  });
}

// -----------------------------------------------------------------------------
// Utility Hooks
// -----------------------------------------------------------------------------

/**
 * Prefetch booking detail (for hover/anticipatory loading)
 */
export function usePrefetchBookingDetail() {
  const queryClient = useQueryClient();

  return (id: number) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.bookings.detail(id),
      queryFn: () => fetchBookingById(id),
      staleTime: 60 * 1000,
    });
  };
}

/**
 * Invalidate all booking queries
 */
export function useInvalidateBookings() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.bookings.all });
  };
}
