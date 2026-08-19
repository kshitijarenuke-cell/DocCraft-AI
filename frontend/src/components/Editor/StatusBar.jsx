import React from 'react';
import { Globe } from 'lucide-react';

export default function StatusBar({ editor }) {
  if (!editor) return null;

  const text = editor.getText();
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;
  // Rough page estimate: ~500 words per page
  const pages = Math.max(1, Math.ceil(words / 500));

  return (
    <div className="status-bar">
      <div className="flex items-center gap-4">
        <span>
          Page <strong>{pages}</strong>
        </span>
        <span>
          <strong>{words.toLocaleString()}</strong> words
        </span>
        <span>
          <strong>{chars.toLocaleString()}</strong> characters
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <Globe size={11} />
          English (US)
        </span>
      </div>
    </div>
  );
}
