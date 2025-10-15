/**
 * API Client Service
 *
 * Centralized API client for making HTTP requests to the backend.
 * Uses axios with interceptors for:
 * - Automatic JWT token attachment
 * - Response error handling
 * - Request/response transformations
 */

import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

/**
 * API Response Types
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}

/**
 * API Client Class
 *
 * Provides methods for all backend API endpoints with automatic
 * authentication token handling.
 */
class ApiClient {
  private client: AxiosInstance;
  private tokenKey = 'assetbridge_token';

  constructor() {
    // Create axios instance with base configuration
    this.client = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001',
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10 second timeout
    });

    // Add request interceptor to attach JWT token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        // Handle 401 Unauthorized - clear token and redirect to login
        if (error.response?.status === 401) {
          this.clearToken();
          // Only redirect if not already on login page
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Token Management
   */

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
  }

  /**
   * Authentication Endpoints
   */

  async login(email: string, password: string) {
    const response = await this.client.post<ApiResponse<{ token: string; user: Record<string, unknown> }>>('/api/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  async logout() {
    const response = await this.client.post<ApiResponse<void>>('/api/auth/logout');
    this.clearToken();
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get<ApiResponse<Record<string, unknown>>>('/api/auth/me');
    return response.data;
  }

  async changePassword(currentPassword: string, newPassword: string) {
    const response = await this.client.post<ApiResponse<void>>('/api/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  }

  /**
   * User Management Endpoints
   */

  async getUsers(params?: { page?: number; limit?: number; search?: string }) {
    const response = await this.client.get<ApiResponse<{
      users: Array<Record<string, unknown>>;
      total: number;
      page: number;
      limit: number;
    }>>('/api/users', { params });
    return response.data;
  }

  async createUser(name: string, email: string) {
    const response = await this.client.post<ApiResponse<{
      user: Record<string, unknown>;
      generatedPassword: string;
    }>>('/api/users', {
      name,
      email,
    });
    return response.data;
  }

  async getUserById(id: string) {
    const response = await this.client.get<ApiResponse<Record<string, unknown>>>(`/api/users/${id}`);
    return response.data;
  }

  async updateUser(id: string, data: { name?: string; email?: string }) {
    const response = await this.client.put<ApiResponse<Record<string, unknown>>>(`/api/users/${id}`, data);
    return response.data;
  }

  async deleteUser(id: string) {
    const response = await this.client.delete<ApiResponse<void>>(`/api/users/${id}`);
    return response.data;
  }

  /**
   * Error Handler Helper
   *
   * Extracts error message from axios error response
   */
  getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.error || error.message || 'An error occurred';
    }
    return error instanceof Error ? error.message : 'An unknown error occurred';
  }
}

// Export singleton instance
export const api = new ApiClient();
