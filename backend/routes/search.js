const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Document = require('../models/Document');

const router = express.Router();

const requireDb = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ success: false, message: 'Database not connected.' });
    return false;
  }
  return true;
};

// GET /api/search?q=query&type=all|documents
router.get('/', auth, async (req, res) => {
  if (!requireDb(res)) return;
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters' });
    }

    const searchRegex = { $regex: q.trim(), $options: 'i' };

    const documents = await Document.find({
      userId: req.userId,
      isDeleted: { $ne: true },
      $or: [
        { title: searchRegex },
        { topic: searchRegex },
        { rawContent: searchRegex },
        { tags: searchRegex },
      ],
    })
      .sort({ updatedAt: -1 })
      .limit(parseInt(limit))
      .select('title topic status updatedAt wordCount aiScore tags');

    res.json({
      success: true,
      query: q,
      results: {
        documents,
        total: documents.length,
      },
    });
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ success: false, message: 'Search failed' });
  }
});

module.exports = router;
