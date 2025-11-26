import styles from './GroupList.module.css';

const GroupList = ({ groups, selectedGroup, onSelectGroup }) => {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    } else if (days === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' });
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const sortedGroups = [...groups].sort((a, b) => {
    const aTime = a.last_message ? new Date(a.last_message.created_at) : new Date(a.created_at);
    const bTime = b.last_message ? new Date(b.last_message.created_at) : new Date(b.created_at);
    return bTime - aTime;
  });

  return (
    <div className={styles.groupList}>
      {sortedGroups.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No groups yet</p>
          <p className={styles.emptyHint}>Create your first group to get started</p>
        </div>
      ) : (
        sortedGroups.map(group => (
          <div
            key={group.group_id}
            className={`${styles.groupItem} ${
              selectedGroup?.group_id === group.group_id ? styles.active : ''
            }`}
            onClick={() => onSelectGroup(group)}
          >
            <div className={styles.groupAvatar}>
              {group.group_image ? (
                <img
                  src={`http://localhost:5000/uploads/${group.group_image}`}
                  alt={group.group_name}
                  className={styles.groupAvatarImg}
                />
              ) : (
                getInitials(group.group_name)
              )}
            </div>

            <div className={styles.groupInfo}>
              <div className={styles.groupHeader}>
                <h3 className={styles.groupName}>{group.group_name}</h3>
                <span className={styles.groupDate}>
                  {formatDate(
                    group.last_message
                      ? group.last_message.created_at
                      : group.created_at
                  )}
                </span>
              </div>
              <p className={styles.groupMessage}>
                {group.last_message
                  ? group.last_message.content
                  : 'No messages yet'}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default GroupList;
