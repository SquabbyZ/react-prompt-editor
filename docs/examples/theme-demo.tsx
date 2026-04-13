import { ConfigProvider, Radio, Space } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import { PromptEditor } from '../../src';
import type { TaskNode } from '../../src/types';

const ThemeDemo: React.FC = () => {
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');
  const [dumiTheme, setDumiTheme] = useState<'light' | 'dark'>('light');

  // 监听 dumi 主题变化（data-prefers-color 属性）
  useEffect(() => {
    const html = document.documentElement;

    // 初始读取
    const currentDumiTheme = html.getAttribute('data-prefers-color') as
      | 'light'
      | 'dark';
    if (currentDumiTheme) {
      setDumiTheme(currentDumiTheme);
    }

    // 监听变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'data-prefers-color'
        ) {
          const newTheme = html.getAttribute('data-prefers-color') as
            | 'light'
            | 'dark';
          if (newTheme) {
            setDumiTheme(newTheme);
          }
        }
      });
    });

    observer.observe(html, {
      attributes: true,
      attributeFilter: ['data-prefers-color'],
    });

    return () => observer.disconnect();
  }, []);

  // system 模式下使用 dumi 主题，否则使用用户选择的主题
  const effectiveTheme = theme === 'system' ? dumiTheme : theme;

  const initialValue = useMemo<TaskNode[]>(
    () => [
      {
        id: '1',
        title: '主题模式演示',
        content:
          '# 主题模式演示\n\n这个示例展示了如何切换明亮/暗色主题。\n\n## 特性\n\n- **system**: 跟随系统设置\n- **light**: 强制明亮模式\n- **dark**: 强制暗色模式\n\n你可以点击上方的按钮切换不同的主题模式，观察编辑器的变化。',
        children: [],
        isLocked: false,
        hasRun: false,
        dependencies: [],
      },
    ],
    [],
  );

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#6366f1',
          borderRadius: 8,
        },
      }}
    >
      <div className="space-y-4">
        {/* 主题切换器 */}
        <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            选择主题模式：
          </div>
          <Radio.Group
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            buttonStyle="solid"
          >
            <Space>
              <Radio.Button value="system">System (跟随系统)</Radio.Button>
              <Radio.Button value="light">Light (明亮)</Radio.Button>
              <Radio.Button value="dark">Dark (暗色)</Radio.Button>
            </Space>
          </Radio.Group>
        </div>

        {/* 编辑器 */}
        <div className="rounded-lg border border-gray-300">
          <PromptEditor
            initialValue={initialValue}
            theme={effectiveTheme as any}
            onRunRequest={(request) => {
              console.log('运行请求:', request);
              setTimeout(() => {
                // 模拟运行完成
              }, 1000);
            }}
            onOptimizeRequest={(request, callbacks) => {
              console.log('优化请求:', request);
              setTimeout(() => {
                callbacks.onResponse({
                  optimizedContent: request.content + '\n\n✨ [AI 优化完成]',
                  thinkingProcess: '正在优化...',
                });
              }, 1500);
            }}
          />
        </div>
      </div>
    </ConfigProvider>
  );
};

export default ThemeDemo;
