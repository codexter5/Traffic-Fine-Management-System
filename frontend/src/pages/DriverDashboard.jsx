import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { finesAPI } from '../api/endpoints';

const getDueMeta = (dueDate) => {
  if (!dueDate) return { label: 'No due date', tone: 'text-slate-500 bg-slate-100' };
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { label: `${Math.abs(diffDays)} overdue`, tone: 'text-red-700 bg-red-100' };
  if (diffDays === 0) return { label: 'Due today', tone: 'text-amber-700 bg-amber-100' };
  return { label: `${diffDays} day${diffDays === 1 ? '' : 's'} left`, tone: diffDays <= 7 ? 'text-amber-700 bg-amber-100' : 'text-emerald-700 bg-emerald-100' };
};

export default function DriverDashboard() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    finesAPI
      .list()
      .then((res) => {
        if (res.data.success) setFines(res.data.data || []);
      })
      .catch(() => setFines([]))
      .finally(() => setLoading(false));
  }, []);

  const pending = fines.filter((fine) => fine.status === 'pending');
  const paid = fines.filter((fine) => fine.status === 'paid');
  const disputed = fines.filter((fine) => fine.dispute?.status === 'pending');
  const nextDue = useMemo(() => pending.slice().sort((a, b) => new Date(a.dueDate || 0) - new Date(b.dueDate || 0))[0], [pending]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Fines</h1>
          <p className="mt-1 text-sm text-gray-500">Track pending fines, dispute status, and recent payments.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link to="/payments" className="btn-secondary">Payment history</Link>
          <Link to="/fines" className="btn-primary">Open fines list</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card"><div className="card-body flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending</p><p className="text-3xl font-bold text-amber-600 mt-2 tracking-tight">{pending.length}</p></div><span className="w-11 h-11 shrink-0 rounded-2xl bg-amber-50 flex items-center justify-center"><svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span></div></div>
        <div className="card"><div className="card-body flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Paid</p><p className="text-3xl font-bold text-emerald-600 mt-2 tracking-tight">{paid.length}</p></div><span className="w-11 h-11 shrink-0 rounded-2xl bg-emerald-50 flex items-center justify-center"><svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span></div></div>
        <div className="card"><div className="card-body flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Open disputes</p><p className="text-3xl font-bold text-orange-600 mt-2 tracking-tight">{disputed.length}</p></div><span className="w-11 h-11 shrink-0 rounded-2xl bg-orange-50 flex items-center justify-center"><svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" /></svg></span></div></div>
      </div>

      {nextDue && (
        <div className="card">
          <div className="card-body flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Next payment due</p>
              <p className="text-lg font-semibold text-slate-900 mt-1">{nextDue.fineNumber} · ₹{nextDue.amount}</p>
              <p className="text-sm text-slate-500 mt-1">{nextDue.violationId?.description}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getDueMeta(nextDue.dueDate).tone}`}>{getDueMeta(nextDue.dueDate).label}</span>
              <Link to={`/fines/${nextDue._id}/pay`} className="btn-primary">Pay now</Link>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="card"><div className="card-body"><p className="text-gray-500 text-sm">Loading...</p></div></div>
      ) : fines.length === 0 ? (
        <div className="card"><div className="card-body"><p className="text-gray-500 text-sm">You have no fines.</p></div></div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="table-header">Fine #</th>
                  <th className="table-header">Violation</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Due</th>
                  <th className="table-header">Dispute</th>
                  <th className="table-header">Status</th>
                  <th className="table-header text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {fines.map((fine) => (
                  <tr key={fine._id} className="hover:bg-gray-50/50">
                    <td className="table-cell font-medium text-gray-900">{fine.fineNumber}</td>
                    <td className="table-cell">{fine.violationId?.description}</td>
                    <td className="table-cell">₹{fine.amount}</td>
                    <td className="table-cell"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getDueMeta(fine.dueDate).tone}`}>{getDueMeta(fine.dueDate).label}</span></td>
                    <td className="table-cell"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${fine.dispute?.status === 'pending' ? 'bg-orange-100 text-orange-800' : fine.dispute?.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' : fine.dispute?.status === 'rejected' ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-600'}`}>{fine.dispute?.status || 'none'}</span></td>
                    <td className="table-cell"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${fine.status === 'paid' ? 'bg-green-100 text-green-800' : fine.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>{fine.status}</span></td>
                    <td className="table-cell text-right">{fine.status === 'pending' && <Link to={`/fines/${fine._id}/pay`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">Pay now</Link>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
