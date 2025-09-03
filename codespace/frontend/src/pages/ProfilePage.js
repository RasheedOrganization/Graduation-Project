import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import BACKEND_URL from '../config';
import defaultAvatar from '../assets/images/user.svg';
import '../styles/ProfilePage.css';

function ProfilePage() {
  const [submissions, setSubmissions] = useState([]);
  const userId = localStorage.getItem('userid');
  const username = localStorage.getItem('username');

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
      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar">
            <img src={defaultAvatar} alt="avatar" />
          </div>
          <div className="profile-info">
            <div className="profile-handle">
              {username || 'User'}
              <span className="user-rating">Unrated</span>
            </div>
            <div className="profile-stats">
              <span>Contributions: 0</span>
              <span>Friends: 0</span>
            </div>
          </div>
        </div>

        <div className="profile-submissions">
          <h2>Recent Submissions</h2>
          <table className="submissions-table">
            <thead>
              <tr>
                <th>Problem</th>
                <th>Verdict</th>
                <th>Language</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => (
                <tr key={sub._id}>
                  <td>{sub.problem}</td>
                  <td className={`verdict ${sub.verdict
                    .toLowerCase()
                    .replace(/\s+/g, '-')}`}
                  >
                    {sub.verdict}
                  </td>
                  <td>{sub.language}</td>
                  <td>{new Date(sub.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
