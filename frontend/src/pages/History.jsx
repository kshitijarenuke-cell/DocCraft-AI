import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History as HistoryIcon, Trash2, RotateCcw, FileText,
  Clock, AlertTriangle, CheckCircle2, RefreshCw, X,
  ExternalLink, Loader2, Edit3
} from 'lucide-react';
import { useDocStore } from '../store/docStore';
import toast from 'react-hot-toast';

const TIME_AGO = (d) => {
  if (!d) return '';
  const diff = Date.now() - new Date(d);
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(d).toLocaleDateString();
};

const STATUS_STYLE = {
  draft:     { color: '#94a3b8', label: 'Draft',    bg: 'rgba(148,163,184,0.1)' },
  analyzed:  { color: '#f59e0b', label: 'Analyzed', bg: 'rgba(245,158,11,0.1)' },
  fixed:     { color: '#8b5cf6', label: 'Fixed',    bg: 'rgba(139,92,246,0.1)' },
  exported:  { color: '#10b981', label: 'Exported', bg: 'rgba(16,185,129,0.1)' },
  deleted:   { color: '#ef4444', label: 'Deleted',  bg: 'rgba(239,68,68,0.1)' },
};

const ACTION_ICON = {
  created:  { icon: FileText, color: '#10b981', label: 'Created' },
  edited:   { icon: Edit3,    color: '#6366f1', label: 'Edited' },
  deleted:  { icon: Trash2,   color: '#ef4444', label: 'Deleted' },
  analyzed: { icon: AlertTriangle, color: '#f59e0b', label: 'Analyzed' },
  exported: { icon: CheckCircle2,  color: '#10b981', label: 'Exported' },
};

export default function History() {
  const navigate = useNavigate();
  const { documents, trashedDocuments, fetchDocuments, fetchTrashedDocuments, restoreDocument, permanentlyDeleteDocument, deleteDocument } = useDocStore();
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      await Promise.all([fetchDocuments(), fetchTrashedDocuments()]);
      setIsLoading(false);
    };
    load();
  }, []);

  const handleRestore = async (id, title) => {
    const ok = await restoreDocument(id);
    if (ok) toast.success(`"${title}" restored to Documents ✅`);
    else toast.error('Restore failed');
  };

  const handlePermanentDelete = async (id, title) => {
    setConfirmDelete(null);
    const ok = await permanentlyDeleteDocument(id);
    if (ok) toast.success(`"${title}" permanently deleted`);
    else toast.error('Delete failed');
  };

  const handleSoftDelete = async (id, title) => {
    const ok = await deleteDocument(id);
    if (ok) {
      toast.success(`"${title}" moved to trash`);
      await fetchTrashedDocuments();
    }
  };

  const allSorted = [...documents].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <HistoryIcon size={18} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-display font-bold text-white">History</h1>
            <p className="text-sm text-slate-500">All documents and deleted items</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card-sm p-1.5 flex gap-1 mb-6 w-fit">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'all' ? 'text-white bg-indigo-500/20 border border-indigo-500/30' : 'text-slate-400 hover:text-white'
          }`}>
          All Documents <span className="ml-1 text-xs opacity-60">({allSorted.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('trash')}
          className={`px-5 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
            activeTab === 'trash' ? 'text-white bg-red-500/20 border border-red-500/30' : 'text-slate-400 hover:text-white'
          }`}>
          <Trash2 size={13} /> Trash
          {trashedDocuments.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-red-500/30 text-red-300 text-xs font-bold">{trashedDocuments.length}</span>
          )}
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-indigo-400" />
        </div>
      ) : activeTab === 'all' ? (
        /* ALL DOCUMENTS TAB */
        allSorted.length === 0 ? (
          <EmptyState icon={FileText} title="No documents yet" subtitle="Create your first document to see it here" />
        ) : (
          <div className="space-y-3">
            {allSorted.map(doc => {
              const st = STATUS_STYLE[doc.status] || STATUS_STYLE.draft;
              return (
                <div key={doc._id} className="glass-card p-4 flex items-center gap-4 hover:border-indigo-500/20 transition-all group">
                  {/* Icon */}
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(99,102,241,0.1)' }}>
                    <FileText size={18} className="text-indigo-400" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="font-medium text-white truncate">{doc.title || 'Untitled'}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                        style={{ background: st.bg, color: st.color }}>
                        {st.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {doc.topic && <span className="truncate max-w-[200px]">{doc.topic}</span>}
                      {doc.topic && <span>·</span>}
                      <span className="flex items-center gap-1"><Clock size={10} /> {TIME_AGO(doc.updatedAt)}</span>
                      {doc.wordCount > 0 && <><span>·</span><span>{doc.wordCount} words</span></>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => navigate(`/app/editor/${doc._id}`)}
                      className="btn-secondary text-xs py-1.5 px-3">
                      <ExternalLink size={12} /> Open
                    </button>
                    <button onClick={() => handleSoftDelete(doc._id, doc.title)}
                      className="text-slate-600 hover:text-red-400 transition-colors p-1.5 rounded-lg hover:bg-red-500/10" title="Move to Trash">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* TRASH TAB */
        <div>
          {trashedDocuments.length === 0 ? (
            <EmptyState icon={Trash2} title="Trash is empty" subtitle="Deleted documents will appear here. You can restore or permanently delete them." />
          ) : (
            <>
              <div className="flex items-center gap-2 mb-4 px-1">
                <AlertTriangle size={14} className="text-amber-400" />
                <p className="text-xs text-slate-500">Documents in trash can be restored or permanently deleted.</p>
              </div>
              <div className="space-y-3">
                {trashedDocuments.map(doc => (
                  <div key={doc._id} className="glass-card p-4 flex items-center gap-4"
                    style={{ borderColor: 'rgba(239,68,68,0.12)', opacity: 0.85 }}>
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(239,68,68,0.08)' }}>
                      <FileText size={18} className="text-red-400" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-300 truncate line-through decoration-red-500/60">{doc.title || 'Untitled'}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-600 mt-0.5">
                        {doc.topic && <span>{doc.topic}</span>}
                        <span className="flex items-center gap-1">
                          <Trash2 size={10} /> Deleted {TIME_AGO(doc.deletedAt)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleRestore(doc._id, doc.title)}
                        className="btn-secondary text-xs py-1.5 px-3">
                        <RotateCcw size={12} /> Restore
                      </button>
                      <button
                        onClick={() => setConfirmDelete(doc)}
                        className="text-xs px-3 py-1.5 rounded-lg transition-all text-red-400 hover:bg-red-500/10 border border-red-500/20">
                        <X size={12} /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Permanent Delete Confirm Dialog */}
      {confirmDelete && (
        <div className="permission-dialog">
          <div className="permission-dialog-card max-w-sm w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(239,68,68,0.12)' }}>
                <AlertTriangle size={18} className="text-red-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Permanent Delete?</h3>
                <p className="text-xs text-slate-500">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-slate-400 mb-5">
              "<strong className="text-white">{confirmDelete.title}</strong>" will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1 justify-center py-2.5 text-sm">
                Cancel
              </button>
              <button
                onClick={() => handlePermanentDelete(confirmDelete._id, confirmDelete.title)}
                className="flex-1 justify-center py-2.5 text-sm flex items-center gap-2 rounded-xl font-medium transition-all"
                style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                <Trash2 size={14} /> Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, title, subtitle }) {
  return (
    <div className="text-center py-16 glass-card">
      <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
        style={{ background: 'rgba(99,102,241,0.1)' }}>
        <Icon size={24} className="text-indigo-400" />
      </div>
      <h3 className="font-display font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}
