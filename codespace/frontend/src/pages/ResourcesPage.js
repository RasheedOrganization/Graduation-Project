import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from '../components/NavBar';
import '../styles/ResourcesPage.css';
import BACKEND_URL from '../config';

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
  const [showForm, setShowForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [showSubtopicForm, setShowSubtopicForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    link: '',
    topic: '',
    subtopic: '',
  });
  const [topics, setTopics] = useState({});
  const [newTopic, setNewTopic] = useState('');
  const [newSubtopic, setNewSubtopic] = useState({ topic: '', name: '' });

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

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/topics`);
        setTopics(res.data);
      } catch (err) {
        console.error('Failed to fetch topics', err);
      }
    };
    fetchTopics();
  }, []);

  const handleTopicChange = (e) => {
    setSelectedTopic(e.target.value);
    setSelectedSubtopic('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'topic' ? { subtopic: '' } : {}),
    }));
  };

  const addTopic = async (e) => {
    e.preventDefault();
    if (!newTopic) return;
    try {
      await axios.post(`${BACKEND_URL}/api/topics`, { topic: newTopic });
      setTopics((prev) => ({ ...prev, [newTopic]: [] }));
      setNewTopic('');
      setShowTopicForm(false);
    } catch (err) {
      console.error('Failed to add topic', err);
    }
  };

  const addSubtopic = async (e) => {
    e.preventDefault();
    const { topic, name } = newSubtopic;
    if (!topic || !name) return;
    try {
      await axios.post(`${BACKEND_URL}/api/topics`, { topic, subtopic: name });
      setTopics((prev) => ({
        ...prev,
        [topic]: [...prev[topic], name],
      }));
      setNewSubtopic({ topic: '', name: '' });
      setShowSubtopicForm(false);
    } catch (err) {
      console.error('Failed to add subtopic', err);
    }
  };

  const addResource = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BACKEND_URL}/api/resources`, formData);
      setResources((prev) => [...prev, res.data]);
      setFormData({ name: '', link: '', topic: '', subtopic: '' });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to add resource', err);
    }
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
            <div className="button-group">
              <button onClick={() => setShowForm(!showForm)}>New</button>
              <button onClick={() => setShowTopicForm(!showTopicForm)}>New Topic</button>
              <button onClick={() => setShowSubtopicForm(!showSubtopicForm)}>New Subtopic</button>
            </div>
            {showForm && (
              <form className="add-resource-form" onSubmit={addResource}>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
                <input
                  type="text"
                  name="link"
                  placeholder="Link"
                  value={formData.link}
                  onChange={handleFormChange}
                  required
                />
                <select
                  name="topic"
                  value={formData.topic}
                  onChange={handleFormChange}
                  required
                >
                  <option value="">Select Topic</option>
                  {Object.keys(topics).map((topic) => (
                    <option key={topic} value={topic}>{topic}</option>
                  ))}
                </select>
                <select
                  name="subtopic"
                  value={formData.subtopic}
                  onChange={handleFormChange}
                  disabled={!formData.topic}
                  required
                >
                  <option value="">Select Subtopic</option>
                    {formData.topic && (topics[formData.topic] || []).map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                </select>
                <button type="submit">Add</button>
              </form>
            )}
            {showTopicForm && (
              <form className="add-topic-form" onSubmit={addTopic}>
                <input
                  type="text"
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Topic Name"
                  required
                />
                <button type="submit">Add</button>
              </form>
            )}
            {showSubtopicForm && (
              <form className="add-subtopic-form" onSubmit={addSubtopic}>
                <select
                  value={newSubtopic.topic}
                  onChange={(e) =>
                    setNewSubtopic((prev) => ({ ...prev, topic: e.target.value }))
                  }
                  required
                >
                  <option value="">Select Topic</option>
                  {Object.keys(topics).map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={newSubtopic.name}
                  onChange={(e) =>
                    setNewSubtopic((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Subtopic Name"
                  required
                />
                <button type="submit">Add</button>
              </form>
            )}
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
              {selectedTopic &&
                (topics[selectedTopic] || []).map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
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
                  onClick={() => {
                    const link =
                      res.link.startsWith('http://') || res.link.startsWith('https://')
                        ? res.link
                        : `https://${res.link}`;
                    window.open(link, '_blank', 'noopener,noreferrer');
                  }}
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
