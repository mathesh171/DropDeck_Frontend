import { useNavigate, useLocation } from 'react-router-dom';
import styles from './BottomNav.module.css';

const BottomNav = ({ unreadCount = 0, onSearch, onCommandPalette }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={styles.bottomNav}>
      <button
        className={`${styles.navItem} ${isActive('/chat') ? styles.active : ''}`}
        onClick={() => navigate('/chat')}
      >
        <span className={styles.icon}>💬</span>
        {unreadCount > 0 && (
          <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
        <span className={styles.label}>Chats</span>
      </button>

      <button
        className={styles.navItem}
        onClick={onSearch}
      >
        <span className={styles.icon}>🔍</span>
        <span className={styles.label}>Search</span>
      </button>

      <button
        className={styles.navItem}
        onClick={onCommandPalette}
      >
        <span className={styles.icon}>⌘</span>
        <span className={styles.label}>Actions</span>
      </button>

      <button
        className={`${styles.navItem} ${isActive('/create-group') ? styles.active : ''}`}
        onClick={() => navigate('/create-group')}
      >
        <span className={styles.icon}>➕</span>
        <span className={styles.label}>Create</span>
      </button>

      <button
        className={`${styles.navItem} ${isActive('/join-group') ? styles.active : ''}`}
        onClick={() => navigate('/join-group')}
      >
        <span className={styles.icon}>🔗</span>
        <span className={styles.label}>Join</span>
      </button>
    </nav>
  );
};

export default BottomNav;