import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from '../components/NavBar';
import BACKEND_URL from '../config';
import '../styles/SectionsPage.css';
import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

const stages = ['Bronze', 'Silver', 'Gold'];

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

