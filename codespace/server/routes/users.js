const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Submission = require('../model/submissionModel');
const User = require('../model/userModel');

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

router.get('/:id/friends', authenticate, async (req, res) => {
  const { id } = req.params;
  if (req.user.id !== id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const user = await User.findById(id).populate('friends', 'username displayName');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.friends);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  if (req.user.id !== id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const user = await User.findById(id).populate('friends', 'username displayName');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({
      username: user.username,
      displayName: user.displayName,
      friends: user.friends,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  if (req.user.id !== id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  const { username, displayName, password } = req.body;
  const update = {};
  if (username) update.username = username;
  if (typeof displayName !== 'undefined') update.displayName = displayName;
  if (password) {
    update.password = await bcrypt.hash(password, 10);
  }
  try {
    const user = await User.findByIdAndUpdate(id, update, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ username: user.username, displayName: user.displayName });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
