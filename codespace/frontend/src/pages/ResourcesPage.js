import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from '../components/NavBar';
import '../styles/ResourcesPage.css';
import BACKEND_URL from '../config';
import ResourcesSidebar from '../components/ResourcesSidebar';
import ResourceList from '../components/ResourceList';


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
  const [selectedStage, setSelectedStage] = useState('');
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
    stage: '',
    topic: '',
    subtopic: '',
  });
  const [topics, setTopics] = useState({});
  const [newTopic, setNewTopic] = useState({ stage: '', name: '' });
  const [newSubtopic, setNewSubtopic] = useState({ stage: '', topic: '', name: '' });

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/resources`);
        setResources(res.data);
      } catch (err) {
        console.error('Failed to fetch resources', err);
      }
    };
    const fetchTopics = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/topics`);
        const grouped = {};
        Object.entries(res.data).forEach(([topicName, subs]) => {
          const stage = subs[0]?.stage;
          if (!stage) return;
          if (!grouped[stage]) grouped[stage] = {};
          if (!grouped[stage][topicName]) grouped[stage][topicName] = [];
          subs.forEach(({ subtopic }) => {
            if (subtopic) grouped[stage][topicName].push(subtopic);
          });
        });
        setTopics(grouped);
      } catch (err) {
        console.error('Failed to fetch topics', err);
      }
    };
    fetchResources();
    fetchTopics();
  }, []);

  const handleStageChange = (e) => {
    setSelectedStage(e.target.value);
    setSelectedTopic('');
    setSelectedSubtopic('');
  };

  const handleTopicChange = (e) => {
    setSelectedTopic(e.target.value);
    setSelectedSubtopic('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'stage' ? { topic: '', subtopic: '' } : {}),
      ...(name === 'topic' ? { subtopic: '' } : {}),
    }));
  };

  const addTopic = async (e) => {
    e.preventDefault();
    const { stage, name } = newTopic;
    if (!stage || !name) return;
    try {
      await axios.post(`${BACKEND_URL}/api/topics`, { stage, topic: name });
      setTopics((prev) => ({
        ...prev,
        [stage]: { ...(prev[stage] || {}), [name]: [] },
      }));
      setNewTopic({ stage: '', name: '' });
      setShowTopicForm(false);
    } catch (err) {
      console.error('Failed to add topic', err);
    }
  };

  const addSubtopic = async (e) => {
    e.preventDefault();
    const { stage, topic, name } = newSubtopic;
    if (!stage || !topic || !name) return;
    try {
      await axios.post(`${BACKEND_URL}/api/topics`, { stage, topic, subtopic: name });
      setTopics((prev) => ({
        ...prev,
        [stage]: {
          ...(prev[stage] || {}),
          [topic]: [...(prev[stage]?.[topic] || []), name],
        },
      }));
      setNewSubtopic({ stage: '', topic: '', name: '' });
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
      setFormData({ name: '', link: '', stage: '', topic: '', subtopic: '' });
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
    const matchesStage = selectedStage ? r.stage === selectedStage : true;
    const matchesTopic = selectedTopic ? r.topic === selectedTopic : true;
    const matchesSubtopic = selectedSubtopic ? r.subtopic === selectedSubtopic : true;
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase());
    return matchesStage && matchesTopic && matchesSubtopic && matchesSearch;
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
          <ResourcesSidebar
            showForm={showForm}
            setShowForm={setShowForm}
            showTopicForm={showTopicForm}
            setShowTopicForm={setShowTopicForm}
            showSubtopicForm={showSubtopicForm}
            setShowSubtopicForm={setShowSubtopicForm}
            formData={formData}
            handleFormChange={handleFormChange}
            addResource={addResource}
            topics={topics}
            newTopic={newTopic}
            setNewTopic={setNewTopic}
            addTopic={addTopic}
            newSubtopic={newSubtopic}
            setNewSubtopic={setNewSubtopic}
            addSubtopic={addSubtopic}
            selectedStage={selectedStage}
            handleStageChange={handleStageChange}
            selectedTopic={selectedTopic}
            handleTopicChange={handleTopicChange}
            selectedSubtopic={selectedSubtopic}
            setSelectedSubtopic={setSelectedSubtopic}
          />
          <ResourceList
            resources={filteredResources}
            openStatusId={openStatusId}
            setOpenStatusId={setOpenStatusId}
            updateStatus={updateStatus}
            statusOptions={statusOptions}
          />
        </div>
      </div>
    </div>
  );
}

export default ResourcesPage;