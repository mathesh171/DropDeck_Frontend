import { useState, useEffect } from 'react';
import styles from './NotificationSettings.module.css';

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    soundEnabled: true,
    desktopEnabled: true,
    emailEnabled: false,
    mentionsOnly: false,
    mutedGroups: []
  });

  const [groups, setGroups] = useState([]);

  useEffect(() => {
    const savedSettings = localStorage.getItem('notificationSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }

    const fetchGroups = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/groups', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setGroups(data.groups || []);
        }
      } catch (error) {
        console.error('Failed to fetch groups:', error);
      }
    };

    fetchGroups();
  }, []);

  useEffect(() => {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
  }, [settings]);

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleGroupMute = (groupId) => {
    setSettings(prev => {
      const mutedGroups = prev.mutedGroups.includes(groupId)
        ? prev.mutedGroups.filter(id => id !== groupId)
        : [...prev.mutedGroups, groupId];
      return { ...prev, mutedGroups };
    });
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setSettings(prev => ({ ...prev, desktopEnabled: true }));
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>General Settings</h3>
        
        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Sound Notifications</span>
            <span className={styles.settingDescription}>Play sound for new messages</span>
          </div>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={settings.soundEnabled}
              onChange={() => toggleSetting('soundEnabled')}
            />
            <span className={styles.slider}></span>
          </label>
        </div>

        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Desktop Notifications</span>
            <span className={styles.settingDescription}>Show browser notifications</span>
          </div>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={settings.desktopEnabled}
              onChange={() => {
                if (!settings.desktopEnabled) {
                  requestNotificationPermission();
                } else {
                  toggleSetting('desktopEnabled');
                }
              }}
            />
            <span className={styles.slider}></span>
          </label>
        </div>

        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Email Notifications</span>
            <span className={styles.settingDescription}>Receive email alerts</span>
          </div>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={settings.emailEnabled}
              onChange={() => toggleSetting('emailEnabled')}
            />
            <span className={styles.slider}></span>
          </label>
        </div>

        <div className={styles.settingItem}>
          <div className={styles.settingInfo}>
            <span className={styles.settingLabel}>Mentions Only</span>
            <span className={styles.settingDescription}>Only notify when mentioned</span>
          </div>
          <label className={styles.switch}>
            <input
              type="checkbox"
              checked={settings.mentionsOnly}
              onChange={() => toggleSetting('mentionsOnly')}
            />
            <span className={styles.slider}></span>
          </label>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Per-Group Settings</h3>
        <p className={styles.sectionDescription}>Mute notifications for specific groups</p>
        
        <div className={styles.groupList}>
          {groups.map(group => (
            <div key={group.group_id} className={styles.groupItem}>
              <div className={styles.groupInfo}>
                <div className={styles.groupAvatar}>
                  {group.group_image ? (
                    <img src={`http://localhost:5000/uploads/${group.group_image}`} alt={group.group_name} />
                  ) : (
                    group.group_name.substring(0, 2).toUpperCase()
                  )}
                </div>
                <span className={styles.groupName}>{group.group_name}</span>
              </div>
              <label className={styles.switch}>
                <input
                  type="checkbox"
                  checked={!settings.mutedGroups.includes(group.group_id)}
                  onChange={() => toggleGroupMute(group.group_id)}
                />
                <span className={styles.slider}></span>
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Test Notifications</h3>
        <button
          className={styles.testButton}
          onClick={() => {
            if (settings.desktopEnabled && Notification.permission === 'granted') {
              new Notification('DropDeck Test', {
                body: 'This is a test notification',
                icon: '/logo.png'
              });
            }
            if (settings.soundEnabled) {
              const audio = new Audio('/notification.mp3');
              audio.play().catch(() => {});
            }
          }}
        >
          Test Notification
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;