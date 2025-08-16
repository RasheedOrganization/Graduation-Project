import React, { useState } from 'react';
import NavBar from '../components/NavBar';
import '../styles/ResourcesPage.css';

const topics = {
  'Graph Algorithms': ['BFS', 'DFS'],
  'Dynamic Programming': ['Knapsack', 'LIS'],
};

const resourcesData = [
  { id: 1, name: 'BFS Tutorial', link: 'https://example.com/bfs', topic: 'Graph Algorithms', subtopic: 'BFS', status: 'Not Attempted' },
  { id: 2, name: 'DFS Guide', link: 'https://example.com/dfs', topic: 'Graph Algorithms', subtopic: 'DFS', status: 'Solving' },
  { id: 3, name: 'Knapsack Article', link: 'https://example.com/knapsack', topic: 'Dynamic Programming', subtopic: 'Knapsack', status: 'Solved' },
  { id: 4, name: 'LIS Explained', link: 'https://example.com/lis', topic: 'Dynamic Programming', subtopic: 'LIS', status: 'Reviewing' },
];

function ResourcesPage() {
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedSubtopic, setSelectedSubtopic] = useState('');

  const handleTopicChange = (e) => {
    setSelectedTopic(e.target.value);
    setSelectedSubtopic('');
  };

  const filteredResources = resourcesData.filter((r) => {
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
              return (
                <div key={res.id} className="resource-card">
                  <h3>{res.name}</h3>
                  <a href={res.link} target="_blank" rel="noopener noreferrer">{res.link}</a>
                  <div className={`status-circle ${statusClass}`} title={res.status}></div>
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
