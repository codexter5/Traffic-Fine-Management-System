import { Link, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-primary-600 text-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 items-center">
            <div className="flex items-center gap-6">
              <Link to="/" className="font-semibold text-lg">Traffic Fine System</Link>
              {user?.role === 'admin' && (
                <>
                  <Link to="/admin" className="hover:bg-primary-500 px-3 py-2 rounded">Admin</Link>
                  <Link to="/fines" className="hover:bg-primary-500 px-3 py-2 rounded">Fines</Link>
                  <Link to="/payments" className="hover:bg-primary-500 px-3 py-2 rounded">Payments</Link>
                </>
              )}
              {user?.role === 'officer' && (
                <>
                  <Link to="/police" className="hover:bg-primary-500 px-3 py-2 rounded">Dashboard</Link>
                  <Link to="/issue-fine" className="hover:bg-primary-500 px-3 py-2 rounded">Issue Fine</Link>
                  <Link to="/fines" className="hover:bg-primary-500 px-3 py-2 rounded">My Fines</Link>
                </>
              )}
              {user?.role === 'driver' && (
                <>
                  <Link to="/driver" className="hover:bg-primary-500 px-3 py-2 rounded">My Fines</Link>
                </>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm">{user?.name} ({user?.role})</span>
              <button onClick={handleLogout} className="bg-primary-700 hover:bg-primary-800 px-4 py-2 rounded text-sm">Logout</button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
