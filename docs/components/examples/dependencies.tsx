import React from 'react';
import { PromptEditor } from '../../../src';
import '../../../src/styles/tailwind.css';
import { RunTaskRequest, RunTaskResponse, TaskNode } from '../../../src/types';
import { DemoWrapper } from '../../demo-wrapper';

/**
 * 节点依赖配置示例
 *
 * 展示如何使用 dependencies 建立节点间的依赖关系。
 * 运行节点时，onRunRequest 中的 dependenciesContent 会自动包含依赖节点的内容。
 */
export default () => {
  const [value, setValue] = React.useState<TaskNode[]>([
    {
      id: 'role',
      title: '角色定义',
      content:
        '# 角色\n\n你是一名资深前端工程师，精通 React 和 TypeScript，擅长组件设计和性能优化。',
      children: [],
      isLocked: false,
      hasRun: false,
    },
    {
      id: 'context',
      title: '上下文背景',
      content:
        '# 项目背景\n\n我们正在开发一个企业级 Prompt 编辑器，需要支持树形结构、拖拽排序和 AI 优化功能。\n\n## 技术栈\n- React 18\n- TypeScript 5\n- Zustand\n- CodeMirror 6',
      children: [],
      isLocked: false,
      hasRun: false,
    },
    {
      id: 'task',
      title: '当前任务',
      content:
        '# 代码审查任务\n\n请基于**角色定义**和**上下文背景**，对以下代码进行审查：\n\n```tsx\nconst App = () => {\n  const [data, setData] = useState([]);\n  useEffect(() => {\n    fetch("/api/data").then(r => r.json()).then(setData);\n  }, []);\n  return <List items={data} />;\n};\n```',
      children: [],
      isLocked: false,
      hasRun: false,
      // 此节点依赖 "角色定义" 和 "上下文背景"
      dependencies: ['role', 'context'],
    },
  ]);

  const handleRunRequest = (request: RunTaskRequest) => {
    console.log('🚀 运行请求:', request);
    console.log(
      '📎 依赖内容:',
      request.dependenciesContent.map((d) => `${d.title}: ${d.content.slice(0, 50)}...`),
    );

    setTimeout(() => {
      const depsInfo = request.dependenciesContent
        .map((d) => `- **${d.title}** (${d.hasRun ? '已运行' : '未运行'})`)
        .join('\n');

      const result: RunTaskResponse = {
        result: `✅ 运行完成！\n\n**收到 ${request.dependenciesContent.length} 个依赖节点的内容：**\n${depsInfo}\n\n依赖内容已自动注入上下文，可以进行更精准的 AI 交互。`,
      };
      request.meta?.onNodeRun?.(request.nodeId, result);
    }, 1000);
  };

  return (
    <div>
      <div
        style={{
          padding: '12px 16px',
          marginBottom: '12px',
          background: '#eff6ff',
          borderRadius: '8px',
          border: '1px solid #bfdbfe',
          fontSize: '13px',
          color: '#1e40af',
          lineHeight: '1.6',
        }}
      >
        💡 <strong>提示：</strong>「当前任务」节点配置了对「角色定义」和「上下文背景」的依赖。
        展开该节点后可在底部看到依赖配置区域，点击运行时
        <code style={{ background: '#dbeafe', padding: '1px 4px', borderRadius: '3px' }}>
          dependenciesContent
        </code>
        会自动包含这两个节点的内容。
      </div>
      <DemoWrapper height="500px">
        <PromptEditor
          value={value}
          onChange={setValue}
          onRunRequest={handleRunRequest}
          onNodeRun={(nodeId, result) => {
            console.log('✅ 节点运行完成:', nodeId, result);
          }}
        />
      </DemoWrapper>
    </div>
  );
};
