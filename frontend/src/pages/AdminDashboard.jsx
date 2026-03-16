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
        <div className="card">
          <div className="card-body flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total fines</p>
              <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{stats.totalFines}</p>
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
              <p className="text-3xl font-bold text-amber-600 mt-2 tracking-tight">{stats.pendingFines}</p>
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
              <p className="text-3xl font-bold text-emerald-600 mt-2 tracking-tight">{stats.paidFines}</p>
            </div>
            <span className="w-11 h-11 shrink-0 rounded-2xl bg-emerald-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
        </div>
        <div className="card">
          <div className="card-body flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Revenue</p>
              <p className="text-3xl font-bold text-indigo-600 mt-2 tracking-tight">
                ₹{stats.totalRevenue?.toLocaleString() ?? 0}
              </p>
            </div>
            <span className="w-11 h-11 shrink-0 rounded-2xl bg-indigo-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card">
          <div className="card-body flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Registered drivers</p>
              <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{stats.totalDrivers}</p>
            </div>
            <span className="w-11 h-11 shrink-0 rounded-2xl bg-sky-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
          </div>
        </div>
        <div className="card">
          <div className="card-body flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Registered vehicles</p>
              <p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{stats.totalVehicles}</p>
            </div>
            <span className="w-11 h-11 shrink-0 rounded-2xl bg-violet-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </span>
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
