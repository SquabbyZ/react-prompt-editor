import React from 'react';
import { Button, Space } from 'antd';
import { PlayCircle, Variable, Zap } from 'lucide-react';
import {
  EditorVariable,
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
      content: '请分析用户的需求，包括核心功能、用户场景和技术要求。',
      children: [],
      isLocked: false,
      hasRun: false,
    },
  ]);

  // 模拟数据选择器组件
  const DataSelector = ({
    onSelect,
    onCancel,
  }: {
    onSelect: (data: any) => void;
    onCancel: () => void;
  }) => {
    const variables = [
      { id: 'username', label: '@用户名', value: 'username' },
      { id: 'email', label: '@邮箱', value: 'email' },
      { id: 'phone', label: '@手机号', value: 'phone' },
    ];

    return (
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          minWidth: '300px',
        }}
      >
        <h3 style={{ marginBottom: '16px' }}>选择变量</h3>
        <Space direction="vertical" style={{ width: '100%' }}>
          {variables.map((v) => (
            <Button
              key={v.id}
              onClick={() =>
                onSelect({
                  id: v.id,
                  label: v.label,
                  value: v.value,
                })
              }
              style={{ width: '100%', textAlign: 'left' }}
            >
              {v.label}
            </Button>
          ))}
        </Space>
        <Button onClick={onCancel} style={{ marginTop: '16px', width: '100%' }}>
          取消
        </Button>
      </div>
    );
  };

  // 处理运行请求
  const handleRunRequest = (request: RunTaskRequest) => {
    console.log('🚀 Run API called:', request);
    setTimeout(() => {
      const result: RunTaskResponse = {
        result: `✅ 运行成功！\n\n节点：${request.nodeId}`,
      };
      if (request.meta?.onNodeRun) {
        (request.meta.onNodeRun as any)(request.nodeId, result);
      }
    }, 1000);
  };

  // 处理优化请求
  const handleOptimizeRequest = (request: OptimizeRequest) => {
    console.log('✨ Optimize API called:', request);
    setTimeout(() => {
      try {
        request.applyOptimizedContent(
          request.content + '\n\n---\n\n✨ **[AI 优化完成]**',
        );
      } catch (error) {
        request.setOptimizeError(error as Error);
      }
    }, 1500);
  };

  // 自定义底部操作按钮
  const renderCustomActions = ({
    defaultActions,
  }: {
    node: TaskNode;
    defaultActions: {
      handleOpenDataSelector: (e: React.MouseEvent) => void;
      handleRun: (e: React.MouseEvent) => void;
      handleOptimize: (e: React.MouseEvent) => void;
    };
    isDarkMode: boolean;
  }) => {
    return (
      <Space size="small">
        <Button
          icon={<Variable size={14} />}
          onClick={defaultActions.handleOpenDataSelector}
          size="small"
          type="text"
        >
          插入变量
        </Button>
        <Button
          icon={<PlayCircle size={14} />}
          onClick={defaultActions.handleRun}
          size="small"
          type="primary"
        >
          执行
        </Button>
        <Button
          icon={<Zap size={14} />}
          onClick={defaultActions.handleOptimize}
          size="small"
          type="default"
        >
          AI 优化
        </Button>
      </Space>
    );
  };

  // 监听变量变化
  const handleVariableChange = (
    nodeId: string,
    variables: EditorVariable[],
  ) => {
    console.log(`📍 Node ${nodeId} variables changed:`, variables);
    console.log(
      'Variables:',
      variables.map((v) => ({
        id: v.data.id,
        label: v.data.label,
        position: v.position,
      })),
    );
  };

  return (
    <DemoWrapper height="550px">
      <PromptEditor
        value={value}
        onChange={setValue}
        onRunRequest={handleRunRequest}
        onOptimizeRequest={handleOptimizeRequest}
        dataSelector={DataSelector}
        onVariableChange={handleVariableChange}
        renderNodeActions={renderCustomActions}
      />
    </DemoWrapper>
  );
};
