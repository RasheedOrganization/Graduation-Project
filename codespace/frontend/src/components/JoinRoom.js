import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
      const res = await fetch(`http://localhost:6909/api/rooms/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.requiresPassword) {
        setNeedsPassword(true);
        setError('');
      } else if (res.ok) {
        navigate(`/rooms/${roomid}`);
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
            />
          </div>
        )}
        {error && <p>{error}</p>}
        <br />
        <button type="submit">Join</button>
      </form>
      <p>
        Don't want to join?{' '}
        <button type="button" onClick={onCreateClick}>Create a room</button>
      </p>
    </div>
  );
}
