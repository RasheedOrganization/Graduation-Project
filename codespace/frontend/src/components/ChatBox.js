import React, { useEffect, useState } from 'react';
import '../styles/ChatBox.css';

export default function ChatBox({ socketRef, username }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (socketRef.current) {
      const handler = (payload) => {
        setMessages((prev) => [...prev, { username: payload.username, msg: payload.msg }]);
      };
      socketRef.current.on('receive message', handler);
      return () => socketRef.current.off('receive message', handler);
    }
  }, [socketRef]);

  const sendMessage = (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed) return;
    if (socketRef.current) {
      socketRef.current.emit('send-message', { msg: trimmed });
    }
    setMessage('');
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((m, idx) => (
          <div key={idx} className="chat-message">
            <strong>{m.username}: </strong>{m.msg}
          </div>
        ))}
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
