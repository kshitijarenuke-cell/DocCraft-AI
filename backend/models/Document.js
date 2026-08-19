const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
  version: { type: Number },
  content: { type: String },
  processedContent: { type: String },
  timestamp: { type: Date, default: Date.now },
  changesSummary: { type: String },
}, { _id: false });

const imageSchema = new mongoose.Schema({
  id: { type: String },
  url: { type: String },
  thumb: { type: String },
  alt: { type: String },
  photographer: { type: String },
  source: { type: String, enum: ['unsplash', 'pexels'] },
}, { _id: false });

const formattingSchema = new mongoose.Schema({
  font: { type: String, default: 'Inter' },
  fontSize: { type: Number, default: 16 },
  alignment: { type: String, default: 'left' },
  lineSpacing: { type: Number, default: 1.5 },
  margins: {
    top: { type: Number, default: 72 },
    bottom: { type: Number, default: 72 },
    left: { type: Number, default: 72 },
    right: { type: Number, default: 72 },
  },
  headingColor: { type: String, default: '#1e293b' },
  bodyColor: { type: String, default: '#374151' },
}, { _id: false });

const issueSchema = new mongoose.Schema({
  type: { type: String, enum: ['ai_generated', 'copied', 'repetition', 'poor_structure', 'grammar'] },
  text: { type: String },
  position: { start: Number, end: Number },
  severity: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  suggestion: { type: String },
}, { _id: false });

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters'],
    default: 'Untitled Document',
  },
  topic: {
    type: String,
    trim: true,
    maxlength: [200, 'Topic cannot exceed 200 characters'],
  },
  rawContent: { type: String, default: '' },
  processedContent: { type: String, default: '' },
  status: {
    type: String,
    enum: ['draft', 'analyzed', 'fixed', 'exported', 'deleted'],
    default: 'draft',
  },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date, default: null },
  aiScore: { type: Number, min: 0, max: 100, default: null },
  detectedIssues: [issueSchema],
  issuesFixed: { type: Boolean, default: false },
  formatting: { type: formattingSchema, default: () => ({}) },
  insertedImages: [imageSchema],
  diagramCode: { type: String, default: null },
  diagramType: { type: String, default: null },
  versions: [versionSchema],
  currentVersion: { type: Number, default: 1 },
  wordCount: { type: Number, default: 0 },
  tags: [{ type: String, trim: true }],
  isPublic: { type: Boolean, default: false },
  exportedAt: { type: Date, default: null },
  lastEditedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Auto-update word count
documentSchema.pre('save', function () {
  const content = this.processedContent || this.rawContent || '';
  this.wordCount = content.split(/\s+/).filter(Boolean).length;
  this.lastEditedAt = new Date();
});

module.exports = mongoose.model('Document', documentSchema);
