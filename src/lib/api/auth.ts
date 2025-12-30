/**
 * Authentication API
 */

import { apiClient } from './client';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthUser {
  id: string;
  username: string;
  role: string;
  fullName?: string;
  branchId?: number;
  branchName?: string;
  customerId?: number;
  employeeId?: number;
}

export interface LoginResponse {
  access_token: string;
  user: AuthUser;
}

export interface RegisterRequest {
  username: string;
  password: string;
  email: string;
  fullName: string;
}

/**
 * Login with username and password
 */
export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const response = await apiClient.post('/auth/login', credentials);
  return response.data;
}

/**
 * Register a new user account
 */
export async function register(data: RegisterRequest): Promise<any> {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
}

/**
 * Logout current user
 */
export async function logout(): Promise<void> {
  const response = await apiClient.post('/auth/logout');
  return response.data;
}

/**
 * Refresh authentication token
 */
export async function refreshToken(): Promise<{ token: string }> {
  const response = await apiClient.post('/auth/refresh');
  return response.data;
}

/**
 * Get current user profile
 */
export async function getCurrentUser(): Promise<any> {
  const response = await apiClient.get('/auth/me');
  return response.data;
}