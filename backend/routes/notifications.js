const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Notification = require('../models/Notification');

const router = express.Router();

const requireDb = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ success: false, message: 'Database not connected.' });
    return false;
  }
  return true;
};

// GET /api/notifications — get user notifications
router.get('/', auth, async (req, res) => {
  if (!requireDb(res)) return;
  try {
    const { limit = 20, unreadOnly } = req.query;
    const query = { userId: req.userId };
    if (unreadOnly === 'true') query.isRead = false;

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    const unreadCount = await Notification.countDocuments({ userId: req.userId, isRead: false });

    res.json({ success: true, notifications, unreadCount });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
});

// POST /api/notifications — create notification (internal use)
router.post('/', auth, async (req, res) => {
  if (!requireDb(res)) return;
  try {
    const { type, title, message, link, meta } = req.body;
    const notification = await Notification.create({
      userId: req.userId,
      type: type || 'info',
      title,
      message,
      link: link || null,
      meta: meta || {},
    });
    res.status(201).json({ success: true, notification });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to create notification' });
  }
});

// PUT /api/notifications/:id/read — mark one as read
router.put('/:id/read', auth, async (req, res) => {
  if (!requireDb(res)) return;
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { isRead: true }
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark as read' });
  }
});

// PUT /api/notifications/read-all — mark all as read
router.put('/read-all', auth, async (req, res) => {
  if (!requireDb(res)) return;
  try {
    await Notification.updateMany({ userId: req.userId, isRead: false }, { isRead: true });
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to mark all as read' });
  }
});

// DELETE /api/notifications/:id — delete one
router.delete('/:id', auth, async (req, res) => {
  if (!requireDb(res)) return;
  try {
    await Notification.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete notification' });
  }
});

// DELETE /api/notifications — clear all read notifications
router.delete('/', auth, async (req, res) => {
  if (!requireDb(res)) return;
  try {
    await Notification.deleteMany({ userId: req.userId, isRead: true });
    res.json({ success: true, message: 'Cleared read notifications' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to clear notifications' });
  }
});

module.exports = router;
