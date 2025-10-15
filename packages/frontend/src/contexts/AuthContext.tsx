/**
 * Authentication Context
 *
 * Provides authentication state and methods throughout the application.
 * Manages:
 * - Current user state
 * - Login/logout functionality
 * - Token persistence
 * - Loading states
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api } from '../services/api';

/**
 * User Type
 */
export interface User {
  _id: string;
  name: string;
  email: string;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

/**
 * Auth Context Type
 */
interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;
}

/**
 * Create Context
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider Props
 */
interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 *
 * Wraps the application to provide authentication state and methods
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize authentication state on mount
   * Checks if user has a valid token and fetches user data
   */
  useEffect(() => {
    const initAuth = async () => {
      const token = api.getToken();

      if (token) {
        try {
          const response = await api.getCurrentUser();
          if (response.success && response.data) {
            setUser(response.data);
          } else {
            api.clearToken();
          }
        } catch (error) {
          console.error('Failed to fetch user:', error);
          api.clearToken();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Login Method
   *
   * Authenticates user and stores token
   */
  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.login(email, password);

      if (response.success && response.data) {
        api.setToken(response.data.token);
        setUser(response.data.user);
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      const errorMessage = api.getErrorMessage(error);
      setError(errorMessage);
      // Don't rethrow - error is available via context state
    } finally {
      setLoading(false);
    }
  };

  /**
   * Logout Method
   *
   * Clears user session and token
   */
  const logout = async () => {
    try {
      setLoading(true);
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      api.clearToken();
      setLoading(false);
    }
  };

  /**
   * Refresh User Method
   *
   * Fetches latest user data from backend
   */
  const refreshUser = async () => {
    try {
      const response = await api.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  /**
   * Clear Error Method
   */
  const clearError = () => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    loading,
    error,
    login,
    logout,
    refreshUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth Hook
 *
 * Custom hook to access authentication context
 * Must be used within AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
