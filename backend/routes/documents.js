const express = require('express');
const Document = require('../models/Document');
const EditHistory = require('../models/EditHistory');
const auth = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// GET /api/documents/trash – deleted docs for History page
router.get('/trash', auth, async (req, res) => {
  try {
    const docs = await Document.find({ userId: req.userId, isDeleted: true })
      .sort({ deletedAt: -1 })
      .select('-rawContent -processedContent -versions');
    res.json({ success: true, documents: docs });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch trash' });
  }
});

// GET /api/documents/stats/overview
router.get('/stats/overview', auth, async (req, res) => {
  try {
    const [total, drafts, fixed, exported, deleted, recent] = await Promise.all([
      Document.countDocuments({ userId: req.userId, isDeleted: { $ne: true } }),
      Document.countDocuments({ userId: req.userId, status: 'draft', isDeleted: { $ne: true } }),
      Document.countDocuments({ userId: req.userId, status: 'fixed', isDeleted: { $ne: true } }),
      Document.countDocuments({ userId: req.userId, status: 'exported', isDeleted: { $ne: true } }),
      Document.countDocuments({ userId: req.userId, isDeleted: true }),
      Document.find({ userId: req.userId, isDeleted: { $ne: true } })
        .sort({ updatedAt: -1 }).limit(3)
        .select('title topic status updatedAt wordCount'),
    ]);
    res.json({ success: true, stats: { total, drafts, fixed, exported, deleted, recent } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch stats' });
  }
});

// GET /api/documents – list user's active documents
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const query = { userId: req.userId, isDeleted: { $ne: true } };

    if (status && status !== 'all') query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } },
      ];
    }

    const [docs, total] = await Promise.all([
      Document.find(query)
        .sort({ updatedAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .select('-rawContent -processedContent -versions'),
      Document.countDocuments(query),
    ]);

    res.json({
      success: true,
      documents: docs,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch documents' });
  }
});

// POST /api/documents – create
router.post('/', auth, async (req, res) => {
  try {
    const { title, topic, rawContent, processedContent, formatting } = req.body;

    const doc = await Document.create({
      userId: req.userId,
      title: title || 'Untitled Document',
      topic,
      rawContent: rawContent || '',
      processedContent: processedContent || rawContent || '',
      formatting,
      versions: [{ version: 1, content: rawContent || '', timestamp: new Date(), changesSummary: 'Initial version' }],
    });

    await User.findByIdAndUpdate(req.userId, { $inc: { documentCount: 1 } });
    await EditHistory.create({
      documentId: doc._id,
      userId: req.userId,
      action: 'created',
      version: 1,
      changesSummary: `Document "${doc.title}" created`,
    });

    res.status(201).json({ success: true, document: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to create document' });
  }
});

// GET /api/documents/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.userId });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    res.json({ success: true, document: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch document' });
  }
});

// PUT /api/documents/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.userId });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    const {
      title, topic, rawContent, processedContent, formatting,
      insertedImages, diagramCode, diagramType, status, detectedIssues, aiScore, issuesFixed, tags
    } = req.body;

    const oldContent = doc.processedContent;

    if (processedContent && processedContent !== doc.processedContent) {
      const newVersion = doc.currentVersion + 1;
      doc.versions.push({
        version: newVersion,
        content: oldContent,
        processedContent,
        timestamp: new Date(),
        changesSummary: `Version ${newVersion}`,
      });
      doc.currentVersion = newVersion;
    }

    if (title !== undefined) doc.title = title;
    if (topic !== undefined) doc.topic = topic;
    if (rawContent !== undefined) doc.rawContent = rawContent;
    if (processedContent !== undefined) doc.processedContent = processedContent;
    if (formatting !== undefined) doc.formatting = { ...doc.formatting.toObject(), ...formatting };
    if (insertedImages !== undefined) doc.insertedImages = insertedImages;
    if (diagramCode !== undefined) doc.diagramCode = diagramCode;
    if (diagramType !== undefined) doc.diagramType = diagramType;
    if (status !== undefined) doc.status = status;
    if (detectedIssues !== undefined) doc.detectedIssues = detectedIssues;
    if (aiScore !== undefined) doc.aiScore = aiScore;
    if (issuesFixed !== undefined) doc.issuesFixed = issuesFixed;
    if (tags !== undefined) doc.tags = tags;

    await doc.save();

    await EditHistory.create({
      documentId: doc._id,
      userId: req.userId,
      action: 'edited',
      version: doc.currentVersion,
      changesSummary: `Updated "${doc.title}"`,
      metadata: { wordCountAfter: doc.wordCount },
    });

    res.json({ success: true, document: doc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Failed to update document' });
  }
});

// DELETE /api/documents/:id – SOFT DELETE (move to trash)
router.delete('/:id', auth, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.userId });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    doc.isDeleted = true;
    doc.deletedAt = new Date();
    doc.status = 'deleted';
    await doc.save();

    await EditHistory.create({
      documentId: doc._id,
      userId: req.userId,
      action: 'deleted',
      version: doc.currentVersion,
      changesSummary: `"${doc.title}" moved to trash`,
    });

    res.json({ success: true, message: 'Document moved to trash' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete document' });
  }
});

// POST /api/documents/:id/restore – restore from trash
router.post('/:id/restore', auth, async (req, res) => {
  try {
    const doc = await Document.findOne({ _id: req.params.id, userId: req.userId });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });

    doc.isDeleted = false;
    doc.deletedAt = null;
    doc.status = 'draft';
    await doc.save();

    await EditHistory.create({
      documentId: doc._id,
      userId: req.userId,
      action: 'edited',
      changesSummary: `"${doc.title}" restored from trash`,
    });

    res.json({ success: true, document: doc, message: 'Document restored' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to restore document' });
  }
});

// DELETE /api/documents/:id/permanent – permanent delete
router.delete('/:id/permanent', auth, async (req, res) => {
  try {
    const doc = await Document.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
    await EditHistory.deleteMany({ documentId: req.params.id });
    await User.findByIdAndUpdate(req.userId, { $inc: { documentCount: -1 } });
    res.json({ success: true, message: 'Permanently deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to permanently delete' });
  }
});

// GET /api/documents/:id/history
router.get('/:id/history', auth, async (req, res) => {
  try {
    const history = await EditHistory.find({ documentId: req.params.id, userId: req.userId })
      .sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, history });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch history' });
  }
});

module.exports = router;
