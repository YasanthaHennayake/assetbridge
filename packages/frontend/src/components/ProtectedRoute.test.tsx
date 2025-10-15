/**
 * ProtectedRoute Component Tests
 *
 * Tests for the ProtectedRoute wrapper component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ProtectedRoute } from './ProtectedRoute';
import { api } from '../services/api';

// Mock the API
vi.mock('../services/api', () => ({
  api: {
    getToken: vi.fn(),
    setToken: vi.fn(),
    getCurrentUser: vi.fn(),
    clearToken: vi.fn(),
    getErrorMessage: vi.fn((error: unknown) => (error as Error).message || 'An error occurred'),
  },
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const TestComponent = () => <div>Protected Content</div>;

  const renderProtectedRoute = (initialRoute = '/protected') => {
    window.history.pushState({}, 'Test page', initialRoute);
    return render(
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute>
                  <TestComponent />
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('should show loading state while checking authentication', () => {
    vi.mocked(api.getToken).mockReturnValue('fake-token');
    vi.mocked(api.getCurrentUser).mockReturnValue(
      new Promise(() => {}) // Never resolves to keep loading state
    );

    renderProtectedRoute();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should redirect to login when user is not authenticated', async () => {
    vi.mocked(api.getToken).mockReturnValue(null);

    renderProtectedRoute();

    // Wait for redirect to happen
    await screen.findByText('Login Page');

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render protected content when user is authenticated', async () => {
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

    renderProtectedRoute();

    await screen.findByText('Protected Content');

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
  });

  it('should redirect to login when token is invalid', async () => {
    vi.mocked(api.getToken).mockReturnValue('invalid-token');
    vi.mocked(api.getCurrentUser).mockRejectedValue(new Error('Unauthorized'));

    renderProtectedRoute();

    await screen.findByText('Login Page');

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(api.clearToken).toHaveBeenCalled();
  });
});
