const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.post('/chat', async (req, res) => {
  const { prompt = '', code = '', mode = 'normal' } = req.body;
  const apiKey = "AIzaSyCxEUSKz296qV7qCFgNvRe_7jYMe9Y8LyI";
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
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text }] }] })
      }
    );
    const data = await response.json();
    const aiText =
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts
        ? data.candidates[0].content.parts.map((p) => p.text).join('')
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
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text }] }] })
      }
    );
    const data = await response.json();
    const aiText =
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts
        ? data.candidates[0].content.parts.map((p) => p.text).join('')
        : statement;
    res.json({ statement: aiText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to verify problem statement' });
  }
});

router.post('/generate-tests', async (req, res) => {
  const { statement = '', count = 1, maxArrayLength = 1000 } = req.body;
  const apiKey = "AIzaSyCxEUSKz296qV7qCFgNvRe_7jYMe9Y8LyI";
  if (!apiKey) {
    return res.status(500).json({ error: 'Missing GEMINI_API_KEY' });
  }
  const text = `Generate a JSON array of exactly ${count} test cases for the following competitive programming problem. Each test should be an object with \"input\" and \"output\" fields. Ensure that any array in the input contains at most ${maxArrayLength} elements. Only return the JSON array.\n\n${statement}`;
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text }] }] })
      }
    );
    const data = await response.json();
    const aiText =
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts
        ? data.candidates[0].content.parts.map((p) => p.text).join('')
        : '[]';
    let tests = [];
    try {
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

module.exports = router;

