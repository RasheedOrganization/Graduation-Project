const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../model/User');
const { secret } = require('../middleware/auth');

const router = express.Router();

// Registration route
router.post('/register', async (req, res) => {
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields' });
  }
  try {
    if (role === 'admin') {
      const authHeader = req.headers['authorization'];
      if (!authHeader) {
        return res.status(403).json({ message: 'Admin token required' });
      }
      const token = authHeader.split(' ')[1];
      try {
        const decoded = jwt.verify(token, secret);
        if (decoded.role !== 'admin') {
          return res.status(403).json({ message: 'Only admins can create admins' });
        }
      } catch (err) {
        return res.status(403).json({ message: 'Invalid admin token' });
      }
    }
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      passwordHash,
      role: role === 'admin' ? 'admin' : 'user'
    });
    await user.save();
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Missing credentials' });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id, role: user.role }, secret, {
      expiresIn: '1h'
    });
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
});

module.exports = router;
