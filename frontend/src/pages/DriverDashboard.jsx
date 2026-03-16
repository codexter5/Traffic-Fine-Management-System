import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { finesAPI } from '../api/endpoints';

export default function DriverDashboard() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    finesAPI
      .list()
      .then((res) => {
        if (res.data.success) setFines(res.data.data);
      })
      .catch(() => setFines([]))
      .finally(() => setLoading(false));
  }, []);

  const pending = fines.filter((f) => f.status === 'pending');
  const paid = fines.filter((f) => f.status === 'paid');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My Fines</h1>
        <p className="mt-1 text-sm text-gray-500">Fines linked to your account (from database).</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="card-body flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending to pay</p>
              <p className="text-3xl font-bold text-amber-600 mt-2 tracking-tight">{pending.length}</p>
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
              <p className="text-3xl font-bold text-emerald-600 mt-2 tracking-tight">{paid.length}</p>
            </div>
            <span className="w-11 h-11 shrink-0 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
        </div>
      </div>
      {loading ? (
        <div className="card">
          <div className="card-body">
            <p className="text-gray-500 text-sm">Loading...</p>
          </div>
        </div>
      ) : fines.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <p className="text-gray-500 text-sm">You have no fines.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="table-header">Fine #</th>
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
                    <td className="table-cell">{f.violationId?.description}</td>
                    <td className="table-cell">₹{f.amount}</td>
                    <td className="table-cell">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          f.status === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {f.status}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      {f.status === 'pending' && (
                        <Link
                          to={`/fines/${f._id}/pay`}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          Pay now
                        </Link>
                      )}
                    </td>
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
