import { markdown } from '@codemirror/lang-markdown';
import CodeMirror from '@uiw/react-codemirror';
import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import { CodeMirrorEditorProps } from './CodeMirrorEditor.types';

export interface CodeMirrorRef {
  view: any;
}

export const CodeMirrorEditor = forwardRef<
  CodeMirrorRef,
  CodeMirrorEditorProps
>(
  (
    {
      value,
      onChange,
      isReadOnly = false,
      placeholder = 'Enter markdown content...',
      className,
      style,
    },
    ref,
  ) => {
    const cmRef = useRef<any>(null);

    useImperativeHandle(ref, () => ({
      get view() {
        return cmRef.current?.view;
      },
    }));

    return (
      <CodeMirror
        ref={cmRef}
        value={value}
        height="200px"
        extensions={[markdown()]}
        onChange={(val) => onChange?.(val)}
        editable={!isReadOnly}
        placeholder={placeholder}
        className={`min-h-[200px] w-full overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700 ${className || ''}`}
        style={style}
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
        }}
      />
    );
  },
);
