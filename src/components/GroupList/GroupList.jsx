import { useState } from 'react';
import styles from './GroupList.module.css';
import { getImageUrl } from '../../utils/api.js';
import Skeleton from '../ui/Skeleton/Skeleton';
import { useSwipeGesture } from '../../hooks/useSwipeGesture';
import pinIcon from '../../assets/pin.png';
import pinnedIcon from '../../assets/pinned.png';

const GroupList = ({ groups, selectedGroup, onSelectGroup, loading = false }) => {
  const [pinnedGroups, setPinnedGroups] = useState(() => {
    const saved = localStorage.getItem('pinnedGroups');
    return saved ? JSON.parse(saved) : [];
  });
  const [swipedItemId, setSwipedItemId] = useState(null);

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
    }
    if (days === 1) return 'Yesterday';
    return date.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit'
    });
  };

  const getInitials = name =>
    name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const togglePin = groupId => {
    const updated = pinnedGroups.includes(groupId)
      ? pinnedGroups.filter(id => id !== groupId)
      : [...pinnedGroups, groupId];

    setPinnedGroups(updated);
    localStorage.setItem('pinnedGroups', JSON.stringify(updated));
    setSwipedItemId(null);
  };

  const uniqueGroups = Array.from(
    new Map(groups.map(g => [g.group_id, g])).values()
  );

  const pinned = uniqueGroups.filter(g => pinnedGroups.includes(g.group_id));
  const unpinned = uniqueGroups.filter(g => !pinnedGroups.includes(g.group_id));

  const sortGroups = list =>
    list.sort((a, b) => {
      const aTime = a.last_message
        ? new Date(a.last_message.created_at)
        : new Date(a.created_at);
      const bTime = b.last_message
        ? new Date(b.last_message.created_at)
        : new Date(b.created_at);
      return bTime - aTime;
    });

  const GroupItem = ({ group }) => {
    const unread = group.unread_count || 0;
    const isOnline = group.online_members > 0;
    const isPinned = pinnedGroups.includes(group.group_id);
    const isSwiped = swipedItemId === group.group_id;

    const { elementRef, swipeDistance } = useSwipeGesture(
      () => setSwipedItemId(group.group_id),
      () => setSwipedItemId(null),
      50
    );

    return (
      <div
        ref={elementRef}
        className={`${styles.groupItemWrapper} ${isSwiped ? styles.swiped : ''}`}
        onClick={() => (isSwiped ? setSwipedItemId(null) : onSelectGroup(group))}
      >
        <div
          className={`${styles.groupItem} ${
            selectedGroup?.group_id === group.group_id ? styles.active : ''
          }`}
          style={{
            transform: `translateX(${Math.max(-80, Math.min(0, swipeDistance))}px)`
          }}
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
            {isOnline && <div className={styles.onlineIndicator} />}
          </div>

          <div className={styles.groupInfo}>
            <div className={styles.groupHeader}>
              <h3 className={styles.groupName}>{group.group_name}</h3>
              <div className={styles.datePinWrapper}>
                <span className={styles.groupDate}>
                  {formatDate(group.last_message?.created_at || group.created_at)}
                </span>
                <button
                  className={styles.pinButton}
                  onClick={e => {
                    e.stopPropagation();
                    togglePin(group.group_id);
                  }}
                >
                  <img
                    src={isPinned ? pinnedIcon : pinIcon}
                    alt="pin"
                  />
                </button>
              </div>
            </div>

            <div className={styles.bottomRow}>
              <p className={styles.groupMessage}>
                {group.last_message?.content || 'No messages yet'}
              </p>
              {unread > 0 && (
                <span className={styles.unreadBadge}>
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </div>
          </div>
        </div>
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
      {sortGroups(pinned).map(g => (
        <GroupItem key={g.group_id} group={g} />
      ))}
      {sortGroups(unpinned).map(g => (
        <GroupItem key={g.group_id} group={g} />
      ))}
    </div>
  );
};

export default GroupList;
