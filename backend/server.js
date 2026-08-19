const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

dotenv.config();

const app = express();

// ─── Track DB connection state ────────────────────────────────────────────
let dbConnected = false;
app.locals.isDbReady = () => dbConnected;

// ─── Security Middleware ───────────────────────────────────────────────────
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false,
}));

// ─── Custom Mongo Sanitize (compatible with Express 5) ────────────────────
const sanitizeValue = (val) => {
  if (typeof val === 'string') return val.replace(/\$/g, '').replace(/\./g, ' ');
  if (val && typeof val === 'object' && !Array.isArray(val)) {
    return Object.keys(val).reduce((acc, key) => {
      if (!key.startsWith('$')) acc[key] = sanitizeValue(val[key]);
      return acc;
    }, {});
  }
  if (Array.isArray(val)) return val.map(sanitizeValue);
  return val;
};
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeValue(req.body);
  }
  next();
});


// ─── Rate Limiting ─────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many auth attempts. Try again in 15 minutes.' },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'AI rate limit reached. Please wait a moment.' },
});

app.use(globalLimiter);

// ─── CORS ─────────────────────────────────────────────────────────────────
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = [
      process.env.CLIENT_URL || 'http://localhost:5173',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://localhost:5176',
      'http://localhost:3000',
    ];
    if (!origin || allowedOrigins.includes(origin) || /^http:\/\/localhost:\d+$/.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// ─── Routes ──────────────────────────────────────────────────────────────
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/ai', aiLimiter, require('./routes/ai'));
app.use('/api/images', require('./routes/images'));
app.use('/api/export', require('./routes/export'));
app.use('/api/templates', require('./routes/templates'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/search', require('./routes/search'));

// ─── Health check ─────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    db: dbConnected ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development',
  });
});

// ─── Global Error Handler ─────────────────────────────────────────────────
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ─── 404 ──────────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ─── MongoDB + Server Start ───────────────────────────────────────────────
const PORT = process.env.PORT || 4000;

mongoose.set('bufferCommands', false);

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/doccraft', {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 10000,
})
  .then(() => {
    dbConnected = true;
    console.log('✅ MongoDB connected');
    app.listen(PORT, () => {
      console.log(`🚀 DocCraft AI v2.0 running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  })
  .catch((err) => {
    dbConnected = false;
    console.error('❌ MongoDB connection error:', err.message);
    console.log('⚠️  Starting server without MongoDB...');
    app.listen(PORT, () => {
      console.log(`🚀 DocCraft AI v2.0 running on port ${PORT} (no DB)`);
    });
  });

mongoose.connection.on('disconnected', () => { dbConnected = false; console.warn('⚠️ MongoDB disconnected'); });
mongoose.connection.on('reconnected', () => { dbConnected = true; console.log('✅ MongoDB reconnected'); });

module.exports = app;
