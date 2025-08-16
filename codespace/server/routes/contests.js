const express = require('express');
const mongoose = require('mongoose');
const Contest = require('../model/contestModel');

const router = express.Router();
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/graduation_project';

mongoose.connect(url);

// Create a new contest (admin only - auth not implemented here)
router.post('/', async (req, res) => {
  const { name, startTime, duration, problems } = req.body;
  try {
    const contest = new Contest({ name, startTime, duration, problems });
    await contest.save();
    res.status(201).json(contest);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// List upcoming contests
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const contests = await Contest.find({ startTime: { $gte: now } }).sort({ startTime: 1 });
    res.json(contests);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Register a user for a contest
router.post('/:id/register', async (req, res) => {
  const { userId } = req.body;
  try {
    const contest = await Contest.findById(req.params.id);
    if (!contest) {
      return res.status(404).json({ message: 'Contest not found' });
    }
    if (contest.participants.includes(userId)) {
      return res.status(400).json({ message: 'Already registered' });
    }
    contest.participants.push(userId);
    await contest.save();
    res.json({ message: 'Registered' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
