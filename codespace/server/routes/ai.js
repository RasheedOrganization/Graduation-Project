const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.post('/chat', async (req, res) => {
  const { prompt = '', code = '', mode = 'normal' } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
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

module.exports = router;
