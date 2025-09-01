import React, { useEffect, useRef, useState } from 'react';
import '../styles/ChatBox.css';
import MarkdownMessage from './MarkdownMessage';

export default function ChatBox({ socket, username }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const MAX_MESSAGES = 50;

  // Handle incoming chat messages
  useEffect(() => {
    if (!socket) return;
    const handler = (payload) => {
      setMessages((prev) => [
        ...prev.slice(-MAX_MESSAGES + 1),
        { username: payload.username, msg: payload.msg },
      ]);
    };
    socket.on('receive message', handler);
    return () => socket.off('receive message', handler);
  }, [socket]);

  // Fetch and receive existing room messages
  useEffect(() => {
    if (!socket) return;
    const handler = (payload) => {
      setMessages(payload.map((m) => ({ username: m.username, msg: m.msg })));
    };
    socket.on('room-messages', handler);
    socket.emit('get-messages');
    return () => socket.off('room-messages', handler);
  }, [socket]);

  // Always scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || !socket) return;
    socket.emit('send-message', { msg: trimmed });
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    setMessage('');
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((m, idx) => {
          const self = m.username === username;
          return (
            <div
              key={idx}
              className={`chat-message${self ? ' self' : ''}`}
            >
              {!self && (
                <>
                  <span className="chat-emoji" role="img" aria-label="user">
                    🙂
                  </span>
                  <span className="chat-user">{m.username}:</span>
                </>
              )}
              <div className="chat-text">
                <MarkdownMessage content={m.msg} />
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form className="chat-input" onSubmit={sendMessage}>
        <input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
