import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import styles from './GlobalSearch.module.css';
import { API_LINK } from '../../config.js';

const GlobalSearch = ({ isOpen, onClose, onSelectGroup, onSelectMessage }) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [results, setResults] = useState({
    messages: [],
    files: [],
    groups: []
  });
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ messages: [], files: [], groups: [] });
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const performSearch = async (searchQuery) => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(
        `${API_LINK}/api/search?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResults({
          messages: data.messages || [],
          files: data.files || [],
          groups: data.groups || []
        });
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
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

  const getTotalResults = () => {
    return results.messages.length + results.files.length + results.groups.length;
  };

  const getFilteredResults = () => {
    switch (activeTab) {
      case 'messages':
        return results.messages;
      case 'files':
        return results.files;
      case 'groups':
        return results.groups;
      default:
        return [
          ...results.messages,
          ...results.files,
          ...results.groups
        ];
    }
  };

  const handleResultClick = (result) => {
    if (result.type === 'message') {
      onSelectMessage && onSelectMessage(result);
    } else if (result.type === 'group') {
      onSelectGroup && onSelectGroup(result);
    }
    onClose();
  };

  if (!isOpen) return null;

  const filteredResults = getFilteredResults();

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.searchWrapper}>
            <span className={styles.searchIcon}>🔍</span>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search messages, files, and groups..."
              className={styles.searchInput}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {loading && <span className={styles.loadingSpinner}></span>}
          </div>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        {query && (
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All ({getTotalResults()})
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'messages' ? styles.active : ''}`}
              onClick={() => setActiveTab('messages')}
            >
              Messages ({results.messages.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'files' ? styles.active : ''}`}
              onClick={() => setActiveTab('files')}
            >
              Files ({results.files.length})
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'groups' ? styles.active : ''}`}
              onClick={() => setActiveTab('groups')}
            >
              Groups ({results.groups.length})
            </button>
          </div>
        )}

        <div className={styles.results}>
          {!query ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>🔍</span>
              <p>Start typing to search</p>
              <p className={styles.emptyHint}>Search for messages, files, or groups</p>
            </div>
          ) : loading ? (
            <div className={styles.loadingState}>
              <span className={styles.spinner}></span>
              <p>Searching...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className={styles.emptyState}>
              <span className={styles.emptyIcon}>😕</span>
              <p>No results found</p>
              <p className={styles.emptyHint}>Try a different search term</p>
            </div>
          ) : (
            <div className={styles.resultsList}>
              {filteredResults.map((result, index) => (
                <div
                  key={index}
                  className={styles.resultItem}
                  onClick={() => handleResultClick(result)}
                >
                  <div className={styles.resultIcon}>
                    {result.type === 'message' && '💬'}
                    {result.type === 'file' && '📎'}
                    {result.type === 'group' && '👥'}
                  </div>
                  <div className={styles.resultContent}>
                    <div className={styles.resultTitle}>
                      {highlightText(result.title || result.name || result.content, query)}
                    </div>
                    <div className={styles.resultMeta}>
                      {result.group_name && <span>{result.group_name}</span>}
                      {result.user_name && <span>· {result.user_name}</span>}
                      {result.created_at && (
                        <span>· {new Date(result.created_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.shortcuts}>
            <kbd>↑↓</kbd> Navigate
            <kbd>↵</kbd> Select
            <kbd>Esc</kbd> Close
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default GlobalSearch;