import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../pageStyles/ChatPage.module.css';
import GroupList from '../components/GroupList/GroupList';
import ChatWindow from '../components/ChatWindow/ChatWindow';
import ChatHeader from '../components/ChatHeader/ChatHeader';
import UserProfile from '../components/UserProfile/UserProfile';
import NotificationBell from '../components/Notifications/NotificationBell';
import ThemeToggle from '../components/ThemeToggle/ThemeToggle';
import GlobalSearch from '../components/GlobalSearch/GlobalSearch';
import CommandPalette from '../components/CommandPalette/CommandPalette';
import FAB from '../components/FAB/FAB';
import ToastContainer from '../components/ui/Toast/ToastContainer';
import CreateGroupIcon from '../assets/CreateGroup.png';
import JoinGroupIcon from '../assets/JoinGroup.png';
import { socket } from '../utils/socket';
import { API_LINK } from '../config.js';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../hooks/useToast';

const ChatPage = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupSearch, setGroupSearch] = useState('');
  const [chatSearchTerm, setChatSearchTerm] = useState('');
  const [chatSearchNav, setChatSearchNav] = useState(null);
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const isSocketInitialized = useRef(false);
  const navigate = useNavigate();
  const { toggleTheme } = useTheme();
  const { toasts, removeToast } = useToast();

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      navigate('/login');
      return;
    }
    fetchUserProfile(storedToken);
    fetchGroups(storedToken);
  }, [navigate]);

  useEffect(() => {
    if (user && !isSocketInitialized.current) {
      socket.connect();
      const uid = user.user_id || user.userid;
      socket.emit('joinGroups', uid);
      socket.on('groupListUpdate', () => {
        fetchGroups(localStorage.getItem('token'));
      });
      socket.on('notificationUpdate', () => {
        fetchGroups(localStorage.getItem('token'));
      });
      isSocketInitialized.current = true;
    }
    return () => {
      socket.off('groupListUpdate');
      socket.off('notificationUpdate');
    };
  }, [user]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;

      if (cmdOrCtrl && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }

      if (cmdOrCtrl && e.key === 'f') {
        e.preventDefault();
        setShowGlobalSearch(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const fetchUserProfile = async storedToken => {
    try {
      const response = await fetch(`${API_LINK}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${storedToken}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch {}
  };

  const fetchGroups = async storedToken => {
    setGroupsLoading(true);
    try {
      const response = await fetch(`${API_LINK}/api/groups`, {
        headers: {
          Authorization: `Bearer ${storedToken || localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const list = data.groups || data || [];
        setGroups(list);
      }
    } catch {}
    setGroupsLoading(false);
  };

  const handleSelectGroup = async group => {
    setSelectedGroup(group);
    setChatSearchTerm('');
    setChatSearchNav(null);
    const t = localStorage.getItem('token');
    if (!t) return;
    await fetch(`${API_LINK}/api/messages/groups/${group.group_id}/read`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${t}`
      }
    });
    fetchGroups(t);
  };

  const filteredGroups = groups.filter(g =>
    (g.group_name || '').toLowerCase().includes(groupSearch.toLowerCase())
  );

  const handleChatSearchChange = term => {
    setChatSearchTerm(term);
  };

  const handleChatSearchNav = direction => {
    setChatSearchNav(direction);
  };

  return (
    <>
      <div className={styles.chatPage}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.topIcons}>
              <div className={styles.iconCircle} onClick={() => setShowProfile(true)}>
                {user?.avatar_url || user?.avatarurl ? (
                  <img
                    src={user.avatar_url || user.avatarurl}
                    alt="User"
                    className={styles.profileImg}
                  />
                ) : (
                  <span className={styles.defaultUserIcon}>U</span>
                )}
              </div>
              <input
                type="text"
                placeholder="Search groups..."
                className={styles.searchBar}
                value={groupSearch}
                onChange={e => setGroupSearch(e.target.value)}
              />
              <button
                className={styles.iconCircle}
                onClick={() => setShowGlobalSearch(true)}
                title="Global Search (Ctrl+F)"
              >
                🔍
              </button>
              {user && (
                <NotificationBell
                  userId={user.user_id || user.userid}
                  token={token}
                />
              )}
              <ThemeToggle />
              <div className={styles.iconCircle} onClick={() => navigate('/create-group')}>
                <img src={CreateGroupIcon} className={styles.smallIcon} alt="Create" />
              </div>
              <div className={styles.iconCircle} onClick={() => navigate('/join-group')}>
                <img src={JoinGroupIcon} className={styles.smallIcon} alt="Join" />
              </div>
            </div>
          </div>
          <GroupList
            groups={filteredGroups}
            selectedGroup={selectedGroup}
            onSelectGroup={handleSelectGroup}
            loading={groupsLoading}
          />
        </div>
        <div className={styles.mainContent}>
          {selectedGroup ? (
            <>
              <ChatHeader
                group={selectedGroup}
                onSearchChange={handleChatSearchChange}
                onSearchNav={handleChatSearchNav}
              />
              <ChatWindow
                group={selectedGroup}
                user={user}
                onNewMessage={() => {
                  fetchGroups(localStorage.getItem('token'));
                }}
                searchTerm={chatSearchTerm}
                searchNavDirection={chatSearchNav}
                onSearchNavHandled={() => setChatSearchNav(null)}
                socket={socket}
              />
            </>
          ) : (
            <div className={styles.emptyState}>
              <span className={styles.emptyStateIcon}>💬</span>
              <h2>Select a group to start chatting</h2>
              <p>Choose a conversation from the sidebar or create a new group</p>
              <button 
                className={styles.commandButton}
                onClick={() => setShowCommandPalette(true)}
              >
                <kbd>⌘</kbd> + <kbd>K</kbd> for quick actions
              </button>
            </div>
          )}
        </div>
      </div>

      {showProfile && (
        <UserProfile
          user={user}
          onUpdate={u => setUser(prev => (prev ? { ...prev, ...u } : prev))}
          onClose={() => setShowProfile(false)}
          onLogout={() => {
            localStorage.clear();
            sessionStorage.clear();
            navigate('/login', { replace: true });
            window.location.reload();
          }}
        />
      )}

      <GlobalSearch
        isOpen={showGlobalSearch}
        onClose={() => setShowGlobalSearch(false)}
        onSelectGroup={handleSelectGroup}
      />

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        groups={groups}
        onSelectGroup={handleSelectGroup}
        toggleTheme={toggleTheme}
      />

      <FAB
        onCommandPalette={() => setShowCommandPalette(true)}
        onGlobalSearch={() => setShowGlobalSearch(true)}
      />

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default ChatPage;