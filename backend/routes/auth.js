const express = require('express');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '7d' });

// Reusable DB check helper
const requireDb = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({
      success: false,
      message: 'Database is not connected. Please ensure MongoDB is running and restart the server.',
    });
    return false;
  }
  return true;
};

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  if (!requireDb(res)) return;
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email: email.toLowerCase(), password });
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, preferences: user.preferences },
    });
  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({ success: false, message: 'Server error during signup' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  if (!requireDb(res)) return;
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: { id: user._id, name: user.name, email: user.email, preferences: user.preferences, lastLogin: user.lastLogin },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/auth/preferences
router.put('/preferences', auth, async (req, res) => {
  try {
    const { preferences } = req.body;
    const user = await User.findByIdAndUpdate(
      req.userId,
      { preferences },
      { new: true, runValidators: true }
    );
    res.json({ success: true, message: 'Preferences updated', user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/auth/update-profile
router.put('/update-profile', auth, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Name must be at least 2 characters' });
    }
    const user = await User.findByIdAndUpdate(req.userId, { name: name.trim() }, { new: true });
    res.json({ success: true, message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PUT /api/auth/change-password
router.put('/change-password', auth, async (req, res) => {
  if (!requireDb(res)) return;
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Both passwords are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters' });
    }
    const user = await User.findById(req.userId).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/auth/account
router.delete('/account', auth, async (req, res) => {
  if (!requireDb(res)) return;
  try {
    const Document = require('../models/Document');
    const EditHistory = require('../models/EditHistory');
    const Notification = require('../models/Notification');
    await Promise.all([
      Document.deleteMany({ userId: req.userId }),
      EditHistory.deleteMany({ userId: req.userId }),
      Notification.deleteMany({ userId: req.userId }),
      User.findByIdAndDelete(req.userId),
    ]);
    res.json({ success: true, message: 'Account permanently deleted' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete account' });
  }
});

module.exports = router;

