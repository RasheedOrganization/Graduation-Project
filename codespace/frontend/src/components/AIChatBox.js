import React, { useEffect, useRef, useState } from 'react';
import BACKEND_URL from '../config';
import '../styles/ChatBox.css';

export default function AIChatBox({ code }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

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
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((m, idx) => (
          <div key={idx} className={`chat-message${m.self ? ' self' : ''}`}>
            <span className="chat-text">{m.text}</span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-input">
        <input
          type="text"
          placeholder="Ask AI..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="button" onClick={() => send('normal')}>Send</button>
        <button type="button" onClick={() => send('fix')}>Fix</button>
        <button type="button" onClick={() => send('explain')}>Explain</button>
      </div>
    </div>
  );
}
