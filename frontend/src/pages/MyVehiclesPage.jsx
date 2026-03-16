import { useEffect, useState } from 'react';
import { vehiclesAPI } from '../api/endpoints';

const emptyVehicle = {
  plateNumber: '',
  make: '',
  model: '',
  year: '',
  type: 'car',
};

export default function MyVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState(emptyVehicle);

  const loadVehicles = () => {
    setLoading(true);
    vehiclesAPI
      .listMy()
      .then((res) => {
        if (res.data?.success) setVehicles(res.data.data || []);
      })
      .catch(() => setVehicles([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.plateNumber.trim()) {
      setError('Plate number is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        plateNumber: form.plateNumber.trim(),
        make: form.make.trim() || undefined,
        model: form.model.trim() || undefined,
        year: form.year ? Number(form.year) : undefined,
        type: form.type || 'car',
      };
      await vehiclesAPI.createMy(payload);
      setForm(emptyVehicle);
      setSuccess('Vehicle added successfully.');
      loadVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add vehicle.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Vehicles</h1>
        <p className="mt-1 text-sm text-gray-500">Vehicles linked to your driver profile in MongoDB.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleCreate} className="card lg:col-span-1">
          <div className="card-body space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Add Vehicle</h2>
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
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Plate number *</label>
              <input
                type="text"
                value={form.plateNumber}
                onChange={(e) => setForm((p) => ({ ...p, plateNumber: e.target.value }))}
                className="input-field"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Make</label>
                <input
                  type="text"
                  value={form.make}
                  onChange={(e) => setForm((p) => ({ ...p, make: e.target.value }))}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Model</label>
                <input
                  type="text"
                  value={form.model}
                  onChange={(e) => setForm((p) => ({ ...p, model: e.target.value }))}
                  className="input-field"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Year</label>
                <input
                  type="number"
                  value={form.year}
                  onChange={(e) => setForm((p) => ({ ...p, year: e.target.value }))}
                  className="input-field"
                  placeholder="2024"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Type</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
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
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving...' : 'Add Vehicle'}
            </button>
          </div>
        </form>

        <div className="card lg:col-span-2">
          <div className="card-body">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Registered Vehicles</h2>
            {loading ? (
              <p className="text-gray-500 text-sm">Loading vehicles...</p>
            ) : vehicles.length === 0 ? (
              <p className="text-gray-500 text-sm">No vehicles linked to your account yet.</p>
            ) : (
              <div className="overflow-x-auto -mx-6 -mb-6">
                <table className="min-w-full">
                  <thead>
                    <tr>
                      <th className="table-header">Plate</th>
                      <th className="table-header">Make</th>
                      <th className="table-header">Model</th>
                      <th className="table-header">Year</th>
                      <th className="table-header">Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vehicles.map((v) => (
                      <tr key={v._id} className="hover:bg-gray-50/50">
                        <td className="table-cell font-medium text-gray-900">{v.plateNumber}</td>
                        <td className="table-cell">{v.make || '—'}</td>
                        <td className="table-cell">{v.model || '—'}</td>
                        <td className="table-cell">{v.year || '—'}</td>
                        <td className="table-cell">
                          <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-50 text-blue-700">
                            {v.type || 'car'}
                          </span>
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
