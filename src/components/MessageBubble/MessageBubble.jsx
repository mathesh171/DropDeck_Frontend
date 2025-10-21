import styles from './MessageBubble.module.css';

const MessageBubble = ({ message, isOwn }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className={`${styles.messageWrapper} ${isOwn ? styles.own : styles.other}`}>
      <div className={`${styles.messageBubble} ${isOwn ? styles.ownBubble : styles.otherBubble}`}>
        {!isOwn && message.user_name && (
          <div className={styles.senderName}>{message.user_name}</div>
        )}
        <div className={styles.messageContent}>{message.content}</div>
        <div className={styles.messageTime}>{formatTime(message.created_at)}</div>
      </div>
    </div>
  );
};

export default MessageBubble;
