/**
 * Dashboard Page Component
 *
 * Main dashboard view after login.
 * Displays welcome message and navigation to different modules.
 */

import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css';

export function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const goToUsers = () => {
    navigate('/settings/users');
  };

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>AssetBridge</h1>
          <div className="header-actions">
            <span className="user-name">{user?.name}</span>
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="welcome-section">
          <h2>Welcome, {user?.name}!</h2>
          <p>Select a module to get started:</p>
        </div>

        <div className="modules-grid">
          <div className="module-card" onClick={goToUsers}>
            <div className="module-icon">👥</div>
            <h3>User Management</h3>
            <p>Manage users and permissions</p>
          </div>

          <div className="module-card disabled">
            <div className="module-icon">🏢</div>
            <h3>Vendor Management</h3>
            <p>Coming soon...</p>
          </div>

          <div className="module-card disabled">
            <div className="module-icon">📋</div>
            <h3>Purchase Requests</h3>
            <p>Coming soon...</p>
          </div>

          <div className="module-card disabled">
            <div className="module-icon">📦</div>
            <h3>Inventory</h3>
            <p>Coming soon...</p>
          </div>
        </div>
      </main>
    </div>
  );
}
