import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BACKEND_URL from '../config';

export default function JoinRoom({ onCreateClick }) {
  const navigate = useNavigate();
  const [roomid, setRoomid] = useState('');
  const [password, setPassword] = useState('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const body = { roomid };
    if (needsPassword) body.password = password;
    try {
      const res = await fetch(`${BACKEND_URL}/api/rooms/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.requiresPassword) {
        setNeedsPassword(true);
        setError('');
      } else if (res.ok) {
        localStorage.setItem('roomid', roomid);
        navigate('/room');
      } else {
        setError(data.message || 'Error joining room');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <div className="auth-card">
      <h2>Join Room</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="roomid">Room ID</label>
          <input
            type="text"
            id="roomid"
            value={roomid}
            onChange={(e) => setRoomid(e.target.value)}
            required
          />
        </div>
        {needsPassword && (
          <div>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        )}
        {error && <p>{error}</p>}
        <br />
        <button type="submit">Join</button>
      </form>
        <p className="switch-link">
          Don't want to join?{' '}
          <button type="button" onClick={onCreateClick}>Create a room</button>
        </p>
      </div>
    );
  }
