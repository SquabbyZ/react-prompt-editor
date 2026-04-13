import markdownIt from 'markdown-it';
import container from 'markdown-it-container';
import { full as emoji } from 'markdown-it-emoji';
import footnote from 'markdown-it-footnote';
import highlightjs from 'markdown-it-highlightjs';
import taskLists from 'markdown-it-task-lists';
import React, { memo, useEffect, useState } from 'react';

// 引入代码高亮样式（默认亮色）
// 注意：实际样式通过 useEffect 动态加载，以适应暗色模式切换
import { cn } from '../../utils';

// 检测暗色模式
const isDarkMode = () => {
  if (typeof window !== 'undefined') {
    const html = document.documentElement;
    return (
      html.classList.contains('dark') ||
      html.getAttribute('data-theme') === 'dark' ||
      html.getAttribute('data-prefers-color') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
  }
  return false;
};

interface MarkdownProps {
  content: string;
  className?: string;
}

// 配置 markdown-it 实例
const md = markdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true,
});

// 添加插件
md.use(highlightjs, {
  inline: true, // 支持行内代码高亮
})
  .use(emoji) // emoji 支持 :emoji_name:
  .use(footnote) // 脚注支持
  .use(taskLists, {
    enabled: true,
    label: true,
    labelAfter: true,
  })
  // 自定义容器：提示框
  .use(container, 'tip', {
    render: (tokens: unknown[], idx: number) => {
      const token = tokens[idx] as { nesting: number; info: string };
      if (token.nesting === 1) {
        return '<div class="md-tip md-tip-info">\n';
      } else {
        return '</div>\n';
      }
    },
  })
  .use(container, 'warning', {
    render: (tokens: unknown[], idx: number) => {
      const token = tokens[idx] as { nesting: number; info: string };
      if (token.nesting === 1) {
        return '<div class="md-tip md-tip-warning">\n';
      } else {
        return '</div>\n';
      }
    },
  })
  .use(container, 'danger', {
    render: (tokens: unknown[], idx: number) => {
      const token = tokens[idx] as { nesting: number; info: string };
      if (token.nesting === 1) {
        return '<div class="md-tip md-tip-danger">\n';
      } else {
        return '</div>\n';
      }
    },
  })
  .use(container, 'success', {
    render: (tokens: unknown[], idx: number) => {
      const token = tokens[idx] as { nesting: number; info: string };
      if (token.nesting === 1) {
        return '<div class="md-tip md-tip-success">\n';
      } else {
        return '</div>\n';
      }
    },
  });

export const MarkdownRenderer: React.FC<MarkdownProps> = memo(
  ({ content, className }) => {
    const [isDark, setIsDark] = useState(() => isDarkMode());

    // 监听暗色模式变化
    useEffect(() => {
      const checkDarkMode = () => {
        setIsDark(isDarkMode());
      };

      checkDarkMode();

      const observer = new MutationObserver(checkDarkMode);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ['class', 'data-theme', 'data-prefers-color'],
      });

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', checkDarkMode);

      return () => {
        observer.disconnect();
        mediaQuery.removeEventListener('change', checkDarkMode);
      };
    }, []);

    // 动态加载暗色模式代码高亮样式
    useEffect(() => {
      const lightStyleId = 'highlightjs-light-style';
      const darkStyleId = 'highlightjs-dark-style';

      if (isDark) {
        // 移除亮色样式，加载暗色样式
        const lightStyle = document.getElementById(lightStyleId);
        if (lightStyle) lightStyle.remove();

        if (!document.getElementById(darkStyleId)) {
          const style = document.createElement('link');
          style.id = darkStyleId;
          style.rel = 'stylesheet';
          style.href =
            'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark.css';
          document.head.appendChild(style);
        }
      } else {
        // 移除暗色样式，加载亮色样式
        const darkStyle = document.getElementById(darkStyleId);
        if (darkStyle) darkStyle.remove();

        if (!document.getElementById(lightStyleId)) {
          const style = document.createElement('link');
          style.id = lightStyleId;
          style.rel = 'stylesheet';
          style.href =
            'https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github.css';
          document.head.appendChild(style);
        }
      }

      return () => {
        const darkStyle = document.getElementById(darkStyleId);
        if (darkStyle) darkStyle.remove();
      };
    }, [isDark]);

    const renderedContent = React.useMemo(() => {
      return md.render(content || '');
    }, [content]);

    return (
      <div className={cn('markdown-content', className)}>
        <div
          className="overflow-x-auto"
          dangerouslySetInnerHTML={{ __html: renderedContent }}
        />
      </div>
    );
  },
);
