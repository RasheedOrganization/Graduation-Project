import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from '../components/NavBar';
import BACKEND_URL from '../config';
import '../styles/SectionsPage.css';

const levels = ['Bronze', 'Silver', 'Gold'];

function SectionsPage() {
  const [level, setLevel] = useState('Bronze');
  const [topics, setTopics] = useState({});
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [subtopicId, setSubtopicId] = useState(null);
  const [resources, setResources] = useState([]);
  const [problems, setProblems] = useState([]);
  const [progress, setProgress] = useState('not started');

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/topics`, { params: { level } });
        setTopics(res.data);
      } catch (err) {
        console.error('Failed to fetch topics', err);
      }
    };
    fetchTopics();
    setSelectedTopic(null);
    setSelectedSubtopic(null);
    setResources([]);
    setProblems([]);
  }, [level]);

  const loadContent = async (topicName, sub) => {
    try {
      const resResources = await axios.get(`${BACKEND_URL}/api/resources`, {
        params: { level, topic: topicName, subtopic: sub.subtopic },
      });
      setResources(resResources.data);

      const resProblems = await axios.get(`${BACKEND_URL}/api/problems`, {
        params: { level, topic: topicName, subtopic: sub.subtopic },
      });
      setProblems(resProblems.data);

      setProgress(sub.progress || 'not started');
      setSubtopicId(sub._id);
      setSelectedTopic(topicName);
      setSelectedSubtopic(sub.subtopic);
    } catch (err) {
      console.error('Failed to load content', err);
    }
  };

  const updateProgress = async (value) => {
    if (!subtopicId) return;
    try {
      await axios.patch(`${BACKEND_URL}/api/topics/${subtopicId}`, { progress: value });
      setProgress(value);
    } catch (err) {
      console.error('Failed to update progress', err);
    }
  };

  return (
    <div>
      <NavBar />
      <div className="sections-page">
        <div className="sections-sidebar">
          <div className="level-selector">
            {levels.map((lvl) => (
              <button
                key={lvl}
                className={lvl === level ? 'active' : ''}
                onClick={() => setLevel(lvl)}
              >
                {lvl}
              </button>
            ))}
          </div>
          <div className="topics-list">
            {Object.keys(topics).map((t) => (
              <div key={t} className="topic-item">
                <div className="topic-name">{t}</div>
                <ul>
                  {topics[t].map((sub) => (
                    <li
                      key={sub._id}
                      className={
                        selectedSubtopic === sub.subtopic && selectedTopic === t
                          ? 'selected'
                          : ''
                      }
                      onClick={() => loadContent(t, sub)}
                    >
                      {sub.subtopic}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="sections-content">
          {selectedSubtopic ? (
            <div>
              <h2>
                {selectedTopic} / {selectedSubtopic}
              </h2>
              <div className="content-block">
                <h3>Resources</h3>
                {resources.length ? (
                  <ul>
                    {resources.map((r) => (
                      <li key={r._id}>
                        <a href={r.link} target="_blank" rel="noreferrer">
                          {r.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No resources available.</p>
                )}
              </div>
              <div className="content-block">
                <h3>Problems</h3>
                {problems.length ? (
                  <ul>
                    {problems.map((p) => (
                      <li key={p._id}>
                        <a href={p.link} target="_blank" rel="noreferrer">
                          {p.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No problems available.</p>
                )}
              </div>
              <div className="progress-section">
                <h3>Progress</h3>
                <select value={progress} onChange={(e) => updateProgress(e.target.value)}>
                  <option value="not started">Not Started</option>
                  <option value="reading">Reading</option>
                  <option value="finished">Finished</option>
                </select>
              </div>
            </div>
          ) : (
            <p className="placeholder">Select a subtopic to view content</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default SectionsPage;

