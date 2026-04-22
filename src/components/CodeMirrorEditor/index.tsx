import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/theme/material-darker.css';
import 'codemirror/addon/search/search';
import 'codemirror/addon/search/searchcursor';
import 'codemirror/addon/dialog/dialog';
import 'codemirror/addon/dialog/dialog.css';

import CodeMirror from 'codemirror';
import React, {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { UnControlled as ReactCodeMirror } from 'react-codemirror2';
import { createTranslator, defaultLocale } from '../../i18n/types';
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
        placeholder,
        minHeight = '100px',
        maxHeight = '400px',
        className,
        style,
        locale = defaultLocale,
        theme = 'system',
      },
      ref,
    ) => {
      const editorRef = useRef<CodeMirror.EditorFromTextArea | CodeMirror.Editor | null>(null);
      const [isDarkMode, setIsDarkMode] = useState(false);

      const t = createTranslator(locale);
      const defaultPlaceholder = placeholder || t('codemirror.placeholder');

      useEffect(() => {
        const checkDarkMode = () => {
          let isDark = false;
          if (theme === 'light') {
            isDark = false;
          } else if (theme === 'dark') {
            isDark = true;
          } else {
            const htmlElement = document.documentElement;
            isDark =
              htmlElement.classList.contains('dark') ||
              htmlElement.getAttribute('data-theme') === 'dark' ||
              window.matchMedia('(prefers-color-scheme: dark)').matches;
          }
          setIsDarkMode(isDark);
        };

        checkDarkMode();

        if (theme === 'system') {
          const observer = new MutationObserver(checkDarkMode);
          observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class', 'data-theme'],
          });
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          mediaQuery.addEventListener('change', checkDarkMode);
          return () => {
            observer.disconnect();
            mediaQuery.removeEventListener('change', checkDarkMode);
          };
        }
      }, [theme]);

      useImperativeHandle(ref, () => ({
        get view() {
          return {
            dispatch: ({ changes, selection }: any) => {
              const editor = editorRef.current;
              if (!editor) return;
              if (changes) {
                const from = editor.posFromIndex(changes.from);
                const to = changes.to != null ? editor.posFromIndex(changes.to) : from;
                editor.replaceRange(changes.insert || '', from, to);
              }
              if (selection?.anchor != null) {
                const cursor = editor.posFromIndex(selection.anchor);
                editor.setCursor(cursor);
              }
            },
            state: {
              doc: {
                length: editorRef.current?.getValue().length || 0,
              },
              selection: {
                main: (() => {
                  const editor = editorRef.current;
                  if (!editor) return { from: 0, to: 0, empty: true };
                  const fromPos = editor.getCursor('from');
                  const toPos = editor.getCursor('to');
                  const from = editor.indexFromPos(fromPos);
                  const to = editor.indexFromPos(toPos);
                  return {
                    from,
                    to,
                    empty: from === to,
                  };
                })(),
              },
            },
          };
        },
      }));

      const options = useMemo(
        () => ({
          mode: 'markdown',
          lineNumbers: false,
          readOnly: isReadOnly,
          theme: isDarkMode ? 'material-darker' : 'default',
          lineWrapping: true,
          viewportMargin: 10,
          placeholder: defaultPlaceholder,
        }),
        [isReadOnly, isDarkMode, defaultPlaceholder],
      );

      useEffect(() => {
        const editor = editorRef.current;
        if (!editor) return;
        const current = editor.getValue();
        if (current !== value) {
          const cursor = editor.getCursor();
          editor.setValue(value || '');
          editor.setCursor(cursor);
        }
      }, [value]);

      return (
        <div
          className={`w-full rounded-lg ${className || ''}`}
          style={{
            ...style,
            minHeight,
            maxHeight,
            overflow: 'hidden',
          }}
        >
          <ReactCodeMirror
            value={value}
            options={options as any}
            editorDidMount={(editor: CodeMirror.Editor) => {
              editorRef.current = editor;
            }}
            onChange={(editor: CodeMirror.Editor) => {
              onChange?.(editor.getValue());
            }}
          />
        </div>
      );
    },
  ),
);
