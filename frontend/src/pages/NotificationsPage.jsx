import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationsAPI } from '../api/endpoints';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const tabs = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
  { key: 'payments', label: 'Payments' },
  { key: 'fines', label: 'Fines' },
];

const isPaymentType = (type) => ['fine_paid', 'payment_success'].includes(type);

export default function NotificationsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('all');

  const loadNotifications = () => {
    setLoading(true);
    notificationsAPI
      .list({ limit: 200 })
      .then((res) => {
        if (res.data.success) setNotifications(res.data.data || []);
      })
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    if (tab === 'unread') return notifications.filter((item) => !item.read);
    if (tab === 'payments') return notifications.filter((item) => isPaymentType(item.type));
    if (tab === 'fines') return notifications.filter((item) => !isPaymentType(item.type));
    return notifications;
  }, [notifications, tab]);

  const handleOpen = async (notification) => {
    if (!notification.read) {
      try {
        await notificationsAPI.markRead(notification._id);
        setNotifications((current) => current.map((item) => (item._id === notification._id ? { ...item, read: true } : item)));
      } catch (_) {}
    }

    if (notification.relatedId?.paymentId) {
      navigate(user?.role === 'admin' || user?.role === 'driver' ? '/payments' : '/fines');
      return;
    }
    if (notification.relatedId?.fineId) {
      navigate('/fines');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationsAPI.markAllRead();
      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
      showToast('All notifications marked as read.');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update notifications.', 'error');
    }
  };

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">Recent system updates for your account.</p>
        </div>
        <button type="button" onClick={handleMarkAllRead} disabled={!unreadCount} className="btn-secondary">
          Mark all read
        </button>
      </div>

      <div className="card">
        <div className="card-body space-y-4">
          <div className="flex flex-wrap gap-2">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                  tab === item.key
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-primary-300 hover:text-primary-600'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {loading ? (
            <p className="text-sm text-gray-500">Loading notifications...</p>
          ) : filteredNotifications.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-medium text-slate-500">No notifications in this view.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <button
                  key={notification._id}
                  type="button"
                  onClick={() => handleOpen(notification)}
                  className={`w-full text-left rounded-2xl border px-4 py-4 transition ${
                    notification.read
                      ? 'border-slate-200 bg-white hover:border-primary-200'
                      : 'border-primary-200 bg-primary-50/60 hover:border-primary-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{notification.message}</p>
                      <p className="mt-1 text-xs text-slate-500">{new Date(notification.createdAt).toLocaleString()}</p>
                    </div>
                    {!notification.read && <span className="w-2.5 h-2.5 rounded-full bg-primary-600 mt-1.5 shrink-0" />}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
