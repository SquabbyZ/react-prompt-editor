import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';
import CodeMirror from '@uiw/react-codemirror';
import React, {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { getCodeMirrorPhrases } from '../../i18n/codemirror';
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
      const cmRef = useRef<any>(null);
      const [isDarkMode, setIsDarkMode] = useState(false);

      // 获取国际化翻译函数
      const t = createTranslator(locale);
      // 如果没有传入 placeholder，使用国际化的默认值
      const defaultPlaceholder = placeholder || t('codemirror.placeholder');

      // 检测暗色模式
      useEffect(() => {
        const checkDarkMode = () => {
          let isDark = false;

          if (theme === 'light') {
            isDark = false;
          } else if (theme === 'dark') {
            isDark = true;
          } else {
            // system: 跟随系统
            const htmlElement = document.documentElement;
            isDark =
              htmlElement.classList.contains('dark') ||
              htmlElement.getAttribute('data-theme') === 'dark' ||
              window.matchMedia('(prefers-color-scheme: dark)').matches;
          }

          setIsDarkMode(isDark);
        };

        checkDarkMode();

        // 只有在 system 模式下才监听变化
        if (theme === 'system') {
          // 监听类名变化
          const observer = new MutationObserver(checkDarkMode);
          observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class', 'data-theme'],
          });

          // 监听系统主题变化
          const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
          mediaQuery.addEventListener('change', checkDarkMode);

          return () => {
            observer.disconnect();
            mediaQuery.removeEventListener('change', checkDarkMode);
          };
        }
      }, [theme]);

      // 注入 CodeMirror 暗色模式样式（避免被 Tailwind purge）
      useEffect(() => {
        const styleId = 'codemirror-dark-mode-styles';
        if (!document.getElementById(styleId)) {
          const style = document.createElement('style');
          style.id = styleId;
          style.textContent = `
            .dark .cm-editor,
            [data-theme="dark"] .cm-editor,
            [data-prefers-color="dark"] .cm-editor {
              background-color: #27272a !important;
            }
            .dark .cm-editor .cm-content,
            [data-theme="dark"] .cm-editor .cm-content,
            [data-prefers-color="dark"] .cm-editor .cm-content {
              background-color: #27272a !important;
              color: #e4e4e7 !important;
            }
            .dark .cm-editor .cm-scroller,
            [data-theme="dark"] .cm-editor .cm-scroller,
            [data-prefers-color="dark"] .cm-editor .cm-scroller {
              background-color: #27272a !important;
              color: #e4e4e7 !important;
            }
            .dark .cm-editor .cm-line,
            [data-theme="dark"] .cm-editor .cm-line,
            [data-prefers-color="dark"] .cm-editor .cm-line {
              background-color: transparent !important;
              color: #e4e4e7 !important;
            }
            .dark .cm-editor .cm-placeholder,
            [data-theme="dark"] .cm-editor .cm-placeholder,
            [data-prefers-color="dark"] .cm-editor .cm-placeholder {
              color: #71717a !important;
            }
            .dark .cm-editor .cm-cursor,
            [data-theme="dark"] .cm-editor .cm-cursor,
            [data-prefers-color="dark"] .cm-editor .cm-cursor {
              border-left-color: #f59e0b !important;
            }
            .dark .cm-editor .cm-activeLine,
            [data-theme="dark"] .cm-editor .cm-activeLine,
            [data-prefers-color="dark"] .cm-editor .cm-activeLine {
              background-color: #3f3f46 !important;
            }
            .dark .cm-editor .cm-selectionBackground,
            [data-theme="dark"] .cm-editor .cm-selectionBackground,
            [data-prefers-color="dark"] .cm-editor .cm-selectionBackground {
              background-color: rgba(245, 158, 11, 0.2) !important;
            }
            .dark .cm-editor .cm-selectedMatchBackground,
            [data-theme="dark"] .cm-editor .cm-selectedMatchBackground,
            [data-prefers-color="dark"] .cm-editor .cm-selectedMatchBackground {
              background-color: rgba(245, 158, 11, 0.3) !important;
            }
            .dark .cm-editor .cm-matchingBracket,
            [data-theme="dark"] .cm-editor .cm-matchingBracket,
            [data-prefers-color="dark"] .cm-editor .cm-matchingBracket {
              background-color: rgba(245, 158, 11, 0.2) !important;
            }
            .dark .cm-editor .cm-panels,
            [data-theme="dark"] .cm-editor .cm-panels,
            [data-prefers-color="dark"] .cm-editor .cm-panels {
              background-color: #27272a !important;
              color: #e4e4e7 !important;
              border-color: #3f3f46 !important;
            }
            .dark .cm-editor .cm-panel,
            [data-theme="dark"] .cm-editor .cm-panel,
            [data-prefers-color="dark"] .cm-editor .cm-panel {
              background-color: #27272a !important;
              color: #e4e4e7 !important;
            }
            .dark .cm-editor .cm-panel input,
            [data-theme="dark"] .cm-editor .cm-panel input,
            [data-prefers-color="dark"] .cm-editor .cm-panel input {
              background-color: #3f3f46 !important;
              color: #e4e4e7 !important;
              border-color: #52525b !important;
            }
            .dark .cm-editor .cm-panel button,
            [data-theme="dark"] .cm-editor .cm-panel button,
            [data-prefers-color="dark"] .cm-editor .cm-panel button {
              background-color: #3f3f46 !important;
              color: #e4e4e7 !important;
            }
          `;
          document.head.appendChild(style);
        }
      }, []);

      // 获取 CodeMirror 国际化配置
      const phrases = getCodeMirrorPhrases(locale);

      useImperativeHandle(ref, () => ({
        get view() {
          return cmRef.current?.view;
        },
      }));

      // 根据暗色模式动态设置扩展
      const extensions = [markdown()];
      if (isDarkMode) {
        extensions.push(oneDark as any);
      }

      return (
        <CodeMirror
          ref={cmRef}
          key={isDarkMode ? 'dark' : 'light'}
          value={value}
          minHeight={minHeight}
          maxHeight={maxHeight}
          extensions={extensions}
          onChange={(val) => onChange?.(val)}
          editable={!isReadOnly}
          placeholder={defaultPlaceholder}
          className={`w-full overflow-auto rounded-lg ${className || ''}`}
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
