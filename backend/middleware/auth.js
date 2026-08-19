const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT first (no DB needed)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    } catch (jwtErr) {
      if (jwtErr.name === 'TokenExpiredError') {
        return res.status(401).json({ success: false, message: 'Token expired. Please log in again.' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    // Check DB before attempting DB query to avoid 10s timeout
    const readyState = mongoose.connection.readyState;
    if (readyState !== 1) {
      return res.status(503).json({
        success: false,
        message: 'Database is not connected. Please check your MongoDB connection and try again.',
      });
    }

    // Fetch user from DB
    let user;
    try {
      user = await User.findById(decoded.userId).select('-password');
    } catch (dbErr) {
      console.error('Auth DB query error:', dbErr.message);
      return res.status(503).json({
        success: false,
        message: 'Database error during authentication. Please try again.',
      });
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    req.user = user;
    req.userId = user._id;
    next();
  } catch (err) {
    console.error('Auth middleware unexpected error:', err.message);
    return res.status(500).json({ success: false, message: 'Authentication error' });
  }
};

module.exports = auth;
