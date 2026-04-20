# React Prompt Editor

树形 Prompt 编辑器 React 组件，适用于复杂 AI 工作流、节点编排和多段内容协作编辑。

当前 npm 版本基于 Ant Design UI 体系构建，宿主项目需要提供 `antd` 与 `@ant-design/x`。后续会逐步提供其他 UI 库版本。

- 官网文档: https://www.rpeditor.asia
- npm: https://www.npmjs.com/package/react-prompt-editor
- GitHub: https://github.com/SquabbyZ/react-prompt-editor

## 安装

```bash
pnpm add react-prompt-editor antd @ant-design/x
```

`react`、`react-dom`、`antd` 和 `@ant-design/x` 为 `peerDependencies`。其中 React 应由你的应用本身提供，当前 UI 版本需要你额外安装 `antd` 与 `@ant-design/x`。

## 快速开始

```tsx
import { PromptEditor } from 'react-prompt-editor';
import 'react-prompt-editor/styles/index.css';

const initialValue = [
  {
    id: 'root-1',
    title: 'System Prompt',
    content: '# Role\n\nYou are a helpful assistant.',
    children: [],
    isLocked: false,
    hasRun: false,
    dependencies: [],
  },
];

export default function App() {
  return (
    <PromptEditor
      initialValue={initialValue}
      onChange={(data) => {
        console.log('tree changed:', data);
      }}
      theme="system"
      draggable
    />
  );
}
```

## 常用 Props

| Prop | 说明 |
| --- | --- |
| `initialValue` | 非受控初始树数据 |
| `value` | 受控模式数据 |
| `onChange` | 树数据变化回调 |
| `onRunRequest` | 节点运行请求回调 |
| `optimizeConfig` | 内置 AI 优化配置 |
| `onOptimizeRequest` | 自定义 AI 优化流程 |
| `previewMode` | 只读预览模式 |
| `previewRenderMode` | 预览渲染模式，支持 `readonly-editor` 和 `markdown` |
| `draggable` | 是否启用拖拽排序 |
| `theme` | 主题模式，支持 `system` / `light` / `dark` |
| `locale` | 国际化语言包 |
| `renderToolbar` | 自定义顶部工具栏渲染函数 |
| `dataSelector` | 数据选择器组件，支持 `@` 变量插入功能 |
| `onVariableChange` | 变量变化回调函数 |

## 额外导出

```tsx
import { enUS, zhCN } from 'react-prompt-editor';
```

## 主要特性

###  数据选择器（变量插入）

支持通过 `@` 符号触发数据选择器，在编辑器中插入变量标签：

```tsx
import { PromptEditor } from 'react-prompt-editor';
import { SimpleDataSelector } from './MyDataSelector';

const App = () => (
  <PromptEditor
    initialValue={initialValue}
    dataSelector={SimpleDataSelector}
    onVariableChange={(nodeId, variables) => {
      console.log('Node', nodeId, 'has variables:', variables);
    }}
  />
);
```

### 🎨 自定义工具栏

使用 `renderToolbar` 完全控制顶部工具栏的内容和布局：

```tsx
<PromptEditor
  initialValue={initialValue}
  renderToolbar={(actions) => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <span>📝 我的 Prompt 工作区</span>
      <button onClick={() => actions.addRootNode()}>添加节点</button>
    </div>
  )}
/>
```

### 👁️ 预览模式

提供两种预览渲染方式：

```tsx
// 只读编辑器模式
<PromptEditor
  previewMode
  previewRenderMode="readonly-editor"
/>

// Markdown 阅读模式
<PromptEditor
  previewMode
  previewRenderMode="markdown"
/>
```

## 文档

- 完整使用文档与示例: https://www.rpeditor.asia
- 问题反馈: https://github.com/SquabbyZ/react-prompt-editor/issues

## License

MIT
