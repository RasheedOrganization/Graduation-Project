const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.post('/chat', async (req, res) => {
  const { prompt = '', code = '', mode = 'normal' } = req.body;
  const apiKey = "AIzaSyCxEUSKz296qV7qCFgNvRe_7jYMe9Y8LyI"
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
  }
  let text = prompt;
  if (mode === 'fix') {
    text = `${prompt}\n\nFix the following code:\n${code}`;
  } else if (mode === 'explain') {
    text = `${prompt}\n\nExplain the following code:\n${code}`;
  }
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text }] }]
      })
    });
    const data = await response.json();
    const aiText = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts
      ? data.candidates[0].content.parts.map(p => p.text).join('')
      : 'No response';
    res.json({ text: aiText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch from Gemini' });
  }
});

router.post('/verify-problem', async (req, res) => {
  const { statement = '' } = req.body;
  const apiKey = "AIzaSyCxEUSKz296qV7qCFgNvRe_7jYMe9Y8LyI";
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
  }
  const text = `You are a competitive programming problem validator. If the following statement is missing information or is unclear, rewrite it to be complete and unambiguous. Otherwise reply with the original statement.\n\n${statement}`;
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text }] }]
      })
    });
    const data = await response.json();
    const aiText = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts
      ? data.candidates[0].content.parts.map(p => p.text).join('')
      : statement;
    res.json({ statement: aiText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to verify problem statement' });
  }
});

router.post('/generate-tests', async (req, res) => {
  const { statement = '' } = req.body;
  const apiKey = "AIzaSyCxEUSKz296qV7qCFgNvRe_7jYMe9Y8LyI";
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
  }
  const text = `Generate a JSON array of test cases for the following competitive programming problem. Each test should be an object with "input" and "output" fields. Avoid large inputs (no test should contain more than 1000 integers). Only return the JSON.\n\n${statement}`;
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text }] }]
      })
    });
    const data = await response.json();
    const aiText = data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts
      ? data.candidates[0].content.parts.map(p => p.text).join('')
      : '[]';
    let tests = [];
    try {
      // Some responses may include additional text or code fences around the
      // JSON array. Extract the first JSON array substring and parse that.
      const match = aiText.match(/\[[\s\S]*\]/);
      if (match) {
        tests = JSON.parse(match[0]);
      } else {
        console.error('No JSON array found in AI response');
      }
    } catch (e) {
      console.error('Failed to parse tests from AI', e);
    }
    res.json({ tests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate tests' });
  }
});

// Utility for formatting average with up to 4 decimal places without
// unnecessary trailing zeros. For example, 3.4000 becomes "3.4".
function formatAvg(num) {
  let s = num.toFixed(4);
  s = s.replace(/\.0+$/, '');
  s = s.replace(/(\.\d*?[1-9])0+$/, '$1');
  return s;
}

// Generates test cases for the array average problem. It supports two modes:
// - sample: returns a single small test for the problem statement.
// - hidden: returns multiple tests for system testing. The client may specify
//   the number of tests (count) and the maximum array length.
router.post('/generate-average-tests', (req, res) => {
  const { type = 'sample', count = 1, maxArrayLength = 10 } = req.body;

  const numTests = type === 'sample' ? 1 : Math.max(1, Math.floor(count));
  const maxLen = Math.max(1, Math.floor(maxArrayLength));

  const tests = [];
  for (let i = 0; i < numTests; i++) {
    const n = Math.floor(Math.random() * maxLen) + 1;
    const arr = Array.from({ length: n }, () => Math.floor(Math.random() * 1e9) + 1);
    const avg = arr.reduce((a, b) => a + b, 0) / n;
    const output = formatAvg(avg);
    tests.push({ input: `${n}\n${arr.join(' ')}`, output });
  }

  res.json({ tests });
});

module.exports = router;
