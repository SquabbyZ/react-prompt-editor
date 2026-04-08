import React from 'react';
import { PromptEditor } from '../../../src';
import '../../../src/styles/tailwind.css';
import {
  OptimizeRequest,
  OptimizeResponse,
  RunTaskRequest,
  RunTaskResponse,
  TaskNode,
} from '../../../src/types';
import { DemoWrapper } from '../../demo-wrapper';

/**
 * 流式输出示例 - 展示如何实现真正的流式 AI 优化
 */
export default () => {
  const [value, setValue] = React.useState<TaskNode[]>([
    {
      id: '1',
      title: 'AI 流式优化示例',
      content: '# 原始内容\n\n这是一个用于演示流式输出的示例文本。',
      children: [],
      isLocked: false,
      hasRun: false,
    },
  ]);

  // 节点运行完成回调
  const handleNodeRun = (nodeId: string, result: RunTaskResponse) => {
    console.log('✅ 节点运行完成:', nodeId, result);
  };

  const handleNodeOptimize = (nodeId: string) => {
    console.log('✨ Node optimized:', nodeId);
  };

  const handleNodeLock = (nodeId: string, isLocked: boolean) => {
    console.log('🔒 Node lock:', nodeId, isLocked);
  };

  // 运行请求回调
  const handleRunRequest = (request: RunTaskRequest) => {
    console.log('运行请求:', request);
    setTimeout(() => {
      const result: RunTaskResponse = {
        result: `✅ 运行成功！节点：${request.nodeId}`,
        stream: false,
      };
      handleNodeRun(request.nodeId, result);
    }, 1000);
  };

  // AI 优化请求回调 - 支持流式输出
  const handleOptimizeRequest = (
    request: OptimizeRequest,
    callbacks: {
      onResponse: (response: OptimizeResponse) => void;
      onError: (error: Error) => void;
    },
  ) => {
    console.log('优化请求:', request);

    // 模拟真实的流式 API 调用（如 OpenAI、通义千问等）
    const fullText = `# 优化后的内容

## 改进点

### 1. 结构优化
- 添加了清晰的标题层级
- 使用列表增强可读性
- 逻辑更严密

### 2. 表达优化
- 语言更精炼
- 重点更突出
- 专业术语更准确

### 3. 内容补充
- 增加了实际应用场景
- 提供了最佳实践建议
- 添加了相关资源链接

---

**总结**：通过结构化重组和表达优化，使内容更加专业和易读。`;

    const thinkingProcess = `🤔 正在分析内容结构...
📊 识别关键信息点...
✍️ 优化表达方式...
🎯 调整逻辑顺序...
✨ 完成优化！`;

    // 第一次调用：发送思考过程（立即显示）
    callbacks.onResponse({
      optimizedContent: '',
      thinkingProcess: thinkingProcess,
    });

    // 模拟流式输出：逐字显示优化后的内容
    let index = 0;
    const chunkSize = 5; // 每次显示 5 个字符
    const interval = 50; // 每 50ms 更新一次

    const timer = setInterval(() => {
      if (index >= fullText.length) {
        clearInterval(timer);
        // 发送完成信号
        callbacks.onResponse({
          optimizedContent: fullText,
          thinkingProcess: thinkingProcess,
          done: true,
        });
        return;
      }

      const currentChunk = fullText.slice(0, index + chunkSize);
      index += chunkSize;

      // 多次调用 onResponse 实现流式输出
      callbacks.onResponse({
        optimizedContent: currentChunk,
        thinkingProcess: thinkingProcess,
      });
    }, interval);

    // 注意：实际项目中应该根据后端 SSE/WebSocket 的响应来调用 onResponse
  };

  return (
    <DemoWrapper height="550px" title="Streaming Output">
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid var(--color-neutral-200, #e4e4e7)',
          backgroundColor: 'var(--color-primary-50, #fefce8)',
          fontSize: '14px',
          color: 'var(--color-neutral-600, #52525b)',
        }}
      >
        💡 Tip: Click the &quot;AI Optimize&quot; button on any node to see
        streaming output
      </div>
      <PromptEditor
        value={value}
        onChange={setValue}
        onRunRequest={handleRunRequest}
        onOptimizeRequest={handleOptimizeRequest}
        onNodeRun={handleNodeRun}
        onNodeOptimize={handleNodeOptimize}
        onNodeLock={handleNodeLock}
      />
    </DemoWrapper>
  );
};
