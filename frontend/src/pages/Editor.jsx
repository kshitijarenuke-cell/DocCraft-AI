import React, { useEffect, useCallback, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import FontFamily from '@tiptap/extension-font-family';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Placeholder from '@tiptap/extension-placeholder';

import { ErrorMark } from '../extensions/ErrorMark';
import { useDocStore } from '../store/docStore';
import { useAuthStore } from '../store/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';

import {
  Save, Download, Scan, Loader2, ArrowLeft,
  Sparkles, AlertTriangle, X, FileText, BarChart3, Palette,
  FileDown, CheckCheck, CheckCircle2, XCircle, FlaskConical,
  Eraser, ImageIcon as ImageLucide
} from 'lucide-react';

// ─── New rich-editor components ────────────────────────────────────────────
import RichToolbar from '../components/Editor/RichToolbar';
import DocumentCanvas from '../components/Editor/DocumentCanvas';
import StatusBar from '../components/Editor/StatusBar';
import SymbolPicker from '../components/Editor/SymbolPicker';
import LinkDialog from '../components/Editor/LinkDialog';

// ─── Existing panel components (preserved) ────────────────────────────────
import DetectionPanel from '../components/Editor/DetectionPanel';
import FormattingPanel from '../components/Editor/FormattingPanel';
import FormattingDialog from '../components/Editor/FormattingDialog';
import ImageSearch from '../components/Editor/ImageSearch';
import DiagramPanel from '../components/Editor/DiagramPanel';

// ─── FontSize extension via TextStyle ─────────────────────────────────────
// TextStyle already supports arbitrary marks; we extend its parseHTML
// to also read `font-size` from inline style so it round-trips correctly.
import { Extension } from '@tiptap/core';
const FontSize = Extension.create({
  name: 'fontSize',
  addGlobalAttributes() {
    return [{
      types: ['textStyle'],
      attributes: {
        fontSize: {
          default: null,
          parseHTML: el => el.style.fontSize || null,
          renderHTML: attrs => attrs.fontSize ? { style: `font-size: ${attrs.fontSize}` } : {},
        },
      },
    }];
  },
});

const PANELS = [
  { id: 'ai',      label: 'AI Detect',  icon: Scan },
  { id: 'format',  label: 'Format',     icon: Palette },
  { id: 'images',  label: 'Images',     icon: ImageLucide },
  { id: 'diagram', label: 'Diagram',    icon: BarChart3 },
];

// ─── Utility: find text positions in TipTap doc ───────────────────────────
const findTextPositions = (editorState, searchText) => {
  const positions = [];
  const clean = searchText.toLowerCase().trim();
  if (clean.length < 4) return positions;
  editorState.doc.descendants((node, pos) => {
    if (!node.isText) return;
    const nodeClean = (node.text || '').toLowerCase();
    let start = 0;
    while (true) {
      const idx = nodeClean.indexOf(clean, start);
      if (idx === -1) break;
      positions.push({ from: pos + idx, to: pos + idx + clean.length });
      start = idx + 1;
      if (positions.length >= 2) break;
    }
  });
  return positions;
};

// ─── Markdown → HTML (for AI rewrite output) ─────────────────────────────
function markdownToHtml(md) {
  if (!md) return '';
  const lines = md.split('\n');
  const result = [];
  let inList = false;
  for (const line of lines) {
    if (/^# (.+)/.test(line)) {
      if (inList) { result.push('</ul>'); inList = false; }
      result.push(`<h1>${line.replace(/^# /, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</h1>`);
    } else if (/^## (.+)/.test(line)) {
      if (inList) { result.push('</ul>'); inList = false; }
      result.push(`<h2>${line.replace(/^## /, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</h2>`);
    } else if (/^### (.+)/.test(line)) {
      if (inList) { result.push('</ul>'); inList = false; }
      result.push(`<h3>${line.replace(/^### /, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')}</h3>`);
    } else if (/^[-*•] (.+)/.test(line)) {
      if (!inList) { result.push('<ul>'); inList = true; }
      const txt = line.replace(/^[-*•] /, '').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      result.push(`<li>${txt}</li>`);
    } else if (line.trim() === '') {
      if (inList) { result.push('</ul>'); inList = false; }
    } else {
      if (inList) { result.push('</ul>'); inList = false; }
      const formatted = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\*(.+?)\*/g, '<em>$1</em>');
      result.push(`<p>${formatted}</p>`);
    }
  }
  if (inList) result.push('</ul>');
  return result.join('');
}

