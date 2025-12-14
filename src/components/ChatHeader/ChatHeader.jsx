import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import styles from './ChatHeader.module.css';
import { getImageUrl } from '../../utils/api.js';
import { API_LINK } from '../../config.js';
import { toast } from '../../utils/toast';
import SearchIcon from '../../assets/Search.png';
import AddIcon from '../../assets/add.png';
import ExitIcon from '../../assets/exit.png';

const ChatHeader = ({
  group,
  user,
  onSearchChange,
  onSearchNav,
  searchTerm,
  totalMatches,
  currentMatchNumber,
  onGroupExit
}) => {
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [term, setTerm] = useState(searchTerm || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const containerRef = useRef(null);
  const menuRef = useRef(null);
  const navigate = useNavigate();

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

  useEffect(() => {
    const handler = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handler);
    }
    return () => document.removeEventListener('mousedown', handler);
  }, [showMenu]);

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

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };

  const handleAddUserClick = async () => {
    setShowMenu(false);
    setShowAddUserModal(true);
    await fetchAvailableUsers();
  };

  const fetchAvailableUsers = async () => {
    setLoadingUsers(true);
    setAvailableUsers([]);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_LINK}/api/groups/discover`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setAvailableUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
    setLoadingUsers(false);
  };

  const handleInviteUser = async (email) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_LINK}/api/groups/${group.group_id}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        toast.success('Invitation sent successfully');
        setShowAddUserModal(false);
        setSearchQuery('');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to send invitation');
      }
    } catch {
      toast.error('Failed to send invitation');
    }
  };

  const handleExitGroup = async () => {
    if (!window.confirm('Are you sure you want to exit this group?')) return;
    
    setShowMenu(false);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_LINK}/api/groups/${group.group_id}/leave`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        toast.success('You have left the group');
        if (onGroupExit) onGroupExit();
        navigate('/chat');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to exit group');
      }
    } catch {
      toast.error('Failed to exit group');
    }
  };

  const filteredUsers = availableUsers.filter(u => 
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className={styles.chatHeader} ref={containerRef}>
        <div className={styles.groupInfo}>
          <div className={styles.groupAvatar}>
            {group.group_image ? (
              <img
                src={getImageUrl(group.group_image)}
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
            <img src={SearchIcon} alt="Search" className={styles.iconImage} />
          </button>
          <div className={styles.menuWrapper} ref={menuRef}>
            <button 
              className={styles.iconButton} 
              title="Menu" 
              type="button"
              onClick={handleMenuClick}
            >
              ⋮
            </button>
            
            {showMenu && (
              <div className={styles.menuDropdown}>
                <button className={styles.menuItem} onClick={handleAddUserClick}>
                  <img src={AddIcon} alt="Add" className={styles.menuIcon} />
                  <span>Add User</span>
                </button>
                <button className={styles.menuItem} onClick={handleExitGroup}>
                  <img src={ExitIcon} alt="Exit" className={styles.menuIcon} />
                  <span>Exit Group</span>
                </button>
              </div>
            )}
          </div>
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

      {showAddUserModal && createPortal(
        <div className={styles.modal} onClick={() => {
          setShowAddUserModal(false);
          setSearchQuery('');
        }}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>Add User to Group</h3>
              <button 
                className={styles.closeButton} 
                onClick={() => {
                  setShowAddUserModal(false);
                  setSearchQuery('');
                }}
              >
                ×
              </button>
            </div>
            
            <input
              type="text"
              placeholder="Search users by name or email..."
              className={styles.modalSearchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <div className={styles.userList}>
              {loadingUsers ? (
                <div className={styles.loading}>Loading users...</div>
              ) : filteredUsers.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No users available to invite</p>
                  <p className={styles.hint}>Enter email address to send invitation</p>
                  <input
                    type="email"
                    placeholder="Enter email address"
                    className={styles.emailInput}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.target.value) {
                        handleInviteUser(e.target.value);
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
              ) : (
                filteredUsers.map(u => (
                  <div key={u.user_id || u.userid} className={styles.userItem}>
                    <div className={styles.userInfo}>
                      <div className={styles.userName}>{u.name}</div>
                      <div className={styles.userEmail}>{u.email}</div>
                    </div>
                    <button
                      className={styles.inviteButton}
                      onClick={() => handleInviteUser(u.email)}
                    >
                      Invite
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ChatHeader;
