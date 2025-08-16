const express = require('express');
const mongoose = require('mongoose');
const Room = require('../model/roomModel');
const { getUsersInRoom } = require('../utils/roomStore');

const router = express.Router();
const url = process.env.MONGODB_URI || 'mongodb://localhost:27017/graduation_project';

mongoose.connect(url);

router.post('/create', async (req, res) => {
  const { isPrivate, password } = req.body;
  try {
    let roomid;
    // Generate a unique 4 digit room id
    do {
      roomid = Math.floor(1000 + Math.random() * 9000).toString();
    } while (await Room.findOne({ roomid }));

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

router.get('/public', async (req, res) => {
  try {
    const rooms = await Room.find({ isPrivate: false }).select('roomid -_id');
    const roomsWithUsers = rooms.map((r) => ({
      roomid: r.roomid,
      users: getUsersInRoom(r.roomid).map(u => u.username),
    }));
    res.json(roomsWithUsers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
