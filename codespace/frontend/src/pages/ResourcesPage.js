import React, { useState, useEffect } from 'react';
import NavBar from '../components/NavBar';
import '../styles/ResourcesPage.css';

const topics = {
  'Graph Algorithms': ['BFS', 'DFS'],
  'Dynamic Programming': ['Knapsack', 'LIS'],
};

const statusOptions = [
  'Not Attempted',
  'Solving',
  'Solved',
  'Reviewing',
  'Skipped',
  'Ignored',
];

const initialResources = [
  { id: 1, name: 'BFS Tutorial', link: 'https://example.com/bfs', topic: 'Graph Algorithms', subtopic: 'BFS', status: 'Not Attempted' },
  { id: 2, name: 'DFS Guide', link: 'https://example.com/dfs', topic: 'Graph Algorithms', subtopic: 'DFS', status: 'Solving' },
  { id: 3, name: 'Knapsack Article', link: 'https://example.com/knapsack', topic: 'Dynamic Programming', subtopic: 'Knapsack', status: 'Solved' },
  { id: 4, name: 'LIS Explained', link: 'https://example.com/lis', topic: 'Dynamic Programming', subtopic: 'LIS', status: 'Reviewing' },
];

function ResourcesPage() {
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedSubtopic, setSelectedSubtopic] = useState('');
  const [resources, setResources] = useState(() => {
    const stored = localStorage.getItem('resources');
    return stored ? JSON.parse(stored) : initialResources;
  });
  const [openStatusId, setOpenStatusId] = useState(null);

  useEffect(() => {
    localStorage.setItem('resources', JSON.stringify(resources));
  }, [resources]);

  const handleTopicChange = (e) => {
    setSelectedTopic(e.target.value);
    setSelectedSubtopic('');
  };

  const updateStatus = (id, status) => {
    setResources((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const filteredResources = resources.filter((r) => {
    const matchesTopic = selectedTopic ? r.topic === selectedTopic : true;
    const matchesSubtopic = selectedSubtopic ? r.subtopic === selectedSubtopic : true;
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    return matchesTopic && matchesSubtopic && matchesSearch;
  });

  return (
    <div>
      <NavBar />
      <div className="resources-page">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="resources-content">
          <div className="left-menu">
            <select value={selectedTopic} onChange={handleTopicChange}>
              <option value="">All Topics</option>
              {Object.keys(topics).map((topic) => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
            <select
              value={selectedSubtopic}
              onChange={(e) => setSelectedSubtopic(e.target.value)}
              disabled={!selectedTopic}
            >
              <option value="">All Subtopics</option>
              {selectedTopic && topics[selectedTopic].map((sub) => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
          <div className="right-resources">
            {filteredResources.map((res) => {
              const statusClass = `status-${res.status.toLowerCase().replace(/ /g, '-')}`;
              const isOpen = openStatusId === res.id;
              return (
                <div
                  key={res.id}
                  className="resource-card"
                  onClick={() => window.open(res.link, '_blank', 'noopener,noreferrer')}
                >
                  <div className="resource-header">
                    <span
                      className={`status-emoji ${statusClass}`}
                      role="img"
                      aria-label={res.status}
                    >●</span>
                    <h3>{res.name}</h3>
                  </div>
                  <p className="resource-link">{res.link}</p>
                  <div
                    className={`status-circle ${statusClass}`}
                    title={res.status}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenStatusId(isOpen ? null : res.id);
                    }}
                  ></div>
                  {isOpen && (
                    <ul className="status-dropdown" onClick={(e) => e.stopPropagation()}>
                      {statusOptions.map((status) => (
                        <li
                          key={status}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(res.id, status);
                            setOpenStatusId(null);
                          }}
                        >
                          {status}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResourcesPage;
