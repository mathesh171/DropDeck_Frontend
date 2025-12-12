import { useState } from 'react';
import styles from './GroupList.module.css';
import { getImageUrl } from '../../utils/api.js';
import Skeleton from '../ui/Skeleton/Skeleton';

const GroupList = ({ groups, selectedGroup, onSelectGroup, loading = false }) => {
  const [pinnedGroups, setPinnedGroups] = useState(() => {
    const saved = localStorage.getItem('pinnedGroups');
    return saved ? JSON.parse(saved) : [];
  });

  const formatDate = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } else if (days === 1) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'numeric',
        day: 'numeric',
        year: '2-digit'
      });
    }
  };

  const getInitials = name => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const togglePin = (groupId) => {
    const updated = pinnedGroups.includes(groupId)
      ? pinnedGroups.filter(id => id !== groupId)
      : [...pinnedGroups, groupId];

    setPinnedGroups(updated);
    localStorage.setItem('pinnedGroups', JSON.stringify(updated));
  };

  const uniqueGroupsMap = new Map();
  groups.forEach(g => {
    uniqueGroupsMap.set(g.group_id, g);
  });
  const uniqueGroups = Array.from(uniqueGroupsMap.values());

  const pinned = uniqueGroups.filter(g => pinnedGroups.includes(g.group_id));
  const unpinned = uniqueGroups.filter(g => !pinnedGroups.includes(g.group_id));

  const sortGroups = (groupsToSort) => {
    return groupsToSort.sort((a, b) => {
      const aTime = a.last_message
        ? new Date(a.last_message.created_at)
        : new Date(a.created_at);
      const bTime = b.last_message
        ? new Date(b.last_message.created_at)
        : new Date(b.created_at);
      return bTime - aTime;
    });
  };

  const sortedPinned = sortGroups(pinned);
  const sortedUnpinned = sortGroups(unpinned);

  const getLastMessagePreview = (group) => {
    const last = group.last_message;
    if (!last) return 'No messages yet';

    if (last.message_type === 'file') {
      return (
        <span className={styles.messageWithIcon}>
          <span className={styles.fileIcon}>📎</span>
          {last.file_name || last.content || 'File'}
        </span>
      );
    }

    if (last.message_type === 'poll') {
      return (
        <span className={styles.messageWithIcon}>
          <span className={styles.pollIcon}>📊</span>
          Poll
        </span>
      );
    }

    if (last.message_type === 'image') {
      return (
        <span className={styles.messageWithIcon}>
          <span className={styles.imageIcon}>🖼️</span>
          Image
        </span>
      );
    }

    return last.content;
  };

  const renderGroupItem = (group, isPinned = false) => {
    const unread = group.unread_count || 0;
    const isOnline = group.online_members > 0;

    return (
      <div
        key={group.group_id}
        className={`${styles.groupItem} ${
          selectedGroup?.group_id === group.group_id ? styles.active : ''
        }`}
        onClick={() => onSelectGroup(group)}
      >
        <div className={styles.avatarWrapper}>
          <div className={styles.groupAvatar}>
            {group.group_image ? (
              <img
                src={getImageUrl(group.group_image)}
                alt={group.group_name}
                className={styles.groupAvatarImg}
              />
            ) : (
              getInitials(group.group_name)
            )}
          </div>
          {isOnline && <div className={styles.onlineIndicator}></div>}
        </div>

        <div className={styles.groupInfo}>
          <div className={styles.groupHeader}>
            <h3 className={styles.groupName}>
              {isPinned && <span className={styles.pinIcon}>📌</span>}
              {group.group_name}
            </h3>
            <span className={styles.groupDate}>
              {formatDate(
                group.last_message ? group.last_message.created_at : group.created_at
              )}
            </span>
          </div>
          <div className={styles.bottomRow}>
            <p className={styles.groupMessage}>{getLastMessagePreview(group)}</p>
            {unread > 0 && (
              <span className={styles.unreadBadge}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </div>
        </div>

        <button
          className={styles.pinButton}
          onClick={(e) => {
            e.stopPropagation();
            togglePin(group.group_id);
          }}
          title={isPinned ? 'Unpin' : 'Pin'}
        >
          📌
        </button>
      </div>
    );
  };

  if (loading) {
    return (
      <div className={styles.groupList}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className={styles.skeletonItem}>
            <Skeleton variant="avatar" circle width={50} height={50} />
            <div className={styles.skeletonContent}>
              <Skeleton variant="title" width="70%" />
              <Skeleton variant="text" width="90%" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={styles.groupList}>
      {uniqueGroups.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>💬</span>
          <p>No groups yet</p>
          <p className={styles.emptyHint}>Create your first group to get started</p>
        </div>
      ) : (
        <>
          {sortedPinned.length > 0 && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <span className={styles.sectionTitle}>Pinned</span>
                <span className={styles.sectionCount}>{sortedPinned.length}</span>
              </div>
              {sortedPinned.map(group => renderGroupItem(group, true))}
            </div>
          )}

          {sortedUnpinned.length > 0 && (
            <div className={styles.section}>
              {sortedPinned.length > 0 && (
                <div className={styles.sectionHeader}>
                  <span className={styles.sectionTitle}>All Chats</span>
                  <span className={styles.sectionCount}>{sortedUnpinned.length}</span>
                </div>
              )}
              {sortedUnpinned.map(group => renderGroupItem(group, false))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GroupList;