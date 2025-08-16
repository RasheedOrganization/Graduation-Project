const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
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

router.get('/:id/submissions', authenticate, async (req, res) => {
  const { id } = req.params;
  if (req.user.id !== id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const submissions = await Submission.find({ user: id }).sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
