import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDocStore } from '../store/docStore';
import { useAuthStore } from '../store/authStore';
import {
  Plus, FileText, Trash2, Clock, BarChart2,
  Zap, TrendingUp, CheckCircle2, Eye, Search,
  ArrowRight, BookOpen, Sparkles, Activity
} from 'lucide-react';
import api from '../lib/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  draft:    { color: 'text-slate-400',  bg: 'bg-slate-400/10',  label: 'Draft' },
  analyzed: { color: 'text-amber-400',  bg: 'bg-amber-400/10',  label: 'Analyzed' },
  fixed:    { color: 'text-emerald-400', bg: 'bg-emerald-400/10', label: 'Fixed' },
  exported: { color: 'text-indigo-400', bg: 'bg-indigo-400/10', label: 'Exported' },
};

const timeAgo = (d) => {
  const diff = Date.now() - new Date(d);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};
const cardItem = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function Dashboard() {
  const { documents, stats, isLoading, fetchDocuments, fetchStats, createDocument, deleteDocument } = useDocStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [creating, setCreating] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [confirmDeleteDoc, setConfirmDeleteDoc] = useState(null);

  useEffect(() => {
    fetchDocuments();
    fetchStats();
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const { data } = await api.get('/analytics/overview');
      setAnalytics(data.analytics);
    } catch {}
  };

  const filtered = documents.filter(d => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
      (d.topic || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || d.status === filter;
    return matchSearch && matchFilter;
  });

  const handleCreate = async () => {
    setCreating(true);
    const doc = await createDocument({ title: 'Untitled Document', rawContent: '' });
    setCreating(false);
    if (doc) navigate(`/app/editor/${doc._id}`);
    else toast.error('Failed to create document');
  };

  const handleDelete = async (id) => {
    setConfirmDeleteDoc(null);
    const ok = await deleteDocument(id);
    if (ok) toast.success('Moved to trash');
    else toast.error('Failed to delete');
  };

  const statCards = [
    { label: 'Total Documents', value: stats?.total ?? '—', icon: FileText,   color: '#6366f1', glow: 'rgba(99,102,241,0.2)' },
    { label: 'In Progress',     value: stats?.drafts ?? '—', icon: Clock,      color: '#f59e0b', glow: 'rgba(245,158,11,0.2)' },
    { label: 'AI Fixed',        value: stats?.fixed ?? '—',  icon: CheckCircle2, color: '#10b981', glow: 'rgba(16,185,129,0.2)' },
    { label: 'Exported',        value: stats?.exported ?? '—', icon: TrendingUp, color: '#8b5cf6', glow: 'rgba(139,92,246,0.2)' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <p className="text-slate-500 text-sm mb-1">{greeting}, {user?.name?.split(' ')[0] || 'there'} 👋</p>
          <h1 className="font-display font-bold text-2xl text-white">Dashboard</h1>
        </div>
        <button onClick={handleCreate} disabled={creating} className="btn-primary">
          <Plus size={17} />
          {creating ? 'Creating...' : 'New Document'}
        </button>
      </motion.div>

      {/* Stats */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {statCards.map(({ label, value, icon: Icon, color, glow }) => (
          <motion.div key={label} variants={cardItem} className="stat-card">
            <div className="flex items-start justify-between mb-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: `${color}15`, border: `1px solid ${color}25`, boxShadow: `0 0 12px ${glow}` }}
              >
                <Icon size={18} style={{ color }} />
              </div>
            </div>
            <div className="text-2xl font-display font-bold text-white mb-0.5">{value}</div>
            <div className="text-xs text-slate-500">{label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Analytics Activity Strip */}
      {analytics?.dailyData && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-5 mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Activity size={15} className="text-indigo-400" />
            <span className="text-sm font-semibold text-white">Documents Created — Last 7 Days</span>
            {analytics.monthGrowth !== 0 && (
              <span
                className="ml-auto text-xs px-2 py-0.5 rounded-full"
                style={{
                  background: analytics.monthGrowth > 0 ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                  color: analytics.monthGrowth > 0 ? '#10b981' : '#ef4444',
                }}
              >
                {analytics.monthGrowth > 0 ? '+' : ''}{analytics.monthGrowth}% this month
              </span>
            )}
          </div>
          <div className="flex items-end gap-2 h-16">
            {analytics.dailyData.map((d, i) => {
              const maxVal = Math.max(...analytics.dailyData.map(x => x.count), 1);
              const height = d.count > 0 ? Math.max((d.count / maxVal) * 100, 15) : 8;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t transition-all"
                    style={{
                      height: `${height}%`,
                      background: d.count > 0
                        ? 'linear-gradient(to top, #6366f1, #8b5cf6)'
                        : 'rgba(148,163,184,0.08)',
                      minHeight: '4px',
                    }}
                    title={`${d.count} document${d.count !== 1 ? 's' : ''}`}
                  />
                  <span className="text-xs text-slate-600">{d.day}</span>
                </div>
              );
            })}
          </div>
          {analytics.totalWords > 0 && (
            <p className="text-xs text-slate-600 mt-3 text-right">
              Total words written: <span className="text-slate-400">{analytics.totalWords.toLocaleString()}</span>
            </p>
          )}
        </motion.div>
      )}

      {/* AI Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card p-5 mb-8 relative overflow-hidden cursor-pointer group"
        onClick={handleCreate}
        style={{ borderColor: 'rgba(99,102,241,0.2)' }}
      >
        <div className="absolute inset-0 opacity-5"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)' }} />
        <div className="relative flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 30px rgba(99,102,241,0.3)' }}
          >
            <Zap size={22} className="text-white animate-float" />
          </div>
          <div className="flex-1">
            <h3 className="font-display font-semibold text-white text-sm mb-0.5">Start with AI Assistance</h3>
            <p className="text-xs text-slate-400">Paste raw content → detect issues → auto-fix → export professional DOCX</p>
          </div>
          <div className="flex items-center gap-2 text-indigo-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
            Create Now <ArrowRight size={16} />
          </div>
        </div>
      </motion.div>

      {/* Documents */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <h2 className="font-display font-semibold text-white flex-1">Your Documents</h2>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="input-field text-sm pl-9 py-2 w-52"
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {['all', 'draft', 'analyzed', 'fixed', 'exported'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`tab-btn text-xs py-1.5 px-3 ${filter === f ? 'active' : ''}`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="glass-card p-5">
                <div className="skeleton h-4 w-3/4 mb-3" />
                <div className="skeleton h-3 w-1/2 mb-4" />
                <div className="skeleton h-3 w-full" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{ background: 'rgba(99,102,241,0.1)' }}>
              <BookOpen size={28} className="text-indigo-400" />
            </div>
            <h3 className="font-display font-semibold text-white mb-2">
              {search ? 'No documents found' : 'No documents yet'}
            </h3>
            <p className="text-slate-500 text-sm mb-5">
              {search ? 'Try a different search term' : 'Create your first AI-powered document'}
            </p>
            {!search && (
              <button onClick={handleCreate} className="btn-primary">
                <Plus size={16} /> Create Document
              </button>
            )}
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filtered.map(doc => {
              const sc = STATUS_COLORS[doc.status] || STATUS_COLORS.draft;
              return (
                <motion.div
                  key={doc._id}
                  variants={cardItem}
                  className="doc-card"
                  onClick={() => navigate(`/app/editor/${doc._id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`badge text-xs ${sc.color} ${sc.bg} border-0`}>{sc.label}</div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => { e.stopPropagation(); navigate(`/app/editor/${doc._id}`); }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/10 transition-all"
                      >
                        <Eye size={13} />
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setConfirmDeleteDoc(doc); }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                  <h3 className="font-semibold text-white text-sm mb-1 truncate group-hover:text-indigo-300 transition-colors">
                    {doc.title}
                  </h3>
                  {doc.topic && <p className="text-xs text-slate-500 mb-3 truncate">📌 {doc.topic}</p>}
                  <div
                    className="flex items-center justify-between text-xs text-slate-600 mt-auto pt-3"
                    style={{ borderTop: '1px solid rgba(148,163,184,0.06)' }}
                  >
                    <span className="flex items-center gap-1"><Clock size={11} />{timeAgo(doc.updatedAt)}</span>
                    {doc.wordCount > 0 && <span>{doc.wordCount.toLocaleString()} words</span>}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>

      {/* Delete Confirm Modal */}
      {confirmDeleteDoc && (
        <div className="permission-dialog">
          <div className="permission-dialog-card max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.12)' }}>
                <Trash2 size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Move to Trash?</h3>
                <p className="text-xs text-slate-500">You can restore it from History.</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-5">
              "<strong className="text-white">{confirmDeleteDoc.title}</strong>" will be moved to trash.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteDoc(null)} className="btn-secondary flex-1 justify-center py-2.5 text-sm">
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDeleteDoc._id)}
                className="flex-1 justify-center py-2.5 text-sm flex items-center gap-2 rounded-xl font-medium transition-all"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}
              >
                <Trash2 size={14} /> Move to Trash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
