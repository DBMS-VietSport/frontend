/**
 * React Query Hooks for Booking Operations
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import {
    getBranchCourtBookings,
    getCourtBookingById,
    cancelCourtBooking,
    getCourtTypes,
    getBranchCourts,
    getBranchServices,
    getCourtBookingSlots,
    getCustomers,
    getEmployees,
    getBranches,
    getCustomerCourtBookings,
    createCourtBooking,
    createCourtBookingClone,
    updateCourtBooking,
    getAvailableTrainers,
    getServiceBookingDetails,
    getCourtBookingServiceBookings as getServiceBookingInfo,
    createServiceBooking,
    createServiceBookingClone,
    calculateSlotsPrice,
    type CourtBookingRequest,
    type ServiceBookingRequest,
} from './booking';

// Query Keys
export const bookingKeys = {
    all: ['bookings'] as const,
    lists: () => [...bookingKeys.all, 'list'] as const,
    customer: (customerId: number) => [...bookingKeys.all, 'customer', customerId] as const,
    list: (filters: any) => [...bookingKeys.lists(), filters] as const,
    details: () => [...bookingKeys.all, 'detail'] as const,
    detail: (id: number) => [...bookingKeys.details(), id] as const,
    courtTypes: ['courtTypes'] as const,
    courts: (branchId?: number, courtTypeId?: number) => ['courts', branchId, courtTypeId] as const,
    services: (branchId: number) => ['services', branchId] as const,
    slots: (courtId: number, date: string) => ['slots', courtId, date] as const,
    customers: ['customers'] as const,
    employees: (role?: string) => ['employees', role] as const,
    branches: ['branches'] as const,
};

/**
 * Get court bookings for a branch
 */
export function useCourtBookings(branchId: number, filters?: {
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
}) {
    return useQuery({
        queryKey: bookingKeys.list({ branchId, ...filters }),
        queryFn: () => getBranchCourtBookings(branchId, filters),
        enabled: !!branchId,
    });
}

/**
 * Get court bookings for a customer
 */
export function useCustomerCourtBookings(customerId: number, branchId: number = 1) {
    return useQuery({
        queryKey: [...bookingKeys.customer(customerId), branchId],
        queryFn: () => getCustomerCourtBookings(customerId, branchId),
        enabled: !!customerId && !!branchId,
    });
}

/**
 * Get a single booking by ID
 */
export function useCourtBooking(bookingId: number, options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>) {
    return useQuery({
        queryKey: bookingKeys.detail(bookingId),
        queryFn: () => getCourtBookingById(bookingId),
        enabled: !!bookingId,
        ...options,
    });
}

/**
 * Get court types
 */
export function useCourtTypes() {
    return useQuery({
        queryKey: bookingKeys.courtTypes,
        queryFn: getCourtTypes,
        staleTime: 5 * 60 * 1000, // 5 minutes - court types rarely change
    });
}

/**
 * Get courts for a branch
 */
export function useCourts(branchId?: number, courtTypeId?: number) {
    return useQuery({
        queryKey: bookingKeys.courts(branchId, courtTypeId),
        queryFn: () => getBranchCourts(branchId!, courtTypeId),
        enabled: !!branchId,
    });
}

/**
 * Get services for a branch
 */
export function useBranchServices(branchId: number) {
    return useQuery({
        queryKey: bookingKeys.services(branchId),
        queryFn: () => getBranchServices(branchId),
        enabled: !!branchId,
    });
}

/**
 * Get booked slots for a court on a date
 */
export function useCourtBookingSlots(courtId: number, date: string) {
    return useQuery({
        queryKey: bookingKeys.slots(courtId, date),
        queryFn: () => getCourtBookingSlots(courtId, date),
        enabled: !!courtId && !!date,
    });
}

/**
 * Get customers
 */
export function useCustomers() {
    return useQuery({
        queryKey: bookingKeys.customers,
        queryFn: getCustomers,
    });
}

/**
 * Get employees (optionally filtered by role)
 */
