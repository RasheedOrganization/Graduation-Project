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

router.post('/:id/friends/:friendId', authenticate, async (req, res) => {
  const { id, friendId } = req.params;
  if (req.user.id !== id) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const friendIndex = user.friends.findIndex(
      (f) => f.toString() === friendId
    );
    let isFriend;
    if (friendIndex >= 0) {
      user.friends.splice(friendIndex, 1);
      isFriend = false;
    } else {
      user.friends.push(friendId);
      isFriend = true;
    }
    await user.save();
    res.json({ isFriend });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/search', authenticate, async (req, res) => {
  const { username = '' } = req.query;
  try {
    const regex = new RegExp(`^${username}`, 'i');
    const users = await User.find({
      username: { $regex: regex },
      _id: { $ne: req.user.id },
    }).select('username');
    const current = await User.findById(req.user.id).select('friends');
    const friendSet = new Set(current.friends.map((f) => f.toString()));
    const results = users.map((u) => ({
      id: u._id.toString(),
      username: u.username,
      isFriend: friendSet.has(u._id.toString()),
    }));
    res.json(results);
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
  const { username, displayName, password, currentPassword } = req.body;
  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (username && username !== user.username) {
      const existing = await User.findOne({ username });
      if (existing && existing._id.toString() !== id) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      user.username = username;
    }
    if (typeof displayName !== 'undefined') user.displayName = displayName;
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password required' });
      }
      const match = await bcrypt.compare(currentPassword, user.password);
      if (!match) {
        return res.status(400).json({ message: 'Current password incorrect' });
      }
      user.password = await bcrypt.hash(password, 10);
    }
    await user.save();
    res.json({ username: user.username, displayName: user.displayName });
  } catch (err) {
    if (err.code === 11000 && err.keyPattern && err.keyPattern.username) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
