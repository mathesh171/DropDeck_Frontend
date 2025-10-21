import styles from './GroupList.module.css';

const GroupList = ({ groups, selectedGroup, onSelectGroup }) => {
  const formatDate = (dateString) => {
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

  return (
    <div className={styles.groupList}>
      {groups.length === 0 ? (
        <div className={styles.emptyState}>
          <p>No groups yet</p>
          <p className={styles.emptyHint}>Create your first group to get started</p>
        </div>
      ) : (
        groups.map(group => (
          <div
            key={group.group_id}
            className={`${styles.groupItem} ${
              selectedGroup?.group_id === group.group_id ? styles.active : ''
            }`}
            onClick={() => onSelectGroup(group)}
          >
            <div className={styles.groupAvatar}>
              {getInitials(group.group_name)}
            </div>
            <div className={styles.groupInfo}>
              <div className={styles.groupHeader}>
                <h3 className={styles.groupName}>{group.group_name}</h3>
                <span className={styles.groupDate}>
                  {formatDate(group.created_at)}
                </span>
              </div>
              <p className={styles.groupDescription}>
                {group.description || 'No description'}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default GroupList;
