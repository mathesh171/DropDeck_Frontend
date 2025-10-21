import styles from './ChatHeader.module.css';

const ChatHeader = ({ group, onLogout }) => {
  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={styles.chatHeader}>
      <div className={styles.groupInfo}>
        <div className={styles.groupAvatar}>
          {getInitials(group.group_name)}
        </div>
        <div className={styles.groupDetails}>
          <h2 className={styles.groupName}>{group.group_name}</h2>
          <p className={styles.groupMeta}>
            {group.description || 'Group chat'}
          </p>
        </div>
      </div>
      
      <div className={styles.headerActions}>
        <button className={styles.iconButton} title="Search">
          🔍
        </button>
        <button className={styles.iconButton} title="Menu">
          ⋮
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
