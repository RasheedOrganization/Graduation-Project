import React, { useState, useEffect } from 'react';
import axios from 'axios';
import NavBar from '../components/NavBar';
import '../styles/ProblemsPage.css';
import BACKEND_URL from '../config';
import ProblemSidebar from '../components/ProblemSidebar';
import ProblemTable from '../components/ProblemTable';

function ProblemsPage() {
  const [search, setSearch] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedSubtopic, setSelectedSubtopic] = useState('');
  const [problems, setProblems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showTopicForm, setShowTopicForm] = useState(false);
  const [showSubtopicForm, setShowSubtopicForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    link: '',
    topic: '',
    subtopic: '',
    difficulty: '',
  });
  const [topics, setTopics] = useState({});
  const [newTopic, setNewTopic] = useState('');
  const [newSubtopic, setNewSubtopic] = useState({ topic: '', name: '' });

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
        setTopics(res.data);
      } catch (err) {
        console.error('Failed to fetch topics', err);
      }
    };
    fetchProblems();
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

  const addProblem = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BACKEND_URL}/api/problems`, formData);
      setProblems((prev) => [...prev, res.data]);
      setFormData({ name: '', link: '', topic: '', subtopic: '', difficulty: '' });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to add problem', err);
    }
  };

  const filteredProblems = problems.filter((p) => {
    const matchesTopic = selectedTopic ? p.topic === selectedTopic : true;
    const matchesSubtopic = selectedSubtopic ? p.subtopic === selectedSubtopic : true;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesTopic && matchesSubtopic && matchesSearch;
  });

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
            selectedTopic={selectedTopic}
            handleTopicChange={handleTopicChange}
            selectedSubtopic={selectedSubtopic}
            setSelectedSubtopic={setSelectedSubtopic}
          />
          <ProblemTable problems={filteredProblems} />
        </div>
      </div>
    </div>
  );
}

export default ProblemsPage;
