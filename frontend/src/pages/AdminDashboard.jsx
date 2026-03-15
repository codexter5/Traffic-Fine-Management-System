import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../api/endpoints';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI
      .getStats()
      .then((res) => {
        if (res.data.success) setStats(res.data.data);
      })
      .catch(() => setStats(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }
  if (!stats) {
    return (
      <div className="card">
        <div className="card-body">
          <p className="text-red-600 text-sm">Failed to load stats.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of data stored in the database.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card border-l-4 border-l-primary-500">
          <div className="card-body">
            <p className="text-sm text-gray-500">Total fines</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalFines}</p>
          </div>
        </div>
        <div className="card border-l-4 border-l-amber-500">
          <div className="card-body">
            <p className="text-sm text-gray-500">Pending fines</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pendingFines}</p>
          </div>
        </div>
        <div className="card border-l-4 border-l-green-500">
          <div className="card-body">
            <p className="text-sm text-gray-500">Paid fines</p>
            <p className="text-2xl font-bold text-green-600 mt-1">{stats.paidFines}</p>
          </div>
        </div>
        <div className="card border-l-4 border-l-indigo-500">
          <div className="card-body">
            <p className="text-sm text-gray-500">Total revenue</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">
              ₹{stats.totalRevenue?.toLocaleString() ?? 0}
            </p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="card-body">
            <p className="text-sm text-gray-500">Registered drivers</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalDrivers}</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <p className="text-sm text-gray-500">Registered vehicles</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalVehicles}</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <Link to="/fines" className="btn-primary">
          View fines
        </Link>
        <Link to="/payments" className="btn-secondary">
          View payments
        </Link>
        <Link to="/issue-fine" className="btn-secondary">
          Issue fine
        </Link>
        <Link to="/users" className="btn-secondary">
          Manage users
        </Link>
      </div>
    </div>
  );
}
