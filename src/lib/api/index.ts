/**
 * API Module Exports
 */

// Export axios client instance and error class
export { apiClient, ApiError } from './client';

// Export booking API functions
export * from './booking';

// Export auth API functions  
export * from './auth';

// Export React Query provider and hooks
export { QueryProvider } from './query-provider';
export * from './use-bookings';
