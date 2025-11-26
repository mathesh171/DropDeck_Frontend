import { useState, useEffect, useRef } from 'react';
import styles from './ChatWindow.module.css';
import MessageBubble from '../MessageBubble/MessageBubble';
import MessageInput from '../MessageInput/MessageInput';
import { io } from "socket.io-client";

const ChatWindow = ({ group, user, onNewMessage }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    socket.current = io("http://localhost:5000");

    socket.current.emit("joinGroupRoom", group.group_id);

    socket.current.on("newMessage", () => {
      fetchMessages();
      if (onNewMessage) onNewMessage();
    });

    return () => {
      socket.current.disconnect();
    };
  }, [group]);

  useEffect(() => {
    if (group) fetchMessages();
  }, [group]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
    } catch {}
    setLoading(false);
  };

  const handleSendMessage = async (content, messageType = 'text') => {
    try {
      await fetch(
        `http://localhost:5000/api/messages/groups/${group.group_id}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ content, message_type: messageType }),
        }
      );

      socket.current.emit("sendMessage", { groupId: group.group_id });

      fetchMessages();
      if (onNewMessage) onNewMessage();
    } catch {}
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
            messages.slice().reverse().map((message, index) => (
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
