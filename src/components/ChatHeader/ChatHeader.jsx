import { useState, useRef, useEffect } from 'react';
import styles from './ChatHeader.module.css';

const ChatHeader = ({
  group,
  onSearchChange,
  onSearchNav,
  searchTerm,
  totalMatches,
  currentMatchNumber
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [term, setTerm] = useState(searchTerm || '');
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
    setTerm(searchTerm || '');
  }, [searchTerm]);

  useEffect(() => {
    const handler = e => {
      if (!showSearch) return;
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSearch(false);
        setTerm('');
        onSearchChange && onSearchChange('');
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
    onSearchChange && onSearchChange(value);
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

  const handleNavClick = direction => {
    onSearchNav && onSearchNav(direction);
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
          <div className={styles.searchInfo}>
            {totalMatches > 0 ? `${currentMatchNumber}/${totalMatches}` : '0/0'}
          </div>
          <div className={styles.searchButtons}>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => handleNavClick('prev')}
            >
              ↑
            </button>
            <button
              type="button"
              className={styles.navButton}
              onClick={() => handleNavClick('next')}
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
