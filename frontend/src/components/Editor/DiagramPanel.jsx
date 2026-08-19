import React, { useState, useEffect, useRef } from 'react';
import { BarChart3, Loader2, Plus, RefreshCw, Code2, Search } from 'lucide-react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

// Initialize mermaid lazily
let mermaidLoaded = false;
let mermaidLib = null;

const initMermaid = async () => {
  if (mermaidLoaded) return mermaidLib;
  const m = await import('mermaid');
  mermaidLib = m.default;
  mermaidLib.initialize({
    startOnLoad: false,
    theme: 'dark',
    themeVariables: {
      primaryColor: '#6366f1',
      primaryTextColor: '#f1f5f9',
      primaryBorderColor: '#818cf8',
      lineColor: '#94a3b8',
      secondaryColor: '#1e293b',
      background: '#0f172a',
      mainBkg: '#1e293b',
      fontFamily: 'Inter, sans-serif',
      fontSize: '13px',
    },
    flowchart: { curve: 'basis', htmlLabels: false },
  });
  mermaidLoaded = true;
  return mermaidLib;
};

const TYPES = [
  { value: 'flowchart', label: 'Flowchart', emoji: '📊' },
  { value: 'mindmap', label: 'Mind Map', emoji: '🧠' },
  { value: 'sequence', label: 'Sequence', emoji: '🔄' },
];

export default function DiagramPanel({ defaultTopic, onInsert }) {
  const [diagramType, setDiagramType] = useState('flowchart');
  const [topic, setTopic] = useState(defaultTopic || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [mermaidCode, setMermaidCode] = useState('');
  const [svgContent, setSvgContent] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [renderError, setRenderError] = useState('');
  const uid = useRef(0);

  // Update topic when parent changes it
  useEffect(() => {
    if (defaultTopic && !topic) setTopic(defaultTopic);
  }, [defaultTopic]);

  const renderDiagram = async (code) => {
    if (!code) return;
    setRenderError('');
    try {
      const m = await initMermaid();
      uid.current += 1;
      const id = `mermaid-${Date.now()}-${uid.current}`;
      const { svg } = await m.render(id, code);
      setSvgContent(svg);
    } catch (err) {
      console.error('Mermaid render error:', err);
      setRenderError('Diagram syntax error. Try regenerating.');
      setSvgContent('');
    }
  };

  const generate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic for the diagram');
      return;
    }
    setIsGenerating(true);
    setSvgContent('');
    setRenderError('');
    try {
      const { data } = await api.post('/ai/diagram', {
        topic: topic.trim(),
        diagramType,
      });
      setMermaidCode(data.mermaidCode);
      await renderDiagram(data.mermaidCode);
      toast.success('Diagram generated!');
    } catch (err) {
      toast.error('Diagram generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsert = () => {
    if (!svgContent) {
      toast.error('Generate a diagram first');
      return;
    }
    // Convert SVG to a proper data URI that TipTap can handle
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(svgBlob);
    onInsert(url, `${diagramType} diagram: ${topic}`);
    toast.success('Diagram inserted into document!');
  };

  const handleCodeChange = async (val) => {
    setMermaidCode(val);
    try {
      await renderDiagram(val);
    } catch {}
  };

  return (
    <div className="glass-card p-4 space-y-4">
      <div className="panel-header">
        <BarChart3 size={14} className="text-indigo-400" />
        <span className="panel-title">Diagram Generator</span>
      </div>

      {/* Topic Input */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">
          What topic should the diagram be about?
        </label>
        <div className="flex gap-2">
          <input
            value={topic}
            onChange={e => setTopic(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generate()}
            placeholder="e.g. Indian Constitution, Water Cycle..."
            className="input-field text-xs py-2 flex-1"
          />
        </div>
      </div>

      {/* Diagram Type */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-1.5">Diagram Type</label>
        <div className="grid grid-cols-3 gap-1">
          {TYPES.map(({ value, label, emoji }) => (
            <button
              key={value}
              onClick={() => setDiagramType(value)}
              className={`py-2 text-xs rounded-lg transition-all flex flex-col items-center gap-1 ${
                diagramType === value
                  ? 'text-white bg-indigo-500/20 border border-indigo-500/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <span>{emoji}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={generate}
        disabled={isGenerating}
        className="btn-primary w-full justify-center text-sm py-2.5"
      >
        {isGenerating
          ? <><Loader2 size={14} className="animate-spin" /> Generating...</>
          : <><BarChart3 size={14} /> Generate Diagram</>
        }
      </button>

      {/* Render Error */}
      {renderError && (
        <div className="text-xs text-red-400 p-2 rounded-lg"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
          ⚠️ {renderError}
        </div>
      )}

      {/* Preview */}
      {svgContent && !renderError && (
        <div className="space-y-3 animate-fade-in">
          <div className="mermaid-container overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: svgContent }} />

          <div className="flex gap-2">
            <button onClick={handleInsert} className="btn-primary flex-1 justify-center text-xs py-2">
              <Plus size={13} /> Insert into Doc
            </button>
            <button onClick={generate} disabled={isGenerating} className="btn-secondary text-xs py-2 px-3" title="Regenerate">
              <RefreshCw size={13} />
            </button>
            <button onClick={() => setShowCode(s => !s)} className="btn-secondary text-xs py-2 px-3" title="View code">
              <Code2 size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Code Editor */}
      {showCode && mermaidCode && (
        <div className="animate-fade-in">
          <label className="block text-xs font-medium text-slate-500 mb-1">Edit Mermaid Code</label>
          <textarea
            value={mermaidCode}
            onChange={e => handleCodeChange(e.target.value)}
            className="input-field text-xs font-mono resize-none h-40"
            spellCheck={false}
          />
        </div>
      )}

      {/* Empty State */}
      {!svgContent && !isGenerating && !renderError && (
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.1)' }}>
            <BarChart3 size={22} className="text-indigo-400" />
          </div>
          <p className="text-xs text-slate-500">Enter a topic above and click Generate</p>
        </div>
      )}

      <p className="text-xs text-slate-600 text-center">Powered by Mermaid.js · AI-generated</p>
    </div>
  );
}
