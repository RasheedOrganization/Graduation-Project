import React, { useState } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AsyncButton from './AsyncButton';
import axios from 'axios';
import BACKEND_URL from '../config';

const CustomProblemPanel = ({ onAdd, onClose }) => {
  const [statement, setStatement] = useState('');
  const [tests, setTests] = useState([{ input: '', output: '' }]);

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

  const handleTestChange = (index, field, value) => {
    setTests(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAdd = async () => {
    await onAdd(statement, tests);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 600 }}>
      <TextField
        multiline
        minRows={6}
        value={statement}
        onChange={(e) => setStatement(e.target.value)}
        placeholder="Write your problem statement here"
      />
      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Sample Tests</Typography>
        {tests.map((test, idx) => (
          <Stack key={idx} direction="row" spacing={2} sx={{ mb: 1 }}>
            <TextField
              label={`Input ${idx + 1}`}
              multiline
              minRows={2}
              value={test.input}
              onChange={(e) => handleTestChange(idx, 'input', e.target.value)}
              fullWidth
            />
            <TextField
              label={`Output ${idx + 1}`}
              multiline
              minRows={2}
              value={test.output}
              onChange={(e) => handleTestChange(idx, 'output', e.target.value)}
              fullWidth
            />
          </Stack>
        ))}
        <AsyncButton
          size="small"
          variant="outlined"
          onClick={handleGenerate}
          sx={{ minWidth: 160 }}
        >
          AI Generate Tests
        </AsyncButton>
      </Box>
      <Stack direction="row" spacing={2} justifyContent="center">
        <AsyncButton variant="contained" onClick={handleVerify}>Verify</AsyncButton>
        <AsyncButton variant="contained" onClick={handleAdd} onSuccess={onClose}>Add</AsyncButton>
      </Stack>
    </Box>
  );
};

export default CustomProblemPanel;
