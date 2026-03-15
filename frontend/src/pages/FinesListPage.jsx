import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { finesAPI } from '../api/endpoints';
import { TableSkeleton } from '../components/common/TableSkeleton';

export default function FinesListPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
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
  const isOverdue = (f) => (f.dueDate ? new Date(f.dueDate) < new Date() : false);
  const canCancel = (f) =>
    f.status === 'pending' &&
    !isOverdue(f) &&
    (user?.role === 'officer' || user?.role === 'admin');

  const handleCancel = async (fineId) => {
    if (!window.confirm('Cancel this fine?')) return;
    try {
      await finesAPI.update(fineId, { status: 'cancelled' });
      loadFines(statusFilter);
      showToast('Fine cancelled.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel fine.', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fines</h1>
          <p className="mt-1 text-sm text-gray-500">All fines are stored in the database.</p>
        </div>
        {(user?.role === 'admin' || user?.role === 'officer') && (
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field w-full sm:w-44"
          >
            <option value="">All statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="cancelled">Cancelled</option>
          </select>
        )}
      </div>
      <div className="card">
        {loading ? (
          <div className="card-body">
            <TableSkeleton rows={6} cols={user?.role === 'driver' ? 5 : 7} />
          </div>
        ) : fines.length === 0 ? (
          <div className="card-body text-center py-12">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-400 mb-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">No fines found</p>
            <p className="text-gray-400 text-sm mt-1">Fines will appear here once issued.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="table-header">Fine #</th>
                  {user?.role !== 'driver' && <th className="table-header">Driver</th>}
                  <th className="table-header">Vehicle</th>
                  <th className="table-header">Violation</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {fines.map((f) => (
                  <tr key={f._id} className="hover:bg-gray-50/50">
                    <td className="table-cell font-medium text-gray-900">{f.fineNumber}</td>
                    {user?.role !== 'driver' && (
                      <td className="table-cell">{f.driverId?.name}</td>
                    )}
                    <td className="table-cell">{f.vehicleId?.plateNumber}</td>
                    <td className="table-cell">{f.violationId?.description}</td>
                    <td className="table-cell">₹{f.amount}</td>
                    <td className="table-cell">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          f.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : f.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td className="table-cell text-right space-x-2">
                      {canPay(f) && (
                        <Link
                          to={`/fines/${f._id}/pay`}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          Pay
                        </Link>
                      )}
                      {canCancel(f) && (
                        <button
                          type="button"
                          onClick={() => handleCancel(f._id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
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
    </div>
  );
}
