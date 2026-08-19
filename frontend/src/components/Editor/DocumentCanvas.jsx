import React from 'react';
import { EditorContent } from '@tiptap/react';

/**
 * DocumentCanvas — A4 paper-style wrapper around the TipTap EditorContent.
 * Gives the editor a professional "document page" feel like Google Docs / Word.
 */
export default function DocumentCanvas({ editor }) {
  return (
    <div className="doc-canvas-outer">
      <div className="doc-canvas-page">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
