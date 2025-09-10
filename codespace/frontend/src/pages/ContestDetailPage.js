import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Box, Typography, Button, List, ListItem, TextField, MenuItem } from '@mui/material';
import NavBar from '../components/NavBar';
import BACKEND_URL from '../config';

function ContestDetailPage() {
  const { id } = useParams();
  const [contest, setContest] = useState(null);
  const [timeLeft, setTimeLeft] = useState('');
  const [registered, setRegistered] = useState(false);
  const [problemList, setProblemList] = useState([]);
  const [selectedProblem, setSelectedProblem] = useState('');
  const isPastContest = contest && new Date(contest.startTime) <= Date.now();
  const role = localStorage.getItem('role');
  const token = localStorage.getItem('token');
  const isAdmin = role === 'admin' || role === 'superadmin';

  useEffect(() => {
    async function fetchContest() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/contests/${id}`);
        if (res.ok) {
          const data = await res.json();
          setContest(data);
          const userId = localStorage.getItem('userid');
          if (userId && data.participants && data.participants.includes(userId)) {
            setRegistered(true);
          }
          return;
        }
      } catch (err) {
        console.error('Failed to fetch contest');
      }
      // Fallback dummy contest
      const now = new Date();
      setContest({
        name: 'Sample Contest',
        startTime: now.toISOString(),
        duration: 90,
        problems: ['Sample Problem 1', 'Sample Problem 2'],
        participants: []
      });
    }
    fetchContest();
  }, [id]);

  useEffect(() => {
    async function fetchProblems() {
      try {
        const res = await fetch(`${BACKEND_URL}/api/problem-list`);
        if (res.ok) {
          const data = await res.json();
          setProblemList(data);
        }
      } catch (err) {
        console.error('Failed to fetch problems');
      }
    }
    fetchProblems();
  }, []);

  useEffect(() => {
    let interval;
    if (contest) {
      const end = new Date(contest.startTime).getTime() + contest.duration * 60000;
      const update = () => {
        const diff = end - Date.now();
        if (diff <= 0) {
          setTimeLeft('Contest ended');
          clearInterval(interval);
        } else {
          const h = Math.floor(diff / 3600000);
          const m = Math.floor((diff % 3600000) / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${h}h ${m}m ${s}s`);
        }
      };
      update();
      interval = setInterval(update, 1000);
    }
    return () => clearInterval(interval);
  }, [contest]);

  const register = async () => {
    const userId = localStorage.getItem('userid');
    try {
      const res = await fetch(`${BACKEND_URL}/api/contests/${id}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        setRegistered(true);
      }
    } catch (err) {
      console.error('Registration failed');
    }
  };

  const unregister = async () => {
    const userId = localStorage.getItem('userid');
    try {
      const res = await fetch(`${BACKEND_URL}/api/contests/${id}/unregister`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        setRegistered(false);
      }
    } catch (err) {
      console.error('Unregistration failed');
    }
  };

  const addProblem = async () => {
    if (!isAdmin) return;
    try {
      const res = await fetch(`${BACKEND_URL}/api/contests/${id}/problems`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ problem: selectedProblem })
      });
      if (res.ok) {
        setContest((prev) => ({
          ...prev,
          problems: [...(prev.problems || []), selectedProblem]
        }));
        setSelectedProblem('');
      }
    } catch (err) {
      console.error('Failed to add problem');
    }
  };

  return (
    <>
      <NavBar />
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        {contest ? (
          <>
            <Typography variant="h4" gutterBottom>
              {contest.name}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Start: {new Date(contest.startTime).toLocaleString()}
            </Typography>
            <Typography variant="subtitle1" gutterBottom>
              Duration: {contest.duration} minutes
            </Typography>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6">Problems</Typography>
              <List>
                {contest.problems && contest.problems.length > 0 ? (
                  contest.problems.map((p, idx) => {
                    const prob = problemList.find((pr) => pr.problem_name === p);
                    return prob ? (
                      <ListItem
                        key={idx}
                        component={Link}
                        to={`/problems/${prob.id}`}
                        sx={{ cursor: 'pointer' }}
                      >
                        {p}
                      </ListItem>
                    ) : (
                      <ListItem key={idx}>{p}</ListItem>
                    );
                  })
                ) : (
                  <ListItem>No problems available</ListItem>
                )}
              </List>
              {!isPastContest && isAdmin && (
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <TextField
                    select
                    label="Add Problem"
                    value={selectedProblem}
                    onChange={(e) => setSelectedProblem(e.target.value)}
                    sx={{ minWidth: 200 }}
                  >
                    {problemList.map((p) => (
                      <MenuItem key={p.id} value={p.problem_name}>
                        {p.problem_name}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Button
                    variant="contained"
                    onClick={addProblem}
                    disabled={!selectedProblem}
                  >
                    Add
                  </Button>
                </Box>
              )}
            </Box>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6">Scoreboard</Typography>
              <Box sx={{ bgcolor: '#f5f5f5', p: 2 }}>
                <Typography variant="body2">Scoreboard will appear here.</Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6">Countdown Timer</Typography>
              <Typography>{timeLeft}</Typography>
            </Box>

            {new Date(contest.startTime) > Date.now() && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6">Registration Status</Typography>
                {registered ? (
                  <Button variant="contained" onClick={unregister}>Unregister</Button>
                ) : (
                  <Button variant="contained" onClick={register}>Register</Button>
                )}
              </Box>
            )}
          </>
        ) : (
          <Typography>Loading...</Typography>
        )}
      </Box>
    </>
  );
}

export default ContestDetailPage;
