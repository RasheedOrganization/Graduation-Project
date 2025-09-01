import React, { useEffect, useRef, useState } from 'react';
import BACKEND_URL from '../config';
import '../styles/ChatBox.css';
import MarkdownMessage from './MarkdownMessage';

export default function AIChatBox({ code }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async (mode) => {
    const prompt = message.trim();
    if (!prompt && mode === 'normal') return;
    const payload = { prompt, mode };
    if (mode !== 'normal') {
      payload.code = code;
    }
    setLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const aiText = data.text || 'No response';
      setMessages(prev => [
        ...prev,
        { self: true, text: prompt || mode },
        { self: false, text: aiText }
      ]);
      setMessage('');
    } catch (err) {
      setMessages(prev => [...prev, { self: false, text: 'Error contacting AI' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((m, idx) => (
          <div key={idx} className={`chat-message${m.self ? ' self' : ''}`}>
            <div className="chat-text">
              <MarkdownMessage content={m.text} />
            </div>
          </div>
        ))}
        {loading && (
          <div className="chat-message">
            <div className="chat-spinner" />
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
        <button type="button" onClick={() => send('normal')} disabled={loading}>Send</button>
        <button type="button" onClick={() => send('fix')} disabled={loading}>Fix</button>
        <button type="button" onClick={() => send('explain')} disabled={loading}>Explain</button>
      </div>
    </div>
  );
}
