import React, { useState } from 'react';
import { PromptEditor } from '../../../src';
import '../../../src/styles/tailwind.css';
import { TaskNode } from '../../../src/types';
import { DemoWrapper } from '../../demo-wrapper';

/**
 * 多编辑器实例示例
 *
 * 每个 <PromptEditor /> 实例拥有独立的 Zustand store，互不干扰。
 * 适用于需要同时管理多个 Prompt 模板的场景。
 */
export default () => {
  const [systemPrompt, setSystemPrompt] = useState<TaskNode[]>([
    {
      id: 's1',
      title: 'System Prompt',
      content:
        '# 系统提示词\n\n你是一个专业的技术写作助手，擅长将复杂概念用简洁清晰的语言表达。\n\n## 要求\n- 使用中文回复\n- 结构化输出\n- 给出具体示例',
      children: [],
      isLocked: false,
      hasRun: false,
    },
  ]);

  const [userPrompt, setUserPrompt] = useState<TaskNode[]>([
    {
      id: 'u1',
      title: 'User Prompt',
      content:
        '# 用户提示词\n\n请帮我写一篇关于 React Server Components 的技术博客，包含：\n\n1. 核心概念介绍\n2. 与传统 SSR 的区别\n3. 实际使用场景',
      children: [],
      isLocked: false,
      hasRun: false,
    },
  ]);

  return (
    <div style={{ display: 'flex', gap: '16px' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '8px',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#6366f1',
            }}
          />
          <span
            style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}
          >
            System Prompt 编辑器
          </span>
        </div>
        <DemoWrapper height="380px">
          <PromptEditor value={systemPrompt} onChange={setSystemPrompt} />
        </DemoWrapper>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            marginBottom: '8px',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
            }}
          />
          <span
            style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}
          >
            User Prompt 编辑器
          </span>
        </div>
        <DemoWrapper height="380px">
          <PromptEditor value={userPrompt} onChange={setUserPrompt} />
        </DemoWrapper>
      </div>
    </div>
  );
};
