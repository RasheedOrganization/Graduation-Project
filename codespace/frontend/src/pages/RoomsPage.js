import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import JoinRoom from '../components/JoinRoom';
import CreateNewRoom from '../components/CreateNewRoom';
import '../styles/RoomsPage.css';

function RoomsPage() {
  const [creating, setCreating] = useState(false);
  return (
    <div className="rooms-container">
      <NavBar />
      <div className="rooms-content">
        {creating ? (
          <CreateNewRoom onBack={() => setCreating(false)} />
        ) : (
          <JoinRoom onCreateClick={() => setCreating(true)} />
        )}
      </div>
    </div>
  );
}

export default RoomsPage;
