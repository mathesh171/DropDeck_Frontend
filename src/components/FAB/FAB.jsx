import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FAB.module.css';

const FAB = ({ onCommandPalette, onGlobalSearch }) => {
  const [isOpen, setIsOpen] = useState(false);
  const fabRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (fabRef.current && !fabRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const actions = [
    {
      icon: '➕',
      label: 'Create Group',
      action: () => {
        navigate('/create-group');
        setIsOpen(false);
      }
    },
    {
      icon: '🔗',
      label: 'Join Group',
      action: () => {
        navigate('/join-group');
        setIsOpen(false);
      }
    },
    {
      icon: '🔍',
      label: 'Search',
      action: () => {
        onGlobalSearch && onGlobalSearch();
        setIsOpen(false);
      }
    },
    {
      icon: '⌘',
      label: 'Commands',
      action: () => {
        onCommandPalette && onCommandPalette();
        setIsOpen(false);
      }
    }
  ];

  return (
    <div className={styles.fabContainer} ref={fabRef}>
      {isOpen && (
        <div className={styles.menu}>
          {actions.map((action, index) => (
            <button
              key={index}
              className={styles.menuItem}
              onClick={action.action}
              style={{
                animationDelay: `${index * 50}ms`
              }}
            >
              <span className={styles.menuIcon}>{action.icon}</span>
              <span className={styles.menuLabel}>{action.label}</span>
            </button>
          ))}
        </div>
      )}

      <button
        className={`${styles.fab} ${isOpen ? styles.open : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Quick actions"
      >
        <span className={styles.fabIcon}>{isOpen ? '✕' : '+'}</span>
      </button>
    </div>
  );
};

export default FAB;