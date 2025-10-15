/**
 * Users List Page Component
 *
 * Displays list of all users with:
 * - Search functionality
 * - Pagination
 * - Create new user
 * - Edit/delete users
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import type { UserSafe } from '@assetbridge/shared';
import '../styles/Users.css';

export function Users() {
  const navigate = useNavigate();
  const { user: currentUser, logout } = useAuth();

  const [users, setUsers] = useState<UserSafe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');

  // Form state for creating user
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [creating, setCreating] = useState(false);

  const limit = 10;

  /**
   * Fetch users from API
   */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await api.getUsers({
        page,
        limit,
        search: search || undefined,
      });

      if (response.success && response.data) {
        setUsers(response.data.users);
        setTotal(response.data.total);
      }
    } catch (err) {
      setError(api.getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  /**
   * Handle search input
   */
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1); // Reset to first page on search
  };

  /**
   * Handle create user
   */
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUserName || !newUserEmail) {
      setError('Name and email are required');
      return;
    }

    try {
      setCreating(true);
      setError('');

      const response = await api.createUser(newUserName, newUserEmail);

      if (response.success && response.data) {
        setGeneratedPassword(response.data.generatedPassword);
        setNewUserName('');
        setNewUserEmail('');
        fetchUsers(); // Refresh list
      }
    } catch (err) {
      setError(api.getErrorMessage(err));
    } finally {
      setCreating(false);
    }
  };

  /**
   * Close create modal
   */
  const closeCreateModal = () => {
    setShowCreateModal(false);
    setGeneratedPassword('');
    setNewUserName('');
    setNewUserEmail('');
    setError('');
  };

  /**
   * Handle logout
   */
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="users-page">
      {/* Header */}
      <header className="page-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={() => navigate('/dashboard')} className="back-button">
              ← Back
            </button>
            <h1>User Management</h1>
          </div>
          <div className="header-actions">
            <span className="user-name">{currentUser?.name}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="page-content">
        {/* Actions Bar */}
        <div className="actions-bar">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />
          <button
            onClick={() => setShowCreateModal(true)}
            className="create-button"
          >
            + Create User
          </button>
        </div>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Users Table */}
        {loading ? (
          <div className="loading">Loading users...</div>
        ) : users.length === 0 ? (
          <div className="empty-state">No users found</div>
        ) : (
          <>
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Last Login</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      {user.mustChangePassword ? (
                        <span className="status-badge status-pending">
                          Password Change Required
                        </span>
                      ) : (
                        <span className="status-badge status-active">
                          Active
                        </span>
                      )}
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      {user.lastLogin
                        ? new Date(user.lastLogin).toLocaleDateString()
                        : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="pagination-button"
                >
                  Previous
                </button>
                <span className="pagination-info">
                  Page {page} of {totalPages} ({total} total users)
                </span>
                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page === totalPages}
                  className="pagination-button"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={closeCreateModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{generatedPassword ? 'User Created' : 'Create New User'}</h2>
              <button onClick={closeCreateModal} className="close-button">
                ×
              </button>
            </div>

            {generatedPassword ? (
              <div className="modal-body">
                <div className="success-message">
                  User created successfully! Please save this password:
                </div>
                <div className="password-display">
                  <strong>{generatedPassword}</strong>
                </div>
                <p className="warning-text">
                  ⚠️ This password will not be shown again. The user will be
                  required to change it on first login.
                </p>
                <button onClick={closeCreateModal} className="modal-button">
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateUser}>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="name">Name</label>
                    <input
                      type="text"
                      id="name"
                      value={newUserName}
                      onChange={(e) => setNewUserName(e.target.value)}
                      required
                      disabled={creating}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      value={newUserEmail}
                      onChange={(e) => setNewUserEmail(e.target.value)}
                      required
                      disabled={creating}
                    />
                  </div>

                  {error && <div className="error-message">{error}</div>}
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    onClick={closeCreateModal}
                    className="modal-button secondary"
                    disabled={creating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="modal-button primary"
                    disabled={creating}
                  >
                    {creating ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
