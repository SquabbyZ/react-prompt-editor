import React, { useState } from 'react';
import type { Locale } from '../../../src';
import { enUS, PromptEditor, zhCN } from '../../../src';
import {
  OptimizeRequest,
  OptimizeResponse,
  RunTaskRequest,
  RunTaskResponse,
  TaskNode,
} from '../../../src/types';

export default () => {
  const [locale, setLocale] = useState<Locale>(zhCN);
  const [value, setValue] = React.useState<TaskNode[]>([
    {
      id: '1',
      title:
        locale === zhCN ? '第一步：需求分析' : 'Step 1: Requirements Analysis',
      content:
        locale === zhCN
          ? '# 需求分析\n\n请分析用户的需求，包括：\n- 核心功能\n- 用户场景\n- 技术要求'
          : '# Requirements Analysis\n\nPlease analyze user requirements, including:\n- Core features\n- User scenarios\n- Technical requirements',
      children: [],
      isLocked: false,
      hasRun: false,
    },
  ]);

  const handleNodeRun = (nodeId: string, result: RunTaskResponse) => {
    console.log('✅ Node run completed:', nodeId, result);
  };

  const handleNodeOptimize = (nodeId: string) => {
    console.log('✨ Node optimized:', nodeId);
  };

  const handleNodeLock = (nodeId: string, isLocked: boolean) => {
    console.log('🔒 Node lock:', nodeId, isLocked);
  };

  const handleTreeChange = (tree: TaskNode[]) => {
    console.log('📊 Tree changed:', tree);
  };

  const handleRunRequest = (request: RunTaskRequest) => {
    setTimeout(() => {
      const result: RunTaskResponse = {
        result: `✅ Success!\n\nNode: ${request.nodeId}\nContent length: ${request.content.length} chars`,
        stream: false,
      };
      handleNodeRun(request.nodeId, result);
    }, 1000);
  };

  const handleOptimizeRequest = (
    request: OptimizeRequest,
    callbacks: {
      onResponse: (response: OptimizeResponse) => void;
      onError: (error: Error) => void;
    },
  ) => {
    setTimeout(() => {
      try {
        const response: OptimizeResponse = {
          optimizedContent:
            request.content + '\n\n---\n\n✨ **[AI Optimized]**',
          thinkingProcess: '🤔 Analyzing...\n📝 Optimizing...\n✅ Done!',
        };
        callbacks.onResponse(response);
      } catch (error) {
        callbacks.onError(error as Error);
      }
    }, 1500);
  };

  return (
    <div className="p-4">
      {/* 语言切换按钮 */}
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setLocale(zhCN)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            locale === zhCN
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🇨🇳 中文
        </button>
        <button
          type="button"
          onClick={() => setLocale(enUS)}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            locale === enUS
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          🇺🇸 English
        </button>
      </div>

      <PromptEditor
        value={value}
        onChange={setValue}
        onRunRequest={handleRunRequest}
        onOptimizeRequest={handleOptimizeRequest}
        onNodeRun={handleNodeRun}
        onNodeOptimize={handleNodeOptimize}
        onNodeLock={handleNodeLock}
        onTreeChange={handleTreeChange}
        locale={locale}
      />
    </div>
  );
};
