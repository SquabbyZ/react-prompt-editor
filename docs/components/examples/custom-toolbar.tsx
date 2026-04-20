import React, { useState } from 'react';
import { PromptEditor } from '../../../src';
import '../../../src/styles/tailwind.css';
import { RunTaskRequest, RunTaskResponse, TaskNode } from '../../../src/types';
import { DemoWrapper } from '../../demo-wrapper';

/**
 * 自定义工具栏示例
 *
 * 使用 renderToolbar 自定义顶部工具栏的内容和布局。
 * 回调参数 actions 提供了 addRootNode 等内置操作方法。
 */
export default () => {
  const [value, setValue] = useState<TaskNode[]>([
    {
      id: '1',
      title: '系统角色定义',
      content:
        '# 系统角色\n\n你是一个专业的代码审查助手，需要对用户提交的代码进行安全性和质量检查。',
      children: [],
      isLocked: false,
      hasRun: false,
    },
  ]);

  const handleRunRequest = (request: RunTaskRequest) => {
    setTimeout(() => {
      const result: RunTaskResponse = {
        result: `✅ 节点 ${request.nodeId} 运行完成`,
      };
      request.meta?.onNodeRun?.(request.nodeId, result);
    }, 800);
  };

  return (
    <DemoWrapper height="500px">
      <PromptEditor
        value={value}
        onChange={setValue}
        onRunRequest={handleRunRequest}
        renderToolbar={(actions) => (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 16px',
              borderBottom: '1px solid #e5e7eb',
              background: '#fafafa',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <span style={{ fontSize: '16px' }}>📝</span>
              <span
                style={{
                  fontWeight: 600,
                  fontSize: '14px',
                  color: '#374151',
                }}
              >
                我的 Prompt 工作区
              </span>
              <span
                style={{
                  fontSize: '12px',
                  color: '#9ca3af',
                  padding: '2px 8px',
                  background: '#f3f4f6',
                  borderRadius: '4px',
                }}
              >
                {value.length} 个节点
              </span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={() => {
                  // 使用内置 addRootNode 添加节点
                  actions.addRootNode();
                }}
                style={{
                  padding: '4px 12px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  border: '1px solid #6366f1',
                  background: '#eef2ff',
                  color: '#4f46e5',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                + 添加节点
              </button>
              <button
                type="button"
                onClick={() => {
                  const json = JSON.stringify(value, null, 2);
                  console.log('导出数据:', json);
                  alert('数据已输出到控制台，请查看 DevTools');
                }}
                style={{
                  padding: '4px 12px',
                  fontSize: '12px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                  color: '#374151',
                  cursor: 'pointer',
                }}
              >
                📋 导出 JSON
              </button>
            </div>
          </div>
        )}
      />
    </DemoWrapper>
  );
};
