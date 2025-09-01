const express = require('express');
const User = require('../model/userModel');
const auth = require('../middleware/authMiddleware');
const permit = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(auth);

// List users - accessible by admins and super admins
router.get('/users', permit('admin', 'superadmin'), async (req, res) => {
  const users = await User.find({}, '-password');
  res.json(users);
});

// Promote a user to admin - only super admins
router.post('/users/:id/promote', permit('superadmin'), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.role = 'admin';
  await user.save();
  res.json({ message: 'User promoted to admin' });
});

// Demote an admin to user - only super admins
router.post('/users/:id/demote', permit('superadmin'), async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.role = 'user';
  await user.save();
  res.json({ message: 'User demoted to user' });
});

module.exports = router;
