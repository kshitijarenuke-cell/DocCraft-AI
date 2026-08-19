const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const Document = require('../models/Document');
const User = require('../models/User');

const router = express.Router();

const requireDb = (res) => {
  if (mongoose.connection.readyState !== 1) {
    res.status(503).json({ success: false, message: 'Database not connected.' });
    return false;
  }
  return true;
};

// GET /api/analytics/overview — comprehensive dashboard analytics
router.get('/overview', auth, async (req, res) => {
  if (!requireDb(res)) return;
  try {
    const userId = req.userId;
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const last7Days = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [
      totalDocs,
      thisMonthDocs,
      lastMonthDocs,
      statusBreakdown,
      recentActivity,
      totalWords,
      docsLast7Days,
    ] = await Promise.all([
      Document.countDocuments({ userId, isDeleted: { $ne: true } }),
      Document.countDocuments({ userId, isDeleted: { $ne: true }, createdAt: { $gte: thisMonthStart } }),
      Document.countDocuments({ userId, isDeleted: { $ne: true }, createdAt: { $gte: lastMonthStart, $lt: thisMonthStart } }),
      Document.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), isDeleted: { $ne: true } } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Document.find({ userId, isDeleted: { $ne: true } })
        .sort({ updatedAt: -1 })
        .limit(5)
        .select('title status updatedAt wordCount aiScore'),
      Document.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), isDeleted: { $ne: true } } },
        { $group: { _id: null, totalWords: { $sum: '$wordCount' } } },
      ]),
      Document.find({ userId, createdAt: { $gte: last7Days } })
        .select('title createdAt')
        .sort({ createdAt: 1 }),
    ]);

    const statusMap = {};
    statusBreakdown.forEach(s => { statusMap[s._id] = s.count; });

    const monthGrowth = lastMonthDocs > 0
      ? Math.round(((thisMonthDocs - lastMonthDocs) / lastMonthDocs) * 100)
      : thisMonthDocs > 0 ? 100 : 0;

    // Daily breakdown for last 7 days
    const dailyData = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now - i * 24 * 60 * 60 * 1000);
      const dayStr = day.toLocaleDateString('en-US', { weekday: 'short' });
      const count = docsLast7Days.filter(d => {
        const docDay = new Date(d.createdAt);
        return docDay.toDateString() === day.toDateString();
      }).length;
      dailyData.push({ day: dayStr, count });
    }

    res.json({
      success: true,
      analytics: {
        totalDocs,
        thisMonthDocs,
        monthGrowth,
        totalWords: totalWords[0]?.totalWords || 0,
        statusBreakdown: {
          draft: statusMap.draft || 0,
          analyzed: statusMap.analyzed || 0,
          fixed: statusMap.fixed || 0,
          exported: statusMap.exported || 0,
        },
        recentActivity,
        dailyData,
      },
    });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch analytics' });
  }
});

module.exports = router;
