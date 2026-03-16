import { useState } from 'react';
import { Link, NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { NotificationBell } from './NotificationBell';

const navLinks = {
  admin: [
    { to: '/admin', label: 'Dashboard' },
    { to: '/fines', label: 'Fines' },
    { to: '/payments', label: 'Payments' },
    { to: '/users', label: 'Users' },
    { to: '/audit-logs', label: 'Audit Logs' },
    { to: '/notifications', label: 'Notifications' },
    { to: '/profile', label: 'Profile' },
  ],
  officer: [
    { to: '/police', label: 'Dashboard' },
    { to: '/issue-fine', label: 'Issue Fine' },
    { to: '/fines', label: 'My Fines' },
    { to: '/notifications', label: 'Notifications' },
    { to: '/profile', label: 'Profile' },
  ],
  driver: [
    { to: '/driver', label: 'My Fines' },
    { to: '/payments', label: 'Payments' },
    { to: '/my-vehicles', label: 'My Vehicles' },
    { to: '/notifications', label: 'Notifications' },
    { to: '/profile', label: 'Profile' },
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

  const navLinkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition ${
      isActive ? 'bg-white/20 text-white' : 'text-primary-100 hover:bg-white/10 hover:text-white'
    }`;

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  return (
    <div className="min-h-screen">
      <nav className="bg-primary-700 text-white shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-5">
              <Link to="/" className="flex items-center gap-2 font-bold text-base text-white shrink-0">
                <svg className="w-6 h-6 text-primary-200 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M11.484 2.17a.75.75 0 011.032 0 11.209 11.209 0 007.877 3.08.75.75 0 01.722.515 12.74 12.74 0 01.635 3.985c0 5.942-4.064 10.933-9.563 12.348a.749.749 0 01-.374 0C6.314 20.683 2.25 15.692 2.25 9.75c0-1.39.189-2.737.534-4.018a.75.75 0 01.719-.506 11.21 11.21 0 007.88-3.056z" clipRule="evenodd" />
                </svg>
                <span className="hidden sm:inline">Traffic Fine System</span>
              </Link>
              <div className="hidden md:flex items-center gap-0.5">
                {links.map(({ to, label }) => (
                  <NavLink key={to} to={to} end className={navLinkClass}>
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <NotificationBell />
              <div className="hidden sm:flex items-center gap-2 pl-1">
                <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {initials}
                </div>
                <span className="text-sm text-primary-100 truncate max-w-[110px]">{user?.name}</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-lg text-sm font-medium transition ml-1"
              >
                Logout
              </button>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/10 transition"
                aria-label="Toggle menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10 bg-primary-800">
            <div className="px-4 py-3 space-y-1">
              {links.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-lg text-sm font-medium ${
                      isActive ? 'bg-white/20 text-white' : 'text-primary-200 hover:bg-white/10'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              <div className="flex items-center gap-2 px-3 py-2 mt-1 border-t border-white/10">
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold">
                  {initials}
                </div>
                <p className="text-sm text-primary-200">{user?.name} · {user?.role}</p>
              </div>
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
