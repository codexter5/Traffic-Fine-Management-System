import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/endpoints';

const vehicleTypes = ['car', 'motorcycle', 'truck', 'bus', 'other'];

export default function SignupPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    licenseNumber: '',
    phone: '',
    address: '',
    vehicle: {
      plateNumber: '',
      make: '',
      model: '',
      year: '',
      type: 'car',
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        licenseNumber: form.licenseNumber?.trim() || undefined,
        phone: form.phone?.trim() || undefined,
        address: form.address?.trim() || undefined,
      };
      if (form.vehicle?.plateNumber?.trim()) {
        payload.vehicle = {
          plateNumber: form.vehicle.plateNumber.trim(),
          make: form.vehicle.make?.trim(),
          model: form.vehicle.model?.trim(),
          year: form.vehicle.year || undefined,
          type: form.vehicle.type || 'car',
        };
      }
      await authAPI.signup(payload);
      navigate('/login', { state: { message: 'Account created. You can now sign in.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary-50 to-gray-100">
      <div className="w-full max-w-lg card shadow-lg">
        <div className="card-body">
          <h1 className="text-2xl font-bold text-gray-900 text-center">Create account</h1>
          <p className="text-gray-500 text-center mt-1 text-sm">Register as a driver to view and pay fines</p>
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && (
              <div className="text-sm text-red-700 bg-red-50 px-3 py-2.5 rounded-lg border border-red-100">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
                className="input-field"
                placeholder="John Doe"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
                className="input-field"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password * (min 6)</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                required
                minLength={6}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password *</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">License number (optional)</label>
              <input
                type="text"
                value={form.licenseNumber}
                onChange={(e) => setForm((p) => ({ ...p, licenseNumber: e.target.value }))}
                className="input-field"
                placeholder="DL-20240001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone (optional)</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                className="input-field"
                placeholder="+91 9876543210"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address (optional)</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                className="input-field"
                placeholder="City, State"
              />
            </div>
            <div className="border-t border-gray-200 pt-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Vehicle (optional)</p>
              <div className="space-y-3">
                <input
                  type="text"
                  value={form.vehicle.plateNumber}
                  onChange={(e) => setForm((p) => ({ ...p, vehicle: { ...p.vehicle, plateNumber: e.target.value } }))}
                  className="input-field"
                  placeholder="Plate number"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={form.vehicle.make}
                    onChange={(e) => setForm((p) => ({ ...p, vehicle: { ...p.vehicle, make: e.target.value } }))}
                    className="input-field"
                    placeholder="Make"
                  />
                  <input
                    type="text"
                    value={form.vehicle.model}
                    onChange={(e) => setForm((p) => ({ ...p, vehicle: { ...p.vehicle, model: e.target.value } }))}
                    className="input-field"
                    placeholder="Model"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={form.vehicle.year || ''}
                    onChange={(e) => setForm((p) => ({ ...p, vehicle: { ...p.vehicle, year: e.target.value } }))}
                    className="input-field"
                    placeholder="Year"
                    min="1990"
                    max={new Date().getFullYear() + 1}
                  />
                  <select
                    value={form.vehicle.type}
                    onChange={(e) => setForm((p) => ({ ...p, vehicle: { ...p.vehicle, type: e.target.value } }))}
                    className="input-field"
                  >
                    {vehicleTypes.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-4">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
