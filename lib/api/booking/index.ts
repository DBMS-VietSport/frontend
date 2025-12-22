/**
 * Booking API Module Exports
 */

// Service functions
export {
  fetchBookings,
  fetchBookingById,
  updateCourtTime,
  updateBookingServices,
  cancelBooking,
  createBooking,
  fetchBranches,
  fetchCourtTypes,
  fetchCourts,
  fetchCustomers,
  fetchEmployees,
  type BookingsFilter,
  type CreateBookingInput,
} from "./service";

// React Query hooks
export {
  // Query hooks
  useBookingsQuery,
  useBookingDetailQuery,
  useBranchesQuery,
  useCourtTypesQuery,
  useCourtsQuery,
  useCustomersQuery,
  useEmployeesQuery,
  // Mutation hooks
  useCreateBookingMutation,
  useUpdateCourtTimeMutation,
  useUpdateServicesMutation,
  useCancelBookingMutation,
  // Utility hooks
  usePrefetchBookingDetail,
  useInvalidateBookings,
} from "./hooks";
