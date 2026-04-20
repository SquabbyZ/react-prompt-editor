import React, { useState } from 'react';
import { PromptEditor } from '../../../src';
import '../../../src/styles/tailwind.css';
import { PreviewRenderMode, TaskNode } from '../../../src/types';
import { DemoWrapper } from '../../demo-wrapper';

/**
 * 预览模式对比示例
 *
 * 展示 previewRenderMode 两种渲染方式的区别：
 * - readonly-editor: 只读编辑器（保留代码高亮和行号）
 * - markdown: Markdown 阅读视图（更适合非技术人员阅读）
 */
export default () => {
  const [renderMode, setRenderMode] = useState<PreviewRenderMode>(
    'readonly-editor',
  );

  const data: TaskNode[] = [
    {
      id: '1',
      title: 'API 接口规范',
      content: [
        '# API 接口规范',
        '',
        '## 请求格式',
        '',
        '所有接口统一使用 **JSON** 格式：',
        '',
        '```json',
        '{',
        '  "method": "POST",',
        '  "headers": {',
        '    "Content-Type": "application/json",',
        '    "Authorization": "Bearer <token>"',
        '  }',
        '}',
        '```',
        '',
        '## 响应规范',
        '',
        '| 字段 | 类型 | 说明 |',
        '| --- | --- | --- |',
        '| code | number | 状态码，0=成功 |',
        '| data | object | 返回数据 |',
        '| message | string | 提示信息 |',
        '',
        '> ⚠️ 所有时间字段统一使用 ISO 8601 格式',
      ].join('\n'),
      children: [
        {
          id: '1.1',
          title: '错误处理',
          content:
            '# 错误处理\n\n- `400` Bad Request - 请求参数错误\n- `401` Unauthorized - 未授权\n- `403` Forbidden - 无权限\n- `500` Internal Server Error - 服务器错误',
          children: [],
          isLocked: false,
          hasRun: false,
        },
      ],
      isLocked: false,
      hasRun: false,
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '12px',
        }}
      >
        <span style={{ fontSize: '13px', color: '#6b7280' }}>
          渲染模式：
        </span>
        <div
          style={{
            display: 'inline-flex',
            borderRadius: '8px',
            border: '1px solid #e5e7eb',
            overflow: 'hidden',
          }}
        >
          {(
            [
              { value: 'readonly-editor', label: '📝 只读编辑器' },
              { value: 'markdown', label: '📖 Markdown 阅读' },
            ] as const
          ).map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setRenderMode(option.value)}
              style={{
                padding: '6px 16px',
                fontSize: '12px',
                border: 'none',
                cursor: 'pointer',
                fontWeight: renderMode === option.value ? 600 : 400,
                background:
                  renderMode === option.value ? '#eef2ff' : '#ffffff',
                color:
                  renderMode === option.value ? '#4f46e5' : '#6b7280',
                transition: 'all 0.15s',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
      <DemoWrapper height="450px">
        <PromptEditor
          value={data}
          previewMode={true}
          previewRenderMode={renderMode}
        />
      </DemoWrapper>
    </div>
  );
};
