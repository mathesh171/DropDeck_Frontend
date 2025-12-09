import { useState, useRef } from 'react';
import styles from './MessageInput.module.css';

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleSubmit = e => {
    e.preventDefault();
    if (!message.trim()) return;
    onSendMessage(message.trim(), 'text', null);
    setMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleChange = e => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  const handleFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = null;
      fileInputRef.current.click();
    }
  };

  const handleFileChange = e => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const label = file.name;
    onSendMessage(label, 'file', file);
  };

  return (
    <div className={styles.messageInputContainer}>
      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <button
          type="button"
          className={styles.iconButton}
          title="Attach file"
          onClick={handleFileClick}
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

        <input
          ref={fileInputRef}
          type="file"
          className={styles.hiddenFileInput}
          onChange={handleFileChange}
        />
      </form>
    </div>
  );
};

export default MessageInput;
