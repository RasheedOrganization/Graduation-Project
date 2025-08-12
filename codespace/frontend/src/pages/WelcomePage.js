import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/WelcomePage.css';

function WelcomePage() {
  const navigate = useNavigate();
  return (
    <div className="welcome-background">
      <div className="welcome-hero">
        <h1 className="welcome-title">USACO Training Portal</h1>
        <p className="welcome-tagline">Practice, learn, and compete with friends</p>
        <button className="welcome-button" onClick={() => navigate('/login')}>
          Log in / Sign up
        </button>
      </div>
    </div>
  );
}

export default WelcomePage;
