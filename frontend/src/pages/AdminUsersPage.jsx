import { useEffect, useState } from 'react';
import { usersAPI, driversAPI } from '../api/endpoints';

const emptyForm = {
  name: '',
  email: '',
  password: '',
  role: 'officer',
  badgeId: '',
  licenseNumber: '',
  phone: '',
  address: '',
  vehicle: { plateNumber: '', make: '', model: '', year: '', type: 'car' },
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUsers = () => {
    setLoading(true);
    usersAPI
      .list()
      .then((res) => {
        if (res.data.success) setUsers(res.data.data);
      })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!form.name?.trim() || !form.email?.trim()) {
      setError('Name and email are required.');
      return;
    }
    if (!editingUser && !form.password) {
      setError('Password is required for new users.');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        role: form.role,
        badgeId: form.role === 'officer' ? form.badgeId : undefined,
      };
      if (editingUser) {
        if (form.password?.trim()) payload.password = form.password;
        if (form.role === 'driver') {
          payload.licenseNumber = form.licenseNumber?.trim() || undefined;
          payload.phone = form.phone?.trim() || undefined;
          payload.address = form.address?.trim() || undefined;
        }
        await usersAPI.update(editingUser._id, payload);
        setSuccess('User updated successfully.');
      } else {
        payload.password = form.password;
        if (form.role === 'driver') {
          payload.licenseNumber = form.licenseNumber?.trim() || undefined;
          payload.phone = form.phone?.trim() || undefined;
          payload.address = form.address?.trim() || undefined;
          if (form.vehicle?.plateNumber?.trim()) {
            payload.vehicle = {
              plateNumber: form.vehicle.plateNumber.trim(),
              make: form.vehicle.make?.trim(),
              model: form.vehicle.model?.trim(),
              year: form.vehicle.year ? Number(form.vehicle.year) : undefined,
              type: form.vehicle.type || 'car',
            };
          }
        }
        const res = await usersAPI.create(payload);
        setSuccess(res.data?.message || 'User created successfully.');
      }
      setForm(emptyForm);
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = async (user) => {
    setEditingUser(user);
    let licenseNumber = '';
    let phone = '';
    let address = '';
    if (user.role === 'driver' && user.email) {
      try {
        const res = await driversAPI.list({ search: user.email, limit: 1 });
        if (res.data?.success && res.data.data?.[0]) {
          const d = res.data.data[0];
          licenseNumber = d.licenseNumber || '';
          phone = d.phone || '';
          address = d.address || '';
        }
      } catch (_) {}
    }
    setForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'officer',
      badgeId: user.badgeId || '',
      licenseNumber,
      phone,
      address,
      vehicle: emptyForm.vehicle,
    });
    setError('');
    setSuccess('');
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setError('');
    setSuccess('');
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user ${user.email}?`)) return;
    setError('');
    setSuccess('');
    try {
      await usersAPI.remove(user._id);
      if (editingUser?._id === user._id) cancelEdit();
      setSuccess('User deleted.');
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Users</h1>
        <p className="mt-1 text-sm text-gray-500">
          Create admins, officers, or drivers. Driver accounts get a database record so they appear when issuing fines.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="card lg:col-span-1">
          <div className="card-body space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h2>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password {editingUser ? '(leave blank to keep)' : '*'}
              </label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}
                className="input-field"
              >
                <option value="admin">Admin</option>
                <option value="officer">Officer</option>
                <option value="driver">Driver</option>
              </select>
            </div>
            {form.role === 'officer' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Badge ID (optional)</label>
                <input
                  type="text"
                  value={form.badgeId}
                  onChange={(e) => setForm((p) => ({ ...p, badgeId: e.target.value }))}
                  className="input-field"
                />
              </div>
            )}
            {form.role === 'driver' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    License number (optional – auto-generated if blank)
                  </label>
                  <input
                    type="text"
                    value={form.licenseNumber}
                    onChange={(e) => setForm((p) => ({ ...p, licenseNumber: e.target.value }))}
                    className="input-field"
                    placeholder="e.g. DL-20240001"
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
                <div className="border-t border-gray-100 pt-3 mt-2">
                  <p className="text-sm font-medium text-gray-700 mb-2">Vehicle (optional)</p>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={form.vehicle?.plateNumber || ''}
                      onChange={(e) => setForm((p) => ({ ...p, vehicle: { ...p.vehicle, plateNumber: e.target.value } }))}
                      className="input-field"
                      placeholder="Plate number"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={form.vehicle?.make || ''}
                        onChange={(e) => setForm((p) => ({ ...p, vehicle: { ...p.vehicle, make: e.target.value } }))}
                        className="input-field"
                        placeholder="Make"
                      />
                      <input
                        type="text"
                        value={form.vehicle?.model || ''}
                        onChange={(e) => setForm((p) => ({ ...p, vehicle: { ...p.vehicle, model: e.target.value } }))}
                        className="input-field"
                        placeholder="Model"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="number"
                        value={form.vehicle?.year || ''}
                        onChange={(e) => setForm((p) => ({ ...p, vehicle: { ...p.vehicle, year: e.target.value } }))}
                        className="input-field"
                        placeholder="Year"
                      />
                      <select
                        value={form.vehicle?.type || 'car'}
                        onChange={(e) => setForm((p) => ({ ...p, vehicle: { ...p.vehicle, type: e.target.value } }))}
                        className="input-field"
                      >
                        <option value="car">Car</option>
                        <option value="motorcycle">Motorcycle</option>
                        <option value="truck">Truck</option>
                        <option value="bus">Bus</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary flex-1">
                {saving ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
              </button>
              {editingUser && (
                <button type="button" onClick={cancelEdit} className="btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </div>
        </form>

        <div className="card lg:col-span-2">
          <div className="card-body">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Existing Users</h2>
            {loading ? (
              <p className="text-gray-500 text-sm">Loading users...</p>
            ) : users.length === 0 ? (
              <p className="text-gray-500 text-sm">No users yet. Create one with the form.</p>
            ) : (
              <div className="overflow-x-auto -mx-6 -mb-6">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="table-header">Name</th>
                      <th className="table-header">Email</th>
                      <th className="table-header">Role</th>
                      <th className="table-header">Badge</th>
                      <th className="table-header text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u._id} className="hover:bg-gray-50/50">
                        <td className="table-cell font-medium text-gray-900">{u.name}</td>
                        <td className="table-cell text-gray-600">{u.email}</td>
                        <td className="table-cell">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              u.role === 'admin'
                                ? 'bg-purple-100 text-purple-800'
                                : u.role === 'officer'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="table-cell text-gray-600">{u.badgeId || '—'}</td>
                        <td className="table-cell text-right space-x-2">
                          <button
                            type="button"
                            onClick={() => startEdit(u)}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            Edit
                          </button>
                          {u.role !== 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleDelete(u)}
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
