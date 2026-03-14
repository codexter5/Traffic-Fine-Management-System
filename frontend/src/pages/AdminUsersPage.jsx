import { useEffect, useState } from 'react';
import { usersAPI } from '../api/endpoints';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'officer',
    badgeId: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
    if (!form.name || !form.email || (!editingUser && !form.password)) {
      setError(editingUser ? 'Name and email are required.' : 'Name, email and password are required.');
      return;
    }
    setSaving(true);
    try {
      if (editingUser) {
        await usersAPI.update(editingUser._id, {
          name: form.name,
          email: form.email,
          password: form.password || undefined,
          role: form.role,
          badgeId: form.role === 'officer' ? form.badgeId : undefined,
        });
      } else {
        await usersAPI.create({
          name: form.name,
          email: form.email,
          password: form.password,
          role: form.role,
          badgeId: form.role === 'officer' ? form.badgeId : undefined,
        });
      }
      setForm({ name: '', email: '', password: '', role: 'officer', badgeId: '' });
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create user.');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'officer',
      badgeId: user.badgeId || '',
    });
    setError('');
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setForm({ name: '', email: '', password: '', role: 'officer', badgeId: '' });
    setError('');
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete user ${user.email}?`)) return;
    try {
      await usersAPI.remove(user._id);
      if (editingUser && editingUser._id === user._id) {
        cancelEdit();
      }
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Manage Users</h1>
        <p className="text-gray-500 text-sm">
          Create new admins, officers or driver accounts for the system.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-6 space-y-4 lg:col-span-1"
        >
          <h2 className="text-lg font-semibold text-gray-800">
            {editingUser ? 'Edit User' : 'Create New User'}
          </h2>
          {error && <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password {editingUser ? '(leave blank to keep unchanged)' : '*'}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
              className="w-full border border-gray-300 rounded px-3 py-2"
            >
              <option value="admin">Admin</option>
              <option value="officer">Officer</option>
              <option value="driver">Driver</option>
            </select>
          </div>
          {form.role === 'officer' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Badge ID (optional)
              </label>
              <input
                type="text"
                value={form.badgeId}
                onChange={(e) => setForm((prev) => ({ ...prev, badgeId: e.target.value }))}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
          )}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-primary-600 text-white py-2 rounded hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingUser ? 'Update User' : 'Create User'}
            </button>
            {editingUser && (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100 text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Existing Users</h2>
          {loading ? (
            <p className="text-gray-500 text-sm">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-500 text-sm">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                      Badge
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{u.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{u.email}</td>
                      <td className="px-4 py-2 text-sm">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
                      <td className="px-4 py-2 text-sm text-gray-600">{u.badgeId || '-'}</td>
                      <td className="px-4 py-2 text-sm text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => startEdit(u)}
                          className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-primary-50 text-primary-700 hover:bg-primary-100"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(u)}
                          className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-red-50 text-red-700 hover:bg-red-100"
                        >
                          Delete
                        </button>
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
  );
}

