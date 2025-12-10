import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../pageStyles/ChatPage.module.css';
import GroupList from '../components/GroupList/GroupList';
import ChatWindow from '../components/ChatWindow/ChatWindow';
import ChatHeader from '../components/ChatHeader/ChatHeader';
import UserProfile from '../components/UserProfile/UserProfile';
import NotificationBell from '../components/Notifications/NotificationBell';
import CreateGroupIcon from '../assets/CreateGroup.png';
import JoinGroupIcon from '../assets/JoinGroup.png';
import { socket } from '../utils/socket';
import { API_LINK } from '../utils/config.js';

const ChatPage = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupSearch, setGroupSearch] = useState('');
  const [chatSearchTerm, setChatSearchTerm] = useState('');
  const [chatSearchNav, setChatSearchNav] = useState(null);
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const isSocketInitialized = useRef(false);
  const navigate = useNavigate();

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
            {user && (
              <NotificationBell
                userId={user.user_id || user.userid}
                token={token}
              />
            )}
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
          <div className={styles.emptyState}>Select a group to start chatting</div>
        )}
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
    </div>
  );
};

export default ChatPage;
