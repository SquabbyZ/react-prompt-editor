import React from 'react';
import { PromptEditor, zhCN } from '../../../src';
import {
  OptimizeRequest,
  OptimizeResponse,
  RunTaskRequest,
  RunTaskResponse,
  TaskNode,
} from '../../../src/types';

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
  ]);

  // 节点运行完成回调
  const handleNodeRun = (nodeId: string, result: RunTaskResponse) => {
    console.log('✅ 节点运行完成:', nodeId, result);
    // 通知组件更新节点状态
    alert(`运行成功！\n\n${result.result}`);
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

  const handleTreeChange = (tree: TaskNode[]) => {
    console.log('📊 Tree changed:', tree);
  };

  // 运行请求回调 - 用户自行处理异步请求
  const handleRunRequest = (request: RunTaskRequest) => {
    console.log('运行请求:', request);
    // 模拟异步请求
    setTimeout(() => {
      const result: RunTaskResponse = {
        result: `✅ 运行成功！\n\n节点：${request.nodeId}\n内容长度：${request.content.length} 字符\n依赖数量：${request.dependenciesContent.length}`,
        stream: false,
      };
      // 通过 onNodeRun 通知组件运行完成
      handleNodeRun(request.nodeId, result);
    }, 1000);
  };

  // AI 优化请求回调 - 用户自行处理异步请求
  const handleOptimizeRequest = (
    request: OptimizeRequest,
    callbacks: {
      onResponse: (response: OptimizeResponse) => void;
      onError: (error: Error) => void;
    },
  ) => {
    console.log('优化请求:', request);
    // 模拟异步请求
    setTimeout(() => {
      try {
        const response: OptimizeResponse = {
          optimizedContent:
            request.content +
            '\n\n---\n\n✨ **[AI 优化完成]**\n\n- 结构更清晰\n- 表达更准确\n- 逻辑更严密',
          thinkingProcess:
            '🤔 分析内容结构...\n📝 优化表达方式...\n✅ 完成优化！',
        };
        // 通过 onResponse 返回结果
        callbacks.onResponse(response);
      } catch (error) {
        callbacks.onError(error as Error);
      }
    }, 1500);
  };

  return (
    <div className="p-4">
      <PromptEditor
        value={value}
        onChange={setValue}
        onRunRequest={handleRunRequest}
        onOptimizeRequest={handleOptimizeRequest}
        onNodeRun={handleNodeRun}
        onNodeOptimize={handleNodeOptimize}
        onNodeLock={handleNodeLock}
        onTreeChange={handleTreeChange}
        locale={zhCN}
      />
    </div>
  );
};
