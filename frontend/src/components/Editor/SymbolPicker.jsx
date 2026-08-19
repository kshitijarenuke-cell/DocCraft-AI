import React, { useState, useRef, useEffect } from 'react';
import { X, Search } from 'lucide-react';

// ─── Symbol categories ─────────────────────────────────────────────────────

const SYMBOL_CATEGORIES = {
  'Common': ['©', '®', '™', '°', '§', '¶', '†', '‡', '•', '…', '—', '–', '«', '»', '‹', '›'],
  'Math': ['±', '×', '÷', '≠', '≤', '≥', '≈', '∞', '√', '∑', '∏', '∂', '∫', '∆', '∇', 'π', 'μ', 'Ω', '∈', '∉', '⊂', '⊃', '∩', '∪', '∀', '∃', '≡', '∝', '∠', '⊥'],
  'Arrows': ['←', '→', '↑', '↓', '↔', '↕', '⇐', '⇒', '⇑', '⇓', '⇔', '⇕', '↖', '↗', '↘', '↙', '↺', '↻', '⟵', '⟶', '⟷', '↦', '↤', '↥', '↧', '⟰', '⟱', '↰', '↱'],
  'Currency': ['$', '€', '£', '¥', '¢', '₹', '₩', '₿', '₣', '₤', '₦', '₨', '₫', '₭', '₮', '₯', '₱', '₲', '₴', '₵', '₸'],
  'Greek': ['α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ', 'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ', 'φ', 'χ', 'ψ', 'ω', 'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ'],
  'Geometric': ['■', '□', '▲', '△', '▼', '▽', '◆', '◇', '●', '○', '◎', '★', '☆', '✦', '✧', '▪', '▫', '▸', '▹', '◂', '◃', '◉', '◊', '⬛', '⬜', '🔶', '🔷'],
  'Misc': ['✓', '✗', '✔', '✘', '✕', '✖', '⚡', '⭐', '♠', '♣', '♥', '♦', '♪', '♫', '☀', '☁', '☂', '☃', '☎', '☐', '☑', '☒', '✉', '✂', '✒', '✏', '⌛', '⌚', '⌨', '⌥'],
};

export default function SymbolPicker({ onInsert, onClose }) {
  const [activeCategory, setActiveCategory] = useState('Common');
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  // Close on click outside
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, [onClose]);

  // Filter symbols by search
  const getSymbols = () => {
    if (search.trim()) {
      return Object.values(SYMBOL_CATEGORIES).flat().filter(s =>
        s.includes(search)
      );
    }
    return SYMBOL_CATEGORIES[activeCategory] || [];
  };

  const symbols = getSymbols();

  return (
    <div
      ref={ref}
      className="symbol-picker"
      onClick={e => e.stopPropagation()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b" style={{ borderColor: 'var(--border)' }}>
        <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Insert Symbol</span>
        <button onClick={onClose} className="toolbar-btn">
          <X size={14} />
        </button>
      </div>

      {/* Search */}
      <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-2 rounded-lg px-2.5 py-1.5" style={{ background: 'var(--bg-input)', border: '1px solid var(--border-input)' }}>
          <Search size={12} style={{ color: 'var(--text-faint)' }} />
          <input
            autoFocus
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search symbols…"
            className="text-xs bg-transparent outline-none flex-1"
            style={{ color: 'var(--text-primary)' }}
          />
        </div>
      </div>

      {/* Category tabs */}
      {!search && (
        <div className="flex overflow-x-auto px-2 py-1.5 gap-1 border-b" style={{ borderColor: 'var(--border)' }}>
          {Object.keys(SYMBOL_CATEGORIES).map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className="text-xs px-2 py-1 rounded whitespace-nowrap transition-all"
              style={{
                color: activeCategory === cat ? 'var(--accent)' : 'var(--text-faint)',
                background: activeCategory === cat ? 'var(--bg-active)' : 'transparent',
                fontWeight: activeCategory === cat ? 600 : 400,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Symbol grid */}
      <div className="p-2 overflow-y-auto" style={{ maxHeight: 200 }}>
        <div className="grid grid-cols-8 gap-1">
          {symbols.map((sym, i) => (
            <button
              key={`${sym}-${i}`}
              onClick={() => { onInsert(sym); onClose(); }}
              title={`U+${sym.codePointAt(0).toString(16).toUpperCase().padStart(4, '0')}`}
              className="w-8 h-8 text-base rounded flex items-center justify-center transition-all hover:scale-110"
              style={{
                color: 'var(--text-primary)',
                background: 'var(--bg-hover)',
                border: '1px solid var(--border-sm)',
              }}
            >
              {sym}
            </button>
          ))}
        </div>
        {symbols.length === 0 && (
          <p className="text-xs text-center py-4" style={{ color: 'var(--text-faint)' }}>No symbols found</p>
        )}
      </div>
    </div>
  );
}