export function useEmployees(role?: string) {
    return useQuery({
        queryKey: bookingKeys.employees(role),
        queryFn: () => getEmployees(role),
    });
}

/**
 * Get branches
 */
export function useBranches() {
    return useQuery({
        queryKey: bookingKeys.branches,
        queryFn: getBranches,
        staleTime: 10 * 60 * 1000, // 10 minutes - branches rarely change
    });
}

/**
 * Create court booking mutation
 */
export function useCreateCourtBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: CourtBookingRequest) => createCourtBooking(request),
        onSuccess: () => {
            // Invalidate and refetch booking lists
            queryClient.invalidateQueries({ queryKey: bookingKeys.all });
        },
    });
}

/**
 * Create court booking mutation using clone endpoint (for testing)
 */
export function useCreateCourtBookingClone() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: CourtBookingRequest) => createCourtBookingClone(request),
        onSuccess: () => {
            // Invalidate and refetch booking lists
            queryClient.invalidateQueries({ queryKey: bookingKeys.all });
        },
    });
}

/**
 * Update court booking mutation
 */
export function useUpdateCourtBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            bookingId,
            courtId,
            bookingDate,
            slots,
            branchId,
        }: {
            bookingId: number;
            courtId: number;
            bookingDate: string;
            slots: string;
            branchId: number;
        }) => updateCourtBooking(bookingId, courtId, bookingDate, slots, branchId),
        onSuccess: (_, variables) => {
            // Invalidate specific booking and lists
            queryClient.invalidateQueries({ queryKey: bookingKeys.detail(variables.bookingId) });
            queryClient.invalidateQueries({ queryKey: bookingKeys.all });
        },
    });
}

/**
 * Cancel court booking mutation
 */
export function useCancelCourtBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (bookingId: number) => cancelCourtBooking(bookingId),
        onSuccess: (_, bookingId) => {
            // Invalidate specific booking and lists
            queryClient.invalidateQueries({ queryKey: bookingKeys.detail(bookingId) });
            queryClient.invalidateQueries({ queryKey: bookingKeys.all });
        },
    });
}

/**
 * Create service booking mutation
 */
export function useCreateServiceBooking() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: ServiceBookingRequest) => createServiceBooking(request),
        onSuccess: (_, variables) => {
            // Invalidate the related court booking
            queryClient.invalidateQueries({ queryKey: bookingKeys.detail(variables.courtBookingId) });
        },
    });
}

/**
 * Create service booking mutation using clone endpoint (for testing)
 */
export function useCreateServiceBookingClone() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (request: ServiceBookingRequest) => createServiceBookingClone(request),
        onSuccess: (_, variables) => {
            // Invalidate the related court booking
            queryClient.invalidateQueries({ queryKey: bookingKeys.detail(variables.courtBookingId) });
        },
    });
}
/**
 * Calculate slots price mutation
 */
export function useCalculatePrice() {
    return useMutation({
        mutationFn: ({
            courtId,
            date,
            slots,
        }: {
            courtId: number;
            date: string;
            slots: { start_time: string; end_time: string }[];
        }) => calculateSlotsPrice(courtId, date, slots),
    });
}

/**
 * Get service booking details
 */
export function useServiceBookingDetails(serviceBookingId: number) {
    return useQuery({
        queryKey: ['service-booking-details', serviceBookingId],
        queryFn: () => getServiceBookingDetails(serviceBookingId),
        enabled: !!serviceBookingId,
    });
}

/**
 * Get service booking info for a court booking
 */
export function useServiceBookingInfo(courtBookingId: number) {
    return useQuery({
        queryKey: ['service-booking-info', courtBookingId],
        queryFn: () => getServiceBookingInfo(courtBookingId),
        enabled: !!courtBookingId,
    });
}

/**
 * Get available trainers for a court booking
 */
export function useAvailableTrainers(courtBookingId: number) {
    return useQuery({
        queryKey: ['available-trainers', courtBookingId],
        queryFn: () => getAvailableTrainers(courtBookingId),
        enabled: !!courtBookingId,
    });
}
