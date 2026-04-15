import { ConfigProvider, message } from 'antd';
import React, { useState } from 'react';
import { PromptEditor } from '../../../src';
import '../../../src/styles/tailwind.css';
import type { OptimizeRequest, TaskNode } from '../../../src/types';
import { DemoWrapper } from '../../demo-wrapper';

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });

export default function CallbackPlatformsDemo() {
  const [value, setValue] = useState<TaskNode[]>([
    {
      id: '1',
      title: '自定义优化内容区演示',
      content:
        '# 自定义优化内容区演示\n\n请把这段 Prompt 优化得更清晰一些。\n\n## 当前目标\n\n- 降低 onOptimizeRequest 的接入难度\n- optimizeCustomContent 有值时不再打开内置弹窗\n- 用 mock 数据直接演示最终结果替换',
      children: [],
      isLocked: false,
      hasRun: false,
      dependencies: [],
    },
  ]);

  const handleOptimizeRequest = async (request: OptimizeRequest) => {
    console.log('[custom optimize flow]', request);
    message.info('已触发自定义优化流程，请查看控制台中的 request 数据');

    const sourceText = request.selectedText || request.content;
    const nextResult = `# Mock 优化结果

这是一段通过 \`onOptimizeRequest\` 生成的 mock 数据。

## 优化后的表达

- 明确了目标和边界
- 语义更集中
- 更适合直接交给模型执行

## 原内容摘要

${sourceText.slice(0, 120)}${sourceText.length > 120 ? '...' : ''}`;

    await sleep(500);
    if (request.signal?.aborted) return;

    message.success('mock 优化完成，已自动应用到当前内容');
    request.applyOptimizedContent(nextResult);
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#6366f1',
        },
      }}
    >
      <DemoWrapper height="860px" title="Custom Optimize Content Demo">
        <div className="h-full min-h-0">
          <PromptEditor
            value={value}
            onChange={setValue}
            onOptimizeRequest={handleOptimizeRequest}
            optimizeCustomContent={<span />}
            onLike={() => message.info('触发了点赞回调')}
            onDislike={() => message.info('触发了点踩回调')}
          />
        </div>
      </DemoWrapper>
    </ConfigProvider>
  );
}
