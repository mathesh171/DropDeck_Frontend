import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import styles from '../pageStyles/ChatPage.module.css';
import GroupList from '../components/GroupList/GroupList';
import ChatWindow from '../components/ChatWindow/ChatWindow';
import ChatHeader from '../components/ChatHeader/ChatHeader';
import UserProfile from '../components/UserProfile/UserProfile';

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
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
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
      console.error('Error fetching groups:', error);
    }
  };

  const handleGroupSelect = (group) => setSelectedGroup(group);
  const handleCreateGroup = () => navigate('/create-group');
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };
  const handleProfileUpdate = (updated) => {
    setUser(prev => ({ ...prev, ...updated }));
    setShowProfile(false);
  };

  const filteredGroups = groups.filter(g => g.group_name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className={styles.chatPage}>
      <div className={styles.sidebar}>
        {/* sidebar header code including user avatar click to open profile */}
        <div className={styles.sidebarHeader}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              {user?.avatar_url && (
                <img
                  src={user.avatar_url}
                  alt="User Avatar"
                  style={{ width: 40, height: 40, borderRadius: "50%", marginRight: "8px", cursor: "pointer" }}
                  onClick={() => setShowProfile(true)}
                />
              )}
              <span style={{ fontWeight: 500 }}>{user?.username || "User"}</span>
            </div>
            <button onClick={handleLogout} style={{ marginLeft: 12 }}>
              Logout
            </button>
          </div>
          <button
            onClick={handleCreateGroup}
            style={{ marginBottom: "12px", width: "100%" }}
          >
            + Create Group
          </button>
        </div>
        <GroupList groups={filteredGroups} selectedGroup={selectedGroup} onSelectGroup={handleGroupSelect} />
      </div>

      <div className={styles.mainContent}>
        {selectedGroup ? (
          <>
            <ChatHeader group={selectedGroup} onLogout={handleLogout} />
            <ChatWindow group={selectedGroup} user={user} onNewMessage={() => fetchGroups(localStorage.getItem('token'))} />
          </>
        ) : (
          <div className={styles.emptyState}>Select a group to start chatting</div>
        )}
      </div>

      {showProfile && (
        <UserProfile user={user} onUpdate={handleProfileUpdate} onClose={() => setShowProfile(false)} onLogout={handleLogout} />
      )}
    </div>
  );
};

export default ChatPage;