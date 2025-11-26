import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import styles from '../pageStyles/ChatPage.module.css';
import GroupList from '../components/GroupList/GroupList';
import ChatWindow from '../components/ChatWindow/ChatWindow';
import ChatHeader from '../components/ChatHeader/ChatHeader';
import UserProfile from '../components/UserProfile/UserProfile';

import LogoutIcon from '../assets/Logout.png';
import CreateGroupIcon from '../assets/CreateGroup.png';

const ChatPage = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    fetchUserProfile(token);
    fetchGroups(token);
  }, [navigate]);

  useEffect(() => {
    if (user && !socketRef.current) {
      socketRef.current = io('http://localhost:5000');
      socketRef.current.emit('joinGroups', user.user_id);

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
  }, [user]);

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Profile error:', error);
    }
  };

  const fetchGroups = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/api/groups', {
        headers: {
          'Authorization': `Bearer ${token || localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setGroups(data.groups || []);
      }
    } catch (error) {
      console.error('Group fetch error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const filteredGroups = groups.filter(g =>
    g.group_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.chatPage}>
      <div className={styles.sidebar}>

        {/* ---------------------------------------
             ⭐ Updated: Profile → Search → Create → Logout
        ----------------------------------------- */}
        <div className={styles.sidebarHeader}>
          <div className={styles.topIcons}>
            <div className={styles.iconCircle} title="Profile" onClick={() => setShowProfile(true)}>
              {user?.avatar_url ? (
                <img src={user.avatar_url} alt="User" className={styles.profileImg} />
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

            <div className={styles.iconCircle} title="Create Group" onClick={() => navigate('/create-group')}>
              <img src={CreateGroupIcon} className={styles.smallIcon} alt="Create" />
            </div>

            <div className={styles.iconCircle} title="Logout" onClick={handleLogout}>
              <img src={LogoutIcon} className={styles.smallIcon} alt="Logout" />
            </div>

          </div>
        </div>

        {/* Groups List */}
        <GroupList
          groups={filteredGroups}
          selectedGroup={selectedGroup}
          onSelectGroup={setSelectedGroup}
        />

      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {selectedGroup ? (
          <>
            <ChatHeader group={selectedGroup} onLogout={handleLogout} />
            <ChatWindow
              group={selectedGroup}
              user={user}
              onNewMessage={() => fetchGroups(localStorage.getItem('token'))}
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
          onLogout={handleLogout}
        />
      )}
    </div>
  );
};

export default ChatPage;