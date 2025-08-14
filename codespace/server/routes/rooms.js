const express = require('express');
const mongoose = require('mongoose');
const Room = require('../model/roomModel');
require('dotenv').config();

const router = express.Router();
const url = process.env.MONGODB_URI;

mongoose.connect(url);

router.post('/create', async (req, res) => {
  const { roomid, isPrivate, password } = req.body;
  try {
    const existing = await Room.findOne({ roomid });
    if (existing) {
      return res.status(400).json({ message: 'Room already exists' });
    }
    const room = new Room({ roomid, isPrivate, password: isPrivate ? password : undefined });
    await room.save();
    res.json({ roomid });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/join', async (req, res) => {
  const { roomid, password } = req.body;
  try {
    const room = await Room.findOne({ roomid });
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    if (room.isPrivate) {
      if (!password) {
        return res.json({ requiresPassword: true });
      }
      if (room.password !== password) {
        return res.status(401).json({ message: 'Invalid password' });
      }
    }
    res.json({ roomid });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
