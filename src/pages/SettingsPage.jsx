import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from '../pageStyles/SettingsPage.module.css';
import ThemeCustomizer from '../components/ThemeCustomizer/ThemeCustomizer';
import NotificationSettings from '../components/NotificationSettings/NotificationSettings';
import { useTheme } from '../context/ThemeContext';

const SettingsPage = () => {
  const navigate = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('appearance');
  const [showThemeCustomizer, setShowThemeCustomizer] = useState(false);

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'about', label: 'About', icon: 'ℹ️' },
  ];

  const renderAppearanceTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.settingCard}>
        <div className={styles.settingHeader}>
          <div>
            <h3 className={styles.settingTitle}>Theme Mode</h3>
            <p className={styles.settingDescription}>Choose your preferred theme</p>
          </div>
          <button
            className={`${styles.toggleButton} ${isDark ? styles.active : ''}`}
            onClick={toggleTheme}
          >
            <span className={styles.toggleIcon}>{isDark ? '🌙' : '☀️'}</span>
            <span className={styles.toggleLabel}>{isDark ? 'Dark' : 'Light'}</span>
          </button>
        </div>
      </div>

      <div className={styles.settingCard}>
        <div className={styles.settingHeader}>
          <div>
            <h3 className={styles.settingTitle}>Customize Theme</h3>
            <p className={styles.settingDescription}>Personalize colors and backgrounds</p>
          </div>
          <button
            className={styles.actionButton}
            onClick={() => setShowThemeCustomizer(true)}
          >
            Customize
          </button>
        </div>
      </div>

      <div className={styles.settingCard}>
        <div className={styles.settingHeader}>
          <div>
            <h3 className={styles.settingTitle}>Font Size</h3>
            <p className={styles.settingDescription}>Adjust text size</p>
          </div>
          <select className={styles.select}>
            <option value="small">Small</option>
            <option value="medium" selected>Medium</option>
            <option value="large">Large</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderNotificationsTab = () => (
    <div className={styles.tabContent}>
      <NotificationSettings />
    </div>
  );

  const renderPrivacyTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.settingCard}>
        <div className={styles.settingHeader}>
          <div>
            <h3 className={styles.settingTitle}>Read Receipts</h3>
            <p className={styles.settingDescription}>Let others know when you've read their messages</p>
          </div>
          <label className={styles.switch}>
            <input type="checkbox" defaultChecked />
            <span className={styles.slider}></span>
          </label>
        </div>
      </div>

      <div className={styles.settingCard}>
        <div className={styles.settingHeader}>
          <div>
            <h3 className={styles.settingTitle}>Last Seen</h3>
            <p className={styles.settingDescription}>Show when you were last online</p>
          </div>
          <label className={styles.switch}>
            <input type="checkbox" defaultChecked />
            <span className={styles.slider}></span>
          </label>
        </div>
      </div>

      <div className={styles.settingCard}>
        <div className={styles.settingHeader}>
          <div>
            <h3 className={styles.settingTitle}>Typing Indicators</h3>
            <p className={styles.settingDescription}>Show when you're typing</p>
          </div>
          <label className={styles.switch}>
            <input type="checkbox" defaultChecked />
            <span className={styles.slider}></span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderAboutTab = () => (
    <div className={styles.tabContent}>
      <div className={styles.aboutCard}>
        <div className={styles.logoSection}>
          <div className={styles.appLogo}>💬</div>
          <h2 className={styles.appName}>DropDeck</h2>
          <p className={styles.appVersion}>Version 1.0.0</p>
        </div>

        <div className={styles.aboutInfo}>
          <p className={styles.aboutDescription}>
            A privacy-first ephemeral messaging platform for temporary group communications.
          </p>

          <div className={styles.infoList}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Developer:</span>
              <span className={styles.infoValue}>DropDeck Team</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>License:</span>
              <span className={styles.infoValue}>MIT</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Website:</span>
              <a href="#" className={styles.infoLink}>dropdeck.com</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={styles.settingsPage}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/chat')}>
          ←
        </button>
        <h1 className={styles.title}>Settings</h1>
      </div>

      <div className={styles.container}>
        <div className={styles.sidebar}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`${styles.tabButton} ${activeTab === tab.id ? styles.activeTab : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className={styles.tabIcon}>{tab.icon}</span>
              <span className={styles.tabLabel}>{tab.label}</span>
            </button>
          ))}
        </div>

        <div className={styles.content}>
          {activeTab === 'appearance' && renderAppearanceTab()}
          {activeTab === 'notifications' && renderNotificationsTab()}
          {activeTab === 'privacy' && renderPrivacyTab()}
          {activeTab === 'about' && renderAboutTab()}
        </div>
      </div>

      {showThemeCustomizer && (
        <ThemeCustomizer
          isOpen={showThemeCustomizer}
          onClose={() => setShowThemeCustomizer(false)}
        />
      )}
    </div>
  );
};

export default SettingsPage;