import { useEffect, useState } from 'react';
import { authAPI } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, updateCurrentUser } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    badgeId: '',
    licenseNumber: '',
    phone: '',
    address: '',
  });
  const [loadingDriver, setLoadingDriver] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      name: user?.name || '',
      email: user?.email || '',
      badgeId: user?.badgeId || '',
    }));
  }, [user]);

  useEffect(() => {
    if (user?.role !== 'driver') return;
    setLoadingDriver(true);
    authAPI
      .getMe()
      .then((res) => {
        const d = res.data?.driver;
        if (!d) return;
        setForm((prev) => ({
          ...prev,
          licenseNumber: d.licenseNumber || '',
          phone: d.phone || '',
          address: d.address || '',
        }));
      })
      .catch(() => {})
      .finally(() => setLoadingDriver(false));
  }, [user?.role]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required.');
      return;
    }

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
    };

    if (form.password.trim()) payload.password = form.password;
    if (user?.role === 'officer') payload.badgeId = form.badgeId?.trim() || undefined;
    if (user?.role === 'driver') {
      payload.licenseNumber = form.licenseNumber?.trim() || undefined;
      payload.phone = form.phone?.trim() || undefined;
      payload.address = form.address?.trim() || undefined;
    }

    setSaving(true);
    try {
      const res = await authAPI.updateMe(payload);
      if (res.data?.success && res.data?.user) {
        const next = {
          id: res.data.user._id,
          name: res.data.user.name,
          email: res.data.user.email,
          role: res.data.user.role,
          badgeId: res.data.user.badgeId,
        };
        updateCurrentUser(next);
      }
      setForm((prev) => ({ ...prev, password: '' }));
      setSuccess(res.data?.message || 'Profile updated.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        <p className="mt-1 text-sm text-gray-500">Update only your own account details.</p>
      </div>

      <form onSubmit={handleSubmit} className="card">
        <div className="card-body space-y-4">
          {error && (
            <div className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
              {error}
            </div>
          )}
          {success && (
            <div className="text-sm text-green-700 bg-green-50 px-3 py-2 rounded-lg border border-green-100">
              {success}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New password (optional)</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
              className="input-field"
              placeholder="Leave blank to keep current password"
            />
          </div>

          {user?.role === 'officer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Badge ID</label>
              <input
                type="text"
                value={form.badgeId}
                onChange={(e) => setForm((p) => ({ ...p, badgeId: e.target.value }))}
                className="input-field"
              />
            </div>
          )}

          {user?.role === 'driver' && (
            <div className="space-y-4 border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-gray-700">Driver details</p>
              {loadingDriver && <p className="text-xs text-gray-500">Loading driver details...</p>}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">License number</label>
                  <input
                    type="text"
                    value={form.licenseNumber}
                    onChange={(e) => setForm((p) => ({ ...p, licenseNumber: e.target.value }))}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                    className="input-field"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
