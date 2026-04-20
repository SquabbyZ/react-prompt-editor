import React, { useState } from 'react';
import { PromptEditor } from '../../../src';
import '../../../src/styles/tailwind.css';
import { TaskNode } from '../../../src/types';
import { DemoWrapper } from '../../demo-wrapper';

/**
 * 受控 vs 非受控模式
 *
 * - 受控模式：通过 value + onChange 管理数据，适合需要在外部同步状态的场景
 * - 非受控模式：通过 initialValue 传入初始数据，组件自行管理状态，适合简单场景
 */
export default () => {
  // ===== 受控模式 =====
  const [controlledValue, setControlledValue] = useState<TaskNode[]>([
    {
      id: 'c1',
      title: '受控模式节点',
      content:
        '# 受控模式\n\n使用 `value` + `onChange` 管理数据，你可以在外部读取和修改编辑器状态。',
      children: [],
      isLocked: false,
      hasRun: false,
    },
  ]);

  // 外部重置按钮
  const handleReset = () => {
    setControlledValue([
      {
        id: 'c1',
        title: '受控模式节点（已重置）',
        content: '# 已重置\n\n内容已被外部重置为初始状态。',
        children: [],
        isLocked: false,
        hasRun: false,
      },
    ]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 受控模式 */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px',
          }}
        >
          <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600 }}>
            ✅ 受控模式 (value + onChange)
          </h4>
          <button
            type="button"
            onClick={handleReset}
            style={{
              padding: '4px 12px',
              fontSize: '12px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              background: '#f9fafb',
              cursor: 'pointer',
            }}
          >
            外部重置
          </button>
        </div>
        <div
          style={{
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '8px',
          }}
        >
          当前节点数：{controlledValue.length}，第一个节点标题：「
          {controlledValue[0]?.title}」
        </div>
        <DemoWrapper height="300px">
          <PromptEditor
            value={controlledValue}
            onChange={setControlledValue}
          />
        </DemoWrapper>
      </div>

      {/* 非受控模式 */}
      <div>
        <h4
          style={{
            margin: '0 0 8px',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          📦 非受控模式 (initialValue)
        </h4>
        <div
          style={{
            fontSize: '12px',
            color: '#6b7280',
            marginBottom: '8px',
          }}
        >
          组件内部自行管理状态，外部无法直接读取或修改。
        </div>
        <DemoWrapper height="300px">
          <PromptEditor
            initialValue={[
              {
                id: 'u1',
                title: '非受控模式节点',
                content:
                  '# 非受控模式\n\n使用 `initialValue` 只传入初始数据，组件自行管理后续状态。',
                children: [],
                isLocked: false,
                hasRun: false,
              },
            ]}
          />
        </DemoWrapper>
      </div>
    </div>
  );
};
