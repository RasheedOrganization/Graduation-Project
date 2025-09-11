const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const router = express.Router();

const { submissionQueue, waitforJobCompletion } = require('../jobs/submissionWorker');
const Submission = require('../model/submissionModel');
const PracticeProblem = require('../model/practiceProblemModel');

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
  const { code, problem_id, language = 'cpp', tests, contestId } = req.body;
  if (!code) {
    return res.status(400).send('Code is required.');
  }

  const jobData = { code, language };
  if (problem_id) {
    jobData.problemId = problem_id;
  } else {
    if (!Array.isArray(tests) || tests.length === 0) {
      return res.status(400).send('No tests found');
    }
    jobData.tests = tests;
  }

  const job = await submissionQueue.add('submissionProcess', jobData);
  let verdictData;
  try {
    verdictData = await waitforJobCompletion(submissionQueue, job);
  } catch (err) {
    return res.status(400).send(err);
  }

  try {
    let problemName = 'Custom Problem';
    if (problem_id) {
      const problem = await PracticeProblem.findOne({ id: problem_id }).select('name');
      problemName = problem ? problem.name : problem_id;
    }
    const submission = new Submission({
      user: req.user.id,
      problem: problemName,
      code,
      verdict: verdictData,
      language,
      contest: contestId && mongoose.Types.ObjectId.isValid(contestId) ? new mongoose.Types.ObjectId(contestId) : undefined,
    });
    await submission.save();
  } catch (err) {
    console.error('Failed to save submission:', err);
  }

  res.send(verdictData);
});

module.exports = router;
