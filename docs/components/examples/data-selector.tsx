import React, { useState } from 'react';
import { message } from 'antd';
import { PromptEditor } from '../../../src';
import { SimpleDataSelector } from '../../../examples/SimpleDataSelector';
import type { TaskNode, EditorVariable, RunTaskRequest, RunTaskResponse } from '../../../src/types';

/**
 * 数据选择器示例 - 在编辑器中插入 @变量
 * 
 * 这个示例展示如何：
 * 1. 使用 dataSelector prop 传入自定义数据选择器组件
 * 2. 管理变量状态（可选）
 * 3. 处理变量插入和显示
 */
const DataSelectorDemo: React.FC = () => {
  const [value, setValue] = useState<TaskNode[]>([
    {
      id: '1',
      title: '用户信息模板',
      content: '你好，{{user.name}}！\n\n你的邮箱是：{{user.email}}\n当前日期：{{date.now}}',
      children: [],
      isLocked: false,
      hasRun: false,
      dependencies: [],
    },
    {
      id: '2',
      title: 'AI 配置模板',
      content: '使用模型：{{model.name}}\n温度参数：{{model.temperature}}\n\n请根据以上配置生成内容。',
      children: [],
      isLocked: false,
      hasRun: false,
      dependencies: [],
    },
  ]);

  // 可选：管理每个节点的变量列表
  const [nodeVariables, setNodeVariables] = useState<Record<string, EditorVariable[]>>({});

  const handleVariableChange = (nodeId: string, variables: EditorVariable[]) => {
    // eslint-disable-next-line no-console
    console.log('节点变量变化:', nodeId, variables);
    setNodeVariables((prev) => ({ ...prev, [nodeId]: variables }));
  };

  const handleChange = (data: TaskNode[]) => {
    setValue(data);
    // eslint-disable-next-line no-console
    console.log('编辑器数据变化:', data);
  };

  // 处理运行请求
  const handleRunRequest = (request: RunTaskRequest) => {
    console.log('🚀 运行请求:', request);
    console.log('📝 节点内容（已替换变量）:', request.content);
    
    // 打印详细信息
    message.info({
      content: '运行请求已触发，请查看控制台查看详细内容',
      duration: 3,
    });
    
    // 模拟运行完成
    setTimeout(() => {
      const result: RunTaskResponse = {
        result: `✅ 运行成功！\n\n节点：${request.nodeId}\n\n处理后的内容：\n${request.content}`,
      };
      
      // 通知编辑器运行完成
      if (request.meta?.onNodeRun) {
        request.meta.onNodeRun(request.nodeId, result);
      }
    }, 1000);
  };

  return (
    <div style={{ height: '600px' }}>
      <PromptEditor
        value={value}
        onChange={handleChange}
        dataSelector={SimpleDataSelector}
        // 如果需要追踪变量，可以传入回调
        onVariableChange={handleVariableChange}
        // 运行请求回调
        onRunRequest={handleRunRequest}
      />
      
      {/* 显示当前变量信息（调试用） */}
      {Object.keys(nodeVariables).length > 0 && (
        <div style={{ 
          marginTop: '16px', 
          padding: '12px', 
          background: '#f5f5f5', 
          borderRadius: '4px',
          fontSize: '12px'
        }}>
          <strong>已插入的变量：</strong>
          <pre style={{ margin: '8px 0 0', overflow: 'auto' }}>
            {JSON.stringify(nodeVariables, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DataSelectorDemo;
