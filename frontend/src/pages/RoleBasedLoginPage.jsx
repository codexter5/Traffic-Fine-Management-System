import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleBasedLoginPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const roles = [
    {
      id: 'admin',
      name: 'Admin',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
        </svg>
      ),
      description: 'System Administrator',
      demoEmail: 'admin@demo.com',
    },
    {
      id: 'officer',
      name: 'Police Officer',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      ),
      description: 'Traffic Police',
      demoEmail: 'officer@demo.com',
    },
    {
      id: 'driver',
      name: 'Driver',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.22.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm11 0c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" />
        </svg>
      ),
      description: 'Vehicle Owner',
      demoEmail: 'driver@demo.com',
    },
  ];

  const handleRoleSelect = (roleId) => {
    setSelectedRole(roleId);
    setError('');
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      // Validate that the user's role matches the selected role
      if (user.role !== selectedRole) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setError(`This account is registered as a ${user.role}, not a ${selectedRole}.`);
        setLoading(false);
        return;
      }

      // Navigate based on role
      if (user.role === 'admin') navigate('/admin', { replace: true });
      else if (user.role === 'officer') navigate('/police', { replace: true });
      else navigate('/driver', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const selectedRoleData = roles.find(r => r.id === selectedRole);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 to-gray-100">
      <div className="w-full max-w-2xl">
        {/* Role Selection View */}
        {!selectedRole ? (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <span className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center">
                  <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M11.484 2.17a.75.75 0 011.032 0 11.209 11.209 0 007.877 3.08.75.75 0 01.722.515 12.74 12.74 0 01.635 3.985c0 5.942-4.064 10.933-9.563 12.348a.749.749 0 01-.374 0C6.314 20.683 2.25 15.692 2.25 9.75c0-1.39.189-2.737.534-4.018a.75.75 0 01.719-.506 11.21 11.21 0 007.88-3.056z" clipRule="evenodd" />
                  </svg>
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">Traffic Fine Management</h1>
              <p className="text-gray-600 text-lg mt-2">Sign in to your account</p>
              <p className="text-gray-500 text-sm mt-1">Select your role to continue</p>
            </div>

            {successMessage && (
              <div className="text-sm text-green-700 bg-green-50 px-4 py-3 rounded-lg border border-green-100">
                {successMessage}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {roles.map((role) => (
                <button
                  key={role.id}
                  onClick={() => handleRoleSelect(role.id)}
                  className="card p-6 hover:shadow-xl transition-all duration-300 hover:border-primary-500 cursor-pointer group"
                >
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="text-primary-600 group-hover:text-primary-700 group-hover:scale-110 transition-transform">
                      {role.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                      <p className="text-sm text-gray-500 mt-1">{role.description}</p>
                    </div>
                    <div className="pt-2 text-xs text-gray-400 border-t border-gray-200 w-full pt-2">
                      Demo: {role.demoEmail}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-center text-sm text-gray-500 mt-8">
              New user? <Link to="/signup" className="text-primary-600 font-medium hover:underline">Create an account</Link>
            </p>
            <p className="text-center text-xs text-gray-400">
              Password for all demo accounts: 123456
            </p>
          </div>
        ) : (
          /* Login Form View */
          <div className="card shadow-lg max-w-md mx-auto">
            <div className="card-body">
              <button
                onClick={() => setSelectedRole(null)}
                className="text-primary-600 hover:text-primary-700 text-sm font-medium mb-4 flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to role selection
              </button>

              <div className="text-center mb-6">
                <div className="flex justify-center mb-3">
                  <span className="text-primary-600">{selectedRoleData?.icon}</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Sign in as {selectedRoleData?.name}</h2>
                <p className="text-gray-500 text-sm mt-1">{selectedRoleData?.description}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
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
                    placeholder={selectedRoleData?.demoEmail}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
