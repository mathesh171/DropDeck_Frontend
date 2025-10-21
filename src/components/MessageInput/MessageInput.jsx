import { useState, useRef } from 'react';
import styles from './MessageInput.module.css';

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = (e) => {
    setMessage(e.target.value);
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  return (
    <div className={styles.messageInputContainer}>
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <button 
          type="button" 
          className={styles.iconButton}
          title="Attach file"
        >
          📎
        </button>
        
        <textarea
          ref={textareaRef}
          value={message}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message"
          className={styles.messageInput}
          rows="1"
        />
        
        <button 
          type="submit" 
          className={styles.sendButton}
          disabled={!message.trim()}
          title="Send message"
        >
          ➤
        </button>
      </form>
    </div>
  );
};

export default MessageInput;
