/**
 * AuthContext Tests
 *
 * Tests for authentication context and state management
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { api } from '../services/api';

// Mock the API
vi.mock('../services/api', () => ({
  api: {
    login: vi.fn(),
    logout: vi.fn(),
    getCurrentUser: vi.fn(),
    getToken: vi.fn(),
    setToken: vi.fn(),
    clearToken: vi.fn(),
    getErrorMessage: vi.fn((error: unknown) => (error as Error).message || 'An error occurred'),
  },
}));

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );

  it('should throw error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleSpy.mockRestore();
  });

  it('should initialize with no user when no token exists', async () => {
    vi.mocked(api.getToken).mockReturnValue(null);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should fetch user data when token exists', async () => {
    const mockUser = {
      _id: '1',
      name: 'Test User',
      email: 'test@example.com',
      mustChangePassword: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.mocked(api.getToken).mockReturnValue('fake-token');
    vi.mocked(api.getCurrentUser).mockResolvedValue({
      success: true,
      data: mockUser,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(api.getCurrentUser).toHaveBeenCalled();
  });

  it('should clear token when user fetch fails', async () => {
    vi.mocked(api.getToken).mockReturnValue('invalid-token');
    vi.mocked(api.getCurrentUser).mockRejectedValue(new Error('Unauthorized'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBeNull();
    expect(api.clearToken).toHaveBeenCalled();
  });

  it('should login successfully and set user', async () => {
    const mockUser = {
      _id: '1',
      name: 'Test User',
      email: 'test@example.com',
      mustChangePassword: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.mocked(api.getToken).mockReturnValue(null);
    vi.mocked(api.login).mockResolvedValue({
      success: true,
      data: {
        token: 'new-token',
        user: mockUser,
      },
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.login('test@example.com', 'password123');
    });

    expect(api.login).toHaveBeenCalledWith('test@example.com', 'password123');
    expect(api.setToken).toHaveBeenCalledWith('new-token');
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.error).toBeNull();
  });

  it('should set error on login failure', async () => {
    vi.mocked(api.getToken).mockReturnValue(null);
    vi.mocked(api.login).mockRejectedValue(new Error('Invalid credentials'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Attempt login - error should be set in context state
    await act(async () => {
      await result.current.login('test@example.com', 'wrong-password');
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.user).toBeNull();
    // Error state should be set after the failed login
    expect(result.current.error).toBe('Invalid credentials');
  });

  it('should logout and clear user state', async () => {
    const mockUser = {
      _id: '1',
      name: 'Test User',
      email: 'test@example.com',
      mustChangePassword: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    vi.mocked(api.getToken).mockReturnValue('fake-token');
    vi.mocked(api.getCurrentUser).mockResolvedValue({
      success: true,
      data: mockUser,
    });
    vi.mocked(api.logout).mockResolvedValue({
      success: true,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser);
    });

    await act(async () => {
      await result.current.logout();
    });

    expect(api.logout).toHaveBeenCalled();
    expect(api.clearToken).toHaveBeenCalled();
    expect(result.current.user).toBeNull();
  });

  it('should refresh user data', async () => {
    const initialUser = {
      _id: '1',
      name: 'Test User',
      email: 'test@example.com',
      mustChangePassword: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedUser = {
      ...initialUser,
      mustChangePassword: false,
    };

    vi.mocked(api.getToken).mockReturnValue('fake-token');
    vi.mocked(api.getCurrentUser)
      .mockResolvedValueOnce({
        success: true,
        data: initialUser,
      })
      .mockResolvedValueOnce({
        success: true,
        data: updatedUser,
      });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.user?.mustChangePassword).toBe(true);
    });

    await act(async () => {
      await result.current.refreshUser();
    });

    expect(result.current.user?.mustChangePassword).toBe(false);
  });

  it('should clear error', async () => {
    vi.mocked(api.getToken).mockReturnValue(null);
    vi.mocked(api.login).mockRejectedValue(new Error('Test error'));

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Trigger an error
    await act(async () => {
      await result.current.login('test@example.com', 'wrong');
    });

    // Error should be set
    expect(result.current.error).toBe('Test error');

    // Clear the error
    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
