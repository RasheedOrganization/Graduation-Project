import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import NavBar from '../components/NavBar';
import TextBox from '../components/TextBox';
import BACKEND_URL from '../config';

function ProblemDetailPage() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    async function fetchProblem() {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/problems/${id}`);
        setProblem(res.data);
      } catch (err) {
        if (err.response && err.response.status === 404) {
          try {
            const scrapeRes = await axios.get(`${BACKEND_URL}/api/parse_problem/${id}`);
            setProblem(scrapeRes.data);
          } catch (scrapeErr) {
            console.error('Error scraping problem:', scrapeErr);
          }
        } else {
          console.error('Error fetching problem:', err);
        }
      }
    }
    fetchProblem();
  }, [id]);

  return (
    <div>
      <NavBar />
      {problem ? (
        <div>
          <h1>{problem.problem_name || problem.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: problem.statement }} />
          <h2>Sample Tests</h2>
          {problem.sinput && problem.soutput ? (
            <ul>
              <li>
                <p>Input:</p>
                <pre>{problem.sinput}</pre>
                <p>Output:</p>
                <pre>{problem.soutput}</pre>
              </li>
            </ul>
          ) : (
            problem.sample_input && problem.sample_outputs && (
              <ul>
                {problem.sample_input.map((input, idx) => (
                  <li key={idx}>
                    <p>Input:</p>
                    <pre>{input}</pre>
                    <p>Output:</p>
                    <pre>{problem.sample_outputs[idx]}</pre>
                  </li>
                ))}
              </ul>
            )
          )}
          <h2>Solve</h2>
          <TextBox socketRef={socketRef} currentProbId={id} />
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default ProblemDetailPage;
