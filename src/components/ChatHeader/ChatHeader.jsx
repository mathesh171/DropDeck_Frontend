import { useState, useRef, useEffect } from 'react';
import styles from './ChatHeader.module.css';

const ChatHeader = ({ group, onSearchChange, onSearchNav }) => {
  const [showSearch, setShowSearch] = useState(false);
  const [term, setTerm] = useState('');
  const containerRef = useRef(null);

  const getInitials = name => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    const handler = e => {
      if (!showSearch) return;
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSearch(false);
        setTerm('');
        if (onSearchChange) onSearchChange('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showSearch, onSearchChange]);

  const handleSearchClick = () => {
    setShowSearch(true);
  };

  const handleChange = e => {
    const value = e.target.value;
    setTerm(value);
    if (onSearchChange) onSearchChange(value);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') {
      if (e.shiftKey) {
        onSearchNav && onSearchNav('prev');
      } else {
        onSearchNav && onSearchNav('next');
      }
    }
  };

  return (
    <div className={styles.chatHeader} ref={containerRef}>
      <div className={styles.groupInfo}>
        <div className={styles.groupAvatar}>
          {group.group_image ? (
            <img
              src={`http://localhost:5000/uploads/${group.group_image}`}
              alt={group.group_name}
              className={styles.groupAvatarImg}
            />
          ) : (
            getInitials(group.group_name)
          )}
        </div>
        <div className={styles.groupDetails}>
          <h2 className={styles.groupName}>{group.group_name}</h2>
          <p className={styles.groupMeta}>{group.description || 'Group chat'}</p>
        </div>
      </div>

      <div className={styles.headerActions}>
        <button
          className={styles.iconButton}
          title="Search"
          type="button"
          onClick={handleSearchClick}
        >
          🔍
        </button>
        <button className={styles.iconButton} title="Menu" type="button">
          ⋮
        </button>
      </div>

      {showSearch && (
        <div className={styles.searchOverlay}>
          <input
            type="text"
            value={term}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Search in this chat..."
            className={styles.searchInput}
            autoFocus
          />
          <div className={styles.searchButtons}>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => onSearchNav && onSearchNav('prev')}
            >
              ↑
            </button>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => onSearchNav && onSearchNav('next')}
            >
              ↓
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
