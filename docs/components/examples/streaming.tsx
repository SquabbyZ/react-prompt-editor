import { Button, ConfigProvider, Input, message, Select, Space } from 'antd';
import React, { useState } from 'react';
import { PromptEditor } from '../../../src';
import '../../../src/styles/tailwind.css';
import { OptimizeConfig, TaskNode } from '../../../src/types';
import { DemoWrapper } from '../../demo-wrapper';

/**
 * 流式输出示例 - 支持用户配置真实接口进行测试
 */
export default () => {
  const [value, setValue] = useState<TaskNode[]>([
    {
      id: '1',
      title: 'AI 流式优化测试',
      content: '# 原始内容\n\n请尝试使用您的后端接口来优化这段文本。',
      children: [],
      isLocked: false,
      hasRun: false,
    },
  ]);

  // 用户配置的接口信息
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('gpt-3.5-turbo');
  const [platform, setPlatform] = useState<
    'auto' | 'openai' | 'dify' | 'bailian'
  >('auto');

  const [optimizeConfig, setOptimizeConfig] = useState<
    OptimizeConfig | undefined
  >(undefined);

  const handleApplyConfig = () => {
    if (!apiUrl) {
      message.warning('请输入 API 地址');
      return;
    }

    setOptimizeConfig({
      url: apiUrl,
      headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : {},
      model,
      platform,
      stream: true, // 默认开启流式
    });
    message.success('配置已应用，现在可以尝试 AI 优化了！');
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#1677ff',
        },
        components: {
          Input: {
            colorBgContainer: 'var(--pe-color-bg-primary, #fff)',
            colorBorder: 'var(--pe-color-border, #e5e7eb)',
            colorText: 'var(--pe-color-text-primary, #111827)',
            colorTextPlaceholder: 'var(--pe-color-text-tertiary, #9ca3af)',
          },
          Select: {
            colorBgContainer: 'var(--pe-color-bg-primary, #fff)',
            colorBorder: 'var(--pe-color-border, #e5e7eb)',
            colorText: 'var(--pe-color-text-primary, #111827)',
          },
        },
      }}
    >
      <DemoWrapper height="600px" title="Streaming Output Test">
        <div className="border-b border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800">
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div className="mb-2 text-sm text-zinc-600 dark:text-zinc-400">
              💡 提示：配置您的后端代理地址以测试真实的流式输出效果。
            </div>
            <div className="flex w-full items-center gap-2">
              <Input
                placeholder="API URL (例如: /api/chat)"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                style={{ width: '30%' }}
              />
              <Input
                placeholder="API Key (可选)"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                style={{ width: '25%' }}
              />
              <Input
                placeholder="Model (例如: gpt-3.5-turbo)"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                style={{ width: '20%' }}
              />
              <Select
                value={platform}
                onChange={(value) => setPlatform(value)}
                className="w-28"
                options={[
                  { value: 'auto', label: 'Auto' },
                  { value: 'openai', label: 'OpenAI' },
                  { value: 'dify', label: 'Dify' },
                  { value: 'bailian', label: '阿里百炼' },
                ]}
              />
              <Button type="primary" onClick={handleApplyConfig}>
                应用
              </Button>
            </div>
          </Space>
        </div>

        <PromptEditor
          value={value}
          onChange={setValue}
          optimizeConfig={optimizeConfig}
          onLike={() => message.info('触发了点赞回调')}
          onDislike={() => message.info('触发了点踩回调')}
        />
      </DemoWrapper>
    </ConfigProvider>
  );
};
