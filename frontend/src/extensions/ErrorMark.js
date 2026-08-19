import { Mark } from '@tiptap/core';

/**
 * Custom TipTap Mark — adds colored underlines for detected issues
 * Types: grammar (red wavy), formatting (yellow dashed), ai_generated (purple), poor_structure (blue), repetition (orange)
 */
export const ErrorMark = Mark.create({
  name: 'errorMark',
  priority: 900,
  keepOnSplit: false,
  inclusive: false,

  addAttributes() {
    return {
      errorType: { default: 'grammar' },
      message: { default: '' },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-error-type]' }];
  },

  renderHTML({ mark }) {
    const styles = {
      grammar:       'border-bottom: 2px solid #ef4444; background: rgba(239,68,68,0.10); padding: 0 1px; border-radius: 1px; cursor: help;',
      repetition:    'border-bottom: 2px dashed #f59e0b; background: rgba(245,158,11,0.10); padding: 0 1px; border-radius: 1px; cursor: help;',
      ai_generated:  'border-bottom: 2px dashed #8b5cf6; background: rgba(139,92,246,0.10); padding: 0 1px; border-radius: 1px; cursor: help;',
      poor_structure:'border-bottom: 2px dotted #6366f1; background: rgba(99,102,241,0.10); padding: 0 1px; border-radius: 1px; cursor: help;',
      formatting:    'border-bottom: 2px dashed #f59e0b; background: rgba(245,158,11,0.10); padding: 0 1px; border-radius: 1px; cursor: help;',
    };
    const style = styles[mark.attrs.errorType] || styles.grammar;
    return [
      'span',
      {
        'data-error-type': mark.attrs.errorType,
        title: mark.attrs.message,
        style,
      },
      0,
    ];
  },

  addCommands() {
    return {
      setErrorMark: (attrs) => ({ commands }) => commands.setMark(this.name, attrs),
      unsetErrorMark: () => ({ commands }) => commands.unsetMark(this.name),
      clearAllErrorMarks: () => ({ tr, state, dispatch }) => {
        const { from, to } = { from: 0, to: state.doc.content.size };
        const markType = state.schema.marks.errorMark;
        if (markType && dispatch) {
          dispatch(tr.removeMark(from, to, markType));
        }
        return true;
      },
    };
  },
});
