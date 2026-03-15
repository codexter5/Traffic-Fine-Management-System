import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { finesAPI } from '../api/endpoints';
import { useToast } from '../context/ToastContext';

export default function PayFinePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [fine, setFine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [method, setMethod] = useState('card');
  const [success, setSuccess] = useState('');
  const { showToast } = useToast();

  useEffect(() => {
    finesAPI
      .get(id)
      .then((res) => {
        if (res.data.success) setFine(res.data.data);
      })
      .catch(() => setFine(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!fine || fine.status === 'paid') return;
    setPaying(true);
    setSuccess('');
    try {
      const res = await finesAPI.pay(id, { amount: fine.amount, method });
      if (res.data.success) {
        setSuccess(
          `Payment recorded. Transaction: ${res.data.data.payment?.transactionId ?? 'N/A'}`
        );
        showToast('Payment successful. Officers have been notified.');
        setTimeout(() => navigate('/driver'), 2000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Payment failed');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }
  if (!fine) {
    return (
      <div className="card">
        <div className="card-body">
          <p className="text-red-600 text-sm">Fine not found.</p>
          <button onClick={() => navigate(-1)} className="btn-secondary mt-3">
            Back
          </button>
        </div>
      </div>
    );
  }
  if (fine.status === 'paid') {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Pay Fine</h1>
        <div className="card">
          <div className="card-body">
            <p className="text-green-600 font-medium">This fine has already been paid.</p>
            <button onClick={() => navigate(-1)} className="btn-secondary mt-4">
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Pay Fine</h1>
      <div className="card max-w-md">
        <div className="card-body space-y-1">
          <p>
            <span className="text-gray-500">Fine #:</span>{' '}
            <span className="font-medium text-gray-900">{fine.fineNumber}</span>
          </p>
          <p>
            <span className="text-gray-500">Violation:</span>{' '}
            <span className="text-gray-900">{fine.violationId?.description}</span>
          </p>
          <p>
            <span className="text-gray-500">Amount:</span>{' '}
            <strong className="text-gray-900">₹{fine.amount}</strong>
          </p>
        </div>
      </div>
      <form onSubmit={handlePay} className="card max-w-md">
        <div className="card-body space-y-4">
          {success && (
            <div className="text-sm text-green-700 bg-green-50 px-3 py-2.5 rounded-lg border border-green-100">
              {success}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Payment method</label>
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              className="input-field"
            >
              <option value="card">Card</option>
              <option value="upi">UPI</option>
              <option value="netbanking">Net Banking</option>
            </select>
          </div>
          <p className="text-sm text-gray-500">Simulated payment. No real charge.</p>
          <div className="flex gap-3">
            <button type="submit" disabled={paying} className="btn-primary bg-green-600 hover:bg-green-700">
              {paying ? 'Processing...' : 'Confirm payment'}
            </button>
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