// ══════════════════════════════════════════════════════════════════════════════
//  MAIN EDITOR COMPONENT
// ══════════════════════════════════════════════════════════════════════════════

export default function Editor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentDoc, fetchDocument, saveDocument, createDocument, fetchDocuments, isSaving } = useDocStore();
  const { user } = useAuthStore();

  // ── State ────────────────────────────────────────────────────────────────
  const [title, setTitle] = useState('Untitled Document');
  const [topic, setTopic] = useState('');
  const [activePanel, setActivePanel] = useState('ai');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isFinalChecking, setIsFinalChecking] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [finalCheckResult, setFinalCheckResult] = useState(null);
  const [hasHighlights, setHasHighlights] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [showFormattingDialog, setShowFormattingDialog] = useState(false);
  const [showSymbols, setShowSymbols] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [editorKey, setEditorKey] = useState(0); // forces re-render for status bar
  const [formatting, setFormatting] = useState({
    font: 'Inter', fontSize: 14, alignment: 'left',
    lineSpacing: 1.65, headingColor: '#a5b4fc', bodyColor: '#cbd5e1',
    margins: { top: 1080, bottom: 1080, left: 1440, right: 1440 },
  });
  const [savedDocId, setSavedDocId] = useState(null);
  const saveTimer = useRef(null);

  // ── TipTap Editor Setup ───────────────────────────────────────────────────
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: {},
        // strike, code, blockquote, codeBlock included by default
      }),
      Highlight.configure({ multicolor: true }),
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Subscript,
      Superscript,
      Image.configure({ inline: false, allowBase64: true }),
      Link.configure({ openOnClick: true, autolink: true }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: 'Start writing your document…' }),
      ErrorMark,
    ],
    content: '',
    editorProps: {
      attributes: { class: 'tiptap-editor focus:outline-none doc-editor-content' },
      handleKeyDown(view, event) {
        // Ctrl/Cmd+K → open link dialog
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
          event.preventDefault();
          setShowLinkDialog(true);
          return true;
        }
        // Ctrl/Cmd+S → save
        if ((event.ctrlKey || event.metaKey) && event.key === 's') {
          event.preventDefault();
          return false; // let handleSave fire from outside
        }
        return false;
      },
    },
    onUpdate: ({ editor }) => {
      scheduleSave(editor.getHTML());
      if (finalCheckResult) setFinalCheckResult(null);
      setEditorKey(k => k + 1); // trigger status bar re-render
    },
  });

  // ── Apply formatting CSS when formatting prefs change ──────────────────
  useEffect(() => {
    if (editor && editor.isEditable) {
      try {
        const el = editor.view.dom;
        if (el) {
          el.style.fontFamily = formatting.font;
          el.style.fontSize = `${formatting.fontSize}px`;
          el.style.lineHeight = String(formatting.lineSpacing);
        }
      } catch {}
    }
  }, [formatting.font, formatting.fontSize, formatting.lineSpacing, editor]);

  // ── Global Ctrl+S shortcut ─────────────────────────────────────────────
  useEffect(() => {
    const handleGlobalSave = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handleGlobalSave);
    return () => window.removeEventListener('keydown', handleGlobalSave);
  }, [savedDocId, title, topic]);

  // ── Load document ─────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (id && id !== 'new') {
        const doc = await fetchDocument(id);
        if (doc) {
          setSavedDocId(doc._id);
          setTitle(doc.title || 'Untitled Document');
          setTopic(doc.topic || '');
          if (doc.formatting) setFormatting(f => ({ ...f, ...doc.formatting }));
          if (editor && doc.processedContent) {
            editor.commands.setContent(doc.processedContent);
          }
          if (doc.detectedIssues?.length) {
            setDetectionResult({
              issues: doc.detectedIssues,
              aiScore: doc.aiScore || 0,
              summary: `${doc.detectedIssues.length} issues from last analysis`,
            });
          }
        }
      }
    };
    if (editor) load();
  }, [id, editor]);

  // ── Auto-save ─────────────────────────────────────────────────────────
  const scheduleSave = useCallback((content) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (savedDocId) autoSave(content);
    }, 3000);
  }, [savedDocId, title, topic]);

  const autoSave = async (content) => {
    await saveDocument(savedDocId, { title, topic, processedContent: content, formatting });
  };

  // ── Highlight helpers ─────────────────────────────────────────────────
  const applyHighlightsToEditor = useCallback((issues) => {
    if (!editor || !issues?.length) return;
    editor.commands.clearAllErrorMarks();
    let highlighted = 0;
    issues.forEach(issue => {
      const searchText = issue.lineText?.substring(0, 50);
      if (!searchText || searchText.length < 4) return;
      const positions = findTextPositions(editor.state, searchText);
      positions.forEach(({ from, to }) => {
        editor.chain()
          .setTextSelection({ from, to })
          .setErrorMark({
            errorType: issue.type || 'grammar',
            message: (issue.suggestion || issue.type || '').substring(0, 120),
          })
          .run();
        highlighted++;
      });
    });
    editor.commands.setTextSelection(0);
    setHasHighlights(highlighted > 0);
    if (highlighted > 0) toast(`${highlighted} issues highlighted in document`, { icon: '🔍' });
  }, [editor]);

  const clearHighlights = useCallback(() => {
    if (editor) {
      editor.commands.clearAllErrorMarks();
      setHasHighlights(false);
      toast.success('Highlights cleared');
    }
  }, [editor]);

  // ── Save ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const content = editor?.getHTML() || '';
    try {
      if (!savedDocId) {
        const doc = await createDocument({ title, topic, rawContent: content, processedContent: content, formatting });
        if (doc) {
          setSavedDocId(doc._id);
          navigate(`/app/editor/${doc._id}`, { replace: true });
          await fetchDocuments();
          toast.success('Document saved! ✅');
        }
      } else {
        await saveDocument(savedDocId, { title, topic, processedContent: content, formatting });
        await fetchDocuments();
        toast.success('Saved!');
      }
    } catch {
      toast.error('Save failed');
    }
  };

  // ── AI Analysis ────────────────────────────────────────────────────────
  const handleDetect = async () => {
    const content = editor?.getText() || '';
    if (content.trim().length < 20) { toast.error('Add some content first (min 20 characters)'); return; }
    setIsAnalyzing(true);
    setDetectionResult(null);
    setFinalCheckResult(null);
    clearHighlights();
    try {
      const { data } = await api.post('/ai/detect', { content, topic });
      setDetectionResult(data);
      if (data.issues?.length > 0) {
        applyHighlightsToEditor(data.issues);
        toast(`Found ${data.issues.length} issues — highlighted in document`, { icon: '⚠️' });
        setShowPermissionDialog(true);
      } else {
        toast.success('No major issues found! ✅');
      }
      if (savedDocId) {
        await saveDocument(savedDocId, { detectedIssues: data.issues, aiScore: data.aiScore, status: 'analyzed' });
      }
    } catch {
      toast.error('Analysis failed. Check backend connection.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ── Final deep check ───────────────────────────────────────────────────
  const handleFinalCheck = async () => {
    const content = editor?.getText() || '';
    if (content.trim().length < 20) { toast.error('Add content first'); return; }
    setIsFinalChecking(true);
    setFinalCheckResult(null);
    try {
      const { data } = await api.post('/ai/final-check', { content, topic });
      setFinalCheckResult(data);
      if (data.isPerfect) toast.success('Document is Perfect! ✅');
      else toast(`${data.remainingIssues?.length || 0} areas need attention`, { icon: '📋' });
    } catch {
      toast.error('Final check failed');
    } finally {
      setIsFinalChecking(false);
    }
  };

  // ── Allow & Fix → Smart Formatting ────────────────────────────────────
  const handleAllowFix = () => {
    setShowPermissionDialog(false);
    setShowFormattingDialog(true);
  };

  const handleRewriteWithFormatting = async (fmtPrefs) => {
    const content = editor?.getText() || '';
    if (content.trim().length < 20) { toast.error('Add content first'); return; }
    setIsRewriting(true);
    setShowFormattingDialog(false);
    clearHighlights();
    const newFormatting = {
      ...formatting,
      font: fmtPrefs.font,
      fontSize: fmtPrefs.bodySize,
      lineSpacing: fmtPrefs.lineHeight,
      alignment: fmtPrefs.alignment,
      headingColor: fmtPrefs.headingColor,
      bodyColor: fmtPrefs.bodyColor,
    };
    setFormatting(newFormatting);
    document.documentElement.style.setProperty('--editor-h1-color', fmtPrefs.headingColor);
    document.documentElement.style.setProperty('--editor-h2-color', fmtPrefs.h2Color || fmtPrefs.headingColor);
    document.documentElement.style.setProperty('--editor-body-color', fmtPrefs.bodyColor);
    document.documentElement.style.setProperty('--editor-line-height', String(fmtPrefs.lineHeight));
    document.documentElement.style.setProperty('--editor-p-gap', `${fmtPrefs.paragraphGap}px`);
    if (editor) {
      const el = editor.view.dom;
      el.style.fontFamily = fmtPrefs.font;
      el.style.fontSize = `${fmtPrefs.bodySize}px`;
      el.style.lineHeight = String(fmtPrefs.lineHeight);
    }
    try {
      const { data } = await api.post('/ai/rewrite', { content, topic, formatting: newFormatting });
      const html = markdownToHtml(data.rewritten);
      editor.commands.setContent(html);
      if (savedDocId) {
        await saveDocument(savedDocId, { processedContent: html, formatting: newFormatting, status: 'fixed', issuesFixed: true });
        await fetchDocuments();
      }
      toast.success('Content rewritten and formatted! ✨');
      setDetectionResult(null);
    } catch {
      toast.error('Rewrite failed. Check backend connection.');
    } finally {
      setIsRewriting(false);
    }
  };

  // ── Export ─────────────────────────────────────────────────────────────
  const handleExportDocx = async () => {
    const content = editor?.getText() || '';
    if (!content.trim()) { toast.error('Nothing to export'); return; }
    try {
      toast.loading('Generating DOCX...', { id: 'export' });
      const response = await api.post('/export/docx', { content, title, topic, formatting }, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data]));
      const a = document.createElement('a');
      a.href = url; a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.docx`; a.click();
      URL.revokeObjectURL(url);
      toast.success('DOCX exported!', { id: 'export' });
      if (savedDocId) saveDocument(savedDocId, { status: 'exported' });
    } catch { toast.error('Export failed', { id: 'export' }); }
  };

  const handleExportPdf = async () => {
    const content = editor?.getText() || '';
    if (!content.trim()) { toast.error('Nothing to export'); return; }
    try {
      toast.loading('Generating PDF...', { id: 'pdf' });
      const response = await api.post('/export/pdf', { content, title, topic, formatting }, { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const a = document.createElement('a');
      a.href = url; a.download = `${title.replace(/[^a-z0-9]/gi, '_')}.pdf`; a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF exported!', { id: 'pdf' });
    } catch { toast.error('PDF export failed', { id: 'pdf' }); }
  };

  // ── Insert helpers ────────────────────────────────────────────────────
  const insertImage = (url, alt) => {
    if (editor && url) editor.chain().focus().setImage({ src: url, alt: alt || 'Image' }).run();
  };

  const insertDiagram = (url, alt) => {
    if (editor && url) {
      editor.chain().focus().setImage({ src: url, alt: alt || 'Diagram' }).run();
      toast.success('Diagram inserted!');
    }
  };

  const insertSymbol = (sym) => {
    if (editor) editor.chain().focus().insertContent(sym).run();
  };

  // ── Loading state ─────────────────────────────────────────────────────
  if (!editor) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-indigo-400" size={32} />
    </div>
  );

  // ══════════════════════════════════════════════════════════════════════
  //  RENDER
  // ══════════════════════════════════════════════════════════════════════
  return (
    <div className="editor-root animate-fade-in">

      {/* ── Top Bar ── */}
      <div className="editor-topbar">
        <button onClick={() => navigate('/app/dashboard')} className="btn-ghost text-sm shrink-0">
          <ArrowLeft size={15} /> Back
        </button>

        {/* Title */}
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="editor-title-input"
          placeholder="Document title…"
        />

        {/* Topic */}
        <div className="editor-topic-area">
          <FileText size={13} className="shrink-0" style={{ color: 'var(--accent)' }} />
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            className="bg-transparent text-sm outline-none flex-1 min-w-0"
            style={{ color: 'var(--text-secondary)' }}
            placeholder="Topic (e.g. Climate Change)…"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {isSaving && <span className="text-xs flex items-center gap-1" style={{ color: 'var(--text-faint)' }}><Loader2 size={11} className="animate-spin" /> Saving…</span>}

          {hasHighlights && (
            <button onClick={clearHighlights} className="btn-ghost text-xs py-1.5 px-2.5" style={{ color: '#fbbf24' }}>
              <Eraser size={12} /> Clear
            </button>
          )}

          <button onClick={handleDetect} disabled={isAnalyzing} className="btn-secondary text-xs py-1.5 px-3">
            {isAnalyzing ? <><Loader2 size={12} className="animate-spin" /> Analyzing…</> : <><Scan size={12} /> Run Analysis</>}
          </button>
          <button onClick={handleFinalCheck} disabled={isFinalChecking} className="btn-secondary text-xs py-1.5 px-3">
            {isFinalChecking ? <><Loader2 size={12} className="animate-spin" /> Checking…</> : <><FlaskConical size={12} /> Analyze Content</>}
          </button>

          <button onClick={handleSave} className="btn-secondary text-sm py-2 px-3">
            <Save size={14} /> Save
          </button>
          <button onClick={handleExportDocx} className="btn-secondary text-sm py-2 px-3">
            <Download size={14} /> DOCX
          </button>
          <button onClick={handleExportPdf} className="btn-primary text-sm py-2 px-3">
            <FileDown size={14} /> PDF
          </button>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className="editor-layout">

        {/* ── Left: toolbar + canvas ── */}
        <div className="editor-main">

          {/* Rich Toolbar */}
          <div className="sticky top-0 z-20">
            <RichToolbar
              editor={editor}
              onOpenSymbols={() => setShowSymbols(s => !s)}
              onOpenLink={() => setShowLinkDialog(true)}
              onOpenImage={() => setActivePanel('images')}
            />
            {/* Symbol picker dropdown — attached below toolbar */}
            {showSymbols && (
              <div className="relative">
                <div className="absolute left-0 top-0 z-50">
                  <SymbolPicker onInsert={insertSymbol} onClose={() => setShowSymbols(false)} />
                </div>
              </div>
            )}
          </div>

          {/* Highlight legend */}
          {hasHighlights && (
            <div className="glass-card-sm px-3 py-2 flex items-center gap-4 flex-wrap text-xs mx-0">
              <span className="font-medium" style={{ color: 'var(--text-faint)' }}>Highlights:</span>
              {[
                { color: '#ef4444', label: 'Grammar', borderStyle: 'solid' },
                { color: '#f59e0b', label: 'Repetition/Format', borderStyle: 'dashed' },
                { color: '#8b5cf6', label: 'AI Phrase', borderStyle: 'dashed' },
                { color: '#6366f1', label: 'Structure', borderStyle: 'dotted' },
              ].map(({ color, label, borderStyle }) => (
                <span key={label} className="flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                  <span className="inline-block w-6 h-0" style={{ borderBottom: `2px ${borderStyle} ${color}` }} />
                  {label}
                </span>
              ))}
            </div>
          )}

          {/* Rewriting indicator */}
          {isRewriting && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl animate-pulse"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <Sparkles size={16} className="text-indigo-400" />
              <span className="text-sm text-indigo-300">AI is rewriting and formatting your document…</span>
            </div>
          )}

          {/* Document Canvas — A4 page */}
          <DocumentCanvas editor={editor} />

          {/* Status Bar */}
          <StatusBar editor={editor} key={editorKey} />
        </div>

        {/* ── Right Panel ── */}
        <div className="editor-panel">
          {/* Panel tabs */}
          <div className="glass-card-sm p-1.5 grid grid-cols-4 gap-1 shrink-0">
            {PANELS.map(({ id: pid, label, icon: Icon }) => (
              <button key={pid} onClick={() => setActivePanel(pid)}
                className={`flex flex-col items-center gap-1 py-2 rounded-lg text-xs transition-all duration-200 ${
                  activePanel === pid ? 'text-white font-medium' : 'text-slate-500 hover:text-slate-300'
                }`}
                style={activePanel === pid ? { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' } : {}}
              >
                <Icon size={15} />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {/* Final check result */}
          {finalCheckResult && (
            <FinalCheckCard result={finalCheckResult} onClose={() => setFinalCheckResult(null)} />
          )}

          {/* Panel content */}
          <div className="flex-1 overflow-y-auto">
            {activePanel === 'ai' && (
              <DetectionPanel
                result={detectionResult}
                isAnalyzing={isAnalyzing}
                onAnalyze={handleDetect}
                onRewrite={handleAllowFix}
                isRewriting={isRewriting}
                hasHighlights={hasHighlights}
                onClearHighlights={clearHighlights}
              />
            )}
            {activePanel === 'format' && (
              <FormattingPanel
                formatting={formatting}
                onChange={updates => setFormatting(f => ({ ...f, ...updates }))}
              />
            )}
            {activePanel === 'images' && (
              <ImageSearch topic={topic} onInsert={insertImage} />
            )}
            {activePanel === 'diagram' && (
              <DiagramPanel defaultTopic={topic} onInsert={insertDiagram} />
            )}
          </div>
        </div>
      </div>

      {/* ── Modals ── */}

      {/* Permission dialog */}
      {showPermissionDialog && (
        <PermissionDialog
          result={detectionResult}
          onAllow={handleAllowFix}
          onDeny={() => setShowPermissionDialog(false)}
        />
      )}

      {/* Formatting dialog */}
      {showFormattingDialog && (
        <FormattingDialog
          onApply={handleRewriteWithFormatting}
          onCancel={() => setShowFormattingDialog(false)}
          isRewriting={isRewriting}
        />
      )}

      {/* Link dialog */}
      {showLinkDialog && (
        <LinkDialog editor={editor} onClose={() => setShowLinkDialog(false)} />
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FinalCheckCard({ result, onClose }) {
  return (
    <div className="glass-card p-4 animate-fade-in shrink-0" style={{ border: `1px solid ${result.isPerfect ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}` }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {result.isPerfect
            ? <CheckCircle2 size={18} className="text-emerald-400" />
            : <AlertTriangle size={18} className="text-amber-400" />
          }
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{result.verdict}</span>
        </div>
        <button onClick={onClose} style={{ color: 'var(--text-faint)' }}><X size={14} /></button>
      </div>
      <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>{result.summary}</p>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 h-1.5 rounded-full" style={{ background: 'var(--bg-hover)' }}>
          <div className="h-1.5 rounded-full transition-all"
            style={{
              width: `${result.score}%`,
              background: result.score >= 80 ? '#10b981' : result.score >= 60 ? '#f59e0b' : '#ef4444'
            }} />
        </div>
        <span className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{result.score}%</span>
      </div>
      <div className="space-y-1 mb-3">
        {result.checks?.map((c, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            {c.passed ? <CheckCircle2 size={12} className="text-emerald-400 shrink-0" /> : <XCircle size={12} className="text-red-400 shrink-0" />}
            <span className="w-20 shrink-0" style={{ color: 'var(--text-faint)' }}>{c.category}</span>
            <span className="truncate" style={{ color: 'var(--text-secondary)' }}>{c.note}</span>
          </div>
        ))}
      </div>
      {result.remainingIssues?.length > 0 && (
        <div className="space-y-1">
          {result.remainingIssues.map((issue, i) => (
            <div key={i} className="text-xs px-2 py-1.5 rounded-lg" style={{ color: '#fbbf24', background: 'rgba(245,158,11,0.07)' }}>
              {issue.suggestion}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function PermissionDialog({ result, onAllow, onDeny }) {
  return (
    <div className="permission-dialog">
      <div className="permission-dialog-card">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-white text-base">Issues Detected</h3>
            <p className="text-slate-500 text-xs mt-0.5">{result?.issueCount} issues found — highlighted in your document</p>
          </div>
        </div>
        <div className="space-y-1.5 mb-4 max-h-44 overflow-y-auto">
          {result?.issues?.slice(0, 6).map((issue, i) => (
            <div key={i} className="rounded-lg p-2.5 text-xs"
              style={{ background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.1)' }}>
              {issue.lineNumber && <span className="text-slate-600 font-mono mr-1.5">Line {issue.lineNumber}:</span>}
              <span className="text-slate-400">{issue.suggestion || issue.text}</span>
            </div>
          ))}
          {result?.issues?.length > 6 && (
            <p className="text-xs text-slate-600 text-center">…and {result.issues.length - 6} more highlighted in document</p>
          )}
        </div>
        <div className="rounded-xl p-3 mb-4 text-xs text-slate-400"
          style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
          💡 Issues are underlined in your document — hover to see details. Click <strong className="text-white">Allow & Fix</strong> to set formatting and let AI rewrite the content.
        </div>
        <div className="flex gap-3">
          <button onClick={onDeny} className="btn-secondary flex-1 justify-center text-sm py-2.5">
            <X size={15} /> Keep Original
          </button>
          <button onClick={onAllow} className="btn-primary flex-1 justify-center text-sm py-2.5">
            <CheckCheck size={15} /> Allow & Fix →
          </button>
        </div>
      </div>
    </div>
  );
}
