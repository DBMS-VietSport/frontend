/**
 * Axios API Client - Configured HTTP client
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const API_TIMEOUT = 30000;

// Custom error class for consistency
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Get auth token from storage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    const authData = localStorage.getItem('vietsport_auth');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed.token || null;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

/**
 * Axios instance with default config and interceptors
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor - Add auth token
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      // Server responded with error status
      throw new ApiError(
        error.response.status,
        error.response.statusText || 'Request failed',
        error.response.data
      );
    } else if (error.request) {
      // Request was made but no response
      throw new ApiError(0, 'Network error: No response from server');
    } else {
      // Something else happened
      throw new ApiError(0, error.message || 'Unknown error occurred');
    }
  }
);

export default apiClient;
