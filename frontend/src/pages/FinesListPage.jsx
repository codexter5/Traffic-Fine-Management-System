import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { finesAPI } from '../api/endpoints';

export default function FinesListPage() {
  const { user } = useAuth();
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const loadFines = (status) => {
    setLoading(true);
    const params = status ? { status } : {};
    finesAPI
      .list(params)
      .then((res) => {
        if (res.data.success) setFines(res.data.data);
      })
      .catch(() => setFines([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFines(statusFilter);
  }, [statusFilter]);

  const canPay = (f) => f.status === 'pending' && (user?.role === 'driver' || user?.role === 'admin');

  const canCancel = (f) =>
    f.status === 'pending' && (user?.role === 'officer' || user?.role === 'admin');

  const handleCancel = async (fineId) => {
    if (!window.confirm('Are you sure you want to cancel this fine?')) return;
    try {
      await finesAPI.update(fineId, { status: 'cancelled' });
      loadFines(statusFilter);
    } catch (err) {
      // simple alert for demo purposes
      alert(err.response?.data?.message || 'Failed to cancel fine.');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Fines</h1>
      {(user?.role === 'admin' || user?.role === 'officer') && (
        <div className="mb-4 flex gap-2">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="border rounded px-3 py-2">
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      )}
      {loading ? (
        <p className="text-gray-500">Loading fines...</p>
      ) : fines.length === 0 ? (
        <p className="text-gray-500">No fines found.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fine #</th>
                {user?.role !== 'driver' && <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>}
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Violation</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fines.map((f) => (
                <tr key={f._id}>
                  <td className="px-6 py-3 text-sm text-gray-800">{f.fineNumber}</td>
                  {user?.role !== 'driver' && <td className="px-6 py-3 text-sm">{f.driverId?.name}</td>}
                  <td className="px-6 py-3 text-sm">{f.vehicleId?.plateNumber}</td>
                  <td className="px-6 py-3 text-sm">{f.violationId?.description}</td>
                  <td className="px-6 py-3 text-sm">₹{f.amount}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${f.status === 'paid' ? 'bg-green-100 text-green-800' : f.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 space-x-2">
                    {canPay(f) && (
                      <Link
                        to={`/fines/${f._id}/pay`}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-primary-50 text-primary-700 hover:bg-primary-100"
                      >
                        Pay
                      </Link>
                    )}
                    {canCancel(f) && (
                      <button
                        type="button"
                        onClick={() => handleCancel(f._id)}
                        className="inline-flex items-center px-3 py-1 text-xs font-medium rounded-full bg-red-50 text-red-700 hover:bg-red-100"
                      >
                        Cancel
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
  );
}
