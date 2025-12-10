import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import styles from './NotificationBell.module.css';
import { API_LINK } from '../../utils/config';

const NotificationBell = ({ userId, token }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);

  const fetchNotifications = async () => {
    if (!token) return;
    const res = await fetch(
      `${API_LINK}/api/notifications?unread_only=true`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return;
    const data = await res.json();
    setUnreadCount(data.unread_count || 0);
    setNotifications(data.notifications || []);
  };

  const markAllRead = async () => {
    if (!token || unreadCount === 0) return;
    const ids = notifications.map(n => n.notification_id);
    if (!ids.length) return;
    await fetch(`${API_LINK}/api/notifications/mark-read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ notification_ids: ids })
    });
    setUnreadCount(0);
    setNotifications([]);
  };

  const handleJoinAction = async (notificationId, action) => {
    if (!token) return;
    setLoadingAction(true);
    try {
      await fetch(`${API_LINK}/api/notifications/join-request/action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ notification_id: notificationId, action })
      });
      await fetchNotifications();
    } finally {
      setLoadingAction(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  useEffect(() => {
    if (!userId) return;
    const s = io(API_LINK);
    s.emit('joinGroups', userId);
    s.on('notificationUpdate', () => {
      fetchNotifications();
    });
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, [userId]);

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.bellButton}
        onClick={() => setOpen(o => !o)}
      >
        <span className={styles.bellIcon}>🔔</span>
        {unreadCount > 0 && (
          <span className={styles.badge}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className={styles.dropdown}>
          <div className={styles.headerRow}>
            <span className={styles.title}>Notifications</span>
            {unreadCount > 0 && (
              <button
                type="button"
                className={styles.markAll}
                onClick={markAllRead}
              >
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className={styles.empty}>No unread notifications</div>
          ) : (
            <ul className={styles.list}>
              {notifications.map(n => {
                const isJoin =
                  n.message &&
                  n.message.toLowerCase().includes('requested to join');
                return (
                  <li key={n.notification_id} className={styles.item}>
                    <div className={styles.message}>{n.message}</div>
                    <div className={styles.metaRow}>
                      <span className={styles.meta}>
                        {n.group_name ? n.group_name : 'System'}
                      </span>
                      {isJoin && (
                        <div className={styles.actionButtons}>
                          <button
                            type="button"
                            className={styles.accept}
                            disabled={loadingAction}
                            onClick={() =>
                              handleJoinAction(n.notification_id, 'accept')
                            }
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            className={styles.decline}
                            disabled={loadingAction}
                            onClick={() =>
                              handleJoinAction(n.notification_id, 'decline')
                            }
                          >
                            Decline
                          </button>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
