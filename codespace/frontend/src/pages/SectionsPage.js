import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from '../components/NavBar';
import BACKEND_URL from '../config';
import '../styles/SectionsPage.css';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

const stages = ['Bronze', 'Silver', 'Gold'];
const statusOptions = [
  'Not Attempted',
  'Solving',
  'Solved',
  'Reviewing',
  'Skipped',
  'Ignored',
];

function SectionsPage() {
  const [topics, setTopics] = useState({});
  const [stageFilter, setStageFilter] = useState(stages[0]);
  const [selectedStage, setSelectedStage] = useState(null);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubtopic, setSelectedSubtopic] = useState(null);
  const [subtopicId, setSubtopicId] = useState(null);
  const [resources, setResources] = useState([]);
  const [problems, setProblems] = useState([]);
  const [progress, setProgress] = useState('not started');

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/topics`);
        const grouped = {};
        Object.entries(res.data).forEach(([topicName, subs]) => {
          subs.forEach(({ _id, subtopic, progress, stage }) => {
            if (!grouped[stage]) grouped[stage] = {};
            if (!grouped[stage][topicName]) grouped[stage][topicName] = [];
            grouped[stage][topicName].push({ _id, subtopic, progress });
          });
        });
        setTopics(grouped);
      } catch (err) {
        console.error('Failed to fetch topics', err);
      }
    };
    fetchTopics();
  }, []);

  const loadContent = async (stage, topicName, sub) => {
    try {
      const resResources = await axios.get(`${BACKEND_URL}/api/resources`, {
        params: { stage, topic: topicName, subtopic: sub.subtopic },
      });
      setResources(resResources.data);

      const resProblems = await axios.get(`${BACKEND_URL}/api/problems`, {
        params: { stage, topic: topicName, subtopic: sub.subtopic },
      });
      setProblems(resProblems.data);

      setProgress(sub.progress || 'not started');
      setSubtopicId(sub._id);
      setSelectedStage(stage);
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

  const updateResourceStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${BACKEND_URL}/api/resources/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResources((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
    } catch (err) {
      console.error('Failed to update resource status', err);
    }
  };

  const updateProblemStatus = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(
        `${BACKEND_URL}/api/problems/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProblems((prev) =>
        prev.map((p) => (p._id === id ? { ...p, status } : p))
      );
    } catch (err) {
      console.error('Failed to update problem status', err);
    }
  };

  const openLink = (link) => {
    const url =
      link.startsWith('http://') || link.startsWith('https://')
        ? link
        : `https://${link}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div>
      <NavBar />
      <div className="sections-page">
        <div className="sections-sidebar">
          <FormControl fullWidth className="stage-select">
            <InputLabel id="stage-select-label">Stage</InputLabel>
            <Select
              labelId="stage-select-label"
              value={stageFilter}
              label="Stage"
              onChange={(e) => {
                setStageFilter(e.target.value);
                setSelectedTopic(null);
                setSelectedSubtopic(null);
              }}
            >
              {stages.map((stage) => (
                <MenuItem key={stage} value={stage}>
                  {stage}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div className="topics-list">
            {Object.keys(topics[stageFilter] || {}).map((t) => (
              <div key={t} className="topic-item">
                <div className="topic-name">{t}</div>
                <ul>
                  {topics[stageFilter][t].map((sub) => (
                    <li
                      key={sub._id}
                      className={
                        selectedStage === stageFilter &&
                        selectedTopic === t &&
                        selectedSubtopic === sub.subtopic
                          ? 'selected'
                          : ''
                      }
                      onClick={() => loadContent(stageFilter, t, sub)}
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
                {selectedStage} / {selectedTopic} / {selectedSubtopic}
              </h2>
              <div className="content-block content-split">
                <div className="resources-side">
                  <h3>Resources</h3>
                  {resources.length ? (
                    <table className="resources-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {resources.map((r) => (
                          <tr
                            key={r._id}
                            onClick={() => openLink(r.link)}
                          >
                            <td>{r.name}</td>
                            <td onClick={(e) => e.stopPropagation()}>
                              <Select
                                value={r.status || 'Not Attempted'}
                                onChange={(e) =>
                                  updateResourceStatus(r._id, e.target.value)
                                }
                                size="small"
                              >
                                {statusOptions.map((s) => (
                                  <MenuItem key={s} value={s}>
                                    {s}
                                  </MenuItem>
                                ))}
                              </Select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No resources available.</p>
                  )}
                </div>
                <div className="problems-side">
                  <h3>Problems</h3>
                  {problems.length ? (
                    <table className="problems-table">
                      <thead>
                        <tr>
                          <th>Status</th>
                          <th>Source Problem</th>
                          <th>Name</th>
                          <th>Difficulty</th>
                        </tr>
                      </thead>
                      <tbody>
                        {problems.map((p) => (
                          <tr
                            key={p._id}
                            onClick={() => openLink(p.link)}
                          >
                            <td onClick={(e) => e.stopPropagation()}>
                              <Select
                                value={p.status || 'Not Attempted'}
                                onChange={(e) =>
                                  updateProblemStatus(p._id, e.target.value)
                                }
                                size="small"
                              >
                                {statusOptions.map((s) => (
                                  <MenuItem key={s} value={s}>
                                    {s}
                                  </MenuItem>
                                ))}
                              </Select>
                            </td>
                            <td>{p.domain}</td>
                            <td>{p.name}</td>
                            <td>{p.difficulty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No problems available.</p>
                  )}
                </div>
              </div>
              <div className="progress-section">
                <h3>Progress</h3>
                <FormControl className="progress-select">
                  <InputLabel id="progress-select-label">Progress</InputLabel>
                  <Select
                    labelId="progress-select-label"
                    value={progress}
                    label="Progress"
                    onChange={(e) => updateProgress(e.target.value)}
                  >
                    <MenuItem value="not started">Not Started</MenuItem>
                    <MenuItem value="reading">Reading</MenuItem>
                    <MenuItem value="finished">Finished</MenuItem>
                  </Select>
                </FormControl>
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

