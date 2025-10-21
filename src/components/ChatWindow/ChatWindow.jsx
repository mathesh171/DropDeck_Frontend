import { useState, useEffect, useRef } from 'react';
import styles from './ChatWindow.module.css';
import MessageBubble from '../MessageBubble/MessageBubble';
import MessageInput from '../MessageInput/MessageInput';

const ChatWindow = ({ group, user }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (group) {
      fetchMessages();
    }
  }, [group]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(
        `http://localhost:5000/api/messages/groups/${group.group_id}/messages?limit=100&offset=0`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content, messageType = 'text') => {
    const token = localStorage.getItem('token');
    
    try {
      const response = await fetch(
        `http://localhost:5000/api/messages/groups/${group.group_id}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            content,
            message_type: messageType
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <p>Loading messages...</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.messagesContainer}>
        <div className={styles.messagesContent}>
          {messages.length === 0 ? (
            <div className={styles.emptyMessages}>
              <p>No messages yet</p>
              <p className={styles.emptyHint}>Start the conversation!</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <MessageBubble
                key={message.message_id || index}
                message={message}
                isOwn={message.user_id === user?.user_id}
              />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <MessageInput onSendMessage={handleSendMessage} />
    </>
  );
};

export default ChatWindow;
