const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { exec } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const Submission = require('../model/submissionModel');

const router = express.Router();

const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/graduation_project';
mongoose.connect(url);

function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'changeme');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

router.post('/submit', authenticate, async (req, res) => {
  const { code, problem_id, language = 'cpp' } = req.body;
  if (!code || !problem_id) {
    return res.status(400).send('Code and problem ID are required.');
  }

  const langMap = { cpp: '54', python: '31', java: '36' };
  const extMap = { cpp: 'cpp', python: 'py', java: 'java' };
  const langId = langMap[language] || langMap.cpp;
  const ext = extMap[language] || 'cpp';

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'cf-'));
  const filePath = path.join(tmpDir, `Main.${ext}`);
  fs.writeFileSync(filePath, code);

  const cmd = `cf submit ${problem_id} ${filePath} --lang ${langId} --wait`;

  exec(cmd, (error, stdout, stderr) => {
    const output = stdout.toString() + stderr.toString();
    if (error) {
      console.error('cf-tool error:', output);
      fs.rmSync(tmpDir, { recursive: true, force: true });
      return res.status(500).send('Submission failed');
    }

    const verdictMatch = output.match(/(Accepted|Wrong answer|Time limit exceeded|Compilation error|Runtime error)/i);
    const verdict = verdictMatch ? verdictMatch[1] : 'Unknown';

    const submission = new Submission({
      user: req.user.id,
      problem: problem_id,
      code,
      verdict,
      language,
    });
    submission.save().catch((err) => console.error('Failed to save submission:', err));

    fs.rmSync(tmpDir, { recursive: true, force: true });
    res.send(verdict);
  });
});

module.exports = router;
