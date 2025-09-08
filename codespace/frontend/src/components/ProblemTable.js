import React from 'react';

function ProblemTable({ problems }) {
  const openLink = (link) => {
    const url =
      link.startsWith('http://') || link.startsWith('https://')
        ? link
        : `https://${link}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const getDomain = (link) => {
    try {
      const url = new URL(link.startsWith('http') ? link : `https://${link}`);
      return url.hostname.replace(/^www\./, '');
    } catch {
      return '';
    }
  };

  return (
    <div className="right-problems">
      <div className="problem-grid">
        {problems.map((p) => (
          <div
            key={p._id}
            className="problem-card"
            onClick={() => openLink(p.link)}
          >
            <h3>{p.name}</h3>
            <p>
              <strong>Topic:</strong> {p.topic}
            </p>
            <p>
              <strong>Subtopic:</strong> {p.subtopic}
            </p>
            <p>
              <strong>Website:</strong> {p.domain || getDomain(p.link)}
            </p>
            <p>
              <strong>Difficulty:</strong> {p.difficulty}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProblemTable;
