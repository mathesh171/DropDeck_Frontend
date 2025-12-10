import { useState } from 'react';
import styles from './MessageInput.module.css';

const MessageInput = ({ onSendMessage }) => {
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [showPollModal, setShowPollModal] = useState(false);
  const [pollQuestion, setPollQuestion] = useState('');
  const [pollOptions, setPollOptions] = useState(['', '', '', '']);

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

  return (
    <div className={styles.messageInputContainer}>
      <div className={styles.inputWrapper}>
        <button
          className={styles.pollButton}
          onClick={() => setShowPollModal(true)}
          title="Create a poll"
        >
          📊
        </button>

        <input
          type="text"
          placeholder="Type a message"
          className={styles.input}
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyPress={e => {
            if (e.key === 'Enter') handleSendMessage();
          }}
        />

        <label className={styles.fileLabel}>
          📎
          <input
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

      {showPollModal && (
        <div className={styles.pollModal}>
          <div className={styles.pollModalContent}>
            <h3>Create a Poll</h3>
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
    </div>
  );
};

export default MessageInput;
