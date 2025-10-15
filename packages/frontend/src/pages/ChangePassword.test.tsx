/**
 * ChangePassword Component Tests
 *
 * Tests for the ChangePassword page component including:
 * - Rendering
 * - Form validation
 * - Password strength indicator
 * - User interactions
 * - Error handling
 * - Forced password change flow
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import { ChangePassword } from './ChangePassword';
import { api } from '../services/api';

// Mock the API
vi.mock('../services/api', () => ({
  api: {
    changePassword: vi.fn(),
    getToken: vi.fn(),
    setToken: vi.fn(),
    clearToken: vi.fn(),
    getCurrentUser: vi.fn(),
    getErrorMessage: vi.fn((error: unknown) => (error as Error).message || 'An error occurred'),
  },
}));

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = (await vi.importActual('react-router-dom')) as Record<string, unknown>;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ChangePassword Component', () => {
  const mockUser = {
    _id: '1',
    name: 'Test User',
    email: 'test@example.com',
    mustChangePassword: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default mock for getToken
    vi.mocked(api.getToken).mockReturnValue('fake-token');

    // Setup default mock for getCurrentUser
    vi.mocked(api.getCurrentUser).mockResolvedValue({
      success: true,
      data: mockUser,
    });

    // Mock clearError and getErrorMessage
    vi.mocked(api.getErrorMessage).mockImplementation((error: unknown) => (error as Error).message || 'An error occurred');
  });

  const renderChangePassword = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <ChangePassword />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('should render change password form with all fields', async () => {
    renderChangePassword();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
    });

    expect(screen.getByLabelText('Current Password')).toBeInTheDocument();
    expect(screen.getByLabelText('New Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm New Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^change password$/i })).toBeInTheDocument();
  });

  it('should show forced password change message when mustChangePassword is true', async () => {
    vi.mocked(api.getCurrentUser).mockResolvedValue({
      success: true,
      data: { ...mockUser, mustChangePassword: true },
    });

    renderChangePassword();

    await waitFor(() => {
      expect(screen.getByText(/For security reasons, you must change your password/i)).toBeInTheDocument();
    });
  });

  it('should show cancel button only when not forced to change password', async () => {
    renderChangePassword();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
    });

    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should not show cancel button when forced to change password', async () => {
    vi.mocked(api.getCurrentUser).mockResolvedValue({
      success: true,
      data: { ...mockUser, mustChangePassword: true },
    });

    renderChangePassword();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
    });

    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
  });

  it('should show validation error when fields are empty', async () => {
    renderChangePassword();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
    });

    const submitButton = screen.getByRole('button', { name: /change password/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('All fields are required')).toBeInTheDocument();
    });
  });

  it('should show validation error for passwords not matching', async () => {
    renderChangePassword();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'OldPassword123!' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'NewPassword123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'DifferentPassword123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => {
      expect(screen.getByText('New passwords do not match')).toBeInTheDocument();
    });
  });

  it('should show validation error when new password is same as current', async () => {
    renderChangePassword();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'SamePassword123!' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'SamePassword123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'SamePassword123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => {
      expect(screen.getByText('New password must be different from current password')).toBeInTheDocument();
    });
  });

  it('should show validation error for weak password (too short)', async () => {
    renderChangePassword();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'OldPassword123!' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'Short1!' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'Short1!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
    });
  });

  it('should show validation error for password missing lowercase', async () => {
    renderChangePassword();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'OldPassword123!' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'UPPERCASE123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'UPPERCASE123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => {
      expect(screen.getByText('Password must contain at least one lowercase letter')).toBeInTheDocument();
    });
  });

  it('should display password strength indicator', async () => {
    renderChangePassword();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
    });

    const newPasswordInput = screen.getByLabelText('New Password');

    // Type a weak password
    fireEvent.change(newPasswordInput, { target: { value: 'weak' } });
    await waitFor(() => {
      expect(screen.getByText(/Password Strength:/i)).toBeInTheDocument();
      expect(screen.getByText('weak')).toBeInTheDocument();
    });

    // Type a strong password
    fireEvent.change(newPasswordInput, { target: { value: 'StrongP@ssw0rd123!' } });
    await waitFor(() => {
      expect(screen.getByText('strong')).toBeInTheDocument();
    });
  });

  it('should display password requirements checklist', async () => {
    renderChangePassword();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
    });

    expect(screen.getByText('Password must contain:')).toBeInTheDocument();
    expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
    expect(screen.getByText('One lowercase letter')).toBeInTheDocument();
    expect(screen.getByText('One uppercase letter')).toBeInTheDocument();
    expect(screen.getByText('One number')).toBeInTheDocument();
    expect(screen.getByText('One special character')).toBeInTheDocument();
  });

  it('should toggle password visibility for all fields', async () => {
    renderChangePassword();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
    });

    const currentPasswordInput = screen.getByLabelText('Current Password') as HTMLInputElement;
    const newPasswordInput = screen.getByLabelText('New Password') as HTMLInputElement;
    const confirmPasswordInput = screen.getByLabelText('Confirm New Password') as HTMLInputElement;

    // Initially all passwords should be hidden
    expect(currentPasswordInput.type).toBe('password');
    expect(newPasswordInput.type).toBe('password');
    expect(confirmPasswordInput.type).toBe('password');

    // Find toggle buttons
    const toggleButtons = screen.getAllByLabelText(/show password|hide password/i);
    expect(toggleButtons).toHaveLength(3);

    // Toggle each password field
    fireEvent.click(toggleButtons[0]); // Current password
    expect(currentPasswordInput.type).toBe('text');

    fireEvent.click(toggleButtons[1]); // New password
    expect(newPasswordInput.type).toBe('text');

    fireEvent.click(toggleButtons[2]); // Confirm password
    expect(confirmPasswordInput.type).toBe('text');
  });

  it('should call changePassword API with correct parameters', async () => {
    vi.mocked(api.changePassword).mockResolvedValue({
      success: true,
    });

    renderChangePassword();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'OldPassword123!' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'NewPassword123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'NewPassword123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => {
      expect(api.changePassword).toHaveBeenCalledWith('OldPassword123!', 'NewPassword123!');
    });
  });

  it('should show success message and redirect after successful password change', async () => {
    vi.mocked(api.changePassword).mockResolvedValue({
      success: true,
    });

    renderChangePassword();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'OldPassword123!' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'NewPassword123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'NewPassword123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /change password/i }));

    await waitFor(() => {
      expect(screen.getByText('✓ Password Changed Successfully')).toBeInTheDocument();
    });

    // Wait for redirect (component uses setTimeout with 2000ms)
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    }, { timeout: 3000 });
  });

  it('should show error message on password change failure', async () => {
    vi.mocked(api.changePassword).mockResolvedValue({
      success: false,
      error: 'Incorrect current password',
    });

    renderChangePassword();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
    }, { timeout: 10000 });

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'WrongPassword123!' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'NewPassword123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'NewPassword123!' },
    });

    fireEvent.click(screen.getByRole('button', { name: /^change password$/i }));

    await waitFor(() => {
      expect(screen.getByText('Incorrect current password')).toBeInTheDocument();
    }, { timeout: 10000 });
  });

  it('should disable form during password change', async () => {
    // Make the API call take longer so we can test loading state
    vi.mocked(api.changePassword).mockImplementation(() =>
      new Promise(resolve => setTimeout(() => resolve({ success: true }), 100))
    );

    renderChangePassword();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
    }, { timeout: 10000 });

    fireEvent.change(screen.getByLabelText('Current Password'), {
      target: { value: 'OldPassword123!' },
    });
    fireEvent.change(screen.getByLabelText('New Password'), {
      target: { value: 'NewPassword123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirm New Password'), {
      target: { value: 'NewPassword123!' },
    });

    const submitButton = screen.getByRole('button', { name: /^change password$/i }) as HTMLButtonElement;
    fireEvent.click(submitButton);

    // During password change, button should show "Changing Password..."
    await waitFor(() => {
      expect(screen.getByText('Changing Password...')).toBeInTheDocument();
    });
    expect(submitButton).toBeDisabled();
  });

  it('should redirect to dashboard when cancel is clicked', async () => {
    renderChangePassword();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
    }, { timeout: 10000 });

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);

    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });
});
