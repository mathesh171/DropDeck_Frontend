import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import styles from '../pageStyles/ChatPage.module.css';
import GroupList from '../components/GroupList/GroupList';
import ChatWindow from '../components/ChatWindow/ChatWindow';
import ChatHeader from '../components/ChatHeader/ChatHeader';
import UserProfile from '../components/UserProfile/UserProfile';
import CreateGroupIcon from '../assets/CreateGroup.png';
import JoinGroupIcon from '../assets/JoinGroup.png';

const ChatPage = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchUserProfile(token);
    fetchGroups(token);
  }, [navigate]);

  useEffect(() => {
    if (user && !socketRef.current) {
      socketRef.current = io('http://localhost:5000');
      socketRef.current.emit('joinGroups', user.user_id || user.userid);
      socketRef.current.on('messageUpdate', () => {
        fetchGroups(localStorage.getItem('token'));
        if (selectedGroup) setSelectedGroup(prev => ({ ...prev }));
      });
      socketRef.current.on('groupListUpdate', () => {
        fetchGroups(localStorage.getItem('token'));
      });
    }
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, selectedGroup]);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch {}
  };

  const fetchGroups = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/groups', {
        headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups || data || []);
      }
    } catch {}
  };

  const filteredGroups = groups.filter(g =>
    (g.group_name || g.groupname || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.chatPage}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.topIcons}>
            <div className={styles.iconCircle} onClick={() => setShowProfile(true)}>
              {user?.avatar_url || user?.avatarurl ? (
                <img src={user.avatar_url || user.avatarurl} alt="User" className={styles.profileImg} />
              ) : (
                <span className={styles.defaultUserIcon}>U</span>
              )}
            </div>
            <input
              type="text"
              placeholder="Search groups..."
              className={styles.searchBar}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
          onSelectGroup={setSelectedGroup}
        />
      </div>
      <div className={styles.mainContent}>
        {selectedGroup ? (
          <>
            <ChatHeader group={selectedGroup} />
            <ChatWindow
              group={selectedGroup}
              user={user}
              onNewMessage={() => {
                fetchGroups(localStorage.getItem('token'));
                setSelectedGroup(prev => ({ ...prev }));
              }}
            />
          </>
        ) : (
          <div className={styles.emptyState}>Select a group to start chatting</div>
        )}
      </div>
      {showProfile && (
        <UserProfile
          user={user}
          onUpdate={(u) => setUser(prev => ({ ...prev, ...u }))}
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
