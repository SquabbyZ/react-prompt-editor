import { ConfigProvider } from 'antd';
import React from 'react';
import { PromptEditor } from './components/PromptEditor';
import { TaskNode } from './types';

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

  const runAPI = async (req: any) => {
    console.log('Run API called:', req);
    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      result: `运行成功！节点 ID: ${req.nodeId}\n内容长度：${req.content.length}\n依赖数量：${req.dependenciesContent.length}`,
      stream: false,
    };
  };

  const optimizeAPI = async (req: any) => {
    console.log('Optimize API called:', req);
    // 模拟 AI 优化
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      optimizedContent:
        req.content + '\n\n[AI 优化：内容已优化，结构更清晰，表达更准确]',
      thinkingProcess: '正在分析内容结构...\n优化表达方式...\n完成！',
    };
  };

  const handleNodeRun = (nodeId: string, result: any) => {
    console.log('Node run callback:', nodeId, result);
    alert(`节点 ${nodeId} 运行完成！\n结果：${result.result}`);
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

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1890ff',
          borderRadius: 8,
        },
      }}
    >
      <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
        <PromptEditor
          initialValue={initialValue}
          runAPI={runAPI}
          optimizeAPI={optimizeAPI}
          onNodeRun={handleNodeRun}
          onNodeOptimize={handleNodeOptimize}
          onNodeLock={handleNodeLock}
          onTreeChange={handleTreeChange}
          theme="default"
          style={{ border: '1px solid #d9d9d9', borderRadius: '8px' }}
        />
      </div>
    </ConfigProvider>
  );
};

export default App;
