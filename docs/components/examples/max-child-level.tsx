import React from 'react';
import { PromptEditor, zhCN } from '../../../src';
import '../../../src/styles/tailwind.css';
import type { TaskNode } from '../../../src/types';
import { DemoWrapper } from '../../demo-wrapper';

const initialData: TaskNode[] = [
  {
    id: '1',
    title: '一级标题',
    content: '# 这是一级标题\n\n这是根节点的内容。',
    isLocked: false,
    hasRun: false,
    children: [
      {
        id: '2',
        title: '二级标题',
        content: '## 这是二级标题\n\n这是一级标题的子节点。',
        parentId: '1',
        isLocked: false,
        hasRun: false,
        children: [
          {
            id: '3',
            title: '三级标题',
            content: '### 这是三级标题\n\n这是二级标题的子节点。',
            parentId: '2',
            isLocked: false,
            hasRun: false,
            children: [],
          },
        ],
      },
    ],
  },
];

export default function MaxChildLevelDemo() {
  const [value, setValue] = React.useState<TaskNode[]>(initialData);

  return (
    <DemoWrapper>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ margin: '0 0 8px 0' }}>最大子标题层级限制示例</h3>
        <p style={{ margin: 0, color: '#666' }}>
          此示例设置了 <code>maxChildLevel={'{4}'}</code>，表示最多只能有 4 层子标题（根节点为第 1 层）。
          当达到最大层级时，&quot;添加子标题&quot; 按钮会自动隐藏。
        </p>
      </div>
      <PromptEditor
        value={value}
        onChange={setValue}
        locale={zhCN}
        maxChildLevel={4}
      />
    </DemoWrapper>
  );
}
