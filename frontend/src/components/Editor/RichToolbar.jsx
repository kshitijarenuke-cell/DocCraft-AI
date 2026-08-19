import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, Subscript, Superscript,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Indent, Outdent,
  Link, Image as ImageIcon, Table, Minus, Type,
  Undo2, Redo2, ChevronDown, Palette, Highlighter,
  LetterText
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

export const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Courier New', value: '"Courier New", monospace' },
  { label: 'Roboto', value: 'Roboto, sans-serif' },
  { label: 'Poppins', value: 'Poppins, sans-serif' },
  { label: 'Montserrat', value: 'Montserrat, sans-serif' },
  { label: 'Lora', value: 'Lora, serif' },
  { label: 'Merriweather', value: 'Merriweather, serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'Oswald', value: 'Oswald, sans-serif' },
];

export const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72];

export const PARAGRAPH_STYLES = [
  { label: 'Normal text', tag: 'paragraph', level: null },
  { label: 'Heading 1', tag: 'heading', level: 1 },
  { label: 'Heading 2', tag: 'heading', level: 2 },
  { label: 'Heading 3', tag: 'heading', level: 3 },
  { label: 'Heading 4', tag: 'heading', level: 4 },
  { label: 'Quote', tag: 'blockquote', level: null },
  { label: 'Code Block', tag: 'codeBlock', level: null },
];

export const LINE_SPACINGS = [
  { label: 'Single (1.0)', value: '1' },
  { label: '1.15', value: '1.15' },
  { label: '1.5', value: '1.5' },
  { label: 'Double (2.0)', value: '2' },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Divider() {
  return <div className="toolbar-divider" />;
}

function ToolBtn({ onClick, active, title, disabled, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`toolbar-btn ${active ? 'toolbar-btn-active' : ''} ${disabled ? 'toolbar-btn-disabled' : ''}`}
    >
      {children}
    </button>
  );
}

