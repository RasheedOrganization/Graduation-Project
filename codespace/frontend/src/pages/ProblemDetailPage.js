import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import NavBar from '../components/NavBar';
import TextBox from '../components/TextBox';
import BACKEND_URL from '../config';
import '../styles/ProblemDetailPage.css';

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

  useEffect(() => {
    socketRef.current = io(BACKEND_URL, { transports: ['websocket'] });
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div>
      <NavBar />
      {problem ? (
        <>
        <div className="problem-detail-container">
          <div className="problem-view">
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
          </div>
          <div className="editor-view">
            <TextBox socketRef={socketRef} currentProbId={id} />
          </div>
        </div>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}

export default ProblemDetailPage;
