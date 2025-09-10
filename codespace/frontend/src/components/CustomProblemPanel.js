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
  const [sampleInput, setSampleInput] = useState('');
  const [sampleOutput, setSampleOutput] = useState('');
  const [tests, setTests] = useState([]); // hidden tests
  const [hiddenCount, setHiddenCount] = useState(5);
  const [maxLen, setMaxLen] = useState(10);
  const [cfLink, setCfLink] = useState('');
  const [fetchError, setFetchError] = useState(null);

  function sanitize(statement) {
    let res = "";
    let buffer = "";
    let count = 0;
    for (let i = 0; i < statement.length; i++) {
      const char = statement.charAt(i);
      if (/\w/.test(char)) {
        buffer += char;
      } else {
        if (buffer !== "") {
          res += buffer;
          buffer = "";
          count++;
        }
        if (char === "$" && statement.charAt(i + 1) === "$" && statement.charAt(i + 2) === "$") {
          res += "$$";
          i += 2;
        } else {
          res += char;
        }
      }
      if (char === '.' && count > 5) {
        res += "\n";
        count = 0;
      }
    }
    if (buffer !== "") {
      res += buffer;
    }
    return res;
  }

  const handleFetchCF = async () => {
    setFetchError(null);
    if (!cfLink) return;
    try {
      const encodedURL = encodeURIComponent(cfLink);
      const res = await axios.get(`${BACKEND_URL}/api/parse_problem/${encodedURL}`);
      const data = res.data;
      if (data.error) {
        setFetchError(data.error);
        return;
      }
      let newStatement = `<h2><strong>${data.title}</strong></h2>\n`;
      newStatement += sanitize(data.statement);
      newStatement += `<h3><strong>Input format</strong></h3>\n`;
      newStatement += sanitize(data.input_format);
      newStatement += `<h3><strong>Output format</strong></h3>\n`;
      newStatement += sanitize(data.output_format);
      setStatement(newStatement);
      setSampleInput(data.sample_input);
      setSampleOutput(data.sample_outputs);
    } catch (err) {
      setFetchError(err.message);
    }
  };

  const handleVerify = async () => {
    const res = await axios.post(`${BACKEND_URL}/api/ai/verify-problem`, { statement });
    if (res.data.statement) {
      setStatement(res.data.statement);
    }
  };

  const handleGenerateSample = async () => {
    const res = await axios.post(`${BACKEND_URL}/api/ai/generate-tests`, {
      statement,
      count: 1,
      maxArrayLength: maxLen,
    });
    if (res.data.tests && res.data.tests[0]) {
      setSampleInput(res.data.tests[0].input);
      setSampleOutput(res.data.tests[0].output);
    }
  };

  const handleGenerateHidden = async () => {
    const res = await axios.post(`${BACKEND_URL}/api/ai/generate-tests`, {
      statement,
      count: hiddenCount,
      maxArrayLength: maxLen,
    });
    if (res.data.tests) {
      setTests(res.data.tests);
    }
  };

  const handleHiddenChange = (index, field, value) => {
    setTests(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleAdd = async () => {
    await onAdd(statement, sampleInput, sampleOutput, tests);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: 600 }}>
      <Stack direction="row" spacing={1} alignItems="center">
        <TextField
          label="Codeforces Link"
          value={cfLink}
          onChange={(e) => setCfLink(e.target.value)}
          size="small"
          fullWidth
        />
        <AsyncButton size="small" variant="outlined" onClick={handleFetchCF} sx={{ minWidth: 100 }}>
          Fetch
        </AsyncButton>
      </Stack>
      {fetchError && <Typography color="error">{fetchError}</Typography>}
      <TextField
        multiline
        minRows={6}
        value={statement}
        onChange={(e) => setStatement(e.target.value)}
        placeholder="Write your problem statement here"
      />

      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>Sample Test</Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
          <TextField
            label="Sample Input"
            multiline
            minRows={2}
            value={sampleInput}
            onChange={(e) => setSampleInput(e.target.value)}
            fullWidth
          />
          <TextField
            label="Sample Output"
            multiline
            minRows={2}
            value={sampleOutput}
            onChange={(e) => setSampleOutput(e.target.value)}
            fullWidth
          />
        </Stack>
        <AsyncButton
          size="small"
          variant="outlined"
          onClick={handleGenerateSample}
          sx={{ minWidth: 160 }}
        >
          Generate Sample
        </AsyncButton>
      </Box>

      <Box>
        <Typography variant="subtitle1" sx={{ mb: 1, mt: 2 }}>Hidden Tests</Typography>
        <Stack direction="row" spacing={2} sx={{ mb: 1 }}>
          <TextField
            label="Number of Tests"
            type="number"
            value={hiddenCount}
            onChange={(e) => setHiddenCount(Number(e.target.value))}
            sx={{ width: 140 }}
          />
          <TextField
            label="Max Array Length"
            type="number"
            value={maxLen}
            onChange={(e) => setMaxLen(Number(e.target.value))}
            sx={{ width: 160 }}
          />
          <AsyncButton
            size="small"
            variant="outlined"
            onClick={handleGenerateHidden}
            sx={{ minWidth: 160 }}
          >
            Generate Hidden
          </AsyncButton>
        </Stack>
        <Box sx={{ maxHeight: 200, overflowY: 'auto' }}>
          {tests.map((test, idx) => (
            <Stack key={idx} direction="row" spacing={2} sx={{ mb: 1 }}>
              <TextField
                label={`Input ${idx + 1}`}
                multiline
                minRows={2}
                value={test.input}
                onChange={(e) => handleHiddenChange(idx, 'input', e.target.value)}
                fullWidth
              />
              <TextField
                label={`Output ${idx + 1}`}
                multiline
                minRows={2}
                value={test.output}
                onChange={(e) => handleHiddenChange(idx, 'output', e.target.value)}
                fullWidth
              />
            </Stack>
          ))}
        </Box>
      </Box>

      <Stack direction="row" spacing={2} justifyContent="center">
        <AsyncButton variant="contained" onClick={handleVerify}>Verify</AsyncButton>
        <AsyncButton variant="contained" onClick={handleAdd} onSuccess={onClose}>Add</AsyncButton>
      </Stack>
    </Box>
  );
};

export default CustomProblemPanel;
