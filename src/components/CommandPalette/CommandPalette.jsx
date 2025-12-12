import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import styles from './CommandPalette.module.css';

const CommandPalette = ({ isOpen, onClose, groups, onSelectGroup, toggleTheme }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const commands = [
    {
      id: 'create-group',
      title: 'Create New Group',
      icon: '➕',
      action: () => navigate('/create-group'),
      keywords: ['new', 'create', 'group', 'add']
    },
    {
      id: 'join-group',
      title: 'Join Group',
      icon: '🔗',
      action: () => navigate('/join-group'),
      keywords: ['join', 'group', 'discover']
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: '⚙️',
      action: () => navigate('/settings'),
      keywords: ['settings', 'preferences', 'config']
    },
    {
      id: 'toggle-theme',
      title: 'Toggle Theme',
      icon: '🌓',
      action: () => toggleTheme && toggleTheme(),
      keywords: ['theme', 'dark', 'light', 'mode']
    },
    {
      id: 'logout',
      title: 'Logout',
      icon: '🚪',
      action: () => {
        localStorage.clear();
        sessionStorage.clear();
        navigate('/login', { replace: true });
      },
      keywords: ['logout', 'signout', 'exit']
    }
  ];

  const groupCommands = groups.map(group => ({
    id: `group-${group.group_id}`,
    title: group.group_name,
    icon: '💬',
    subtitle: 'Open group',
    action: () => {
      onSelectGroup(group);
      onClose();
    },
    keywords: [group.group_name.toLowerCase(), 'group', 'chat']
  }));

  const allCommands = [...commands, ...groupCommands];

  const filteredCommands = query
    ? allCommands.filter(cmd => {
        const searchText = query.toLowerCase();
        return (
          cmd.title.toLowerCase().includes(searchText) ||
          cmd.keywords?.some(kw => kw.includes(searchText))
        );
      })
    : allCommands;

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < filteredCommands.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          executeCommand(filteredCommands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands]);

  const executeCommand = (command) => {
    command.action();
    onClose();
  };

  const highlightText = (text, query) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={index} className={styles.highlight}>{part}</mark>
      ) : (
        part
      )
    );
  };

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.palette} onClick={(e) => e.stopPropagation()}>
        <div className={styles.searchBox}>
          <span className={styles.searchIcon}>⌘</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd className={styles.kbd}>Esc</kbd>
        </div>

        <div className={styles.results}>
          {filteredCommands.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🔍</span>
              <p>No commands found</p>
            </div>
          ) : (
            filteredCommands.map((command, index) => (
              <div
                key={command.id}
                className={`${styles.commandItem} ${
                  index === selectedIndex ? styles.selected : ''
                }`}
                onClick={() => executeCommand(command)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <span className={styles.commandIcon}>{command.icon}</span>
                <div className={styles.commandContent}>
                  <div className={styles.commandTitle}>
                    {highlightText(command.title, query)}
                  </div>
                  {command.subtitle && (
                    <div className={styles.commandSubtitle}>{command.subtitle}</div>
                  )}
                </div>
                {index === selectedIndex && (
                  <kbd className={styles.enterKbd}>↵</kbd>
                )}
              </div>
            ))
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.shortcuts}>
            <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
            <span><kbd>↵</kbd> Select</span>
            <span><kbd>Esc</kbd> Close</span>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CommandPalette;