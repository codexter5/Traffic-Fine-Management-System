import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../api/endpoints';

const renderBarHeight = (value, max) => {
  if (!max) return '10%';
  return `${Math.max(10, Math.round((value / max) * 100))}%`;
};

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

  const maxMonthlyFine = useMemo(() => Math.max(...(stats?.monthlyFines?.map((item) => item.value) || [0])), [stats]);
  const maxMonthlyRevenue = useMemo(() => Math.max(...(stats?.monthlyRevenue?.map((item) => item.value) || [0])), [stats]);

  if (loading) {
    return <div className="card"><div className="card-body"><p className="text-gray-500 text-sm">Loading...</p></div></div>;
  }

  if (!stats) {
    return <div className="card"><div className="card-body"><p className="text-red-600 text-sm">Failed to load stats.</p></div></div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Operational overview, revenue trends, and top violations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card"><div className="card-body flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Total fines</p><p className="text-3xl font-bold text-slate-900 mt-2 tracking-tight">{stats.totalFines}</p></div><span className="w-11 h-11 shrink-0 rounded-2xl bg-primary-50 flex items-center justify-center"><svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></span></div></div>
        <div className="card"><div className="card-body flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending</p><p className="text-3xl font-bold text-amber-600 mt-2 tracking-tight">{stats.pendingFines}</p></div><span className="w-11 h-11 shrink-0 rounded-2xl bg-amber-50 flex items-center justify-center"><svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span></div></div>
        <div className="card"><div className="card-body flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Paid</p><p className="text-3xl font-bold text-emerald-600 mt-2 tracking-tight">{stats.paidFines}</p></div><span className="w-11 h-11 shrink-0 rounded-2xl bg-emerald-50 flex items-center justify-center"><svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></span></div></div>
        <div className="card"><div className="card-body flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Revenue</p><p className="text-3xl font-bold text-indigo-600 mt-2 tracking-tight">₹{stats.totalRevenue?.toLocaleString() ?? 0}</p></div><span className="w-11 h-11 shrink-0 rounded-2xl bg-indigo-50 flex items-center justify-center"><svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg></span></div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Monthly fines</h2>
                <p className="text-sm text-slate-500">Last 6 months</p>
              </div>
            </div>
            <div className="h-64 flex items-end gap-3">
              {stats.monthlyFines.map((item) => (
                <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-2xl bg-primary-500/90" style={{ height: renderBarHeight(item.value, maxMonthlyFine) }} />
                  <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                  <p className="text-xs text-slate-400">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Monthly revenue</h2>
                <p className="text-sm text-slate-500">Successful payments</p>
              </div>
            </div>
            <div className="h-64 flex items-end gap-3">
              {stats.monthlyRevenue.map((item) => (
                <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-2xl bg-emerald-500/90" style={{ height: renderBarHeight(item.value, maxMonthlyRevenue) }} />
                  <p className="text-xs font-semibold text-slate-500">{item.label}</p>
                  <p className="text-xs text-slate-400">₹{item.value.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card lg:col-span-2">
          <div className="card-body">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Violation breakdown</h2>
                <p className="text-sm text-slate-500">Most common issued violations</p>
              </div>
            </div>
            <div className="space-y-3">
              {stats.violationBreakdown?.length ? stats.violationBreakdown.map((item, index) => (
                <div key={item.id || index} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.code} · {item.description}</p>
                      <p className="text-xs text-slate-500 mt-1">{item.count} fines · ₹{item.amount.toLocaleString()}</p>
                    </div>
                    <span className="text-xs font-semibold text-slate-400">#{index + 1}</span>
                  </div>
                </div>
              )) : <p className="text-sm text-slate-500">No violation data yet.</p>}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-body space-y-3">
            <h2 className="text-lg font-semibold text-slate-900">Quick access</h2>
            <Link to="/fines" className="btn-primary w-full">View fines</Link>
            <Link to="/payments" className="btn-secondary w-full">View payments</Link>
            <Link to="/audit-logs" className="btn-secondary w-full">Audit logs</Link>
            <Link to="/users" className="btn-secondary w-full">Manage users</Link>
            <Link to="/notifications" className="btn-secondary w-full">Notifications</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
