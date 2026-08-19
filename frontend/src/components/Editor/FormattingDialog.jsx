import React, { useState } from 'react';
import { Palette, X, Check, Loader2 } from 'lucide-react';

const FONTS = ['Inter', 'Georgia', 'Times New Roman', 'Calibri', 'Arial', 'Roboto', 'Merriweather'];
const ALIGNMENTS = ['left', 'center', 'right', 'justify'];

export default function FormattingDialog({ onApply, onCancel, isRewriting }) {
  const [fmt, setFmt] = useState({
    font: 'Inter',
    headingSize: 24,
    headingColor: '#a5b4fc',
    h2Size: 20,
    h2Color: '#818cf8',
    bodySize: 14,
    bodyColor: '#cbd5e1',
    alignment: 'left',
    lineHeight: 1.65,
    paragraphGap: 10,
  });

  const set = (key, val) => setFmt(f => ({ ...f, [key]: val }));

  return (
    <div className="permission-dialog">
      <div className="permission-dialog-card max-w-lg w-full mx-4" style={{ borderColor: 'rgba(99,102,241,0.3)', maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <Palette size={18} className="text-indigo-400" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-white">Set Formatting Preferences</h3>
              <p className="text-xs text-slate-500">Choose how your document should look after AI rewrites it</p>
            </div>
          </div>
          <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Font Family */}
        <Section title="Font Family (All Text)">
          <select value={fmt.font} onChange={e => set('font', e.target.value)} className="input-field text-sm py-2">
            {FONTS.map(f => <option key={f} value={f}>{f}</option>)}
          </select>
        </Section>

        {/* Heading H1 */}
        <Section title="Heading 1 (Main Sections)">
          <div className="grid grid-cols-2 gap-3">
            <SizeSlider label="Size" value={fmt.headingSize} min={18} max={36}
              onChange={v => set('headingSize', v)} />
            <ColorPicker label="Color" value={fmt.headingColor}
              onChange={v => set('headingColor', v)} />
          </div>
          <Preview style={{ fontFamily: fmt.font, fontSize: `${fmt.headingSize}px`, color: fmt.headingColor, fontWeight: 800, lineHeight: 1.25 }}>
            Main Heading Example
          </Preview>
        </Section>

        {/* Heading H2 */}
        <Section title="Heading 2 (Subheadings)">
          <div className="grid grid-cols-2 gap-3">
            <SizeSlider label="Size" value={fmt.h2Size} min={14} max={28}
              onChange={v => set('h2Size', v)} />
            <ColorPicker label="Color" value={fmt.h2Color}
              onChange={v => set('h2Color', v)} />
          </div>
          <Preview style={{ fontFamily: fmt.font, fontSize: `${fmt.h2Size}px`, color: fmt.h2Color, fontWeight: 700, lineHeight: 1.3 }}>
            Subheading Example
          </Preview>
        </Section>

        {/* Body Text */}
        <Section title="Body Text">
          <div className="grid grid-cols-2 gap-3">
            <SizeSlider label="Size" value={fmt.bodySize} min={10} max={20}
              onChange={v => set('bodySize', v)} />
            <ColorPicker label="Color" value={fmt.bodyColor}
              onChange={v => set('bodyColor', v)} />
          </div>

          {/* Alignment */}
          <div className="mt-3">
            <label className="block text-xs text-slate-500 mb-1.5">Text Alignment</label>
            <div className="grid grid-cols-4 gap-1">
              {ALIGNMENTS.map(a => (
                <button key={a} onClick={() => set('alignment', a)}
                  className={`py-1.5 text-xs rounded-lg capitalize transition-all ${
                    fmt.alignment === a
                      ? 'text-white bg-indigo-500/20 border border-indigo-500/30'
                      : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                  }`}>
                  {a}
                </button>
              ))}
            </div>
          </div>

          <Preview style={{ fontFamily: fmt.font, fontSize: `${fmt.bodySize}px`, color: fmt.bodyColor, lineHeight: fmt.lineHeight, textAlign: fmt.alignment }}>
            The quick brown fox jumps over the lazy dog. This is how your body text will look in the document.
          </Preview>
        </Section>

        {/* Spacing */}
        <Section title="Spacing">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-500 block mb-1.5">
                Line Height: <span className="text-indigo-400 font-medium">{fmt.lineHeight}×</span>
              </label>
              <input type="range" min={1.2} max={2.5} step={0.05}
                value={fmt.lineHeight}
                onChange={e => set('lineHeight', parseFloat(e.target.value))}
                className="w-full accent-indigo-500" />
              <div className="flex justify-between text-xs text-slate-700 mt-0.5">
                <span>Tight</span><span>Wide</span>
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 block mb-1.5">
                Paragraph Gap: <span className="text-indigo-400 font-medium">{fmt.paragraphGap}px</span>
              </label>
              <input type="range" min={4} max={32} step={2}
                value={fmt.paragraphGap}
                onChange={e => set('paragraphGap', parseInt(e.target.value))}
                className="w-full accent-indigo-500" />
              <div className="flex justify-between text-xs text-slate-700 mt-0.5">
                <span>Compact</span><span>Spacious</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Actions */}
        <div className="flex gap-3 mt-5">
          <button onClick={onCancel} className="btn-secondary flex-1 justify-center text-sm py-2.5">
            <X size={14} /> Cancel
          </button>
          <button
            onClick={() => onApply(fmt)}
            disabled={isRewriting}
            className="btn-primary flex-1 justify-center text-sm py-2.5"
          >
            {isRewriting
              ? <><Loader2 size={14} className="animate-spin" /> Applying...</>
              : <><Check size={14} /> Apply & Rewrite</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="mb-4 pb-4" style={{ borderBottom: '1px solid rgba(148,163,184,0.08)' }}>
      <label className="block text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-2.5">{title}</label>
      {children}
    </div>
  );
}

function SizeSlider({ label, value, min, max, onChange }) {
  return (
    <div>
      <label className="text-xs text-slate-500 block mb-1">
        {label}: <span className="text-white font-medium">{value}px</span>
      </label>
      <input type="range" min={min} max={max} step={1}
        value={value} onChange={e => onChange(parseInt(e.target.value))}
        className="w-full accent-indigo-500" />
    </div>
  );
}

function ColorPicker({ label, value, onChange }) {
  return (
    <div>
      <label className="text-xs text-slate-500 block mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input type="color" value={value} onChange={e => onChange(e.target.value)}
          className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" />
        <span className="text-xs text-slate-400 font-mono">{value}</span>
      </div>
    </div>
  );
}

function Preview({ style, children }) {
  return (
    <div className="mt-2 p-2.5 rounded-lg" style={{ background: 'rgba(15,23,42,0.4)', border: '1px solid rgba(148,163,184,0.06)' }}>
      <p style={style}>{children}</p>
    </div>
  );
}
