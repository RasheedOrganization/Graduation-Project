import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from '../components/NavBar';
import '../styles/ResourcesPage.css';
import BACKEND_URL from '../config';

const topics = {
  'Graph Algorithms': ['BFS', 'DFS'],
  'Dynamic Programming': ['Knapsack', 'LIS'],
};

const statusOptions = [
  { value: 'Not Attempted', emoji: '⏳' },
  { value: 'Solving', emoji: '🧠' },
  { value: 'Solved', emoji: '👨‍💻' },
  { value: 'Reviewing', emoji: '🔍' },
  { value: 'Skipped', emoji: '⏭️' },
  { value: 'Ignored', emoji: '🚫' },
];

function ResourcesPage() {
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedSubtopic, setSelectedSubtopic] = useState('');
  const [resources, setResources] = useState([]);
  const [openStatusId, setOpenStatusId] = useState(null);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/resources`);
        setResources(res.data);
      } catch (err) {
        console.error('Failed to fetch resources', err);
      }
    };
    fetchResources();
  }, []);

  const handleTopicChange = (e) => {
    setSelectedTopic(e.target.value);
    setSelectedSubtopic('');
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.patch(`${BACKEND_URL}/api/resources/${id}`, { status });
      setResources((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
    } catch (err) {
      console.error('Failed to update status', err);
    }
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
              const isOpen = openStatusId === res._id;
              return (
                <div
                  key={res._id}
                  className="resource-card"
                  onClick={() => window.open(res.link, '_blank', 'noopener,noreferrer')}
                >
                  <div className="resource-header">
                    <h3>{res.name}</h3>
                  </div>
                  <p className="resource-link">{res.link}</p>
                  <div
                    className={`status-circle ${statusClass}`}
                    title={res.status}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenStatusId(isOpen ? null : res._id);
                    }}
                  ></div>
                  {isOpen && (
                    <ul className="status-dropdown" onClick={(e) => e.stopPropagation()}>
                      {statusOptions.map(({ value, emoji }) => (
                        <li
                          key={value}
                          onClick={(e) => {
                            e.stopPropagation();
                            updateStatus(res._id, value);
                            setOpenStatusId(null);
                          }}
                        >
                          <span
                            className={`status-emoji status-${value
                              .toLowerCase()
                              .replace(/ /g, '-')}`}
                            role="img"
                            aria-label={value}
                          >
                            {emoji}
                          </span>
                          {value}
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
