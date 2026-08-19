const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const preferencesSchema = new mongoose.Schema({
  defaultFont: { type: String, default: 'Inter' },
  defaultFontSize: { type: Number, default: 16 },
  defaultAlignment: { type: String, default: 'left' },
  lineSpacing: { type: Number, default: 1.5 },
  theme: { type: String, enum: ['dark', 'light'], default: 'dark' },
  autoSave: { type: Boolean, default: true },
  autoSaveInterval: { type: Number, default: 30 },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email format'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  avatar: { type: String, default: null },
  preferences: { type: preferencesSchema, default: () => ({}) },
  isVerified: { type: Boolean, default: false },
  lastLogin: { type: Date, default: null },
  documentCount: { type: Number, default: 0 },
}, { timestamps: true });

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Transform output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
