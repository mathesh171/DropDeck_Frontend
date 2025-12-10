import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../pageStyles/JoinGroupPage.module.css';
import { API_LINK } from '../utils/config.js';

const JoinGroupPage = () => {
  const [groups, setGroups] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [joiningGroupId, setJoiningGroupId] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchJoinableGroups(token);
  }, [navigate]);

  const fetchJoinableGroups = async (token) => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_LINK}/api/groups/discover`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        setError('Failed to load groups.');
        setGroups([]);
        setLoading(false);
        return;
      }

      const data = await response.json();
      const all = data.groups || data;
      const visible = all.filter(
        (g) => g.access_type === 'public' || g.access_type === 'approval'
      );

      setGroups(visible);
    } catch {
      setError('Network error. Try again.');
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (group) => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setError('');
    setJoiningGroupId(group.group_id);
    try {
      const groupId = group.group_id;
      const accessType = group.access_type;
      const isPublic = accessType === 'public';
      const endpoint = isPublic
        ? `${API_LINK}/api/groups/${groupId}/join`
        : `${API_LINK}/api/groups/${groupId}/request`;
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.error || data.message || 'Action failed.');
        setJoiningGroupId(null);
        return;
      }
      await fetchJoinableGroups(token);
      setJoiningGroupId(null);
    } catch {
      setError('Network error. Try again.');
      setJoiningGroupId(null);
    }
  };

  const filteredGroups = groups.filter((g) =>
    (g.group_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.joinGroupPage}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/chat')}>
          ←
        </button>
        <h2 className={styles.title}>Join Groups</h2>
      </div>
      <div className={styles.content}>
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search public and approval-required groups..."
            className={styles.searchBar}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        {error && <div className={styles.error}>{error}</div>}
        {loading ? (
          <div className={styles.loading}>Loading groups...</div>
        ) : filteredGroups.length === 0 ? (
          <div className={styles.empty}>No groups available to join.</div>
        ) : (
          <div className={styles.groupList}>
            {filteredGroups.map((group) => {
              const accessType = group.access_type;
              const isPublic = accessType === 'public';
              const isApproval = accessType === 'approval';
              const label = isPublic
                ? 'Public'
                : isApproval
                ? 'Approval Required'
                : accessType;
              const buttonText = isPublic ? 'Join' : 'Request';
              const joining = joiningGroupId === group.group_id;
              return (
                <div
                  key={group.group_id}
                  className={styles.groupItem}
                >
                  <div className={styles.groupInfo}>
                    <div className={styles.groupNameRow}>
                      <span className={styles.groupName}>
                        {group.group_name}
                      </span>
                      <span className={styles.badge}>{label}</span>
                    </div>
                    {group.description && (
                      <p className={styles.groupDescription}>
                        {group.description}
                      </p>
                    )}
                  </div>
                  <button
                    className={styles.joinButton}
                    onClick={() => handleJoin(group)}
                    disabled={joining}
                  >
                    {joining ? 'Processing...' : buttonText}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default JoinGroupPage;
