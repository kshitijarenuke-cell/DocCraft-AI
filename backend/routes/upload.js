const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const path = require('path');

const router = express.Router();

// Memory storage — process in RAM, no disk writes needed
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['.docx', '.txt', '.pdf'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only DOCX, PDF, and TXT files are supported'), false);
    }
  },
});

// POST /api/upload — extract text content from uploaded file
router.post('/', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    let extractedText = '';
    let title = path.basename(req.file.originalname, ext);

    if (ext === '.txt') {
      extractedText = req.file.buffer.toString('utf-8');
    } else if (ext === '.docx') {
      try {
        const mammoth = require('mammoth');
        const result = await mammoth.extractRawText({ buffer: req.file.buffer });
        extractedText = result.value;
      } catch (e) {
        return res.status(422).json({ success: false, message: 'Could not parse DOCX file. Ensure it is a valid Word document.' });
      }
    } else if (ext === '.pdf') {
      try {
        const pdfParse = require('pdf-parse');
        const data = await pdfParse(req.file.buffer);
        extractedText = data.text;
      } catch (e) {
        return res.status(422).json({ success: false, message: 'Could not parse PDF file.' });
      }
    }

    if (!extractedText || extractedText.trim().length < 10) {
      return res.status(422).json({ success: false, message: 'File appears to be empty or unreadable.' });
    }

    // Clean up excessive whitespace
    extractedText = extractedText
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    res.json({
      success: true,
      content: extractedText,
      title,
      wordCount: extractedText.split(/\s+/).filter(Boolean).length,
      fileType: ext.replace('.', '').toUpperCase(),
      fileSize: req.file.size,
    });
  } catch (err) {
    if (err.message?.includes('Only DOCX')) {
      return res.status(400).json({ success: false, message: err.message });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Maximum size is 10MB.' });
    }
    console.error('Upload error:', err);
    res.status(500).json({ success: false, message: 'File processing failed' });
  }
});

module.exports = router;
