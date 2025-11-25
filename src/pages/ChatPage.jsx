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