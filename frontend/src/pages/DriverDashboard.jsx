import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { finesAPI } from '../api/endpoints';

export default function DriverDashboard() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    finesAPI.list()
      .then((res) => { if (res.data.success) setFines(res.data.data); })
      .catch(() => setFines([]))
      .finally(() => setLoading(false));
  }, []);

  const pending = fines.filter((f) => f.status === 'pending');
  const paid = fines.filter((f) => f.status === 'paid');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Fines</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-amber-50 rounded-lg shadow p-6 border-l-4 border-amber-500">
          <p className="text-amber-800 text-sm font-medium">Pending to Pay</p>
          <p className="text-2xl font-bold text-amber-700">{pending.length}</p>
        </div>
        <div className="bg-green-50 rounded-lg shadow p-6 border-l-4 border-green-500">
          <p className="text-green-800 text-sm font-medium">Paid</p>
          <p className="text-2xl font-bold text-green-700">{paid.length}</p>
        </div>
      </div>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : fines.length === 0 ? (
        <p className="text-gray-500">You have no fines.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fine #</th>
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
                  <td className="px-6 py-3 text-sm">{f.violationId?.description}</td>
                  <td className="px-6 py-3 text-sm">₹{f.amount}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${f.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {f.status}
                    </span>
                  </td>
                  <td className="px-6 py-3">
                    {f.status === 'pending' && (
                      <Link to={`/fines/${f._id}/pay`} className="text-primary-600 hover:underline text-sm">Pay Now</Link>
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
