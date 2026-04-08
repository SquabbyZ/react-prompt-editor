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
      const [isDarkMode, setIsDarkMode] = useState(false);

      // 检测暗色模式
      useEffect(() => {
        const checkDarkMode = () => {
          const htmlElement = document.documentElement;
          const isDark =
            htmlElement.classList.contains('dark') ||
            htmlElement.getAttribute('data-theme') === 'dark' ||
            window.matchMedia('(prefers-color-scheme: dark)').matches;
          setIsDarkMode(isDark);
        };

        checkDarkMode();

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
          value={value}
          height="200px"
          extensions={extensions}
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
