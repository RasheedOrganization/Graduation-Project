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

  const copyId = (e, roomid) => {
    e.stopPropagation();
    navigator.clipboard.writeText(roomid);
  };

  return (
    <div className="public-rooms-list">
      {rooms.map((room) => (
        <div
          key={room.roomid}
          className="public-room-item"
          onClick={() => handleJoin(room.roomid)}
        >
          <span>Room {room.roomid}</span>
          <button onClick={(e) => copyId(e, room.roomid)}>{room.roomid}</button>
        </div>
      ))}
    </div>
  );
}
