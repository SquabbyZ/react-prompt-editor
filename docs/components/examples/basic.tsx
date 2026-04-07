import React from 'react';
import { PromptEditor } from '../../../src';
import { TaskNode } from '../../../src/types';

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

  const runAPI = async (req: any) => {
    console.log('Run API called:', req);
    // 模拟 API 调用
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return {
      result: `✅ 运行成功！\n\n节点：${req.nodeId}\n内容长度：${req.content.length} 字符\n依赖数量：${req.dependenciesContent.length}`,
      stream: false,
    };
  };

  const optimizeAPI = async (req: any) => {
    console.log('Optimize API called:', req);
    // 模拟 AI 优化
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return {
      optimizedContent:
        req.content +
        '\n\n---\n\n✨ **[AI 优化完成]**\n\n- 结构更清晰\n- 表达更准确\n- 逻辑更严密',
      thinkingProcess: '🤔 分析内容结构...\n📝 优化表达方式...\n✅ 完成优化！',
    };
  };

  const handleNodeRun = (nodeId: string, result: any) => {
    console.log('✅ Node run:', nodeId, result);
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

  return (
    <div style={{ padding: '20px' }}>
      <PromptEditor
        value={value}
        onChange={setValue}
        runAPI={runAPI}
        optimizeAPI={optimizeAPI}
        onNodeRun={handleNodeRun}
        onNodeOptimize={handleNodeOptimize}
        onNodeLock={handleNodeLock}
        onTreeChange={handleTreeChange}
        theme="default"
      />
    </div>
  );
};
