import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import AsyncButton from './AsyncButton';
import axios from 'axios';
import BACKEND_URL from '../config';

const CustomProblemPanel = ({ onAdd, onClose }) => {
  const [statement, setStatement] = useState('');
  const [tests, setTests] = useState([]);

  const handleVerify = async () => {
    const res = await axios.post(`${BACKEND_URL}/api/ai/verify-problem`, { statement });
    if (res.data.statement) {
      setStatement(res.data.statement);
    }
  };

  const handleGenerate = async () => {
    const res = await axios.post(`${BACKEND_URL}/api/ai/generate-tests`, { statement });
    if (res.data.tests) {
      setTests(res.data.tests);
    }
  };

  const handleAdd = async () => {
    await onAdd(statement, tests);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <TextField
        multiline
        minRows={6}
        value={statement}
        onChange={(e) => setStatement(e.target.value)}
        placeholder="Write your problem statement here"
      />
      <Stack direction="row" spacing={2} justifyContent="center">
        <AsyncButton variant="contained" onClick={handleVerify}>Verify</AsyncButton>
        <AsyncButton variant="contained" onClick={handleGenerate}>Generate Tests</AsyncButton>
        <AsyncButton variant="contained" onClick={handleAdd} onSuccess={onClose}>Add</AsyncButton>
      </Stack>
    </Box>
  );
};

export default CustomProblemPanel;
