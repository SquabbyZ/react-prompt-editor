import React from 'react';
import { PromptEditor } from '../../src';
import '../../src/styles/tailwind.css';
import { TaskNode } from '../../src/types';
import { DemoWrapper } from '../demo-wrapper';

/**
 * 预览模式示例 - 只读展示提示词内容
 *
 * 使用 previewMode 属性隐藏所有操作按钮，只展示内容
 * 适合用于分享、演示或审查场景
 */
export default () => {
  const data: TaskNode[] = [
    {
      id: '1',
      title: 'AI 助手提示词',
      content:
        '# 角色定义\n\n你是一个专业的 AI 助手，负责帮助用户解决问题。\n\n## 能力要求\n- 准确理解用户意图\n- 提供清晰、有用的回答\n- 保持友好、专业的态度',
      children: [
        {
          id: '1.1',
          title: '问候语生成',
          content: '请生成友好的问候语，根据时间和场景调整语气。',
          children: [],
          isLocked: false,
          hasRun: false,
        },
        {
          id: '1.2',
          title: '问题分类',
          content: '将用户问题分类为：技术咨询、产品使用、故障排查等。',
          children: [],
          isLocked: false,
          hasRun: false,
        },
      ],
      isLocked: false,
      hasRun: false,
    },
    {
      id: '2',
      title: '数据分析提示词',
      content: '# 数据分析\n\n请对用户数据进行分析，生成可视化报告。',
      children: [],
      isLocked: false,
      hasRun: false,
    },
  ];

  return (
    <DemoWrapper height="450px" title="Preview Mode">
      <PromptEditor value={data} previewMode={true} />
    </DemoWrapper>
  );
};
