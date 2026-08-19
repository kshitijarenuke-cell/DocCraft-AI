import React from 'react';
import {
  Scan, AlertTriangle, CheckCircle2, Sparkles, Loader2,
  RefreshCw, Info, FileText, Hash
} from 'lucide-react';

const ISSUE_ICONS = {
  ai_generated: '🤖',
  copied: '📋',
  repetition: '🔄',
  poor_structure: '📐',
  grammar: '✏️',
};

const TYPE_LABELS = {
  ai_generated: 'AI Language',
  repetition: 'Repetition',
  poor_structure: 'Structure',
  grammar: 'Grammar',
  copied: 'Copied',
};

const SEV_STYLE = {
  high: { pill: 'badge-danger', dot: '#ef4444', label: 'High' },
  medium: { pill: 'badge-warning', dot: '#f59e0b', label: 'Med' },
  low: { pill: 'badge-primary', dot: '#6366f1', label: 'Low' },
};

const groupByType = (issues) => {
  const groups = {};
  issues.forEach(issue => {
    const t = issue.type || 'grammar';
    if (!groups[t]) groups[t] = [];
    groups[t].push(issue);
  });
  return groups;
};

export default function DetectionPanel({ result, isAnalyzing, onAnalyze, onRewrite, isRewriting }) {
  const grouped = result?.issues ? groupByType(result.issues) : {};

  return (
    <div className="space-y-3">
      {/* AI Score */}
      {result && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">AI Score</span>
            <span className={`text-2xl font-display font-bold ${
              result.aiScore > 70 ? 'text-red-400' :
              result.aiScore > 40 ? 'text-amber-400' : 'text-emerald-400'
            }`}>{result.aiScore}%</span>
          </div>

          {/* Score bar */}
          <div className="w-full h-2 rounded-full mb-2" style={{ background: 'rgba(148,163,184,0.1)' }}>
            <div className="h-2 rounded-full transition-all duration-700"
              style={{
                width: `${result.aiScore}%`,
                background: result.aiScore > 70 ? 'linear-gradient(90deg,#ef4444,#dc2626)'
                  : result.aiScore > 40 ? 'linear-gradient(90deg,#f59e0b,#d97706)'
                  : 'linear-gradient(90deg,#10b981,#059669)',
              }} />
          </div>

          <p className="text-xs text-slate-500 mb-2">
            {result.aiScore > 70 ? '⚠️ High AI-generated likelihood' :
             result.aiScore > 40 ? '⚡ Moderate AI patterns' : '✅ Mostly human-written'}
          </p>

          {/* Issue type summary pills */}
          {result.issues?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {Object.entries(grouped).map(([type, arr]) => (
                <span key={type} className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)', color: '#a5b4fc' }}>
                  {ISSUE_ICONS[type]} {TYPE_LABELS[type]} ({arr.length})
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Summary */}
      {result?.summary && (
        <div className="glass-card-sm p-3 text-xs text-slate-400"
          style={{ borderLeft: '2px solid rgba(99,102,241,0.4)' }}>
          {result.summary}
        </div>
      )}

      {/* Detected Issues — grouped by type */}
      {result?.issues?.length > 0 && (
        <div className="glass-card p-4">
          <div className="panel-header">
            <AlertTriangle size={13} className="text-red-400" />
            <span className="panel-title">Issues Detected ({result.issues.length})</span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {Object.entries(grouped).map(([type, issues]) => (
              <div key={type}>
                {/* Group header */}
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="text-sm">{ISSUE_ICONS[type]}</span>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    {TYPE_LABELS[type]} — {issues.length} issue{issues.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {issues.map((issue, i) => {
                  const sev = SEV_STYLE[issue.severity] || SEV_STYLE.medium;
                  return (
                    <div key={i} className="rounded-lg p-2.5 mb-1.5 text-xs"
                      style={{ background: 'rgba(30,41,59,0.5)', border: '1px solid rgba(148,163,184,0.07)' }}>

                      {/* Line number + severity */}
                      <div className="flex items-center gap-2 mb-1">
                        {issue.lineNumber && (
                          <span className="flex items-center gap-0.5 text-slate-600 font-mono">
                            <Hash size={10} />{issue.lineNumber}
                          </span>
                        )}
                        <span className={`badge text-xs ${sev.pill}`}>{sev.label}</span>
                      </div>

                      {/* Line preview */}
                      {issue.lineText && (
                        <p className="text-slate-600 italic mb-1 font-mono text-xs truncate">
                          "{issue.lineText}"
                        </p>
                      )}

                      {/* Suggestion */}
                      <p className="text-slate-400 leading-relaxed">
                        {issue.suggestion || issue.text}
                      </p>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No issues — great */}
      {result && result.issues?.length === 0 && (
        <div className="glass-card p-5 text-center">
          <CheckCircle2 size={32} className="text-emerald-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-white">Content looks great!</p>
          <p className="text-xs text-slate-500 mt-1">No issues detected.</p>
        </div>
      )}

      {/* Empty state */}
      {!result && !isAnalyzing && (
        <div className="glass-card p-5 text-center">
          <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.1)' }}>
            <Scan size={22} className="text-indigo-400" />
          </div>
          <p className="text-sm font-medium text-white mb-1">Run Analysis</p>
          <p className="text-xs text-slate-500 mb-4">
            Checks grammar, capitalization, structure, repetition, and AI-generated phrases line-by-line
          </p>
          <button onClick={onAnalyze} className="btn-primary text-xs py-2 w-full justify-center">
            <Scan size={13} /> Run Analysis
          </button>
        </div>
      )}

      {/* Loading state */}
      {isAnalyzing && (
        <div className="glass-card p-5 text-center">
          <Loader2 size={24} className="animate-spin text-indigo-400 mx-auto mb-3" />
          <p className="text-sm text-slate-300 mb-3">Analyzing content...</p>
          <div className="space-y-1.5 text-left">
            {['Checking grammar & capitalization...', 'Detecting AI phrases...', 'Scanning for repetitions...', 'Evaluating structure...'].map((s, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                <div className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: '#6366f1', animationDelay: `${i * 200}ms` }} />
                {s}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {result && (
        <div className="space-y-2">
          {result.issues?.length > 0 && (
            <button onClick={onRewrite} disabled={isRewriting}
              className="btn-primary w-full justify-center text-sm py-2.5">
              {isRewriting
                ? <><Loader2 size={14} className="animate-spin" /> Rewriting...</>
                : <><Sparkles size={14} /> Allow & Fix Issues</>
              }
            </button>
          )}
          <button onClick={onAnalyze} disabled={isAnalyzing}
            className="btn-secondary w-full justify-center text-sm py-2">
            <RefreshCw size={13} /> Re-analyze
          </button>
        </div>
      )}

      <div className="glass-card-sm p-3">
        <div className="flex items-start gap-2 text-xs text-slate-500">
          <Info size={11} className="text-indigo-400 mt-0.5 flex-shrink-0" />
          <p>Line numbers shown for each issue. Add OpenAI key for deeper AI analysis.</p>
        </div>
      </div>
    </div>
  );
}
