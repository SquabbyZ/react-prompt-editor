import React from 'react';
import {
  OptimizeRequest,
  PromptEditor,
  RunTaskRequest,
  RunTaskResponse,
  TaskNode,
} from '../../src';
import '../../src/styles/tailwind.css';
import { DemoWrapper } from '../demo-wrapper';

export default () => {
  const [value, setValue] = React.useState<TaskNode[]>([
    {
      id: '1',
      title: '第一步：需求分析',
      content:
        '# 需求分析\n\n请分析用户的需求，包括：\n- 核心功能\n- 用户场景\n- 技术要求',
      children: [
        {
          id: '1.1',
          title: '1.1 用户访谈',
          content:
            '# 用户访谈\n\n访谈内容：\n- 用户痛点\n- 期望功能\n- 使用场景',
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
      title: '第二步：方案设计',
      content:
        '# 方案设计\n\n基于需求分析结果，设计解决方案：\n- 架构设计\n- 技术选型\n- 实现步骤',
      children: [],
      isLocked: false,
      hasRun: false,
    },
    {
      id: '3',
      title: '第三步：实施计划',
      content:
        '# 实施计划\n\n制定详细的实施计划：\n- 时间安排\n- 资源分配\n- 风险评估',
      children: [],
      isLocked: false,
      hasRun: false,
    },
  ]);

  // 处理运行请求
  const handleRunRequest = (request: RunTaskRequest) => {
    console.log('🚀 Run API called:', request);
    // 模拟 API 调用
    setTimeout(() => {
      const result: RunTaskResponse = {
        result: `✅ 运行成功！\n\n节点：${request.nodeId}\n内容长度：${request.content.length} 字符\n依赖数量：${request.dependenciesContent.length}`,
      };
      // 通知组件运行完成（通过 meta.onNodeRun）
      if (request.meta?.onNodeRun) {
        (request.meta.onNodeRun as any)(request.nodeId, result);
      }
    }, 1000);
  };

  // 处理优化请求
  const handleOptimizeRequest = (request: OptimizeRequest) => {
    console.log('✨ Optimize API called:', request);
    // 模拟 AI 优化
    setTimeout(() => {
      try {
        request.applyOptimizedContent(
          request.content +
            '\n\n---\n\n✨ **[AI 优化完成]**\n\n- 结构更清晰\n- 表达更准确\n- 逻辑更严密',
        );
      } catch (error) {
        request.setOptimizeError(error as Error);
      }
    }, 1500);
  };

  const handleNodeRun = (nodeId: string, result: any) => {
    console.log('✅ Node run:', nodeId, result);
  };

  const handleNodeOptimize = (nodeId: string, result: any) => {
    console.log('✨ Node optimized:', nodeId);
    if (result.thinkingProcess) {
      console.log('思考过程:\n', result.thinkingProcess);
    }
  };

  const handleNodeLock = (nodeId: string, isLocked: boolean) => {
    console.log('🔒 Node lock:', nodeId, isLocked);
  };

  return (
    <DemoWrapper height="550px">
      <PromptEditor
        value={value}
        onChange={setValue}
        onRunRequest={handleRunRequest}
        onOptimizeRequest={handleOptimizeRequest}
        onNodeRun={handleNodeRun}
        onNodeOptimize={handleNodeOptimize}
        onNodeLock={handleNodeLock}
        draggable={true} // 启用拖拽排序功能
      />
    </DemoWrapper>
  );
};
