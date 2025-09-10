import React from 'react';
import NavBar from '../components/NavBar';
import '../styles/HomePage.css';

function HomePage() {
  return (
    <div className="home-container">
      <NavBar />
      <main className="home-hero">
        <h1 className="home-title">CodeSpace</h1>
        <p className="home-tagline">A free collection of curated, high-quality resources</p>
        <p className="home-tagline">to take you from Bronze to Platinum and beyond.</p>
      </main>
      <footer className="home-footer">Created by the CP Initiative</footer>
    </div>
  );
}

export default HomePage;
