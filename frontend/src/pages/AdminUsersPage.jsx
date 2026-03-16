import { useEffect, useState } from 'react';
import { usersAPI, driversAPI } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';

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
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.badgeId?.toLowerCase().includes(q);
    return matchesRole && matchesSearch;
  });

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
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900">Existing Users</h2>
              {!loading && users.length > 0 && (
                <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                  {filteredUsers.length} / {users.length}
                </span>
              )}
            </div>

            {/* Filter toolbar */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <div className="relative flex-1 min-w-0">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, email or badge…"
                  className="input-field pl-9 py-2 text-sm"
                />
              </div>
              <div className="flex gap-2 shrink-0">
                {['all', 'admin', 'officer', 'driver'].map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRoleFilter(r)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold border transition whitespace-nowrap ${
                      roleFilter === r
                        ? 'bg-primary-600 text-white border-primary-600 shadow-sm'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-primary-400 hover:text-primary-600'
                    }`}
                  >
                    {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <p className="text-gray-500 text-sm">Loading users...</p>
            ) : filteredUsers.length === 0 ? (
              <div className="py-10 text-center">
                <svg className="w-10 h-10 text-slate-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm font-medium text-slate-500">
                  {users.length === 0 ? 'No users yet. Create one with the form.' : 'No users match your filters.'}
                </p>
              </div>
            ) : (
              <>
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
                    {filteredUsers.map((u) => {
                      const canManage = u.role !== 'admin' || u._id === currentUser?.id;
                      return (
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
                          {canManage ? (
                            <>
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
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">Protected admin</span>
                          )}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
