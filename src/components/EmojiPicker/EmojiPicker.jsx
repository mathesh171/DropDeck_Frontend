import { useState } from 'react';
import styles from './EmojiPicker.module.css';

const EMOJI_CATEGORIES = {
  recent: { label: '🕒 Recent', emojis: [] },
  smileys: {
    label: '😀 Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '🥲', '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔']
  },
  gestures: {
    label: '👍 Gestures',
    emojis: ['👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌', '🤌', '🤏', '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐', '🖖', '👋', '🤙', '💪', '🙏']
  },
  hearts: {
    label: '❤️ Hearts',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '💕', '💞', '💓', '💗', '💖', '💘', '💝']
  },
  animals: {
    label: '🐶 Animals',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗']
  },
  food: {
    label: '🍕 Food',
    emojis: ['🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥓', '🥚', '🧇', '🥞', '🧈', '🍞', '🥐', '🥨', '🥯', '🥖', '🧀', '🥗', '🥙', '🌮', '🌯', '🥪', '🍖', '🍗', '🥩']
  },
  activities: {
    label: '⚽ Activities',
    emojis: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍', '🏏', '🥅', '⛳', '🪁', '🏹', '🎣', '🤿', '🥊', '🥋']
  },
  travel: {
    label: '✈️ Travel',
    emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🦯', '🦽', '🦼', '🛴', '🚲', '🛵', '🏍️', '🛺', '🚨', '🚔', '🚍']
  },
  objects: {
    label: '💡 Objects',
    emojis: ['⌚', '📱', '📲', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '🖲️', '🕹️', '🗜️', '💾', '💿', '📀', '📼', '📷', '📸', '📹', '🎥', '📽️', '🎞️', '📞', '☎️', '📟', '📠']
  },
  symbols: {
    label: '❤️ Symbols',
    emojis: ['❤️', '💔', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️', '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊']
  },
  flags: {
    label: '🏁 Flags',
    emojis: ['🏁', '🚩', '🎌', '🏴', '🏳️', '🏳️‍🌈', '🏳️‍⚧️', '🏴‍☠️', '🇺🇳', '🇦🇫', '🇦🇽', '🇦🇱', '🇩🇿', '🇦🇸', '🇦🇩', '🇦🇴', '🇦🇮', '🇦🇶', '🇦🇬', '🇦🇷', '🇦🇲', '🇦🇼', '🇦🇺', '🇦🇹']
  }
};

const EmojiPicker = ({ onSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('smileys');
  const [search, setSearch] = useState('');
  const [recentEmojis, setRecentEmojis] = useState(() => {
    const saved = localStorage.getItem('recentEmojis');
    return saved ? JSON.parse(saved) : [];
  });

  const handleEmojiClick = (emoji) => {
    onSelect(emoji);
    
    const updated = [emoji, ...recentEmojis.filter(e => e !== emoji)].slice(0, 20);
    setRecentEmojis(updated);
    localStorage.setItem('recentEmojis', JSON.stringify(updated));
  };

  const categories = {
    ...EMOJI_CATEGORIES,
    recent: { ...EMOJI_CATEGORIES.recent, emojis: recentEmojis }
  };

  const filteredEmojis = search
    ? Object.values(categories)
        .flatMap(cat => cat.emojis)
        .filter(emoji => emoji.includes(search))
    : categories[activeCategory].emojis;

  return (
    <div className={styles.picker}>
      <div className={styles.header}>
        <input
          type="text"
          placeholder="Search emoji..."
          className={styles.search}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      {!search && (
        <div className={styles.categories}>
          {Object.keys(categories).map(key => (
            <button
              key={key}
              className={`${styles.categoryBtn} ${activeCategory === key ? styles.active : ''}`}
              onClick={() => setActiveCategory(key)}
              disabled={key === 'recent' && recentEmojis.length === 0}
            >
              {categories[key].label.split(' ')[0]}
            </button>
          ))}
        </div>
      )}

      <div className={styles.emojiGrid}>
        {filteredEmojis.length > 0 ? (
          filteredEmojis.map((emoji, index) => (
            <button
              key={index}
              className={styles.emojiBtn}
              onClick={() => handleEmojiClick(emoji)}
            >
              {emoji}
            </button>
          ))
        ) : (
          <div className={styles.noResults}>No emojis found</div>
        )}
      </div>
    </div>
  );
};

export default EmojiPicker;