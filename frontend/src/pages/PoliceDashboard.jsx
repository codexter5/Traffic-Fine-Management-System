import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { finesAPI } from '../api/endpoints';

export default function PoliceDashboard() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    finesAPI
      .list({ limit: 10 })
      .then((res) => {
        if (res.data.success) setFines(res.data.data);
      })
      .catch(() => setFines([]))
      .finally(() => setLoading(false));
  }, []);

  const pending = fines.filter((f) => f.status === 'pending').length;
  const paid = fines.filter((f) => f.status === 'paid').length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Police Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Fines you have issued (from database).</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="card-body flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">My issued fines</p>
              <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{fines.length}</p>
            </div>
            <span className="w-11 h-11 shrink-0 rounded-2xl bg-primary-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
          </div>
        </div>
        <div className="card">
          <div className="card-body flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending</p>
              <p className="text-3xl font-bold text-amber-600 mt-2 tracking-tight">{pending}</p>
            </div>
            <span className="w-11 h-11 shrink-0 rounded-2xl bg-amber-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
        </div>
        <div className="card">
          <div className="card-body flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Paid</p>
              <p className="text-3xl font-bold text-emerald-600 mt-2 tracking-tight">{paid}</p>
            </div>
            <span className="w-11 h-11 shrink-0 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-3">
        <Link to="/issue-fine" className="btn-primary">
          Issue new fine
        </Link>
        <Link to="/fines" className="btn-secondary">
          View all fines
        </Link>
      </div>
      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent fines</h2>
          {loading ? (
            <p className="text-gray-500 text-sm">Loading...</p>
          ) : fines.length === 0 ? (
            <p className="text-gray-500 text-sm">No fines issued yet.</p>
          ) : (
            <div className="overflow-x-auto -mx-6 -mb-6">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="table-header">Fine #</th>
                    <th className="table-header">Driver</th>
                    <th className="table-header">Vehicle</th>
                    <th className="table-header">Amount</th>
                    <th className="table-header">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fines.map((f) => (
                    <tr key={f._id} className="hover:bg-gray-50/50">
                      <td className="table-cell font-medium text-gray-900">{f.fineNumber}</td>
                      <td className="table-cell">{f.driverId?.name}</td>
                      <td className="table-cell">{f.vehicleId?.plateNumber}</td>
                      <td className="table-cell">₹{f.amount}</td>
                      <td className="table-cell">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            f.status === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : f.status === 'pending'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {f.status}
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
  );
}
