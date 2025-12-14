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
import KeyboardShortcutsHelp from '../components/KeyboardShortcuts/KeyboardShortcutsHelp';
import CreateGroupIcon from '../assets/CreateGroup.png';
import JoinGroupIcon from '../assets/JoinGroup.png';
import SettingsIcon from '../assets/Settings.png';
import SearchIcon from '../assets/Search.png';
import MenuIcon from '../assets/menu.png';
import { socket } from '../utils/socket';
import { API_LINK } from '../config.js';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../hooks/useToast';
import { useKeyboard } from '../hooks/useKeyboard';

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
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false);
  const [groupsLoading, setGroupsLoading] = useState(true);
  const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
  const [showSearchBar, setShowSearchBar] = useState(false);
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

  useKeyboard({
    'ctrl+k': () => setShowCommandPalette(true),
    'ctrl+f': () => setShowGlobalSearch(true),
    'ctrl+n': () => navigate('/create-group'),
    'ctrl+j': () => navigate('/join-group'),
    'ctrl+,': () => navigate('/settings'),
    'ctrl+d': () => toggleTheme(),
    '?': () => setShowShortcutsHelp(true),
    'escape': () => {
      setShowCommandPalette(false);
      setShowGlobalSearch(false);
      setShowShortcutsHelp(false);
      setShowProfile(false);
      if (showSearchBar) {
        setShowSearchBar(false);
      }
    },
    'arrowup': (e) => {
      if (groups.length > 0 && !selectedGroup) {
        e.preventDefault();
        setSelectedGroupIndex(prev => Math.max(0, prev - 1));
      }
    },
    'arrowdown': (e) => {
      if (groups.length > 0 && !selectedGroup) {
        e.preventDefault();
        setSelectedGroupIndex(prev => Math.min(groups.length - 1, prev + 1));
      }
    },
    'enter': () => {
      if (groups.length > 0 && !selectedGroup) {
        handleSelectGroup(groups[selectedGroupIndex]);
      }
    }
  }, [showCommandPalette, showGlobalSearch, showShortcutsHelp, showProfile, groups, selectedGroup, selectedGroupIndex, showSearchBar]);

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

  const getUserInitial = username => {
    if (!username) return 'U';
    return username.charAt(0).toUpperCase();
  };

  const handleSearchClick = () => {
    setShowSearchBar(true);
  };

  const handleMenuClick = () => {
    setShowSearchBar(false);
    setGroupSearch('');
  };

  return (
    <>
      <div className={styles.chatPage}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.topIcons}>
              <div 
                className={styles.iconCircle} 
                onClick={() => setShowProfile(true)}
                role="button"
                tabIndex={0}
                aria-label="Open profile"
                onKeyDown={(e) => e.key === 'Enter' && setShowProfile(true)}
              >
                {user?.avatar_url || user?.avatarurl ? (
                  <img
                    src={user.avatar_url || user.avatarurl}
                    alt="User"
                    className={styles.profileImg}
                  />
                ) : (
                  <span className={styles.defaultUserIcon}>
                    {getUserInitial(user?.name)}
                  </span>
                )}
              </div>

              {showSearchBar ? (
                <>
                  <input
                    type="text"
                    placeholder="Search groups..."
                    className={styles.searchBar}
                    value={groupSearch}
                    onChange={e => setGroupSearch(e.target.value)}
                    aria-label="Search groups"
                    autoFocus
                  />
                  <button
                    className={styles.iconCircle}
                    onClick={handleMenuClick}
                    aria-label="Close search"
                  >
                    <img src={MenuIcon} className={styles.smallIcon} alt="Menu" />
                  </button>
                </>
              ) : (
                <div className={styles.rightIcons}>
                  <button
                    className={styles.iconCircle}
                    onClick={handleSearchClick}
                    aria-label="Search"
                  >
                    <img src={SearchIcon} className={styles.smallIcon} alt="Search" />
                  </button>
                  {user && (
                    <NotificationBell
                      userId={user.user_id || user.userid}
                      token={token}
                    />
                  )}
                  <button
                    className={styles.iconCircle}
                    onClick={() => navigate('/create-group')}
                    aria-label="Create group"
                  >
                    <img src={CreateGroupIcon} className={styles.smallIcon} alt="Create" />
                  </button>
                  <button
                    className={styles.iconCircle}
                    onClick={() => navigate('/join-group')}
                    aria-label="Join group"
                  >
                    <img src={JoinGroupIcon} className={styles.smallIcon} alt="Join" />
                  </button>
                  <button
                    className={styles.iconCircle}
                    onClick={() => navigate('/settings')}
                    aria-label="Settings"
                  >
                    <img src={SettingsIcon} className={styles.smallIcon} alt="Settings" />
                  </button>
                </div>
              )}
            </div>
          </div>
          <GroupList
            groups={filteredGroups}
            selectedGroup={selectedGroup}
            onSelectGroup={handleSelectGroup}
            loading={groupsLoading}
          />
        </div>
        <div className={styles.mainContent} role="main">
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
              <button 
                className={styles.helpButton}
                onClick={() => setShowShortcutsHelp(true)}
              >
                <kbd>?</kbd> for keyboard shortcuts
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

      <KeyboardShortcutsHelp
        isOpen={showShortcutsHelp}
        onClose={() => setShowShortcutsHelp(false)}
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
