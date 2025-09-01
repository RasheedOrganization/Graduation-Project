import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Tabs,
  Tab,
  Card,
  CardContent,
  CardActions,
  Button,
  Typography,
  TextField
} from '@mui/material';
import NavBar from '../components/NavBar';
import BACKEND_URL from '../config';

function ContestCard({ contest, onRegister, userId }) {
  const isRegistered = userId && contest.participants && contest.participants.includes(userId);
  return (
    <Card sx={{ mb: 2 }}>
      <CardContent component={Link} to={`/contests/${contest._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <Typography variant="h6">{contest.name}</Typography>
        <Typography variant="body2">Start: {new Date(contest.startTime).toLocaleString()}</Typography>
        <Typography variant="body2">Duration: {contest.duration} minutes</Typography>
      </CardContent>
      {onRegister && (
        <CardActions>
          <Button size="small" onClick={() => onRegister(contest._id)} disabled={isRegistered}>
            {isRegistered ? 'Registered' : 'Register'}
          </Button>
        </CardActions>
      )}
    </Card>
  );
}

function ContestPage() {
  const [tab, setTab] = useState(0);
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [form, setForm] = useState({ name: '', startTime: '', duration: '' });
  const userId = localStorage.getItem('userid');
  const role = localStorage.getItem('role');
  const isAdmin = role === 'admin' || role === 'superadmin';

  const handleInputChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const fetchContests = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/contests`);
      if (res.ok) {
        const data = await res.json();
        setUpcoming(data.upcoming);
        setPast(data.past);
        return;
      }
    } catch (err) {
      console.error('Failed to fetch contests');
    }
    // dummy data fallback
    setUpcoming([
      {
        _id: 'sample-upcoming',
        name: 'Sample Upcoming Contest',
        startTime: new Date().toISOString(),
        duration: 90
      }
    ]);
    setPast([
      {
        _id: 'sample-past',
        name: 'Sample Past Contest',
        startTime: new Date(Date.now() - 86400000).toISOString(),
        duration: 120
      }
    ]);
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/contests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          startTime: new Date(form.startTime).toISOString(),
          duration: Number(form.duration)
        })
      });
      const data = await res.json();
      if (res.ok) {
        setForm({ name: '', startTime: '', duration: '' });
        fetchContests();
        alert('Contest scheduled');
      } else {
        alert(data.message || 'Failed to create contest');
      }
    } catch (err) {
      alert('Server error');
    }
  };

  const register = async (id) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/contests/${id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const data = await res.json();
      if (res.ok) {
        setUpcoming((prev) =>
          prev.map((c) =>
            c._id === id
              ? { ...c, participants: [...(c.participants || []), userId] }
              : c
          )
        );
        alert('Registered');
      } else {
        alert(data.message || 'Registration failed');
      }
    } catch (err) {
      alert('Server error');
    }
  };

  return (
    <>
      <NavBar />
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        {isAdmin && (
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 2, mb: 3 }}>
            <TextField
              label="Name"
              name="name"
              value={form.name}
              onChange={handleInputChange}
              required
            />
            <TextField
              label="Start Time"
              type="datetime-local"
              name="startTime"
              value={form.startTime}
              onChange={handleInputChange}
              InputLabelProps={{ shrink: true }}
              required
            />
            <TextField
              label="Duration (min)"
              type="number"
              name="duration"
              value={form.duration}
              onChange={handleInputChange}
              required
            />
            <Button type="submit" variant="contained">Schedule</Button>
          </Box>
        )}
        <Tabs value={tab} onChange={(e, v) => setTab(v)}>
          <Tab label="Upcoming" />
          <Tab label="Past" />
        </Tabs>
        <Box hidden={tab !== 0} sx={{ mt: 2 }}>
          {upcoming.length > 0 ? (
            upcoming.map((contest) => (
              <ContestCard key={contest._id} contest={contest} onRegister={register} userId={userId} />
            ))
          ) : (
            <Typography>No upcoming contests</Typography>
          )}
        </Box>
        <Box hidden={tab !== 1} sx={{ mt: 2 }}>
          {past.length > 0 ? (
            past.map((contest) => (
              <ContestCard key={contest._id} contest={contest} />
            ))
          ) : (
            <Typography>No past contests</Typography>
          )}
        </Box>
      </Box>
    </>
  );
}

export default ContestPage;
