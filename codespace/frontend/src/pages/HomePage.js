import React, { useEffect, useState } from 'react';
import '../styles/HomePage.css';

const features = [
  {
    id: 'problems',
    title: 'Problems',
    description:
      'Solve curated problems with instant feedback. Track your progress and learn from detailed explanations.',
    bullets: ['Difficulty tiers', 'Runtime feedback', 'Editorials & hints'],
    img: '/images/feature_problems.jpg',
    alt: 'Students solving coding problems in an online editor.',
    caption: 'Curated problem sets with instant feedback.',
  },
  {
    id: 'resources',
    title: 'Resources',
    description:
      'Hand-picked guides, templates, and walkthroughs to help you move faster.',
    bullets: ['Topic roadmaps', 'Cheat sheets', 'Reference solutions'],
    img: '/images/feature_resources.jpg',
    alt: 'Laptop with documentation and notes beside a stack of books.',
    caption: 'Guides and references, all in one place.',
  },
  {
    id: 'sections',
    title: 'Sections',
    description:
      'Clear sections for learning paths—algorithms, data structures, competitive prep, and more.',
    bullets: ['Structured modules', 'Progress tracking', 'Recommended next steps'],
    img: '/images/feature_sections.jpg',
    alt: 'Dashboard UI with categorized learning tiles.',
    caption: 'Follow a guided learning path.',
  },
  {
    id: 'contests',
    title: 'Contests',
    description:
      'Join timed contests, climb the leaderboard, and learn from editorials.',
    bullets: ['Live timer', 'Scoreboard', 'Registration & reminders'],
    link: '/contests',
    img: '/images/feature_contests.jpg',
    alt: 'Trophy beside a digital scoreboard.',
    caption: 'Compete and improve under pressure.',
  },
  {
    id: 'rooms',
    title: 'Rooms',
    description:
      'Create rooms to study with friends—share problems, compare solutions, and stay motivated.',
    bullets: ['Invite links', 'Chat/comments', 'Shared sets'],
    img: '/images/feature_rooms.jpg',
    alt: 'Group collaborating around laptops / grid of video call tiles.',
    caption: 'Learn together, faster.',
  },
];

function HomePage() {
  const [active, setActive] = useState(features[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { threshold: 0.5 }
    );

    features.forEach((f) => {
      const el = document.getElementById(f.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-container">
      <header className="home-hero">
        <h1 className="home-title">Practice. Compete. Grow.</h1>
        <p className="home-subtext">
          From bite-sized problems to full contests and study rooms—everything you
          need to level up.
        </p>
        <div className="hero-actions">
          <a href="/signup" className="hero-button primary">
            Get Started
          </a>
          <a href="/contests" className="hero-button secondary">
            Explore Contests
          </a>
        </div>
      </header>

      <nav className="home-nav">
        <ul>
          {features.map((f) => (
            <li key={f.id}>
              <a
                href={`#${f.id}`}
                onClick={(e) => handleNavClick(e, f.id)}
                aria-current={active === f.id ? 'page' : undefined}
                className={active === f.id ? 'active' : undefined}
              >
                {f.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <main>
        {features.map((f) => (
          <section id={f.id} key={f.id} className="feature-section">
            <h2>{f.title}</h2>
            <p>{f.description}</p>
            <ul>
              {f.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
            {f.id === 'contests' && (
              <p>
                <a href="/contests" className="section-link">
                  Explore Contests
                </a>
              </p>
            )}
            <figure>
              <img src={f.img} alt={f.alt} />
              <figcaption>{f.caption}</figcaption>
            </figure>
          </section>
        ))}
      </main>

      <footer className="home-footer">
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
        <a href="/privacy">Privacy</a>
      </footer>
    </div>
  );
}

export default HomePage;
