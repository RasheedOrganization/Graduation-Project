import React, { useState } from 'react';
import ChatBox from './ChatBox';
import '../styles/ChatWidget.css';

export default function ChatWidget({ socketRef, username }) {
  const [open, setOpen] = useState(false);

  const toggleChat = () => setOpen((prev) => !prev);

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-popup">
          <ChatBox socket={socketRef.current} username={username} />
        </div>
      )}
      <button className="chat-toggle" onClick={toggleChat} aria-label="Toggle chat">
        {open ? '\u2715' : '\ud83d\udd8a\ufe0f'}
      </button>
    </div>
  );
}
