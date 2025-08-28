import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import NavBar from '../components/NavBar';

function ContestDetailPage() {
  const { id } = useParams();

  return (
    <>
      <NavBar />
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Contest Details
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Contest ID: {id}
        </Typography>
        {/* TODO: Replace placeholders with real contest data */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Problems</Typography>
          <Box sx={{ height: 100, bgcolor: '#f5f5f5', mb: 3 }} />
          <Typography variant="h6">Scoreboard</Typography>
          <Box sx={{ height: 100, bgcolor: '#f5f5f5', mb: 3 }} />
          <Typography variant="h6">Countdown Timer</Typography>
          <Box sx={{ height: 40, bgcolor: '#f5f5f5', mb: 3 }} />
          <Typography variant="h6">Registration Status</Typography>
          <Box sx={{ height: 40, bgcolor: '#f5f5f5', mb: 3 }} />
        </Box>
      </Box>
    </>
  );
}

export default ContestDetailPage;
