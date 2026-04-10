import markdownIt from 'markdown-it';
import container from 'markdown-it-container';
import { full as emoji } from 'markdown-it-emoji';
import footnote from 'markdown-it-footnote';
import highlightjs from 'markdown-it-highlightjs';
import taskLists from 'markdown-it-task-lists';
import React, { memo } from 'react';

// 引入代码高亮样式
import 'highlight.js/styles/github.css';
import { cn } from '../../utils';

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
