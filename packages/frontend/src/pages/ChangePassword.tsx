/**
 * Change Password Page Component
 *
 * Provides password change interface for:
 * - First-time login (forced password change)
 * - User-initiated password changes
 *
 * Features:
 * - Current password verification
 * - New password with confirmation
 * - Password strength indicator
 * - Show/hide password toggles
 * - Validation (8+ chars, mixed case, number, symbol)
 */

import { useState, FormEvent, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import '../styles/ChangePassword.css';

export function ChangePassword() {
  const navigate = useNavigate();
  const { user, refreshUser, clearError } = useAuth();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Show/hide states for each password field
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength calculation
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  // Check if this is a forced password change
  const isForced = user?.mustChangePassword || false;

  // Redirect if user doesn't need to change password and they try to access directly
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  /**
   * Calculate password strength
   */
  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength('weak');
      return;
    }

    let strength = 0;

    // Length check
    if (newPassword.length >= 8) strength++;
    if (newPassword.length >= 12) strength++;

    // Character variety checks
    if (/[a-z]/.test(newPassword)) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/[0-9]/.test(newPassword)) strength++;
    if (/[^a-zA-Z0-9]/.test(newPassword)) strength++;

    if (strength <= 2) setPasswordStrength('weak');
    else if (strength <= 4) setPasswordStrength('medium');
    else setPasswordStrength('strong');
  }, [newPassword]);

  /**
   * Validate password requirements
   */
  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }

    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }

    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }

    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      return 'Password must contain at least one special character';
    }

    return null;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    clearError();
    setError('');
    setValidationError('');

    // Validate inputs
    if (!currentPassword || !newPassword || !confirmPassword) {
      setValidationError('All fields are required');
      return;
    }

    // Validate new password meets requirements
    const passwordValidation = validatePassword(newPassword);
    if (passwordValidation) {
      setValidationError(passwordValidation);
      return;
    }

    // Check passwords match
    if (newPassword !== confirmPassword) {
      setValidationError('New passwords do not match');
      return;
    }

    // Check new password is different from current
    if (newPassword === currentPassword) {
      setValidationError('New password must be different from current password');
      return;
    }

    try {
      setLoading(true);

      const response = await api.changePassword(currentPassword, newPassword);

      if (response.success) {
        setSuccess(true);

        // Refresh user data to update mustChangePassword flag
        await refreshUser();

        // Show success message briefly, then redirect
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(response.error || 'Failed to change password');
      }
    } catch (err: unknown) {
      setError(api.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle cancel (only for non-forced changes)
   */
  const handleCancel = () => {
    if (!isForced) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="change-password-page">
      <div className="change-password-container">
        <div className="change-password-header">
          <h1>Change Password</h1>
          {isForced && (
            <p className="forced-message">
              For security reasons, you must change your password before continuing.
            </p>
          )}
        </div>

        {success ? (
          <div className="success-message">
            <h2>✓ Password Changed Successfully</h2>
            <p>Redirecting to dashboard...</p>
          </div>
        ) : (
          <form className="change-password-form" onSubmit={handleSubmit}>
            {/* Display validation or API errors */}
            {(validationError || error) && (
              <div className="error-message">
                {validationError || error}
              </div>
            )}

            {/* Current Password */}
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  id="currentPassword"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={loading}
                  aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                >
                  {showCurrentPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="form-group">
              <label htmlFor="newPassword">New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={loading}
                  aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                >
                  {showNewPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="password-strength">
                  <div className="strength-label">
                    Password Strength: <span className={`strength-${passwordStrength}`}>{passwordStrength}</span>
                  </div>
                  <div className="strength-bar">
                    <div className={`strength-fill strength-fill-${passwordStrength}`}></div>
                  </div>
                </div>
              )}

              {/* Password Requirements */}
              <div className="password-requirements">
                <p>Password must contain:</p>
                <ul>
                  <li className={newPassword.length >= 8 ? 'valid' : ''}>
                    At least 8 characters
                  </li>
                  <li className={/[a-z]/.test(newPassword) ? 'valid' : ''}>
                    One lowercase letter
                  </li>
                  <li className={/[A-Z]/.test(newPassword) ? 'valid' : ''}>
                    One uppercase letter
                  </li>
                  <li className={/[0-9]/.test(newPassword) ? 'valid' : ''}>
                    One number
                  </li>
                  <li className={/[^a-zA-Z0-9]/.test(newPassword) ? 'valid' : ''}>
                    One special character
                  </li>
                </ul>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  disabled={loading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {confirmPassword && newPassword !== confirmPassword && (
                <p className="field-error">Passwords do not match</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="form-actions">
              <button
                type="submit"
                className="submit-button"
                disabled={loading}
              >
                {loading ? 'Changing Password...' : 'Change Password'}
              </button>

              {!isForced && (
                <button
                  type="button"
                  className="cancel-button"
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        <div className="change-password-footer">
          <p>© 2025 AssetBridge. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
