import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { finesAPI } from '../api/endpoints';

export default function PoliceDashboard() {
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    finesAPI.list({ limit: 10 }).then((res) => {
      if (res.data.success) setFines(res.data.data);
    }).catch(() => setFines([])).finally(() => setLoading(false));
  }, []);

  const pending = fines.filter((f) => f.status === 'pending').length;
  const paid = fines.filter((f) => f.status === 'paid').length;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Police Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-500">
          <p className="text-gray-500 text-sm">My Issued Fines</p>
          <p className="text-2xl font-bold text-gray-800">{fines.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
          <p className="text-gray-500 text-sm">Pending</p>
          <p className="text-2xl font-bold text-amber-600">{pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Paid</p>
          <p className="text-2xl font-bold text-green-600">{paid}</p>
        </div>
      </div>
      <div className="flex gap-4 mb-6">
        <Link to="/issue-fine" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">Issue New Fine</Link>
        <Link to="/fines" className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">View All Fines</Link>
      </div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <h2 className="px-6 py-3 bg-gray-50 font-medium text-gray-800">Recent Fines</h2>
        {loading ? (
          <p className="p-6 text-gray-500">Loading...</p>
        ) : fines.length === 0 ? (
          <p className="p-6 text-gray-500">No fines issued yet.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fine #</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Driver</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Vehicle</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fines.map((f) => (
                <tr key={f._id}>
                  <td className="px-6 py-3 text-sm text-gray-800">{f.fineNumber}</td>
                  <td className="px-6 py-3 text-sm">{f.driverId?.name}</td>
                  <td className="px-6 py-3 text-sm">{f.vehicleId?.plateNumber}</td>
                  <td className="px-6 py-3 text-sm">₹{f.amount}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${f.status === 'paid' ? 'bg-green-100 text-green-800' : f.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>
                      {f.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
