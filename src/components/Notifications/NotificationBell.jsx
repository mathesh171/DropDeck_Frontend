import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { io } from 'socket.io-client';
import styles from './NotificationBell.module.css';
import { API_LINK } from '../../config.js';
import { toast } from '../../utils/toast';

const NotificationBell = ({ userId, token }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_LINK}/api/notifications?unread_only=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setUnreadCount(data.unread_count || 0);
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    }
  };

  const markAllRead = async () => {
    if (!token || unreadCount === 0) return;
    const ids = notifications.map((n) => n.notification_id);
    if (!ids.length) return;
    try {
      await fetch(`${API_LINK}/api/notifications/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notification_ids: ids }),
      });
      setUnreadCount(0);
      setNotifications([]);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleJoinAction = async (notificationId, action) => {
    if (!token) return;
    setLoadingAction(true);
    try {
      const response = await fetch(`${API_LINK}/api/notifications/join-request/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notification_id: notificationId, action }),
      });
      
      if (response.ok) {
        await fetchNotifications();
        toast.success(action === 'accept' ? 'User added to group successfully' : 'Request declined');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to process request');
      }
    } catch (error) {
      toast.error('Failed to process request');
    } finally {
      setLoadingAction(false);
    }
  };

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [token]);

  useEffect(() => {
    if (!userId) return;
    const s = io(API_LINK);
    s.emit('joinGroups', userId);
    s.on('notificationUpdate', (data) => {
      fetchNotifications();
      if (data && data.message) {
        toast.info(data.message);
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('DropDeck', {
            body: data?.message || 'New notification',
            icon: '/logo.png',
            badge: '/logo.png',
          });
        }
      }
    });
    setSocket(s);
    return () => s.disconnect();
  }, [userId]);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (open) {
      updateDropdownPosition();
      window.addEventListener('resize', updateDropdownPosition);
      window.addEventListener('scroll', updateDropdownPosition);
    }
    return () => {
      window.removeEventListener('resize', updateDropdownPosition);
      window.removeEventListener('scroll', updateDropdownPosition);
    };
  }, [open]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  const renderDropdown = () => {
    if (!open) return null;

    return createPortal(
      <>
        <div className={styles.backdrop} onClick={() => setOpen(false)} />
        <div
          ref={dropdownRef}
          className={styles.dropdown}
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            right: `${dropdownPosition.right}px`,
          }}
        >
          <div className={styles.headerRow}>
            <span className={styles.title}>Notifications</span>
            {unreadCount > 0 && (
              <button type="button" className={styles.markAll} onClick={markAllRead}>
                Mark all read
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>🔕</span>
              <p>No unread notifications</p>
            </div>
          ) : (
            <ul className={styles.list}>
              {notifications.map((n) => {
                const isJoin = n.message && n.message.toLowerCase().includes('requested to join');
                const uniqueKey = n.notification_id;

                return (
                  <li key={uniqueKey} className={styles.item}>
                    <div className={styles.itemContent}>
                      <div className={styles.message}>{n.message}</div>
                      <div className={styles.metaRow}>
                        <span className={styles.meta}>
                          {n.group_name ? n.group_name : 'System'}
                        </span>
                        {n.created_at && (
                          <span className={styles.time}>
                            {new Date(n.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {isJoin && (
                      <div className={styles.actionButtons}>
                        <button
                          type="button"
                          className={styles.accept}
                          disabled={loadingAction}
                          onClick={() => handleJoinAction(n.notification_id, 'accept')}
                        >
                          ✓
                        </button>
                        <button
                          type="button"
                          className={styles.decline}
                          disabled={loadingAction}
                          onClick={() => handleJoinAction(n.notification_id, 'decline')}
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </>,
      document.body
    );
  };

  return (
    <div className={styles.wrapper}>
      <button
        ref={buttonRef}
        type="button"
        className={`${styles.bellButton} ${unreadCount > 0 ? styles.hasNotifications : ''}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={styles.bellIcon}>🔔</span>
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>
      {renderDropdown()}
    </div>
  );
};

export default NotificationBell;
