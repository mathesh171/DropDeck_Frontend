import { createPortal } from 'react-dom';
import { useState } from 'react';
import styles from './KeyboardShortcutsHelp.module.css';

const shortcuts = [
  {
    category: 'Navigation',
    items: [
      { keys: ['Ctrl', 'K'], description: 'Open command palette' },
      { keys: ['Ctrl', 'F'], description: 'Global search' },
      { keys: ['Esc'], description: 'Close modal/dialog' },
      { keys: ['↑', '↓'], description: 'Navigate groups' },
      { keys: ['Enter'], description: 'Select/Open' },
    ]
  },
  {
    category: 'Messaging',
    items: [
      { keys: ['Ctrl', 'Enter'], description: 'Send message' },
      { keys: ['Shift', 'Enter'], description: 'New line' },
      { keys: ['@'], description: 'Mention user' },
      { keys: ['/'], description: 'Commands' },
    ]
  },
  {
    category: 'Actions',
    items: [
      { keys: ['Ctrl', 'N'], description: 'New group' },
      { keys: ['Ctrl', 'J'], description: 'Join group' },
      { keys: ['Ctrl', ','], description: 'Settings' },
      { keys: ['Ctrl', 'D'], description: 'Toggle dark mode' },
    ]
  }
];

const KeyboardShortcutsHelp = ({ isOpen, onClose }) => {
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filteredShortcuts = shortcuts.map(category => ({
    ...category,
    items: category.items.filter(item =>
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.items.length > 0);

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>⌨️ Keyboard Shortcuts</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        <div className={styles.search}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search shortcuts..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className={styles.content}>
          {filteredShortcuts.length === 0 ? (
            <div className={styles.emptyState}>
              <p>No shortcuts found</p>
            </div>
          ) : (
            filteredShortcuts.map((category, idx) => (
              <div key={idx} className={styles.category}>
                <h3 className={styles.categoryTitle}>{category.category}</h3>
                <div className={styles.shortcuts}>
                  {category.items.map((item, itemIdx) => (
                    <div key={itemIdx} className={styles.shortcutItem}>
                      <div className={styles.keys}>
                        {item.keys.map((key, keyIdx) => (
                          <kbd key={keyIdx} className={styles.key}>{key}</kbd>
                        ))}
                      </div>
                      <span className={styles.description}>{item.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            Press <kbd className={styles.key}>?</kbd> to toggle this help
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default KeyboardShortcutsHelp;