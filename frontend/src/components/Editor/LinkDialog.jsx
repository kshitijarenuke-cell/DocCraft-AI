import React, { useState, useEffect, useRef } from 'react';
import { Link, ExternalLink, Unlink, X } from 'lucide-react';

export default function LinkDialog({ editor, onClose }) {
  const initialUrl = editor?.getAttributes('link')?.href || '';
  const [url, setUrl] = useState(initialUrl);
  const [openInNew, setOpenInNew] = useState(true);
  const inputRef = useRef(null);

  const hasLink = editor?.isActive('link');

  useEffect(() => { inputRef.current?.focus(); }, []);

  const apply = () => {
    if (!url.trim()) return;
    const href = url.startsWith('http') ? url : `https://${url}`;
    editor.chain().focus().extendMarkRange('link').setLink({
      href,
      target: openInNew ? '_blank' : null,
      rel: openInNew ? 'noopener noreferrer' : null,
    }).run();
    onClose();
  };

  const remove = () => {
    editor.chain().focus().extendMarkRange('link').unsetLink().run();
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') apply();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div className="link-dialog-backdrop" onClick={onClose}>
      <div className="link-dialog-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--bg-active)', border: '1px solid var(--border-focus)' }}>
              <Link size={14} style={{ color: 'var(--accent)' }} />
            </div>
            <span className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>
              {hasLink ? 'Edit Link' : 'Insert Link'}
            </span>
          </div>
          <button onClick={onClose} className="toolbar-btn">
            <X size={14} />
          </button>
        </div>

        {/* URL input */}
        <div className="mb-3">
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--text-secondary)' }}>URL</label>
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="https://example.com"
            className="input-field text-sm"
          />
        </div>

        {/* Open in new tab */}
        <label className="flex items-center gap-2 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={openInNew}
            onChange={e => setOpenInNew(e.target.checked)}
            className="w-3.5 h-3.5 rounded"
            style={{ accentColor: 'var(--accent)' }}
          />
          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            <ExternalLink size={11} className="inline mr-1" />
            Open in new tab
          </span>
        </label>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button onClick={apply} className="btn-primary flex-1 justify-center text-sm py-2">
            {hasLink ? 'Update' : 'Insert'}
          </button>
          {hasLink && (
            <button onClick={remove} className="btn-secondary text-sm py-2 px-3" title="Remove link">
              <Unlink size={14} />
            </button>
          )}
          <button onClick={onClose} className="btn-secondary text-sm py-2 px-3">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
