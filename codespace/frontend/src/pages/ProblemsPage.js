import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from '../components/NavBar';
import '../styles/ProblemsPage.css';
import BACKEND_URL from '../config';
import ProblemSidebar from '../components/ProblemSidebar';
import ProblemTable from '../components/ProblemTable';

function ProblemsPage() {
  const [search, setSearch] = useState('');
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedSubtopic, setSelectedSubtopic] = useState('');
  const [problems, setProblems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [showSubtopicForm, setShowSubtopicForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    link: '',
    stage: '',
    topic: '',
    subtopic: '',
    difficulty: '',
  });
  const [topics, setTopics] = useState({});
  const [newTopic, setNewTopic] = useState({ stage: '', name: '' });
  const [newSubtopic, setNewSubtopic] = useState({ stage: '', topic: '', name: '' });
  const role = localStorage.getItem('role');
  const isAdmin = role === 'admin' || role === 'superadmin';
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/problems`);
        setProblems(res.data);
      } catch (err) {
        console.error('Failed to fetch problems', err);
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
    fetchProblems();
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
    if (!isAdmin) return;
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
    if (!isAdmin) return;
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

  const addProblem = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      const res = await axios.post(`${BACKEND_URL}/api/problems`, formData);
      setProblems((prev) => [...prev, res.data]);
      setFormData({ name: '', link: '', stage: '', topic: '', subtopic: '', difficulty: '' });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to add problem', err);
    }
  };

  const filteredProblems = problems.filter((p) => {
    const matchesStage = selectedStage ? p.stage === selectedStage : true;
    const matchesTopic = selectedTopic ? p.topic === selectedTopic : true;
    const matchesSubtopic = selectedSubtopic ? p.subtopic === selectedSubtopic : true;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesStage && matchesTopic && matchesSubtopic && matchesSearch;
  });

  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage) || 1;
  const currentProblems = filteredProblems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedStage, selectedTopic, selectedSubtopic]);

  return (
    <div>
      <NavBar />
      <div className="problems-page">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="problems-content">
          <ProblemSidebar
            isAdmin={isAdmin}
            showForm={showForm}
            setShowForm={setShowForm}
            showTopicForm={showTopicForm}
            setShowTopicForm={setShowTopicForm}
            showSubtopicForm={showSubtopicForm}
            setShowSubtopicForm={setShowSubtopicForm}
            formData={formData}
            handleFormChange={handleFormChange}
            addProblem={addProblem}
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
          <ProblemTable problems={currentProblems} />
        </div>
        <footer className="pagination">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={page === currentPage ? 'active' : ''}
            >
              {page}
            </button>
          ))}
        </footer>
      </div>
    </div>
  );
}

export default ProblemsPage;
