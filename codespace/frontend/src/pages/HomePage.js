import React from 'react';
import NavBar from '../components/NavBar';
import '../styles/HomePage.css';
import architectureImg from '../assets/images/architecture.png';
import awwImg from '../assets/images/aww.png';

function HomePage() {
  return (
    <div className="home-container">
      <NavBar />
      <main className="home-hero">
        <h1 className="home-title">Code Hub</h1>
        <p className="home-tagline">A free collection of curated, high-quality resources</p>
        <p className="home-tagline">to take you from Bronze to Platinum and beyond.</p>
      </main>
      <section className="home-gallery">
        <img
          src={architectureImg}
          alt="Architecture diagram"
          className="gallery-image"
        />
        <img
          src={awwImg}
          alt="Collaborative coding"
          className="gallery-image"
        />
      </section>
      <footer className="home-footer">Created by the CP Initiative</footer>
    </div>
  );
}

export default HomePage;
