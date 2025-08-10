import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CreateProblem() {
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const initialState = {
    id: '',
    problem_name: '',
    statement: '',
    sinput: '',
    soutput: '',
    main_tests: '',
    expected_output: '',
  };

  const [formData, setFormData] = useState(initialState);
  const [message, setMessage] = useState('');

  if (role !== 'admin') {
    return <div>Unauthorized</div>;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const missing = Object.entries(formData)
      .filter(([_, v]) => !v)
      .map(([k]) => k);
    if (missing.length) {
      setMessage(`Please fill: ${missing.join(', ')}`);
      return;
    }
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/new`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Problem created successfully');
      setFormData(initialState);
      setTimeout(() => navigate('/solve-problem'), 1000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating problem');
    }
  };

  return (
    <div>
      {message && <p>{message}</p>}
      <form onSubmit={handleSubmit}>
        <input
          name="id"
          value={formData.id}
          onChange={handleChange}
          placeholder="Problem ID"
        />
        <input
          name="problem_name"
          value={formData.problem_name}
          onChange={handleChange}
          placeholder="Problem Name"
        />
        <textarea
          name="statement"
          value={formData.statement}
          onChange={handleChange}
          placeholder="Statement"
        />
        <textarea
          name="sinput"
          value={formData.sinput}
          onChange={handleChange}
          placeholder="Sample Input"
        />
        <textarea
          name="soutput"
          value={formData.soutput}
          onChange={handleChange}
          placeholder="Sample Output"
        />
        <textarea
          name="main_tests"
          value={formData.main_tests}
          onChange={handleChange}
          placeholder="Main Tests"
        />
        <textarea
          name="expected_output"
          value={formData.expected_output}
          onChange={handleChange}
          placeholder="Expected Output"
        />
        <button type="submit">Create</button>
      </form>
    </div>
  );
}
