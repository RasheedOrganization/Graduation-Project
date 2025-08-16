import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../components/NavBar';
import BACKEND_URL from '../config';

// Custom hook to fetch the list of problems from the backend
function useProblemList() {
  const [problems, setProblems] = useState([]);

  useEffect(() => {
    async function fetchProblems() {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/problem-list`);
        setProblems(res.data);
      } catch (err) {
        console.error('Error fetching problems:', err);
      }
    }
    fetchProblems();
  }, []);

  return problems;
}

function ProblemsPage() {
  const problems = useProblemList();

  return (
    <div>
      <NavBar />
      <h1>Problems Page</h1>
      <ul>
        {problems.map((problem) => (
          <li key={problem.id}>
            {problem.problem_name} <Link to={`/problems/${problem.id}`}>View</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProblemsPage;
