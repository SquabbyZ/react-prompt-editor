import { ConfigProvider } from 'antd';
import React from 'react';
import { PromptEditor } from './components/PromptEditor';
import {
  OptimizeRequest,
  OptimizeResponse,
  RunTaskRequest,
  TaskNode,
} from './types';

const App: React.FC = () => {
  const initialValue: TaskNode[] = [
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
  ];

  const handleNodeRun = (nodeId: string, result: any) => {
    console.log('Node run callback:', nodeId, result);
    alert(`节点 ${nodeId} 运行完成！\n结果：${result.result}`);
  };

  // 运行请求回调 - 用户自行处理异步请求
  const handleRunRequest = (request: RunTaskRequest) => {
    console.log('运行请求:', request);

    // 模拟异步请求
    setTimeout(() => {
      const result = {
        result: `✅ 运行成功！节点 ID: ${request.nodeId}\n内容长度：${request.content.length}\n依赖数量：${request.dependenciesContent.length}`,
        stream: false,
      };

      // 通知组件运行结果
      handleNodeRun(request.nodeId, result);
    }, 1000);
  };

  // AI 优化请求回调 - 用户自行处理异步请求（支持流式输出）
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
            '\n\n✨ [AI 优化完成：内容已优化，结构更清晰，表达更准确]',
          thinkingProcess:
            '🤔 正在分析内容结构...\n✍️ 优化表达方式...\n✅ 完成！',
        };

        // 通知组件优化结果（可以多次调用实现流式输出）
        callbacks.onResponse(response);
      } catch (error) {
        callbacks.onError(error as Error);
      }
    }, 1500);
  };

  const handleNodeOptimize = (nodeId: string, result: any) => {
    console.log('Node optimize callback:', nodeId, result);
    if (result.thinkingProcess) {
      console.log('思考过程:', result.thinkingProcess);
    }
  };

  const handleNodeLock = (nodeId: string, isLocked: boolean) => {
    console.log('Node lock callback:', nodeId, isLocked);
  };

  const handleTreeChange = (tree: TaskNode[]) => {
    console.log('Tree changed:', tree);
  };

  // 点赞回调
  const handleLike = (messageId: string) => {
    console.log('点赞消息:', messageId);
    // 可以在这里调用后端接口记录点赞
  };

  // 点踩回调
  const handleDislike = (messageId: string) => {
    console.log('点踩消息:', messageId);
    // 可以在这里调用后端接口记录点踩
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <div className="mx-auto max-w-[1400px] p-6">
        <PromptEditor
          initialValue={initialValue}
          onRunRequest={handleRunRequest}
          onOptimizeRequest={handleOptimizeRequest}
          onNodeRun={handleNodeRun}
          onNodeOptimize={handleNodeOptimize}
          onNodeLock={handleNodeLock}
          onTreeChange={handleTreeChange}
          onLike={handleLike}
          onDislike={handleDislike}
          className="rounded-lg border border-gray-300"
        />
      </div>
    </ConfigProvider>
  );
};

export default App;
