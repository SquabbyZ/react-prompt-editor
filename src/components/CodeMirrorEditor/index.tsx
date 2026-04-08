import { markdown } from '@codemirror/lang-markdown';
import CodeMirror from '@uiw/react-codemirror';
import React, { forwardRef, memo, useImperativeHandle, useRef } from 'react';
import { getCodeMirrorPhrases } from '../../i18n/codemirror';
import { defaultLocale } from '../../i18n/types';
import { CodeMirrorEditorProps } from './CodeMirrorEditor.types';

export interface CodeMirrorRef {
  view: any;
}

export const CodeMirrorEditor = memo(
  forwardRef<CodeMirrorRef, CodeMirrorEditorProps>(
    (
      {
        value,
        onChange,
        isReadOnly = false,
        placeholder = 'Enter markdown content...',
        className,
        style,
        locale = defaultLocale,
      },
      ref,
    ) => {
      const cmRef = useRef<any>(null);

      // 获取 CodeMirror 国际化配置
      const phrases = getCodeMirrorPhrases(locale);

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
          className={`min-h-[200px] w-full overflow-hidden rounded-lg ${className || ''}`}
          style={style}
          basicSetup={{
            lineNumbers: false,
            foldGutter: false,
            highlightActiveLine: true,
            highlightSelectionMatches: true,
          }}
          // CodeMirror 搜索框国际化配置
          // @ts-ignore - phrases 是 CodeMirror 支持的配置项
          phrases={phrases}
        />
      );
    },
  ),
);
