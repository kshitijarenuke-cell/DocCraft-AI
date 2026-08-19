import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Layout, Plus, Search, BookOpen, Briefcase, GraduationCap,
  User, FileText, Loader2, Star, ArrowRight, Trash2, ChevronRight
} from 'lucide-react';
import api from '../lib/api';
import { useDocStore } from '../store/docStore';
import toast from 'react-hot-toast';

const CATEGORY_ICONS = {
  academic: GraduationCap,
  business: Briefcase,
  personal: User,
  technical: FileText,
  creative: Star,
  all: Layout,
};

const CATEGORY_COLORS = {
  academic: { color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
  business: { color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
  personal: { color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  technical: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  creative: { color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
};

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function Templates() {
  const navigate = useNavigate();
  const { createDocument } = useDocStore();
  const [templates, setTemplates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [usingId, setUsingId] = useState(null);

  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/templates', { params: category !== 'all' ? { category } : {} });
      setTemplates(data.templates || []);
    } catch {
      toast.error('Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  }, [category]);

  useEffect(() => { fetchTemplates(); }, [fetchTemplates]);

  const handleUseTemplate = async (template) => {
    setUsingId(template._id);
    try {
      // Mark usage
      await api.post(`/templates/${template._id}/use`);
      // Create new doc from template content
      const doc = await createDocument({
        title: template.name,
        rawContent: template.content,
        processedContent: template.content,
        topic: template.description || template.name,
      });
      if (doc) {
        toast.success(`Opening "${template.name}"...`);
        navigate(`/app/editor/${doc._id}`);
      } else {
        toast.error('Failed to create document from template');
      }
    } catch {
      toast.error('Failed to use template');
    } finally {
      setUsingId(null);
    }
  };

  const handleDeleteTemplate = async (template) => {
    if (!confirm(`Delete "${template.name}"?`)) return;
    try {
      await api.delete(`/templates/${template._id}`);
      setTemplates(prev => prev.filter(t => t._id !== template._id));
      toast.success('Template deleted');
    } catch {
      toast.error('Failed to delete template');
    }
  };

  const categories = ['all', 'academic', 'business', 'personal', 'technical', 'creative'];

  const filtered = templates.filter(t =>
    !search ||
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    (t.description || '').toLowerCase().includes(search.toLowerCase()) ||
    (t.tags || []).some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
      >
        <div>
          <p className="text-slate-500 text-sm mb-1">Ready-to-use document structures</p>
          <h1 className="font-display font-bold text-2xl text-white">Templates</h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search templates..."
              className="input-field text-sm pl-9 py-2 w-52"
            />
          </div>
        </div>
      </motion.div>

      {/* Category Tabs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 flex-wrap mb-6"
      >
        {categories.map(cat => {
          const Icon = CATEGORY_ICONS[cat] || Layout;
          const isActive = category === cat;
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
              style={isActive ? {
                background: 'rgba(99,102,241,0.2)',
                border: '1px solid rgba(99,102,241,0.3)',
              } : {
                background: 'rgba(30,41,59,0.4)',
                border: '1px solid rgba(148,163,184,0.08)',
              }}
            >
              <Icon size={14} />
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          );
        })}
      </motion.div>

      {/* Templates Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card p-5">
              <div className="skeleton h-10 w-10 rounded-xl mb-4" />
              <div className="skeleton h-4 w-2/3 mb-2" />
              <div className="skeleton h-3 w-full mb-1" />
              <div className="skeleton h-3 w-4/5" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-16 text-center"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ background: 'rgba(99,102,241,0.1)' }}>
            <BookOpen size={28} className="text-indigo-400" />
          </div>
          <h3 className="font-display font-semibold text-white mb-2">No templates found</h3>
          <p className="text-slate-500 text-sm">Try a different search or category</p>
        </motion.div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filtered.map(template => {
            const catStyle = CATEGORY_COLORS[template.category] || CATEGORY_COLORS.business;
            const CatIcon = CATEGORY_ICONS[template.category] || FileText;
            const isUsing = usingId === template._id;

            return (
              <motion.div
                key={template._id}
                variants={item}
                className="glass-card p-5 group flex flex-col relative overflow-hidden cursor-pointer hover:border-indigo-500/25 transition-all duration-300"
                style={{ height: '100%' }}
              >
                {/* Built-in badge */}
                {template.isBuiltIn && (
                  <div className="absolute top-3 right-3">
                    <span className="text-xs px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc', border: '1px solid rgba(99,102,241,0.2)' }}>
                      Built-in
                    </span>
                  </div>
                )}

                {/* Icon + Category */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: catStyle.bg, border: `1px solid ${catStyle.color}25` }}
                  >
                    {template.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <CatIcon size={11} style={{ color: catStyle.color }} />
                      <span className="text-xs capitalize" style={{ color: catStyle.color }}>
                        {template.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Name + Description */}
                <h3 className="font-display font-semibold text-white text-sm mb-2 group-hover:text-indigo-300 transition-colors pr-14">
                  {template.name}
                </h3>
                {template.description && (
                  <p className="text-xs text-slate-500 mb-4 leading-relaxed flex-1">
                    {template.description}
                  </p>
                )}

                {/* Tags */}
                {template.tags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {template.tags.slice(0, 3).map(tag => (
                      <span key={tag}
                        className="text-xs px-2 py-0.5 rounded-full text-slate-500"
                        style={{ background: 'rgba(148,163,184,0.07)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-3"
                  style={{ borderTop: '1px solid rgba(148,163,184,0.07)' }}>
                  {template.usageCount > 0 && (
                    <span className="text-xs text-slate-600">
                      Used {template.usageCount}×
                    </span>
                  )}
                  <div className="flex items-center gap-2 ml-auto">
                    {!template.isBuiltIn && (
                      <button
                        onClick={() => handleDeleteTemplate(template)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        title="Delete template"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                    <button
                      onClick={() => handleUseTemplate(template)}
                      disabled={isUsing}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                      style={{
                        background: 'rgba(99,102,241,0.15)',
                        border: '1px solid rgba(99,102,241,0.25)',
                        color: '#a5b4fc',
                      }}
                    >
                      {isUsing ? (
                        <><Loader2 size={12} className="animate-spin" /> Opening...</>
                      ) : (
                        <>Use <ArrowRight size={12} /></>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Stats footer */}
      {!isLoading && filtered.length > 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-slate-600 mt-6"
        >
          {filtered.length} template{filtered.length !== 1 ? 's' : ''} available
        </motion.p>
      )}
    </div>
  );
}
