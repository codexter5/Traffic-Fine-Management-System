import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { finesAPI } from '../api/endpoints';
import { TableSkeleton } from '../components/common/TableSkeleton';
import { downloadCsv } from '../utils/csv';

const getDueMeta = (dueDate) => {
  if (!dueDate) return { label: 'No due date', tone: 'text-slate-500 bg-slate-100' };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? '' : 's'} overdue`,
      tone: 'text-red-700 bg-red-100',
    };
  }
  if (diffDays === 0) return { label: 'Due today', tone: 'text-amber-700 bg-amber-100' };
  if (diffDays <= 7) return { label: `${diffDays} day${diffDays === 1 ? '' : 's'} left`, tone: 'text-amber-700 bg-amber-100' };
  return { label: `${diffDays} days left`, tone: 'text-emerald-700 bg-emerald-100' };
};

export default function FinesListPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [disputeFilter, setDisputeFilter] = useState('all');

  const isPrivileged = user?.role === 'admin' || user?.role === 'officer';

  const loadFines = () => {
    setLoading(true);
    const params = {};
    if (statusFilter) params.status = statusFilter;
    if (search.trim()) params.q = search.trim();
    if (isPrivileged && disputeFilter !== 'all') params.disputeStatus = disputeFilter;

    finesAPI
      .list(params)
      .then((res) => {
        if (res.data.success) setFines(res.data.data || []);
      })
      .catch(() => setFines([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadFines();
  }, [statusFilter, search, disputeFilter, user?.role]);

  const canPay = (fine) => fine.status === 'pending' && (user?.role === 'driver' || user?.role === 'admin');
  const canEdit = (fine) => isPrivileged && fine.status !== 'paid';
  const canCancel = (fine) => {
    const dueDate = fine.dueDate ? new Date(fine.dueDate) : null;
    return fine.status === 'pending' && (!dueDate || dueDate >= new Date()) && isPrivileged;
  };
  const canDispute = (fine) => user?.role === 'driver' && fine.status !== 'cancelled' && fine.dispute?.status !== 'pending';
  const canResolveDispute = (fine) => isPrivileged && fine.dispute?.status === 'pending';

  const summary = useMemo(
    () => ({
      pending: fines.filter((fine) => fine.status === 'pending').length,
      disputed: fines.filter((fine) => fine.dispute?.status === 'pending').length,
    }),
    [fines]
  );

  const handleCancel = async (fineId) => {
    if (!window.confirm('Cancel this fine?')) return;
    try {
      await finesAPI.update(fineId, { status: 'cancelled' });
      showToast('Fine cancelled.');
      loadFines();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to cancel fine.', 'error');
    }
  };

  const handleDispute = async (fineId) => {
    const reason = window.prompt('Explain why you want to dispute this fine.');
    if (!reason?.trim()) return;
    try {
      await finesAPI.dispute(fineId, { reason: reason.trim() });
      showToast('Dispute submitted.');
      loadFines();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit dispute.', 'error');
    }
  };

  const handleResolveDispute = async (fineId) => {
    const decision = window.prompt('Type accept to cancel the fine, or reject to keep it active.');
    if (!decision) return;
    const normalized = decision.trim().toLowerCase();
    if (!['accept', 'reject', 'accepted', 'rejected'].includes(normalized)) {
      showToast('Use accept or reject.', 'error');
      return;
    }
    const resolutionNote = window.prompt('Optional resolution note:') || '';
    try {
      await finesAPI.resolveDispute(fineId, {
        decision: normalized.startsWith('accept') ? 'accepted' : 'rejected',
        resolutionNote,
      });
      showToast('Dispute resolved.');
      loadFines();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to resolve dispute.', 'error');
    }
  };

  const handleExport = () => {
    downloadCsv(
      'fines-export.csv',
      fines.map((fine) => ({
        fineNumber: fine.fineNumber,
        driver: fine.driverId?.name || '',
        vehicle: fine.vehicleId?.plateNumber || '',
        violation: fine.violationId?.description || '',
        amount: fine.amount,
        status: fine.status,
        disputeStatus: fine.dispute?.status || 'none',
        dueDate: fine.dueDate ? new Date(fine.dueDate).toLocaleDateString() : '',
      }))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fines</h1>
          <p className="mt-1 text-sm text-gray-500">Search by fine number, driver, plate number, or violation.</p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="rounded-xl bg-white border border-slate-200 px-4 py-3 min-w-[140px]">
            <p className="text-slate-500">Pending</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{summary.pending}</p>
          </div>
          {isPrivileged && (
            <div className="rounded-xl bg-white border border-slate-200 px-4 py-3 min-w-[140px]">
              <p className="text-slate-500">Open disputes</p>
              <p className="text-xl font-bold text-slate-900 mt-1">{summary.disputed}</p>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-body space-y-4">
          <div className="flex flex-col xl:flex-row xl:items-center gap-3">
            <div className="relative flex-1">
              <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
              </svg>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search fines, drivers, or plates"
                className="input-field pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="input-field w-full sm:w-40">
                <option value="">All statuses</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="cancelled">Cancelled</option>
              </select>
              {isPrivileged && (
                <select value={disputeFilter} onChange={(event) => setDisputeFilter(event.target.value)} className="input-field w-full sm:w-44">
                  <option value="all">All disputes</option>
                  <option value="pending">Pending disputes</option>
                  <option value="accepted">Accepted disputes</option>
                  <option value="rejected">Rejected disputes</option>
                  <option value="none">No disputes</option>
                </select>
              )}
              {isPrivileged && (
                <button type="button" onClick={handleExport} className="btn-secondary">
                  Export CSV
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <TableSkeleton rows={6} cols={user?.role === 'driver' ? 8 : 9} />
          ) : fines.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 font-medium">No fines found</p>
              <p className="text-gray-400 text-sm mt-1">Try adjusting the filters or search term.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 -mb-6">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="table-header">Fine #</th>
                    {user?.role !== 'driver' && <th className="table-header">Driver</th>}
                    <th className="table-header">Vehicle</th>
                    <th className="table-header">Violation</th>
                    <th className="table-header">Amount</th>
                    <th className="table-header">Due</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Dispute</th>
                    <th className="table-header text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {fines.map((fine) => {
                    const dueMeta = getDueMeta(fine.dueDate);
                    return (
                      <tr key={fine._id} className="hover:bg-gray-50/50">
                        <td className="table-cell font-medium text-gray-900">{fine.fineNumber}</td>
                        {user?.role !== 'driver' && (
                          <td className="table-cell">
                            <p className="font-medium text-slate-900">{fine.driverId?.name}</p>
                            <p className="text-xs text-slate-500">{fine.driverId?.licenseNumber}</p>
                          </td>
                        )}
                        <td className="table-cell">
                          <p className="font-medium text-slate-900">{fine.vehicleId?.plateNumber}</p>
                          <p className="text-xs text-slate-500">{fine.vehicleId?.make} {fine.vehicleId?.model}</p>
                        </td>
                        <td className="table-cell">{fine.violationId?.description}</td>
                        <td className="table-cell">₹{fine.amount}</td>
                        <td className="table-cell">
                          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${dueMeta.tone}`}>
                            {dueMeta.label}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              fine.status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : fine.status === 'pending'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {fine.status}
                          </span>
                        </td>
                        <td className="table-cell">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              fine.dispute?.status === 'pending'
                                ? 'bg-orange-100 text-orange-800'
                                : fine.dispute?.status === 'accepted'
                                ? 'bg-emerald-100 text-emerald-800'
                                : fine.dispute?.status === 'rejected'
                                ? 'bg-slate-200 text-slate-700'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {fine.dispute?.status || 'none'}
                          </span>
                        </td>
                        <td className="table-cell text-right">
                          <div className="flex flex-wrap justify-end gap-2">
                            {canPay(fine) && (
                              <Link to={`/fines/${fine._id}/pay`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                                Pay
                              </Link>
                            )}
                            {canEdit(fine) && (
                              <Link to={`/fines/${fine._id}/edit`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                                Edit
                              </Link>
                            )}
                            {canCancel(fine) && (
                              <button type="button" onClick={() => handleCancel(fine._id)} className="text-red-600 hover:text-red-700 text-sm font-medium">
                                Cancel
                              </button>
                            )}
                            {canDispute(fine) && (
                              <button type="button" onClick={() => handleDispute(fine._id)} className="text-amber-700 hover:text-amber-800 text-sm font-medium">
                                Dispute
                              </button>
                            )}
                            {canResolveDispute(fine) && (
                              <button type="button" onClick={() => handleResolveDispute(fine._id)} className="text-orange-700 hover:text-orange-800 text-sm font-medium">
                                Resolve
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
