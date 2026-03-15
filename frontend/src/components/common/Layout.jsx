import { useState } from 'react';
import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from './NotificationBell';

const navLinks = {
  admin: [
    { to: '/admin', label: 'Dashboard' },
    { to: '/fines', label: 'Fines' },
    { to: '/payments', label: 'Payments' },
    { to: '/users', label: 'Users' },
  ],
  officer: [
    { to: '/police', label: 'Dashboard' },
    { to: '/issue-fine', label: 'Issue Fine' },
    { to: '/fines', label: 'My Fines' },
  ],
  driver: [
    { to: '/driver', label: 'My Fines' },
  ],
};

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const links = user?.role ? navLinks[user.role] || [] : [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-primary-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center gap-4">
              <Link to="/" className="font-semibold text-lg text-white truncate">
                Traffic Fine System
              </Link>
              {/* Desktop nav */}
              <div className="hidden md:flex items-center gap-1">
                {links.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className="hover:bg-primary-500 px-3 py-2 rounded-lg text-sm transition"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {(user?.role === 'admin' || user?.role === 'officer') && <NotificationBell />}
              <span className="hidden sm:inline text-sm text-primary-100 truncate max-w-[120px]">
                {user?.name} <span className="text-primary-200">({user?.role})</span>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-primary-700 hover:bg-primary-800 px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Logout
              </button>
              {/* Mobile menu button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-primary-500"
                aria-label="Menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        {/* Mobile nav */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-primary-500 bg-primary-700">
            <div className="px-4 py-3 space-y-1">
              {links.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block hover:bg-primary-500 px-3 py-2 rounded-lg text-sm"
                >
                  {label}
                </Link>
              ))}
              <p className="px-3 py-2 text-sm text-primary-200">
                {user?.name} ({user?.role})
              </p>
            </div>
          </div>
        )}
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
        <Outlet />
      </main>
    </div>
  );
}
