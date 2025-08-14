import React, { useState } from 'react';
import { v4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import BACKEND_URL from '../config';

export default function CreateNewRoom({ onBack }) {
  const navigate = useNavigate();
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [roomId, setRoomId] = useState(v4());

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isPrivate && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/api/rooms/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomid: roomId, isPrivate, password: isPrivate ? password : undefined }),
      });
      if (res.ok) {
        navigate(`/rooms/${roomId}`);
      } else {
        const data = await res.json();
        setError(data.message || 'Error creating room');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <div className="auth-card">
      <h2>Create Room</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="roomid">Room ID</label>
          <input
            type="text"
            id="roomid"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Room Type</label>
          <select
            value={isPrivate ? 'private' : 'public'}
            onChange={(e) => setIsPrivate(e.target.value === 'private')}
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
        {isPrivate && (
          <>
            <div>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm">Confirm Password</label>
              <input
                type="password"
                id="confirm"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </>
        )}
        {error && <p>{error}</p>}
        <button type="submit">Create</button>
      </form>
      <p>
        <button type="button" onClick={onBack}>Back to join</button>
      </p>
    </div>
  );
}
