import React from 'react';
import NavBar from '../components/NavBar';
import JoinRoom from '../components/JoinRoom';
import CreateNewRoom from '../components/CreateNewRoom';
import '../styles/RoomsPage.css';

function RoomsPage() {
  return (
    <div className="rooms-container">
      <NavBar />
      <div className="rooms-content">
        <JoinRoom />
        <CreateNewRoom />
      </div>
    </div>
  );
}

export default RoomsPage;
