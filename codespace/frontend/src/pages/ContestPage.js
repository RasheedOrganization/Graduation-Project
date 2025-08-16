import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import BACKEND_URL from '../config';

function ContestPage() {
  const [contests, setContests] = useState([]);

  useEffect(() => {
    async function fetchContests() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/contests`);
        if (res.ok) {
          const data = await res.json();
          setContests(data);
        }
      } catch (err) {
        console.error('Failed to fetch contests');
      }
    }
    fetchContests();
  }, []);

  const register = async (id) => {
    const userId = localStorage.getItem('userid');
    try {
      const res = await fetch(`${BACKEND_URL}/api/contests/${id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Registered');
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      alert('Server error');
    }
  };

  return (
    <div>
      <NavBar />
      <div style={{ maxWidth: '600px', margin: '2rem auto' }}>
        <h2>Upcoming Contests</h2>
        {contests.map((contest) => (
          <div key={contest._id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
            <h3>{contest.name}</h3>
            <p>Start: {new Date(contest.startTime).toLocaleString()}</p>
            <p>Duration: {contest.duration} minutes</p>
            <button onClick={() => register(contest._id)}>Register</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContestPage;
