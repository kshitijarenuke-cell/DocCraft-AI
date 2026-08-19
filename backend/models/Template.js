const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: {
    type: String,
    enum: ['academic', 'business', 'creative', 'technical', 'personal'],
    default: 'general',
  },
  icon: { type: String, default: '📄' },
  content: { type: String, required: true },
  isBuiltIn: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  usageCount: { type: Number, default: 0 },
  tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Template', templateSchema);
