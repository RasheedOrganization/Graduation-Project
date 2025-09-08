import React, { useEffect, useRef, useState } from 'react';
import '../styles/ChatBox.css';
import MarkdownMessage from './MarkdownMessage';
import userIcon from '../assets/images/user.svg';
import botIcon from '../assets/images/ai-bot.svg';

export default function AIChatBox({ code, socketRef, username }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!socketRef?.current) return;
    const handleHistory = (history) => {
      setMessages(history.map(m => ({
        self: m.type === 'user' ? m.username === username : false,
        text: m.text,
        sender: m.type === 'user' ? 'user' : 'bot',
        username: m.username,
      })));
    };
    const handleUser = (payload) => {
      setMessages(prev => [
        ...prev,
        {
          self: payload.username === username,
          text: payload.text,
          sender: 'user',
          username: payload.username,
        },
      ]);
    };
    const handleBot = (payload) => {
      setLoading(false);
      setMessages(prev => [
        ...prev,
        { self: false, text: payload.text, sender: 'bot' },
      ]);
    };
    const handleClear = () => setMessages([]);
    socketRef.current.on('ai-chat-history', handleHistory);
    socketRef.current.on('ai-user-message', handleUser);
    socketRef.current.on('ai-bot-message', handleBot);
    socketRef.current.on('ai-chat-cleared', handleClear);
    socketRef.current.emit('get-ai-messages');
    return () => {
      socketRef.current.off('ai-chat-history', handleHistory);
      socketRef.current.off('ai-user-message', handleUser);
      socketRef.current.off('ai-bot-message', handleBot);
      socketRef.current.off('ai-chat-cleared', handleClear);
    };
  }, [socketRef, username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (mode) => {
    const trimmed = message.trim();
    const prompt = trimmed || (mode !== 'normal' ? mode : '');
    if (!socketRef?.current) return;
    if (!prompt && mode === 'normal') return;
    socketRef.current.emit('ai-request', { prompt, mode, code, username });
    setLoading(true);
    setMessage('');
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((m, idx) => (
          <div key={idx} className={`chat-row${m.self ? ' self' : ''}`}>
            {!m.self && (
              <img
                src={m.sender === 'bot' ? botIcon : userIcon}
                alt={m.sender === 'bot' ? 'AI bot avatar' : `${m.username} avatar`}
                className="chat-avatar"
              />
            )}
            <div className="chat-message">
              {m.sender === 'user' && !m.self && (
                <span className="chat-user">{m.username}</span>
              )}
              <div className="chat-text">
                <MarkdownMessage content={m.text} />
              </div>
            </div>
            {m.self && (
              <img
                src={userIcon}
                alt="Your avatar"
                className="chat-avatar"
              />
            )}
          </div>
        ))}
        {loading && (
          <div className="chat-row">
            <div className="chat-message">
              <div className="chat-spinner" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Ask AI..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="chat-actions">
          <button type="button" onClick={() => socketRef?.current?.emit('clear-ai-chat')} disabled={loading}>Clear</button>
          <button type="button" onClick={() => send('normal')} disabled={loading}>Send</button>
          <button type="button" onClick={() => send('fix')} disabled={loading}>Fix</button>
          <button type="button" onClick={() => send('explain')} disabled={loading}>Explain</button>
        </div>
      </div>
    </div>
  );
}
