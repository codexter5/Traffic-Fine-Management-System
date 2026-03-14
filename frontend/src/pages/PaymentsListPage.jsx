import { useState, useEffect } from 'react';
import { paymentsAPI } from '../api/endpoints';

export default function PaymentsListPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    paymentsAPI.list()
      .then((res) => { if (res.data.success) setPayments(res.data.data); })
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Payments</h1>
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : payments.length === 0 ? (
        <p className="text-gray-500">No payments found.</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Transaction ID</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fine #</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-2 text-left text-xs font-medium text-gray-500 uppercase">Paid At</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((p) => (
                <tr key={p._id}>
                  <td className="px-6 py-3 text-sm text-gray-800">{p.transactionId}</td>
                  <td className="px-6 py-3 text-sm">{p.fineId?.fineNumber}</td>
                  <td className="px-6 py-3 text-sm">₹{p.amount}</td>
                  <td className="px-6 py-3 text-sm">{p.method}</td>
                  <td className="px-6 py-3">
                    <span className={`px-2 py-1 text-xs rounded ${p.gatewayStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {p.gatewayStatus}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-sm">{new Date(p.paidAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
