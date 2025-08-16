import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import BACKEND_URL from '../config';

function ProfilePage() {
  const [submissions, setSubmissions] = useState([]);
  const userId = localStorage.getItem('userid');

  useEffect(() => {
    async function fetchSubmissions() {
      const token = localStorage.getItem('token');
      if (!userId || !token) return;
      try {
        const res = await fetch(`${BACKEND_URL}/api/users/${userId}/submissions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setSubmissions(data);
        }
      } catch (err) {
        console.error('Failed to fetch submissions', err);
      }
    }
    fetchSubmissions();
  }, [userId]);

  return (
    <div>
      <NavBar />
      <h1>Profile Page</h1>
      <ul>
        {submissions.map((sub) => (
          <li key={sub._id}>
            <strong>{sub.problem}</strong>: {sub.verdict} (
            {new Date(sub.createdAt).toLocaleString()})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ProfilePage;
