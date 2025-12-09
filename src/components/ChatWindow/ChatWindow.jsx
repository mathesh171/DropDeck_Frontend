import { useState, useEffect, useRef, useMemo } from 'react';
import styles from './ChatWindow.module.css';
import MessageBubble from '../MessageBubble/MessageBubble';
import MessageInput from '../MessageInput/MessageInput';
import { io } from 'socket.io-client';
import ChatHeader from '../ChatHeader/ChatHeader';

const ChatWindow = ({ group, user, onNewMessage }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const messagesEndRef = useRef(null);
  const socket = useRef(null);
  const matchRefs = useRef([]);

  useEffect(() => {
    socket.current = io('http://localhost:5000');

    socket.current.emit('joinGroupRoom', group.group_id);

    socket.current.on('newMessage', () => {
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
        `http://localhost:5000/api/messages/groups/${group.group_id}/messages?limit=200&offset=0`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch {
    }
    setLoading(false);
  };

  const handleSendMessage = async (content, messageType = 'text', file) => {
    try {
      if (messageType === 'file' && file) {
        const formData = new FormData();
        formData.append('file', file);
        const token = localStorage.getItem('token');
        await fetch(
          `http://localhost:5000/api/files/groups/${group.group_id}/files/upload`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`
            },
            body: formData
          }
        );
      } else {
        await fetch(
          `http://localhost:5000/api/messages/groups/${group.group_id}/messages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ content, message_type: messageType })
          }
        );
      }

      socket.current.emit('sendMessage', { groupId: group.group_id });

      fetchMessages();
      if (onNewMessage) onNewMessage();
    } catch {
    }
  };

  const orderedMessages = useMemo(
    () => messages.slice().reverse(),
    [messages]
  );

  const matches = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    const indices = [];
    orderedMessages.forEach((m, idx) => {
      if ((m.content || '').toLowerCase().includes(term)) {
        indices.push(idx);
      }
    });
    return indices;
  }, [orderedMessages, searchTerm]);

  useEffect(() => {
    matchRefs.current = [];
    setActiveIndex(0);
  }, [searchTerm, messages]);

  useEffect(() => {
    if (!matches.length) return;
    const currentIdx = matches[activeIndex] ?? matches[0];
    const ref = matchRefs.current[currentIdx];
    if (ref && ref.scrollIntoView) {
      ref.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeIndex, matches]);

  const handleSearchChange = term => {
    setSearchTerm(term);
  };

  const handleSearchNav = direction => {
    if (!matches.length) return;
    if (direction === 'next') {
      setActiveIndex(prev => (prev + 1) % matches.length);
    } else if (direction === 'prev') {
      setActiveIndex(prev => (prev - 1 + matches.length) % matches.length);
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
          {orderedMessages.length === 0 ? (
            <div className={styles.emptyMessages}>
              <p>No messages yet</p>
              <p className={styles.emptyHint}>Start the conversation!</p>
            </div>
          ) : (
            orderedMessages.map((message, index) => {
              const matchIndex = matches.indexOf(index);
              const isMatch = matchIndex !== -1;
              const isActive =
                isMatch && matches[activeIndex] === index && matches.length > 0;
              return (
                <div
                  key={message.message_id || index}
                  ref={el => {
                    if (isMatch) {
                      matchRefs.current[index] = el;
                    }
                  }}
                >
                  <MessageBubble
                    message={message}
                    isOwn={message.user_id === user?.user_id}
                    highlightTerm={searchTerm}
                    isActiveMatch={isActive}
                  />
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <MessageInput onSendMessage={handleSendMessage} />
    </>
  );
};

export default ChatWindow;
