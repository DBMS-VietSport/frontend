/**
 * API Client - Centralized REST API utilities
 *
 * This module provides a typed, consistent way to make HTTP requests.
 * Currently configured for mock data, can be easily switched to real backend.
 */

// API Configuration
const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_URL || "/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
} as const;

// Error types
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NetworkError extends Error {
  constructor(message: string = "Network error occurred") {
    super(message);
    this.name = "NetworkError";
  }
}

// Response type wrapper
export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

// Request options
export interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  timeout?: number;
}

/**
 * Get auth token from storage
 * TODO: Integrate with useAuth hook for proper token management
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;

  try {
    const authData = localStorage.getItem("vietsport_auth");
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
 * Build request headers with auth token
 */
function buildHeaders(customHeaders?: Record<string, string>): HeadersInit {
  const headers: Record<string, string> = {
    ...API_CONFIG.headers,
    ...customHeaders,
  };

  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Build full URL from endpoint
 */
function buildUrl(endpoint: string, params?: Record<string, string>): string {
  const url = new URL(endpoint, API_CONFIG.baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value);
      }
    });
  }

  return url.toString();
}

/**
 * Handle API response
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorData: unknown;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }

    throw new ApiError(
      response.status,
      `HTTP ${response.status}: ${response.statusText}`,
      errorData
    );
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return await response.json();
  } catch {
    return undefined as T;
  }
}

/**
 * Create fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  timeout: number
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timeoutId);
  }
}

// HTTP Methods

/**
 * GET request
 */
export async function get<T>(
  endpoint: string,
  params?: Record<string, string>,
  options?: RequestOptions
): Promise<T> {
  const url = buildUrl(endpoint, params);

  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: "GET",
        headers: buildHeaders(options?.headers),
        signal: options?.signal,
      },
      options?.timeout || API_CONFIG.timeout
    );

    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new NetworkError("Request timeout");
    }
    throw new NetworkError(
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

/**
 * POST request
 */
export async function post<TResponse, TBody = unknown>(
  endpoint: string,
  body?: TBody,
  options?: RequestOptions
): Promise<TResponse> {
  const url = buildUrl(endpoint);

  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: "POST",
        headers: buildHeaders(options?.headers),
        body: body ? JSON.stringify(body) : undefined,
        signal: options?.signal,
      },
      options?.timeout || API_CONFIG.timeout
    );

    return handleResponse<TResponse>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new NetworkError("Request timeout");
    }
    throw new NetworkError(
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

/**
 * PUT request
 */
export async function put<TResponse, TBody = unknown>(
  endpoint: string,
  body?: TBody,
  options?: RequestOptions
): Promise<TResponse> {
  const url = buildUrl(endpoint);

  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: "PUT",
        headers: buildHeaders(options?.headers),
        body: body ? JSON.stringify(body) : undefined,
        signal: options?.signal,
      },
      options?.timeout || API_CONFIG.timeout
    );

    return handleResponse<TResponse>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new NetworkError("Request timeout");
    }
    throw new NetworkError(
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

/**
 * PATCH request
 */
export async function patch<TResponse, TBody = unknown>(
  endpoint: string,
  body?: TBody,
  options?: RequestOptions
): Promise<TResponse> {
  const url = buildUrl(endpoint);

  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: "PATCH",
        headers: buildHeaders(options?.headers),
        body: body ? JSON.stringify(body) : undefined,
        signal: options?.signal,
      },
      options?.timeout || API_CONFIG.timeout
    );

    return handleResponse<TResponse>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new NetworkError("Request timeout");
    }
    throw new NetworkError(
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

/**
 * DELETE request
 */
export async function del<TResponse = void>(
  endpoint: string,
  options?: RequestOptions
): Promise<TResponse> {
  const url = buildUrl(endpoint);

  try {
    const response = await fetchWithTimeout(
      url,
      {
        method: "DELETE",
        headers: buildHeaders(options?.headers),
        signal: options?.signal,
      },
      options?.timeout || API_CONFIG.timeout
    );

    return handleResponse<TResponse>(response);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new NetworkError("Request timeout");
    }
    throw new NetworkError(
      error instanceof Error ? error.message : "Unknown error"
    );
  }
}

// Export all methods as a single object for convenience
export const apiClient = {
  get,
  post,
  put,
  patch,
  del,
};

export default apiClient;
