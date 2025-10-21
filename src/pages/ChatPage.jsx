import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../pageStyles/ChatPage.module.css';
import GroupList from '../components/GroupList/GroupList';
import ChatWindow from '../components/ChatWindow/ChatWindow';
import ChatHeader from '../components/ChatHeader/ChatHeader';

const ChatPage = () => {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch user profile
    fetchUserProfile(token);
    
    // Fetch user groups
    fetchGroups(token);
  }, [navigate]);

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

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
  };

  const handleCreateGroup = () => {
    navigate('/create-group');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const filteredGroups = groups.filter(group =>
    group.group_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.chatPage}>
      <div className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.userAvatar}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <button 
            className={styles.createButton}
            onClick={handleCreateGroup}
            title="Create new group"
          >
            +
          </button>
        </div>
        
        <GroupList
          groups={filteredGroups}
          selectedGroup={selectedGroup}
          onSelectGroup={handleGroupSelect}
        />
      </div>

      <div className={styles.mainContent}>
        {selectedGroup ? (
          <>
            <ChatHeader 
              group={selectedGroup} 
              onLogout={handleLogout}
            />
            <ChatWindow 
              group={selectedGroup}
              user={user}
            />
          </>
        ) : (
          <div className={styles.emptyState}>
            <h2>Drop Deck</h2>
            <p>Select a group to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