// ─── Dropdown wrapper ─────────────────────────────────────────────────────────
function Dropdown({ trigger, children, width = 180 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(o => !o)}>{trigger}</div>
      {open && (
        <div
          className="toolbar-dropdown"
          style={{ minWidth: width }}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Paragraph Style Dropdown ─────────────────────────────────────────────────
function ParagraphStyleDropdown({ editor }) {
  const getActiveLabel = () => {
    if (editor.isActive('heading', { level: 1 })) return 'Heading 1';
    if (editor.isActive('heading', { level: 2 })) return 'Heading 2';
    if (editor.isActive('heading', { level: 3 })) return 'Heading 3';
    if (editor.isActive('heading', { level: 4 })) return 'Heading 4';
    if (editor.isActive('blockquote')) return 'Quote';
    if (editor.isActive('codeBlock')) return 'Code Block';
    return 'Normal text';
  };

  const applyStyle = (style) => {
    const chain = editor.chain().focus();
    if (style.tag === 'paragraph') chain.setParagraph().run();
    else if (style.tag === 'heading') chain.toggleHeading({ level: style.level }).run();
    else if (style.tag === 'blockquote') chain.toggleBlockquote().run();
    else if (style.tag === 'codeBlock') chain.toggleCodeBlock().run();
  };

  const sizeMap = { 'Heading 1': '2em', 'Heading 2': '1.5em', 'Heading 3': '1.25em', 'Heading 4': '1.1em' };

  return (
    <Dropdown width={180} trigger={
      <button className="toolbar-select" style={{ width: 150 }}>
        <span className="truncate text-xs font-medium">{getActiveLabel()}</span>
        <ChevronDown size={11} />
      </button>
    }>
      {PARAGRAPH_STYLES.map(style => (
        <button
          key={style.label}
          onClick={() => applyStyle(style)}
          className="toolbar-dropdown-item"
          style={{ fontSize: sizeMap[style.label] || '0.875rem', fontWeight: style.label.startsWith('Heading') ? '700' : '400' }}
        >
          {style.label}
        </button>
      ))}
    </Dropdown>
  );
}

// ─── Font Family Dropdown ─────────────────────────────────────────────────────
function FontFamilyDropdown({ editor }) {
  const current = FONT_FAMILIES.find(f => editor.isActive('textStyle', { fontFamily: f.value }))?.label || 'Font';

  return (
    <Dropdown width={200} trigger={
      <button className="toolbar-select" style={{ width: 140 }}>
        <span className="truncate text-xs">{current}</span>
        <ChevronDown size={11} />
      </button>
    }>
      {FONT_FAMILIES.map(font => (
        <button
          key={font.label}
          onClick={() => font.value
            ? editor.chain().focus().setFontFamily(font.value).run()
            : editor.chain().focus().unsetFontFamily().run()
          }
          className="toolbar-dropdown-item"
          style={{ fontFamily: font.value || 'inherit' }}
        >
          {font.label}
        </button>
      ))}
    </Dropdown>
  );
}

// ─── Font Size Dropdown ───────────────────────────────────────────────────────
function FontSizeDropdown({ editor }) {
  const [customSize, setCustomSize] = useState('');
  const currentAttr = editor.getAttributes('textStyle')?.fontSize;
  const current = currentAttr ? parseInt(currentAttr) : 14;

  const applySize = (size) => {
    editor.chain().focus().setMark('textStyle', { fontSize: `${size}px` }).run();
  };

  return (
    <Dropdown width={120} trigger={
      <button className="toolbar-select" style={{ width: 64 }}>
        <span className="text-xs">{current}</span>
        <ChevronDown size={11} />
      </button>
    }>
      <div className="p-2 border-b border-white/10">
        <input
          type="number"
          value={customSize}
          placeholder="Custom…"
          onChange={e => setCustomSize(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && customSize) applySize(parseInt(customSize)); }}
          className="w-full text-xs bg-transparent border border-white/15 rounded px-2 py-1 text-white outline-none"
          style={{ color: 'var(--text-primary)', background: 'var(--bg-input)' }}
        />
      </div>
      {FONT_SIZES.map(size => (
        <button
          key={size}
          onClick={() => applySize(size)}
          className={`toolbar-dropdown-item ${current === size ? 'toolbar-dropdown-item-active' : ''}`}
        >
          {size}
        </button>
      ))}
    </Dropdown>
  );
}

// ─── Color Picker Button ──────────────────────────────────────────────────────
function ColorPicker({ icon: Icon, title, onColor, currentColor, isHighlight = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const inputRef = useRef(null);

  const PRESET_COLORS = [
    '#000000', '#374151', '#6b7280', '#9ca3af', '#ffffff',
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#06b6d4', '#3b82f6', '#6366f1',
    '#8b5cf6', '#ec4899', '#f43f5e',
  ];

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        title={title}
        onClick={() => setOpen(o => !o)}
        className="toolbar-btn flex flex-col items-center gap-0.5 px-1.5"
        style={{ height: 30, minWidth: 28 }}
      >
        <Icon size={12} />
        <div className="w-4 h-1 rounded-sm" style={{ background: currentColor || (isHighlight ? '#fde68a' : '#f1f5f9') }} />
      </button>
      {open && (
        <div className="toolbar-dropdown p-2" style={{ minWidth: 160 }}>
          <div className="grid grid-cols-6 gap-1 mb-2">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => { onColor(c); setOpen(false); }}
                className="w-5 h-5 rounded border border-white/10 hover:scale-110 transition-transform"
                style={{ background: c }}
                title={c}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            <input ref={inputRef} type="color" defaultValue={currentColor || '#ffffff'}
              onChange={e => onColor(e.target.value)}
              className="w-7 h-7 rounded cursor-pointer border-0 bg-transparent"
            />
            <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Custom</span>
          </div>
          {isHighlight && (
            <button onClick={() => { onColor(null); setOpen(false); }} className="toolbar-dropdown-item text-xs mt-1">
              Remove highlight
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Line Spacing Dropdown ────────────────────────────────────────────────────
function LineSpacingDropdown({ editor }) {
  return (
    <Dropdown width={160} trigger={
      <ToolBtn title="Line spacing">
        <LetterText size={14} />
      </ToolBtn>
    }>
      <div className="px-3 py-2 text-xs font-semibold" style={{ color: 'var(--text-faint)' }}>Line Spacing</div>
      {LINE_SPACINGS.map(({ label, value }) => (
        <button key={value}
          onClick={() => {
            const el = editor.view.dom;
            if (el) el.style.lineHeight = value;
          }}
          className="toolbar-dropdown-item"
        >
          {label}
        </button>
      ))}
    </Dropdown>
  );
}

// ─── Table Picker ─────────────────────────────────────────────────────────────
function TablePicker({ editor }) {
  const [hover, setHover] = useState({ r: 0, c: 0 });
  const ROWS = 8, COLS = 10;

  return (
    <Dropdown width={240} trigger={
      <ToolBtn title="Insert table">
        <Table size={14} />
      </ToolBtn>
    }>
      <div className="p-3">
        <p className="text-xs mb-2 font-medium" style={{ color: 'var(--text-faint)' }}>
          {hover.r > 0 ? `${hover.r} × ${hover.c} table` : 'Insert table'}
        </p>
        <div className="grid" style={{ gridTemplateColumns: `repeat(${COLS}, 20px)`, gap: 2 }}>
          {Array.from({ length: ROWS * COLS }).map((_, i) => {
            const r = Math.floor(i / COLS) + 1, c = (i % COLS) + 1;
            const active = r <= hover.r && c <= hover.c;
            return (
              <div
                key={i}
                onMouseEnter={() => setHover({ r, c })}
                onClick={() => {
                  editor.chain().focus().insertTable({ rows: hover.r, cols: hover.c, withHeaderRow: true }).run();
                }}
                className="w-5 h-5 rounded-sm border cursor-pointer transition-all"
                style={{
                  background: active ? 'rgba(99,102,241,0.3)' : 'var(--bg-hover)',
                  borderColor: active ? 'rgba(99,102,241,0.5)' : 'var(--border)',
                }}
              />
            );
          })}
        </div>
      </div>
    </Dropdown>
  );
}

// ─── Main RichToolbar Component ───────────────────────────────────────────────
export default function RichToolbar({ editor, onOpenSymbols, onOpenLink, onOpenImage }) {
  if (!editor) return null;

  const [textColor, setTextColor] = useState('#f1f5f9');
  const [hlColor, setHlColor] = useState('#fde68a');

  const applyTextColor = useCallback((color) => {
    setTextColor(color);
    editor.chain().focus().setColor(color).run();
  }, [editor]);

  const applyHighlight = useCallback((color) => {
    setHlColor(color || '#fde68a');
    if (color) editor.chain().focus().setHighlight({ color }).run();
    else editor.chain().focus().unsetHighlight().run();
  }, [editor]);

  return (
    <div className="rich-toolbar">
      {/* Row 1 */}
      <div className="toolbar-row">
        {/* Undo / Redo */}
        <ToolBtn onClick={() => editor.chain().focus().undo().run()} title="Undo (Ctrl+Z)" disabled={!editor.can().undo()}>
          <Undo2 size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().redo().run()} title="Redo (Ctrl+Y)" disabled={!editor.can().redo()}>
          <Redo2 size={14} />
        </ToolBtn>

        <Divider />

        {/* Paragraph Style */}
        <ParagraphStyleDropdown editor={editor} />

        <Divider />

        {/* Font Family */}
        <FontFamilyDropdown editor={editor} />

        {/* Font Size */}
        <FontSizeDropdown editor={editor} />

        <Divider />

        {/* Bold / Italic / Underline / Strike */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)">
          <Bold size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)">
          <Italic size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)">
          <Underline size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subscript">
          <Subscript size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superscript">
          <Superscript size={14} />
        </ToolBtn>

        <Divider />

        {/* Colors */}
        <ColorPicker
          icon={Palette}
          title="Text color"
          currentColor={textColor}
          onColor={applyTextColor}
        />
        <ColorPicker
          icon={Highlighter}
          title="Highlight color"
          currentColor={hlColor}
          onColor={applyHighlight}
          isHighlight
        />

        <Divider />

        {/* Alignment */}
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left">
          <AlignLeft size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Center">
          <AlignCenter size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right">
          <AlignRight size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify">
          <AlignJustify size={14} />
        </ToolBtn>

        <Divider />

        {/* Lists */}
        <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
          <List size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered list">
          <ListOrdered size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().sinkListItem('listItem').run()} title="Increase indent">
          <Indent size={14} />
        </ToolBtn>
        <ToolBtn onClick={() => editor.chain().focus().liftListItem('listItem').run()} title="Decrease indent">
          <Outdent size={14} />
        </ToolBtn>

        <Divider />

        {/* Line spacing */}
        <LineSpacingDropdown editor={editor} />

        <Divider />

        {/* Insert controls */}
        <ToolBtn onClick={onOpenLink} title="Insert link (Ctrl+K)">
          <Link size={14} />
        </ToolBtn>
        <ToolBtn onClick={onOpenImage} title="Insert image">
          <ImageIcon size={14} />
        </ToolBtn>
        <TablePicker editor={editor} />
        <ToolBtn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal rule">
          <Minus size={14} />
        </ToolBtn>
        <ToolBtn onClick={onOpenSymbols} title="Insert symbol">
          <Type size={14} />
        </ToolBtn>
      </div>
    </div>
  );
}
