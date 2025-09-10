import React from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../components/NavBar';
import '../styles/HomePage.css';

const features = [
  {
    title: 'Problems',
    description:
      'Solve curated challenges with instant feedback. Track progress and learn from clear explanations.',
    bullets: ['Difficulty tiers', 'Hints/editorials'],
    image: '/images/feature_problems.jpg',
    alt: 'Students solving coding problems in an online editor.',
    link: '/problems',
  },
  {
    title: 'Resources',
    description: 'Guides, templates, and walkthroughs to help you move faster.',
    bullets: ['Topic roadmaps', 'Cheat sheets'],
    image: '/images/feature_resources.jpg',
    alt: 'Laptop with documentation and notes beside a stack of books.',
    link: '/resources',
  },
  {
    title: 'Sections',
    description:
      'Structured learning paths—algorithms, data structures, competitive prep, and more.',
    bullets: ['Progress tracking', 'Next steps'],
    image: '/images/feature_sections.jpg',
    alt: 'Dashboard UI showing categorized learning tiles.',
    link: '/sections',
  },
  {
    title: 'Contests',
    description:
      'Join timed contests, climb the leaderboard, and learn from post-contest editorials.',
    bullets: ['Live timer', 'Scoreboard'],
    image: '/images/feature_contests.jpg',
    alt: 'Trophy beside a digital scoreboard.',
    link: '/contests',
  },
  {
    title: 'Rooms',
    description:
      'Study with friends—share problems, compare solutions, and stay motivated.',
    bullets: ['Invite links', 'Shared sets'],
    image: '/images/feature_rooms.jpg',
    alt: 'Group collaborating around laptops / grid of video call tiles.',
    link: '/rooms',
  },
];

function HomePage() {
  return (
    <div className="home-container">
      <NavBar />
      <main>
        <section className="home-hero">
          <h1 className="home-title">Practice. Compete. Grow.</h1>
          <p className="home-tagline">
            From bite-sized problems to full contests and study rooms—everything you need to level
            up.
          </p>
          <div className="hero-buttons">
            <Link to="/signup" className="hero-button">
              Get Started
            </Link>
            <Link to="/contests" className="hero-button secondary">
              Explore Contests
            </Link>
          </div>
        </section>
        <section className="features-overview">
          <h2>What you'll find</h2>
          <div className="features-grid">
            {features.map((f) => (
              <article key={f.title} className="feature-card">
                <img src={f.image} alt={f.alt} />
                <h3>{f.title}</h3>
                <p>{f.description}</p>
                <ul>
                  {f.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                {f.link && (
                  <Link to={f.link} className="feature-link">
                    Open →
                  </Link>
                )}
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="home-footer">Created by the CP Initiative</footer>
    </div>
  );
}

export default HomePage;
