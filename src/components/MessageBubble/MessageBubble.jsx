import styles from './MessageBubble.module.css';

const MessageBubble = ({ message, isOwn, highlightTerm, isActiveMatch }) => {
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

  const renderContent = () => {
    if (isFile && message.file_name) {
      return <span className={styles.fileName}>{message.file_name}</span>;
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

  return (
    <div className={`${styles.messageWrapper} ${isOwn ? styles.own : styles.other}`}>
      <div
        className={`${styles.messageBubble} ${
          isOwn ? styles.ownBubble : styles.otherBubble
        }`}
      >
        {!isOwn && message.user_name && (
          <div className={styles.senderName}>{message.user_name}</div>
        )}
        <div className={styles.messageContent}>{renderContent()}</div>
        <div className={styles.messageTime}>{formatTime(message.created_at)}</div>
      </div>
    </div>
  );
};

export default MessageBubble;
