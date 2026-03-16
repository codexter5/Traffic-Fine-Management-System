import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { paymentsAPI } from '../api/endpoints';
import { downloadCsv } from '../utils/csv';

export default function PaymentsListPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('');

  const loadPayments = () => {
    setLoading(true);
    const params = {};
    if (search.trim()) params.q = search.trim();
    if (methodFilter) params.method = methodFilter;
    paymentsAPI
      .list(params)
      .then((res) => {
        if (res.data.success) setPayments(res.data.data || []);
      })
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPayments();
  }, [search, methodFilter, user?.role]);

  const totalAmount = useMemo(() => payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0), [payments]);

  const handleExport = () => {
    downloadCsv(
      'payments-export.csv',
      payments.map((payment) => ({
        transactionId: payment.transactionId,
        fineNumber: payment.fineId?.fineNumber || '',
        driver: payment.fineId?.driverId?.name || '',
        vehicle: payment.fineId?.vehicleId?.plateNumber || '',
        amount: payment.amount,
        method: payment.method,
        status: payment.gatewayStatus,
        paidAt: new Date(payment.paidAt).toLocaleString(),
      }))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{user?.role === 'driver' ? 'Payment History' : 'Payments'}</h1>
          <p className="mt-1 text-sm text-gray-500">{user?.role === 'driver' ? 'All payments recorded for your fines.' : 'Track revenue, methods, and transaction history.'}</p>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="rounded-xl bg-white border border-slate-200 px-4 py-3 min-w-[140px]">
            <p className="text-slate-500">Payments</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{payments.length}</p>
          </div>
          <div className="rounded-xl bg-white border border-slate-200 px-4 py-3 min-w-[160px]">
            <p className="text-slate-500">Total amount</p>
            <p className="text-xl font-bold text-slate-900 mt-1">₹{totalAmount.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body space-y-4">
          <div className="flex flex-col xl:flex-row xl:items-center gap-3">
            <div className="relative flex-1">
              <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
              </svg>
              <input value={search} onChange={(event) => setSearch(event.target.value)} className="input-field pl-9" placeholder="Search by transaction or fine number" />
            </div>
            <div className="flex flex-wrap gap-2">
              <select value={methodFilter} onChange={(event) => setMethodFilter(event.target.value)} className="input-field w-full sm:w-44">
                <option value="">All methods</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="netbanking">Net banking</option>
              </select>
              <button type="button" onClick={handleExport} className="btn-secondary">
                Export CSV
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-gray-500 text-sm">Loading payments...</p>
          ) : payments.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-500 font-medium">No payments found.</p>
              <p className="text-gray-400 text-sm mt-1">Payments will appear here after successful transactions.</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-6 -mb-6">
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="table-header">Transaction ID</th>
                    <th className="table-header">Fine #</th>
                    {user?.role === 'admin' && <th className="table-header">Driver</th>}
                    {user?.role === 'admin' && <th className="table-header">Vehicle</th>}
                    <th className="table-header">Amount</th>
                    <th className="table-header">Method</th>
                    <th className="table-header">Status</th>
                    <th className="table-header">Paid at</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50/50">
                      <td className="table-cell font-medium text-gray-900">{payment.transactionId}</td>
                      <td className="table-cell">{payment.fineId?.fineNumber}</td>
                      {user?.role === 'admin' && <td className="table-cell">{payment.fineId?.driverId?.name}</td>}
                      {user?.role === 'admin' && <td className="table-cell">{payment.fineId?.vehicleId?.plateNumber}</td>}
                      <td className="table-cell">₹{payment.amount}</td>
                      <td className="table-cell uppercase">{payment.method}</td>
                      <td className="table-cell">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${payment.gatewayStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {payment.gatewayStatus}
                        </span>
                      </td>
                      <td className="table-cell text-gray-600">{new Date(payment.paidAt).toLocaleString()}</td>
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
