import React from 'react';
import { Palette, Type, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';

const FONTS = ['Inter', 'Georgia', 'Times New Roman', 'Calibri', 'Arial', 'Roboto', 'Merriweather'];
const FONT_SIZES = [10, 11, 12, 14, 16, 18, 20, 24];

export default function FormattingPanel({ formatting, onChange }) {
  return (
    <div className="glass-card p-4 space-y-5">
      <div className="panel-header">
        <Palette size={14} className="text-indigo-400" />
        <span className="panel-title">Formatting Options</span>
      </div>

      {/* Font Family */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Font Family</label>
        <select
          value={formatting.font}
          onChange={e => onChange({ font: e.target.value })}
          className="input-field text-sm py-2"
        >
          {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Font Size */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">
          Font Size <span className="text-indigo-400">{formatting.fontSize}px</span>
        </label>
        <div className="grid grid-cols-4 gap-1">
          {FONT_SIZES.map(s => (
            <button
              key={s}
              onClick={() => onChange({ fontSize: s })}
              className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                formatting.fontSize === s
                  ? 'text-white bg-indigo-500/20 border border-indigo-500/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Text Alignment */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Alignment</label>
        <div className="grid grid-cols-4 gap-1">
          {[
            { val: 'left', Icon: AlignLeft, label: 'Left' },
            { val: 'center', Icon: AlignCenter, label: 'Center' },
            { val: 'right', Icon: AlignRight, label: 'Right' },
            { val: 'justify', Icon: AlignJustify, label: 'Justify' },
          ].map(({ val, Icon, label }) => (
            <button
              key={val}
              onClick={() => onChange({ alignment: val })}
              title={label}
              className={`py-2 rounded-lg flex items-center justify-center transition-all ${
                formatting.alignment === val
                  ? 'text-white bg-indigo-500/20 border border-indigo-500/30'
                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>
      </div>

      {/* Line Spacing */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">
          Line Spacing <span className="text-indigo-400">{formatting.lineSpacing}×</span>
        </label>
        <input
          type="range"
          min={1}
          max={3}
          step={0.1}
          value={formatting.lineSpacing}
          onChange={e => onChange({ lineSpacing: parseFloat(e.target.value) })}
          className="w-full accent-indigo-500"
        />
        <div className="flex justify-between text-xs text-slate-600 mt-1">
          <span>Tight (1×)</span><span>Normal (1.5×)</span><span>Wide (3×)</span>
        </div>
      </div>

      {/* Colors */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Colors (for DOCX export)</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-slate-600 mb-1">Heading Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formatting.headingColor}
                onChange={e => onChange({ headingColor: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs text-slate-400 font-mono">{formatting.headingColor}</span>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-600 mb-1">Body Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={formatting.bodyColor}
                onChange={e => onChange({ bodyColor: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs text-slate-400 font-mono">{formatting.bodyColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Margins */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Margins (DOCX)</label>
        <div className="grid grid-cols-2 gap-2">
          {['top', 'bottom', 'left', 'right'].map(side => (
            <div key={side}>
              <label className="text-xs text-slate-600 capitalize mb-1 block">{side}</label>
              <input
                type="number"
                min={0}
                max={200}
                value={formatting.margins?.[side] || 72}
                onChange={e => onChange({ margins: { ...formatting.margins, [side]: parseInt(e.target.value) } })}
                className="input-field text-xs py-1.5"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Preview */}
      <div>
        <label className="block text-xs font-medium text-slate-400 mb-2">Preview</label>
        <div className="rounded-xl p-4" style={{ background: 'rgba(248,250,252,0.04)' }}>
          <p style={{
            fontFamily: formatting.font,
            fontSize: `${Math.max(10, formatting.fontSize * 0.75)}px`,
            textAlign: formatting.alignment,
            lineHeight: formatting.lineSpacing,
            color: '#cbd5e1',
          }}>
            The quick brown fox jumps over the lazy dog. This is a sample text to preview your formatting choices before applying them to your document.
          </p>
        </div>
      </div>
    </div>
  );
}
