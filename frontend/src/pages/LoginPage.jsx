import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (user.role === 'admin') navigate('/admin', { replace: true });
      else if (user.role === 'driver') navigate('/driver', { replace: true });
      else navigate('/police', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 to-gray-100">
      <div className="w-full max-w-md card shadow-lg">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-gray-900 text-center">Traffic Fine Management</h1>
          <p className="text-gray-500 text-center mt-2 text-sm">Sign in to your account</p>
          {successMessage && (
            <div className="mt-4 text-sm text-green-700 bg-green-50 px-3 py-2.5 rounded-lg border border-green-100">
              {successMessage}
            </div>
          )}
          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {error && (
              <div className="text-sm text-red-700 bg-red-50 px-3 py-2.5 rounded-lg border border-red-100">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            New user? <Link to="/signup" className="text-primary-600 font-medium hover:underline">Create an account</Link>
          </p>
          <p className="mt-2 text-center text-xs text-gray-400">
            Demo: admin@demo.com / officer@demo.com / driver@demo.com — password: 123456
          </p>
        </div>
      </div>
    </div>
  );
}
