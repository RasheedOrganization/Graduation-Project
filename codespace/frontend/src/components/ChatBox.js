import React, { useEffect, useRef, useState } from 'react';
import '../styles/ChatBox.css';

export default function ChatBox({ socketRef, username }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const MAX_MESSAGES = 50;

  useEffect(() => {
    if (socketRef.current) {
      const handler = (payload) => {
        setMessages((prev) => [...prev.slice(-MAX_MESSAGES + 1), { username: payload.username, msg: payload.msg }]);
      };
      socketRef.current.on('receive message', handler);
      return () => socketRef.current.off('receive message', handler);
    }
  }, [socketRef]);

  useEffect(() => {
    if (socketRef.current) {
      const handler = (payload) => {
        setMessages(payload.map(m => ({ username: m.username, msg: m.msg })));
      };
      socketRef.current.emit('get-messages');
      socketRef.current.on('room-messages', handler);
      return () => socketRef.current.off('room-messages', handler);
    }
  }, [socketRef]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    if (socketRef.current) {
      socketRef.current.emit('send-message', { msg: trimmed });
    }
    setMessages((prev) => [...prev.slice(-MAX_MESSAGES + 1), { username, msg: trimmed }]);
    setMessage('');
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((m, idx) => (
          <div key={idx} className="chat-message">
            <span className="chat-emoji" role="img" aria-label="user">🙂</span>
            <span className="chat-user">{m.username}:</span>
            <span className="chat-text">{m.msg}</span>
          </div>
        ))}
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
