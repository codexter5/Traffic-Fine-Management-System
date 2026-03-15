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
        <div className="card border-l-4 border-l-amber-500 bg-amber-50/30">
          <div className="card-body">
            <p className="text-sm font-medium text-amber-800">Pending to pay</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{pending.length}</p>
          </div>
        </div>
        <div className="card border-l-4 border-l-green-500 bg-green-50/30">
          <div className="card-body">
            <p className="text-sm font-medium text-green-800">Paid</p>
            <p className="text-2xl font-bold text-green-700 mt-1">{paid.length}</p>
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
