import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from '../components/NavBar';
import BACKEND_URL from '../config';
import defaultAvatar from '../assets/images/user.svg';
import CalendarHeatmap from 'react-calendar-heatmap';
import 'react-calendar-heatmap/dist/styles.css';
import '../styles/ProfilePage.css';

function FriendProfilePage() {
  const { id } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [userInfo, setUserInfo] = useState({ username: '', displayName: '', friends: [] });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    async function fetchData() {
      try {
        const userRes = await fetch(`${BACKEND_URL}/api/users/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.ok) {
          const data = await userRes.json();
          setUserInfo(data);
        }
        const subRes = await fetch(`${BACKEND_URL}/api/users/${id}/submissions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubmissions(subData);
        }
      } catch (err) {
        console.error('Failed to fetch friend profile', err);
      }
    }
    fetchData();
  }, [id, navigate]);

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
              <span>Friends: {userInfo.friends ? userInfo.friends.length : 0}</span>
            </div>
          </div>
        </div>

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
                  <td className={`verdict ${sub.verdict.toLowerCase().replace(/\s+/g, '-')}`}>
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

export default FriendProfilePage;
