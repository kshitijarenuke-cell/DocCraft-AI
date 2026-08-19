const mongoose = require('mongoose');

const editHistorySchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  action: {
    type: String,
    enum: ['created', 'edited', 'analyzed', 'fixed', 'image_added', 'diagram_added', 'exported', 'formatting_changed'],
    required: true,
  },
  version: { type: Number },
  changesSummary: { type: String },
  changes: {
    before: { type: String },
    after: { type: String },
    diff: { type: String },
  },
  metadata: {
    wordCountBefore: Number,
    wordCountAfter: Number,
    issuesFixed: Number,
    aiScore: Number,
  },
}, { timestamps: true });

module.exports = mongoose.model('EditHistory', editHistorySchema);
