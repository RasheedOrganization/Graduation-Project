const express = require('express');
const mongoose = require('mongoose');
const Contest = require('../model/contestModel');

const router = express.Router();
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/graduation_project';

// Reuse existing connection if available
if (mongoose.connection.readyState === 0) {
  mongoose.connect(url);
}

// Create a new contest (admin only - auth not implemented here)
// TODO: add proper authentication and authorization
router.post('/', async (req, res) => {
  const { name, startTime, duration, problems = [] } = req.body;
  if (!name || !startTime || !duration) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    const contest = new Contest({ name, startTime, duration, problems });
    await contest.save();
    res.status(201).json(contest);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// List upcoming and past contests separately
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const upcoming = await Contest.find({ startTime: { $gte: now } }).sort({ startTime: 1 });
    const past = await Contest.find({ startTime: { $lt: now } }).sort({ startTime: -1 });
    res.json({ upcoming, past });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get details of a single contest
router.get('/:id', async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }
    res.json(contest);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Register a user for a contest
router.post('/:id/register', async (req, res) => {
  const { userId } = req.body;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid userId' });
  }
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }
    if (new Date(contest.startTime) <= new Date()) {
      return res.status(400).json({ message: 'Contest already started' });
    }
    if (contest.participants.some((id) => id.equals(userId))) {
      return res.status(400).json({ message: 'Already registered' });
    }
    contest.participants.push(new mongoose.Types.ObjectId(userId));
    await contest.save();
    res.json({ message: 'Registered' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Unregister a user from a contest
router.post('/:id/unregister', async (req, res) => {
  const { userId } = req.body;
  if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: 'Invalid userId' });
  }
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }
    contest.participants = contest.participants.filter(
      (id) => !id.equals(userId)
    );
    await contest.save();
    res.json({ message: 'Unregistered' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add a problem to a contest
router.post('/:id/problems', async (req, res) => {
  const { problem } = req.body;
  if (!problem) {
    return res.status(400).json({ message: 'Problem is required' });
  }
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }
    if (!contest.problems.includes(problem)) {
      contest.problems.push(problem);
      await contest.save();
    }
    res.json({ message: 'Problem added' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
