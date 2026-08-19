import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, FileX, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #070d1a 0%, #0f172a 60%, #1a0533 100%)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        {/* 404 Number */}
        <div className="relative mb-8">
          <div
            className="text-9xl font-display font-black select-none"
            style={{
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              opacity: 0.3,
              lineHeight: 1,
            }}
          >
            404
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center"
          >
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}
            >
              <FileX size={36} className="text-indigo-400" />
            </div>
          </div>
        </div>

        <h1 className="font-display font-bold text-2xl text-white mb-3">
          Page Not Found
        </h1>
        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex items-center justify-center gap-3">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <Home size={15} />
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: 'rgba(30,41,59,0.7)',
              border: '1px solid rgba(148,163,184,0.1)',
              color: '#94a3b8',
            }}
          >
            <ArrowLeft size={15} />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
}
