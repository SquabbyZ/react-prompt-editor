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
      const isInternalChange = useRef(false);
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
          const editor = editorRef.current;
          const fullText = editor?.getValue() || '';
          
          return {
            dispatch: ({ changes, selection }: any) => {
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
                length: fullText.length,
                toString: () => fullText,
                sliceString: (from: number, to: number) => fullText.slice(from, to),
              },
              selection: {
                main: (() => {
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
        if (!editor || isInternalChange.current) return;
        const current = editor.getValue();
        const next = value || '';
        if (current !== next) {
          const cursor = editor.getCursor();
          editor.operation(() => {
            editor.replaceRange(next, { line: 0, ch: 0 }, { line: editor.lastLine(), ch: editor.getLine(editor.lastLine()).length });
          });
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
            options={options as any}
            editorDidMount={(editor: CodeMirror.Editor) => {
              editorRef.current = editor;
            }}
            onChange={(editor: CodeMirror.Editor) => {
              isInternalChange.current = true;
              onChange?.(editor.getValue());
              setTimeout(() => { isInternalChange.current = false; }, 0);
            }}
          />
        </div>
      );
    },
  ),
);
