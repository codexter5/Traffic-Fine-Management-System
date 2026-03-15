import { useState, useEffect, useRef } from 'react';
import { notificationsAPI } from '../../api/endpoints';

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);

  const load = () => {
    setLoading(true);
    notificationsAPI
      .list()
      .then((res) => {
        if (res.data.success) {
          setNotifications(res.data.data);
          setUnreadCount(res.data.unreadCount ?? 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markRead = (id) => {
    notificationsAPI.markRead(id).then(() => load());
  };

  const markAllRead = () => {
    notificationsAPI.markAllRead().then(() => load());
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => { setOpen(!open); if (!open) load(); }}
        className="relative p-2 rounded-lg hover:bg-primary-500 text-white transition"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m-6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-h-96 overflow-auto card shadow-xl z-50">
          <div className="card-body p-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="font-semibold text-gray-900">Notifications</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs text-primary-600 hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            {loading ? (
              <p className="p-4 text-gray-500 text-sm">Loading...</p>
            ) : notifications.length === 0 ? (
              <p className="p-4 text-gray-500 text-sm">No notifications yet.</p>
            ) : (
              <ul className="divide-y divide-gray-100 max-h-72 overflow-auto">
                {notifications.map((n) => (
                  <li
                    key={n._id}
                    className={`px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer ${!n.read ? 'bg-primary-50/50' : ''}`}
                    onClick={() => { markRead(n._id); }}
                  >
                    <p className="text-gray-800">{n.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
