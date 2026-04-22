import React, { useState } from 'react';
import { message } from 'antd';
import { PromptEditor } from '../../../src';
import { SimpleDataSelector } from '../../../examples/SimpleDataSelector';
import type { TaskNode, RunTaskRequest, RunTaskResponse } from '../../../src/types';

/**
 * 数据选择器示例 - 在编辑器中插入 @变量
 *
 * 这个示例展示如何：
 * 1. 使用 dataSelector prop 传入自定义数据选择器组件
 * 2. 处理变量插入和显示
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
        // 运行请求回调
        onRunRequest={handleRunRequest}
      />
      

    </div>
  );
};

export default DataSelectorDemo;
