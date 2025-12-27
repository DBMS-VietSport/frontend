/**
 * API Module Exports
 *
 * Central export point for all API-related utilities and hooks.
 */

// Client utilities
export {
  apiClient,
  get,
  post,
  put,
  patch,
  del,
  ApiError,
  NetworkError,
  type ApiResponse,
  type RequestOptions,
} from "./client";

// React Query configuration
export {
  createQueryClient,
  getQueryClient,
  queryKeys,
} from "./queryClient";

// Provider component
export { QueryProvider } from "./QueryProvider";
