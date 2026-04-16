import { ConfigProvider, Radio, Space, theme as antdTheme } from 'antd';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PromptEditor } from '../../src';
import '../../src/styles/tailwind.css';
import type { TaskNode } from '../../src/types';

const ThemeDemo: React.FC = () => {
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');
  const [dumiTheme, setDumiTheme] = useState<'light' | 'dark'>('light');
  const wrapperRef = useRef<HTMLDivElement>(null);

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
  const isDark = effectiveTheme === 'dark';

  useEffect(() => {
    const previewer = wrapperRef.current?.closest('.dumi-default-previewer');
    if (!previewer) return;

    previewer.classList.toggle('rpe-demo-previewer-dark', isDark);
    previewer.setAttribute('data-theme', effectiveTheme);

    return () => {
      previewer.classList.remove('rpe-demo-previewer-dark');
      previewer.removeAttribute('data-theme');
    };
  }, [effectiveTheme, isDark]);

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
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#6366f1',
          borderRadius: 8,
        },
      }}
    >
      <div
        ref={wrapperRef}
        data-theme={effectiveTheme}
        className={`${isDark ? 'dark' : ''} space-y-4 rounded-[28px] border p-4 transition-colors md:p-8 ${
          isDark
            ? 'border-blue-900/80 bg-[#07101f] shadow-[0_24px_80px_rgba(2,6,23,0.38)]'
            : 'border-gray-200 bg-[#fbfcfe]'
        }`}
      >
        {/* 主题切换器 */}
        <div
          className={`rounded-2xl border p-4 transition-colors ${
            isDark
              ? 'border-blue-950/80 bg-[linear-gradient(180deg,rgba(10,21,43,0.96),rgba(7,16,31,0.98))]'
              : 'border-gray-200 bg-white'
          }`}
        >
          <div className={`mb-2 text-sm font-medium ${isDark ? 'text-slate-100' : 'text-gray-700'}`}>
            选择主题模式：
          </div>
          <p className={`mb-3 text-xs leading-6 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>
            这里只控制下方示例组件的主题，不会修改整篇文档站的主题模式。
          </p>
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
        <div
          className={`overflow-hidden rounded-2xl border transition-colors ${
            isDark
              ? 'border-blue-950/80 bg-[linear-gradient(180deg,rgba(8,20,40,0.96),rgba(6,16,32,0.98))] p-4'
              : 'border-gray-300 bg-white'
          }`}
        >
          <PromptEditor
            initialValue={initialValue}
            theme={effectiveTheme as any}
            onRunRequest={(request) => {
              console.log('运行请求:', request);
              setTimeout(() => {
                // 模拟运行完成
              }, 1000);
            }}
            onOptimizeRequest={(request) => {
              console.log('优化请求:', request);
              setTimeout(() => {
                request.applyOptimizedContent(
                  request.content + '\n\n✨ [AI 优化完成]',
                );
              }, 1500);
            }}
          />
        </div>
      </div>
    </ConfigProvider>
  );
};

export default ThemeDemo;
