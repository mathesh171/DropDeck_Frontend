import { useState, useEffect, useRef, useMemo } from 'react';
import styles from './ChatWindow.module.css';
import MessageBubble from '../MessageBubble/MessageBubble';
import MessageInput from '../MessageInput/MessageInput';
import TypingIndicator from '../TypingIndicator/TypingIndicator';
import { socket } from '../../utils/socket';
import { API_LINK } from '../../config.js';

const ChatWindow = ({
  group,
  user,
  onNewMessage,
  searchTerm,
  searchNavDirection,
  onSearchNavHandled
}) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [typingUsers, setTypingUsers] = useState([]);
  const [replyTo, setReplyTo] = useState(null);
  const messagesEndRef = useRef(null);
  const matchRefs = useRef([]);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (!group) return;

    socket.emit('joinGroupRoom', group.group_id);

    const handleNewMessage = () => {
      fetchMessages();
      if (onNewMessage) onNewMessage();
    };

    const handleUserTyping = (data) => {
      if (data.userId === user?.user_id) return;
      
      setTypingUsers(prev => {
        if (!prev.find(u => u.id === data.userId)) {
          return [...prev, { id: data.userId, name: data.userName }];
        }
        return prev;
      });

      setTimeout(() => {
        setTypingUsers(prev => prev.filter(u => u.id !== data.userId));
      }, 3000);
    };

    const handleUserStoppedTyping = (data) => {
      setTypingUsers(prev => prev.filter(u => u.id !== data.userId));
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('userTyping', handleUserTyping);
    socket.on('userStoppedTyping', handleUserStoppedTyping);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('userTyping', handleUserTyping);
      socket.off('userStoppedTyping', handleUserStoppedTyping);
    };
  }, [group, onNewMessage, user]);

  useEffect(() => {
    if (group) fetchMessages();
  }, [group]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  const fetchMessages = async () => {
    if (!group) return;
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(
        `${API_LINK}/api/messages/groups/${group.group_id}/messages?limit=200&offset=0`,
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
      const token = localStorage.getItem('token');

      if (messageType === 'file' && file) {
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await fetch(
          `${API_LINK}/api/files/groups/${group.group_id}/files/upload`,
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`
            },
            body: formData
          }
        );
        if (!uploadRes.ok) return;

        await fetchMessages();
        if (onNewMessage) onNewMessage();
      } else {
        const payload = { 
          content, 
          message_type: messageType 
        };
        
        if (replyTo) {
          payload.reply_to = replyTo.message_id;
        }

        await fetch(
          `${API_LINK}/api/messages/groups/${group.group_id}/messages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
          }
        );

        socket.emit('sendMessage', { groupId: group.group_id });
        socket.emit('stopTyping', { 
          groupId: group.group_id, 
          userId: user?.user_id,
          userName: user?.name 
        });
        
        setReplyTo(null);
        await fetchMessages();
        if (onNewMessage) onNewMessage();
      }
    } catch {
    }
  };

  const handleTyping = () => {
    socket.emit('typing', { 
      groupId: group.group_id, 
      userId: user?.user_id,
      userName: user?.name || user?.username
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { 
        groupId: group.group_id, 
        userId: user?.user_id,
        userName: user?.name || user?.username
      });
    }, 2000);
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

  useEffect(() => {
    if (!searchNavDirection || !matches.length) {
      onSearchNavHandled && onSearchNavHandled(false, false);
      return;
    }

    let hasBelow = false;
    let hasAbove = false;

    if (searchNavDirection === 'next') {
      hasBelow = activeIndex < matches.length - 1;
      if (hasBelow) {
        setActiveIndex(prev => Math.min(prev + 1, matches.length - 1));
      }
    } else if (searchNavDirection === 'prev') {
      hasAbove = activeIndex > 0;
      if (hasAbove) {
        setActiveIndex(prev => Math.max(prev - 1, 0));
      }
    }

    onSearchNavHandled && onSearchNavHandled(hasAbove, hasBelow);
  }, [searchNavDirection, matches, activeIndex, onSearchNavHandled]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading messages...</p>
      </div>
    );
  }

  const typingUserNames = typingUsers.map(u => u.name);

  return (
    <>
      <div className={styles.messagesContainer}>
        <div className={styles.messagesContent}>
          {orderedMessages.length === 0 ? (
            <div className={styles.emptyMessages}>
              <span className={styles.emptyIcon}>💬</span>
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
                    onReply={setReplyTo}
                  />
                </div>
              );
            })
          )}
          {typingUserNames.length > 0 && (
            <TypingIndicator users={typingUserNames} />
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <MessageInput 
        onSendMessage={handleSendMessage} 
        onTyping={handleTyping}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
      />
    </>
  );
};

export default ChatWindow;