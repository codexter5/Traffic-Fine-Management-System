import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { driversAPI, vehiclesAPI, violationsAPI, finesAPI } from '../api/endpoints';

export default function IssueFineForm() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    driverId: '',
    vehicleId: '',
    violationId: '',
    amount: '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    location: '',
    notes: '',
  });

  useEffect(() => {
    Promise.all([driversAPI.list({ limit: 500 }), vehiclesAPI.list({ limit: 500 }), violationsAPI.list()])
      .then(([d, v, vv]) => {
        if (d.data.success) setDrivers(d.data.data);
        if (v.data.success) setVehicles(v.data.data);
        if (vv.data.success) setViolations(vv.data.data);
      })
      .catch(console.error);
  }, []);

  const handleDriverChange = (driverId) => {
    setForm((prev) => ({ ...prev, driverId, vehicleId: '' }));
    if (driverId) {
      vehiclesAPI.list({ driverId }).then((res) => {
        if (res.data.success) setVehicles(res.data.data);
      });
    } else {
      vehiclesAPI.list({ limit: 500 }).then((res) => {
        if (res.data.success) setVehicles(res.data.data);
      });
    }
  };

  const handleViolationSelect = (violationId) => {
    const v = violations.find((x) => x._id === violationId);
    setForm((prev) => ({ ...prev, violationId, amount: v ? v.defaultAmount : prev.amount }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.driverId || !form.vehicleId || !form.violationId || !form.amount) {
      alert('Please fill driver, vehicle, violation and amount.');
      return;
    }
    setLoading(true);
    try {
      const res = await finesAPI.create({
        driverId: form.driverId,
        vehicleId: form.vehicleId,
        violationId: form.violationId,
        amount: Number(form.amount),
        dueDate: form.dueDate,
        location: form.location || undefined,
        notes: form.notes || undefined,
      });
      if (res.data.success) {
        alert('Fine issued successfully: ' + res.data.data.fineNumber);
        navigate('/fines');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to issue fine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Issue Fine</h1>
      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Driver *</label>
          <select
            value={form.driverId}
            onChange={(e) => handleDriverChange(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Select driver</option>
            {drivers.map((d) => (
              <option key={d._id} value={d._id}>{d.name} ({d.licenseNumber})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle *</label>
          <select
            value={form.vehicleId}
            onChange={(e) => setForm((prev) => ({ ...prev, vehicleId: e.target.value }))}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Select vehicle</option>
            {vehicles.map((v) => (
              <option key={v._id} value={v._id} disabled={form.driverId && v.driverId?._id !== form.driverId}>
                {v.plateNumber} - {v.make} {v.model}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Violation *</label>
          <select
            value={form.violationId}
            onChange={(e) => handleViolationSelect(e.target.value)}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value="">Select violation</option>
            {violations.map((v) => (
              <option key={v._id} value={v._id}>{v.code} - {v.description} (₹{v.defaultAmount})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount (₹) *</label>
          <input
            type="number"
            min="1"
            step="0.01"
            value={form.amount}
            onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
            required
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Due Date *</label>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-2"
            placeholder="e.g. Main Street, Junction"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
            className="w-full border border-gray-300 rounded px-3 py-2"
            rows={2}
          />
        </div>
        <div className="flex gap-4">
          <button type="submit" disabled={loading} className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 disabled:opacity-50">
            {loading ? 'Issuing...' : 'Issue Fine'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
