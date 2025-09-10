const express = require('express');
const { callGemini, extractText } = require('../utils/gemini');
const router = express.Router();

router.post('/chat', async (req, res) => {
  const { prompt = '', code = '', mode = 'normal' } = req.body;
  let text = prompt;
  if (mode === 'fix') {
    text = `${prompt}\n\nFix the following code:\n${code}`;
  } else if (mode === 'explain') {
    text = `${prompt}\n\nExplain the following code:\n${code}`;
  }
  try {
    const data = await callGemini(text);
    const aiText = extractText(data);
    res.json({ text: aiText });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch from Gemini' });
  }
});

router.post('/verify-problem', async (req, res) => {
  const { statement = '' } = req.body;
  const text = `You are a competitive programming problem validator. If the following statement is missing information or is unclear, rewrite it to be complete and unambiguous. Otherwise reply with the original statement. Respond ONLY with valid JSON of the form {"statement":"<final statement>"} and nothing else.\n\n${statement}`;
  try {
    const data = await callGemini(text);
    const aiText = extractText(data) || statement;

    let verifiedStatement = statement;
    try {
      const match = aiText.match(/\{[\s\S]*\}/);
      if (match) {
        const obj = JSON.parse(match[0]);
        if (obj.statement) {
          verifiedStatement = obj.statement.trim();
        } else {
          console.error('No statement field in AI response JSON');
        }
      } else {
        console.error('No JSON object found in AI response');
      }
    } catch (e) {
      console.error('Failed to parse statement from AI', e);
    }

    res.json({ statement: verifiedStatement });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to verify problem statement' });
  }
});

router.post('/generate-tests', async (req, res) => {
  const { statement = '', count = 1, maxArrayLength = 1000 } = req.body;
  const text = `Generate a JSON array of exactly ${count} test cases for the following competitive programming problem. Each test should be an object with \"input\" and \"output\" fields. Ensure that any array in the input contains at most ${maxArrayLength} elements. Only return the JSON array.\n\n${statement}`;
  try {
    const data = await callGemini(text);
    const aiText = extractText(data) || '[]';
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

