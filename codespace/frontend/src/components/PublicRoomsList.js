import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BACKEND_URL from '../config';

export default function PublicRoomsList() {
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchRooms() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/rooms/public`);
        if (res.ok) {
          const data = await res.json();
          setRooms(data);
        }
      } catch (err) {
        console.error('Failed to fetch rooms');
      }
    }
    fetchRooms();
    const interval = setInterval(fetchRooms, 5000);
    return () => clearInterval(interval);
  }, []);

  const joinRoom = async (roomid) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/rooms/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomid }),
      });
      if (res.ok) {
        localStorage.setItem('roomid', roomid);
        navigate('/room');
      } else {
        const data = await res.json();
        alert(data.message || 'Error joining room');
      }
    } catch (err) {
      alert('Server error');
    }
  };

  const handleJoin = (roomid) => {
    if (window.confirm(`Join room ${roomid}?`)) {
      joinRoom(roomid);
    }
  };

  return (
    <div className="rooms-sidebar">
      <h3>Public Rooms</h3>
      {rooms.map((room) => (
        <div
          key={room.roomid}
          className="room-block"
          onClick={() => handleJoin(room.roomid)}
        >
          <div className="room-title">Room {room.roomid}</div>
          <ul className="user-list">
            {room.users && room.users.map((user) => (
              <li key={user}>{user}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
