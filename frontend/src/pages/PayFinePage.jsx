import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { finesAPI } from '../api/endpoints';

export default function PayFinePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fine, setFine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState('card');

  useEffect(() => {
    finesAPI.get(id)
      .then((res) => { if (res.data.success) setFine(res.data.data); })
      .catch(() => setFine(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!fine || fine.status === 'paid') return;
    setPaying(true);
    try {
      const res = await finesAPI.pay(id, { amount: fine.amount, method });
      if (res.data.success) {
        alert('Payment successful (simulated). Transaction: ' + res.data.data.payment?.transactionId);
        navigate('/driver');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!fine) return <p className="text-red-500">Fine not found.</p>;
  if (fine.status === 'paid') {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Pay Fine</h1>
        <p className="text-green-600 font-medium">This fine has already been paid.</p>
        <button onClick={() => navigate(-1)} className="mt-4 bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Back</button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pay Fine</h1>
      <div className="max-w-md bg-white rounded-lg shadow p-6 mb-6">
        <p><span className="text-gray-500">Fine #:</span> {fine.fineNumber}</p>
        <p><span className="text-gray-500">Violation:</span> {fine.violationId?.description}</p>
        <p><span className="text-gray-500">Amount:</span> <strong>₹{fine.amount}</strong></p>
      </div>
      <form onSubmit={handlePay} className="max-w-md bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
          <select value={method} onChange={(e) => setMethod(e.target.value)} className="w-full border border-gray-300 rounded px-3 py-2">
            <option value="card">Card</option>
            <option value="upi">UPI</option>
            <option value="netbanking">Net Banking</option>
          </select>
        </div>
        <p className="text-sm text-gray-500">This is a simulated payment. No real charge will be made.</p>
        <div className="flex gap-4">
          <button type="submit" disabled={paying} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50">
            {paying ? 'Processing...' : 'Confirm Payment'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300">Cancel</button>
        </div>
      </form>
    </div>
  );
}
