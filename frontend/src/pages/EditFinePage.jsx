import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { finesAPI, vehiclesAPI, violationsAPI } from '../api/endpoints';
import { useToast } from '../context/ToastContext';

export default function EditFinePage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [fine, setFine] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [violations, setViolations] = useState([]);
  const [form, setForm] = useState({
    violationId: '',
    vehicleId: '',
    amount: '',
    dueDate: '',
    location: '',
    notes: '',
  });

  useEffect(() => {
    Promise.all([finesAPI.get(id), vehiclesAPI.list({ limit: 500 }), violationsAPI.list()])
      .then(([fineRes, vehicleRes, violationRes]) => {
        const fineData = fineRes.data?.data;
        setFine(fineData);
        setVehicles(vehicleRes.data?.data || []);
        setViolations(violationRes.data?.data || []);
        setForm({
          violationId: fineData?.violationId?._id || '',
          vehicleId: fineData?.vehicleId?._id || '',
          amount: fineData?.amount || '',
          dueDate: fineData?.dueDate ? new Date(fineData.dueDate).toISOString().slice(0, 10) : '',
          location: fineData?.location || '',
          notes: fineData?.notes || '',
        });
      })
      .catch(() => setFine(null))
      .finally(() => setLoading(false));
  }, [id]);

  const availableVehicles = useMemo(() => {
    const driverId = fine?.driverId?._id;
    if (!driverId) return vehicles;
    return vehicles.filter((vehicle) => vehicle.driverId?._id === driverId || vehicle.driverId === driverId);
  }, [fine, vehicles]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      await finesAPI.update(id, {
        violationId: form.violationId,
        vehicleId: form.vehicleId,
        amount: Number(form.amount),
        dueDate: form.dueDate,
        location: form.location,
        notes: form.notes,
      });
      showToast('Fine updated successfully.');
      navigate('/fines');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update fine.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleVoidFine = async () => {
    if (!window.confirm('Void this fine?')) return;
    setSaving(true);
    try {
      await finesAPI.update(id, { status: 'cancelled' });
      showToast('Fine voided.');
      navigate('/fines');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to void fine.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="card"><div className="card-body"><p className="text-sm text-gray-500">Loading fine...</p></div></div>;
  }

  if (!fine) {
    return <div className="card"><div className="card-body"><p className="text-sm text-red-600">Fine not found.</p></div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Fine</h1>
        <p className="mt-1 text-sm text-gray-500">Update the violation, vehicle, amount, due date, or notes before payment.</p>
      </div>

      <form onSubmit={handleSubmit} className="card max-w-2xl">
        <div className="card-body space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
              <p className="text-slate-500">Fine #</p>
              <p className="font-semibold text-slate-900 mt-1">{fine.fineNumber}</p>
            </div>
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3">
              <p className="text-slate-500">Driver</p>
              <p className="font-semibold text-slate-900 mt-1">{fine.driverId?.name}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Vehicle</label>
            <select value={form.vehicleId} onChange={(e) => setForm((current) => ({ ...current, vehicleId: e.target.value }))} className="input-field">
              {availableVehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle._id}>{vehicle.plateNumber} - {vehicle.make} {vehicle.model}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Violation</label>
            <select value={form.violationId} onChange={(e) => setForm((current) => ({ ...current, violationId: e.target.value }))} className="input-field">
              {violations.map((violation) => (
                <option key={violation._id} value={violation._id}>{violation.code} - {violation.description}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Amount</label>
              <input type="number" min="1" step="0.01" value={form.amount} onChange={(e) => setForm((current) => ({ ...current, amount: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Due date</label>
              <input type="date" value={form.dueDate} onChange={(e) => setForm((current) => ({ ...current, dueDate: e.target.value }))} className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
            <input type="text" value={form.location} onChange={(e) => setForm((current) => ({ ...current, location: e.target.value }))} className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
            <textarea rows={3} value={form.notes} onChange={(e) => setForm((current) => ({ ...current, notes: e.target.value }))} className="input-field resize-y min-h-[96px]" />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button type="submit" disabled={saving || fine.status === 'paid'} className="btn-primary">
              {saving ? 'Saving...' : 'Save changes'}
            </button>
            <button type="button" onClick={handleVoidFine} disabled={saving || fine.status === 'paid'} className="btn-secondary">
              Void fine
            </button>
            <button type="button" onClick={() => navigate('/fines')} className="btn-secondary">
              Back
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
