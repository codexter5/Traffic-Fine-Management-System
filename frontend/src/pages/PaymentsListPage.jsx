import { useState, useEffect } from 'react';
import { paymentsAPI } from '../api/endpoints';

export default function PaymentsListPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentsAPI
      .list()
      .then((res) => {
        if (res.data.success) setPayments(res.data.data);
      })
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Payments</h1>
        <p className="mt-1 text-sm text-gray-500">All payments stored in the database.</p>
      </div>
      <div className="card">
        {loading ? (
          <div className="card-body">
            <p className="text-gray-500 text-sm">Loading...</p>
          </div>
        ) : payments.length === 0 ? (
          <div className="card-body">
            <p className="text-gray-500 text-sm">No payments found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="table-header">Transaction ID</th>
                  <th className="table-header">Fine #</th>
                  <th className="table-header">Amount</th>
                  <th className="table-header">Method</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Paid at</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p._id} className="hover:bg-gray-50/50">
                    <td className="table-cell font-medium text-gray-900">{p.transactionId}</td>
                    <td className="table-cell">{p.fineId?.fineNumber}</td>
                    <td className="table-cell">₹{p.amount}</td>
                    <td className="table-cell">{p.method}</td>
                    <td className="table-cell">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          p.gatewayStatus === 'success'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {p.gatewayStatus}
                      </span>
                    </td>
                    <td className="table-cell text-gray-600">
                      {new Date(p.paidAt).toLocaleString()}
                    </td>
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
