import React, { useState } from 'react';

function ProblemTable({ problems }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(problems.length / itemsPerPage) || 1;

  const openLink = (link) => {
    const url = link.startsWith('http://') || link.startsWith('https://')
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

  const current = problems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="right-problems">
      <table className="problem-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Topic</th>
            <th>Subtopic</th>
            <th>Website</th>
            <th>Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {current.map((p) => (
            <tr key={p._id} onClick={() => openLink(p.link)}>
              <td>{p.name}</td>
              <td>{p.topic}</td>
              <td>{p.subtopic}</td>
              <td>{p.domain || getDomain(p.link)}</td>
              <td>{p.difficulty}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => setCurrentPage(page)}
            className={page === currentPage ? 'active' : ''}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
}

export default ProblemTable;
