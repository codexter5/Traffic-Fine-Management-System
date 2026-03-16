import { useEffect, useState } from 'react';
import { adminAPI } from '../api/endpoints';

const actions = [
  { value: '', label: 'All actions' },
  { value: 'fine_issued', label: 'Fine issued' },
  { value: 'fine_updated', label: 'Fine updated' },
  { value: 'fine_cancelled', label: 'Fine cancelled' },
  { value: 'fine_disputed', label: 'Fine disputed' },
  { value: 'dispute_resolved', label: 'Dispute resolved' },
  { value: 'fine_paid', label: 'Fine paid' },
];

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState('');

  useEffect(() => {
    setLoading(true);
    adminAPI
      .auditLogs(action ? { action } : {})
      .then((res) => {
        if (res.data.success) setLogs(res.data.data || []);
      })
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [action]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="mt-1 text-sm text-gray-500">Track who issued, updated, paid, or resolved fines.</p>
        </div>
        <select value={action} onChange={(e) => setAction(e.target.value)} className="input-field w-full sm:w-56">
          {actions.map((item) => (
            <option key={item.label} value={item.value}>{item.label}</option>
          ))}
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="card-body"><p className="text-sm text-gray-500">Loading audit logs...</p></div>
        ) : logs.length === 0 ? (
          <div className="card-body"><p className="text-sm text-gray-500">No audit events found.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="table-header">Actor</th>
                  <th className="table-header">Action</th>
                  <th className="table-header">Fine</th>
                  <th className="table-header">Payment</th>
                  <th className="table-header">Details</th>
                  <th className="table-header">When</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50/50">
                    <td className="table-cell">
                      <p className="font-medium text-slate-900">{log.actorId?.name || log.actorName || 'System'}</p>
                      <p className="text-xs text-slate-500">{log.actorRole}</p>
                    </td>
                    <td className="table-cell text-slate-700">{log.action.replace(/_/g, ' ')}</td>
                    <td className="table-cell text-slate-700">{log.fineId?.fineNumber || '—'}</td>
                    <td className="table-cell text-slate-700">{log.paymentId?.transactionId || '—'}</td>
                    <td className="table-cell text-slate-700">{log.details || '—'}</td>
                    <td className="table-cell text-slate-500">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
