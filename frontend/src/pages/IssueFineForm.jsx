import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { driversAPI, vehiclesAPI, violationsAPI, finesAPI } from '../api/endpoints';

export default function IssueFineForm() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [violations, setViolations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creatingViolation, setCreatingViolation] = useState(false);
  const [showCustomViolation, setShowCustomViolation] = useState(false);
  const [customViolationError, setCustomViolationError] = useState('');
  const [success, setSuccess] = useState('');
  const [customViolation, setCustomViolation] = useState({
    code: '',
    description: '',
    defaultAmount: '',
    points: '',
  });
  const [form, setForm] = useState({
    driverId: '',
    vehicleId: '',
    violationId: '',
    amount: '',
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    location: '',
    notes: '',
  });

  const loadOptions = () => {
    Promise.all([
      driversAPI.list({ limit: 500 }),
      vehiclesAPI.list({ limit: 500 }),
      violationsAPI.list(),
    ])
      .then(([d, v, vv]) => {
        if (d.data.success) setDrivers(d.data.data);
        if (v.data.success) setVehicles(v.data.data);
        if (vv.data.success) setViolations(vv.data.data);
      })
      .catch(console.error);
  };

  useEffect(() => {
    loadOptions();
  }, []);

  const handleDriverChange = (driverId) => {
    setForm((prev) => ({ ...prev, driverId, vehicleId: '' }));
    if (driverId) {
      vehiclesAPI.list({ driverId }).then((res) => {
        if (res.data.success) setVehicles(res.data.data);
      });
    } else {
      loadOptions();
    }
  };

  const handleViolationSelect = (violationId) => {
    const v = violations.find((x) => x._id === violationId);
    setForm((prev) => ({ ...prev, violationId, amount: v ? v.defaultAmount : prev.amount }));
  };

  const handleCreateCustomViolation = async (e) => {
    e.preventDefault();
    setCustomViolationError('');
    if (!customViolation.code.trim() || !customViolation.description.trim()) {
      setCustomViolationError('Code and description are required.');
      return;
    }
    if (!customViolation.defaultAmount && customViolation.defaultAmount !== 0) {
      setCustomViolationError('Default amount is required.');
      return;
    }

    setCreatingViolation(true);
    try {
      const res = await violationsAPI.create({
        code: customViolation.code.trim(),
        description: customViolation.description.trim(),
        defaultAmount: Number(customViolation.defaultAmount),
        points: customViolation.points ? Number(customViolation.points) : 0,
      });

      if (res.data?.success && res.data?.data) {
        const created = res.data.data;
        setViolations((prev) => [...prev, created].sort((a, b) => a.code.localeCompare(b.code)));
        setForm((prev) => ({
          ...prev,
          violationId: created._id,
          amount: created.defaultAmount,
        }));
        setCustomViolation({ code: '', description: '', defaultAmount: '', points: '' });
        setShowCustomViolation(false);
        setSuccess(`Custom violation ${created.code} created and selected.`);
      }
    } catch (err) {
      setCustomViolationError(err.response?.data?.message || 'Failed to create custom violation.');
    } finally {
      setCreatingViolation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    if (!form.driverId || !form.vehicleId || !form.violationId || !form.amount) {
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
        setSuccess(`Fine ${res.data.data.fineNumber} issued and saved to the database.`);
        setForm((prev) => ({
          ...prev,
          driverId: '',
          vehicleId: '',
          violationId: '',
          amount: '',
        }));
      }
    } catch (err) {
      setSuccess('');
      alert(err.response?.data?.message || 'Failed to issue fine');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Issue Fine</h1>
        <p className="mt-1 text-sm text-gray-500">
          Select a driver and vehicle from the database. Data is saved when you submit.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="card max-w-2xl">
        <div className="card-body space-y-4">
          {success && (
            <div className="text-sm text-green-700 bg-green-50 px-3 py-2.5 rounded-lg border border-green-100">
              {success}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Driver *</label>
            <select
              value={form.driverId}
              onChange={(e) => handleDriverChange(e.target.value)}
              required
              className="input-field"
            >
              <option value="">Select driver</option>
              {drivers.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.licenseNumber})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Vehicle *</label>
            <select
              value={form.vehicleId}
              onChange={(e) => setForm((prev) => ({ ...prev, vehicleId: e.target.value }))}
              required
              className="input-field"
            >
              <option value="">Select vehicle</option>
              {vehicles.map((v) => (
                <option
                  key={v._id}
                  value={v._id}
                  disabled={form.driverId && v.driverId?._id !== form.driverId}
                >
                  {v.plateNumber} — {v.make} {v.model}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Violation *</label>
            <select
              value={form.violationId}
              onChange={(e) => handleViolationSelect(e.target.value)}
              required
              className="input-field"
            >
              <option value="">Select violation</option>
              {violations.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.code} — {v.description} (₹{v.defaultAmount})
                </option>
              ))}
            </select>
            <div className="mt-2">
              <button
                type="button"
                onClick={() => {
                  setCustomViolationError('');
                  setShowCustomViolation((prev) => !prev);
                }}
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                {showCustomViolation ? 'Close custom violation form' : '+ Add custom violation'}
              </button>
            </div>
            {showCustomViolation && (
              <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <h3 className="text-sm font-semibold text-slate-900">Create custom violation</h3>
                {customViolationError && (
                  <div className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-lg border border-red-100">
                    {customViolationError}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Code *</label>
                    <input
                      type="text"
                      value={customViolation.code}
                      onChange={(e) => setCustomViolation((prev) => ({ ...prev, code: e.target.value }))}
                      className="input-field"
                      placeholder="e.g. CUSTOM-001"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Default amount (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={customViolation.defaultAmount}
                      onChange={(e) =>
                        setCustomViolation((prev) => ({ ...prev, defaultAmount: e.target.value }))
                      }
                      className="input-field"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description *</label>
                  <input
                    type="text"
                    value={customViolation.description}
                    onChange={(e) =>
                      setCustomViolation((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="input-field"
                    placeholder="Describe the violation"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Points (optional)</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={customViolation.points}
                    onChange={(e) => setCustomViolation((prev) => ({ ...prev, points: e.target.value }))}
                    className="input-field"
                    placeholder="0"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    disabled={creatingViolation}
                    onClick={handleCreateCustomViolation}
                    className="btn-primary"
                  >
                    {creatingViolation ? 'Creating...' : 'Create violation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustomViolation(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount (₹) *</label>
            <input
              type="number"
              min="1"
              step="0.01"
              value={form.amount}
              onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
              required
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Due date *</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm((prev) => ({ ...prev, dueDate: e.target.value }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Location (optional)</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
              className="input-field"
              placeholder="e.g. Main Street, Junction"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              className="input-field resize-y min-h-[80px]"
              rows={2}
              placeholder="Additional details"
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Issuing...' : 'Issue Fine'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
