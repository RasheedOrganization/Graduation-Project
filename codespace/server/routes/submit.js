const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const router = express.Router();

const { submissionQueue, waitforJobCompletion } = require('../jobs/submissionWorker');
const Submission = require('../model/submissionModel');

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

router.post('/', authenticate, async (req, res) => {
  const { code, problem_id, language = 'cpp' } = req.body;
  if (!code || !problem_id) {
    return res.status(400).send('Code and problem ID are required.');
  }

  const job = await submissionQueue.add('submissionProcess', { code: code, problemId: problem_id, language });
  const verdictData = await waitforJobCompletion(submissionQueue, job);

  try {
    const submission = new Submission({
      user: req.user.id,
      problem: problem_id,
      code,
      verdict: verdictData,
      language,
    });
    await submission.save();
  } catch (err) {
    console.error('Failed to save submission:', err);
  }

  res.send(verdictData);
});

module.exports = router;
