import { useState, useRef, useEffect } from 'react';
import styles from './MessageInput.module.css';

const MessageInput = ({ 
  onSendMessage, 
  onTyping,
  replyTo,
  onCancelReply 
}) => {
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '', '', '']);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (replyTo && inputRef.current) {
      inputRef.current.focus();
    }
  }, [replyTo]);

  const handleSendMessage = () => {
    if (content.trim()) {
      onSendMessage(content);
      setContent('');
    }
  };

  const handleFileChange = e => {
    const selectedFile = e.target.files && e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      onSendMessage(selectedFile.name, 'file', selectedFile);
      setFile(null);
      e.target.value = '';
    }
  };

  const handlePollOptionChange = (index, value) => {
    const updatedOptions = [...pollOptions];
    updatedOptions[index] = value;
    setPollOptions(updatedOptions);
  };

  const handleCreatePoll = () => {
    const validOptions = pollOptions.filter(opt => opt.trim().length > 0);
    if (!pollQuestion.trim()) {
      alert('Please enter a poll question');
      return;
    }
    if (validOptions.length < 2) {
      alert('Please enter at least 2 options');
      return;
    }

    const pollContent = JSON.stringify({
      question: pollQuestion,
      options: validOptions
    });

    onSendMessage(pollContent, 'poll');
    setPollQuestion('');
    setPollOptions(['', '', '', '']);
    setShowPollModal(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      setFile(files[0]);
      onSendMessage(files[0].name, 'file', files[0]);
      setFile(null);
    }
  };

  const handleInputChange = (e) => {
    setContent(e.target.value);
    if (onTyping) {
      onTyping();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {isDragging && (
        <div className={styles.dragOverlay}>
          <div className={styles.dragContent}>
            <span className={styles.dragIcon}>📎</span>
            <p>Drop file to upload</p>
          </div>
        </div>
      )}
      
      <div 
        className={styles.messageInputContainer}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {replyTo && (
          <div className={styles.replyPreview}>
            <div className={styles.replyContent}>
              <span className={styles.replyLabel}>Replying to {replyTo.user_name}</span>
              <span className={styles.replyText}>{replyTo.content}</span>
            </div>
            <button className={styles.cancelReply} onClick={onCancelReply}>
              ×
            </button>
          </div>
        )}

        <div className={styles.inputWrapper}>
          <button
            className={styles.pollButton}
            onClick={() => setShowPollModal(true)}
            title="Create a poll"
          >
            📊
          </button>

          <input
            ref={inputRef}
            type="text"
            placeholder="Type a message"
            className={styles.input}
            value={content}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />

          <label className={styles.fileLabel}>
            📎
            <input
              ref={fileInputRef}
              type="file"
              className={styles.fileInput}
              onChange={handleFileChange}
            />
          </label>

          <button
            className={styles.sendButton}
            onClick={handleSendMessage}
            disabled={!content.trim()}
          >
            ➤
          </button>
        </div>
      </div>

      {showPollModal && (
        <div className={styles.pollModal} onClick={() => setShowPollModal(false)}>
          <div className={styles.pollModalContent} onClick={e => e.stopPropagation()}>
            <div className={styles.pollModalHeader}>
              <h3>Create a Poll</h3>
              <button className={styles.closeModal} onClick={() => setShowPollModal(false)}>
                ×
              </button>
            </div>

            <input
              type="text"
              placeholder="Poll question"
              className={styles.pollInput}
              value={pollQuestion}
              onChange={e => setPollQuestion(e.target.value)}
            />

            <div className={styles.pollOptionsContainer}>
              {pollOptions.map((option, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  className={styles.pollOption}
                  value={option}
                  onChange={e => handlePollOptionChange(index, e.target.value)}
                />
              ))}
            </div>

            <div className={styles.pollModalButtons}>
              <button
                className={styles.pollCancelButton}
                onClick={() => setShowPollModal(false)}
              >
                Cancel
              </button>
              <button
                className={styles.pollCreateButton}
                onClick={handleCreatePoll}
              >
                Create Poll
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageInput;