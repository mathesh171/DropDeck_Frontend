import { useState, useEffect } from 'react';
import styles from './MessageBubble.module.css';
import { getFileDownloadUrl } from '../../utils/api.js';

const MessageBubble = ({ 
  message, 
  isOwn, 
  highlightTerm, 
  isActiveMatch,
  onReply,
  onReact,
  showStatus = true 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const formatTime = timestamp => {
    const date = new Date(timestamp);
    return isNaN(date.getTime())
      ? ''
      : date.toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
  };

  const isFile = message.message_type === 'file';
  const isPoll = message.message_type === 'poll';

  const getMessageStatus = () => {
    if (!isOwn || !showStatus) return null;
    
    const status = message.status || 'sent';
    
    switch(status) {
      case 'sending':
        return <span className={styles.statusSending}>⏱</span>;
      case 'sent':
        return <span className={styles.statusSent}>✓</span>;
      case 'delivered':
        return <span className={styles.statusDelivered}>✓✓</span>;
      case 'read':
        return <span className={styles.statusRead}>✓✓</span>;
      default:
        return <span className={styles.statusSent}>✓</span>;
    }
  };

  const renderContent = () => {
    if (isFile) {
      const fileName = message.file_name || message.content || 'File';
      const fileId = message.file_id;

      if (!fileId) {
        return (
          <span className={styles.fileError}>
            {fileName} (file not available)
          </span>
        );
      }

      const href = getFileDownloadUrl(fileId);

      return (
        <div className={styles.fileWrapper}>
          <span className={styles.fileIcon}>📎</span>
          <a
            href={href}
            className={styles.fileName}
            download={fileName}
            onClick={e => e.stopPropagation()}
          >
            {fileName}
          </a>
        </div>
      );
    }

    if (isPoll) {
      let pollData;
      try {
        pollData = JSON.parse(message.content);
      } catch {
        return <span>{message.content}</span>;
      }

      return (
        <div className={styles.pollContainer}>
          <div className={styles.pollQuestion}>{pollData.question}</div>
          <div className={styles.pollOptions}>
            {pollData.options.map((option, idx) => (
              <div key={idx} className={styles.pollOption}>
                <input
                  type="radio"
                  id={`poll-${message.message_id}-${idx}`}
                  name={`poll-${message.message_id}`}
                  className={styles.pollRadio}
                />
                <label htmlFor={`poll-${message.message_id}-${idx}`}>
                  {option}
                </label>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (!highlightTerm || !message.content) {
      return message.content;
    }

    const term = highlightTerm.toLowerCase();
    const text = message.content;
    const lower = text.toLowerCase();
    const parts = [];
    let currentIndex = 0;
    let matchIndex;

    while ((matchIndex = lower.indexOf(term, currentIndex)) !== -1) {
      if (matchIndex > currentIndex) {
        parts.push({
          text: text.slice(currentIndex, matchIndex),
          match: false
        });
      }
      parts.push({
        text: text.slice(matchIndex, matchIndex + term.length),
        match: true
      });
      currentIndex = matchIndex + term.length;
    }

    if (currentIndex < text.length) {
      parts.push({
        text: text.slice(currentIndex),
        match: false
      });
    }

    return parts.map((part, idx) =>
      part.match ? (
        <span
          key={idx}
          className={`${styles.highlight} ${
            isActiveMatch ? styles.activeHighlight : ''
          }`}
        >
          {part.text}
        </span>
      ) : (
        <span key={idx}>{part.text}</span>
      )
    );
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setShowMenu(true);
  };

  useEffect(() => {
    const handleClick = () => setShowMenu(false);
    if (showMenu) {
      document.addEventListener('click', handleClick);
      return () => document.removeEventListener('click', handleClick);
    }
  }, [showMenu]);

  const reactions = message.reactions || [];
  const hasReactions = reactions.length > 0;

  return (
    <div 
      className={`
        ${styles.messageWrapper} 
        ${isOwn ? styles.own : styles.other}
        ${isVisible ? styles.visible : ''}
      `}
      onContextMenu={handleContextMenu}
    >
      <div
        className={`${styles.messageBubble} ${
          isOwn ? styles.ownBubble : styles.otherBubble
        }`}
      >
        {!isOwn && message.user_name && (
          <div className={styles.senderName}>{message.user_name}</div>
        )}
        
        {message.reply_to && (
          <div className={styles.replyPreview} onClick={() => onReply && onReply(message.reply_to)}>
            <div className={styles.replyLine}></div>
            <div className={styles.replyContent}>
              <span className={styles.replyUser}>{message.reply_to.user_name}</span>
              <span className={styles.replyText}>{message.reply_to.content}</span>
            </div>
          </div>
        )}

        <div className={styles.messageContent}>{renderContent()}</div>
        
        <div className={styles.messageFooter}>
          <span className={styles.messageTime}>{formatTime(message.created_at)}</span>
          {message.edited && <span className={styles.editedLabel}>edited</span>}
          {getMessageStatus()}
        </div>

        {hasReactions && (
          <div className={styles.reactions}>
            {reactions.map((reaction, idx) => (
              <span key={idx} className={styles.reaction} title={reaction.users?.join(', ')}>
                {reaction.emoji} {reaction.count > 1 && reaction.count}
              </span>
            ))}
          </div>
        )}

        {showMenu && (
          <div className={styles.contextMenu}>
            <button onClick={() => {
              onReply && onReply(message);
              setShowMenu(false);
            }}>Reply</button>
            <button onClick={() => {
              onReact && onReact(message);
              setShowMenu(false);
            }}>React</button>
            {isOwn && <button>Edit</button>}
            {isOwn && <button>Delete</button>}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;