import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../api/endpoints';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats()
      .then((res) => { if (res.data.success) setStats(res.data.data); })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!stats) return <p className="text-red-500">Failed to load stats.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-500">
          <p className="text-gray-500 text-sm">Total Fines</p>
          <p className="text-2xl font-bold text-gray-800">{stats.totalFines}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-500">
          <p className="text-gray-500 text-sm">Pending Fines</p>
          <p className="text-2xl font-bold text-amber-600">{stats.pendingFines}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <p className="text-gray-500 text-sm">Paid Fines</p>
          <p className="text-2xl font-bold text-green-600">{stats.paidFines}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-indigo-500">
          <p className="text-gray-500 text-sm">Total Revenue</p>
          <p className="text-2xl font-bold text-indigo-600">₹{stats.totalRevenue?.toLocaleString() || 0}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Registered Drivers</p>
          <p className="text-2xl font-bold text-gray-800">{stats.totalDrivers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-500 text-sm">Registered Vehicles</p>
          <p className="text-2xl font-bold text-gray-800">{stats.totalVehicles}</p>
        </div>
      </div>
      <div className="flex gap-4">
        <Link to="/fines" className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700">View Fines</Link>
        <Link to="/payments" className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">View Payments</Link>
        <Link to="/issue-fine" className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300">Issue Fine</Link>
      </div>
    </div>
  );
}
