import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '../components/NavBar';
import BACKEND_URL from '../config';
import defaultAvatar from '../assets/images/user.svg';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import '../styles/ProfilePage.css';

function ProfilePage() {
  const [submissions, setSubmissions] = useState([]);
  const [userInfo, setUserInfo] = useState({ username: '', displayName: '', friends: [] });
  const [showEdit, setShowEdit] = useState(false);
  const [showFriends, setShowFriends] = useState(false);
  const [form, setForm] = useState({ username: '', displayName: '', password: '' });
  const userId = localStorage.getItem('userid');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    async function fetchSubmissions() {
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
    async function fetchUser() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUserInfo(data);
          setForm({ username: data.username || '', displayName: data.displayName || '', password: '' });
        }
      } catch (err) {
        console.error('Failed to fetch user', err);
      }
    }
    if (userId) {
      fetchSubmissions();
      fetchUser();
    }
  }, [userId, navigate]);

  const handleSave = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        setUserInfo((prev) => ({ ...prev, username: data.username, displayName: data.displayName }));
        localStorage.setItem('username', data.username);
        setShowEdit(false);
        setForm((prev) => ({ ...prev, password: '' }));
      }
    } catch (err) {
      console.error('Failed to update profile', err);
    }
  };

  const heatmapCounts = submissions.reduce((acc, sub) => {
    const date = new Date(sub.createdAt).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});
  const heatmapValues = Object.keys(heatmapCounts).map((date) => ({ date, count: heatmapCounts[date] }));

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
              {userInfo.displayName || userInfo.username || 'User'}
              <span className="user-rating">Unrated</span>
            </div>
            <div className="profile-stats">
              <span>Contributions: {submissions.length}</span>
              <span className="friends-link" onClick={() => setShowFriends(!showFriends)}>
                Friends: {userInfo.friends ? userInfo.friends.length : 0}
              </span>
              <button className="edit-button" onClick={() => setShowEdit(!showEdit)}>Edit Profile</button>
            </div>
          </div>
        </div>

        {showFriends && (
          <div className="friends-list">
            <h3>Friends</h3>
            <ul>
              {(userInfo.friends || []).map((f) => (
                <li key={f._id}>{f.displayName || f.username}</li>
              ))}
            </ul>
          </div>
        )}

        {showEdit && (
          <form className="edit-form" onSubmit={handleSave}>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="Username"
              required
            />
            <input
              type="text"
              value={form.displayName}
              onChange={(e) => setForm({ ...form, displayName: e.target.value })}
              placeholder="Display Name"
            />
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="New Password"
            />
            <button type="submit">Save</button>
          </form>
        )}

        <div className="profile-heatmap">
          <h2>Submission Activity</h2>
          <CalendarHeatmap
            startDate={new Date(new Date().getFullYear(), 0, 1)}
            endDate={new Date(new Date().getFullYear(), 11, 31)}
            values={heatmapValues}
            classForValue={(value) => {
              if (!value || !value.count) {
                return 'color-empty';
              }
              return `color-scale-${Math.min(value.count, 4)}`;
            }}
            tooltipDataAttrs={(value) => ({ title: `${value.date}: ${value.count || 0} submissions` })}
          />
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
