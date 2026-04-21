---
name: peaks-react-prompt-editor
description: Expert guide for using, integrating, and customizing the react-prompt-editor (RPEditor) library — a tree-structured React prompt editor for AI workflows. Use this skill when working with the react-prompt-editor package, building prompt management UIs, integrating PromptEditor component into React apps, configuring AI optimization, implementing variable insertion, handling node execution, customizing toolbars/actions, or debugging any issues related to react-prompt-editor. Triggers on tasks involving PromptEditor component, TaskNode data, RunTaskRequest, OptimizeRequest, OptimizeConfig, DataSelector, EditorVariable, or any mention of react-prompt-editor.
---

# React Prompt Editor (RPEditor) Skill

## Installation

```bash
pnpm add react-prompt-editor antd @ant-design/x
```

**Always import styles** (required):
```tsx
import 'react-prompt-editor/styles/index.css';
```

## Quick Start

```tsx
import { PromptEditor, TaskNode, enUS } from 'react-prompt-editor';
import 'react-prompt-editor/styles/index.css';

const [data, setData] = useState<TaskNode[]>([
  { id: '1', title: 'System Prompt', content: '# Role\nYou are a helpful assistant.', children: [], isLocked: false, hasRun: false }
]);

<PromptEditor value={data} onChange={setData} locale={enUS} />
```

## Key Concepts

- **TaskNode**: Public tree-nested format used in `value`/`onChange`. Has `children: TaskNode[]`.
- **Controlled vs uncontrolled**: Use `value`+`onChange` for controlled; `initialValue` for uncontrolled.
- **Callback-based async**: Component fires callbacks (`onRunRequest`, `onOptimizeRequest`); you handle API calls and notify component via `request.meta?.onNodeRun?.()` or `request.applyOptimizedContent()`.
- **Dependencies**: Each node can declare `dependencies: string[]` (IDs). When running, `dependenciesContent` is auto-collected and passed in `RunTaskRequest`.

## Common Patterns

### Node Execution
```tsx
const handleRunRequest = (request: RunTaskRequest) => {
  myAPI.run({ content: request.content, deps: request.dependenciesContent })
    .then(result => request.meta?.onNodeRun?.(request.nodeId, result));
};
<PromptEditor onRunRequest={handleRunRequest} ... />
```

### AI Optimization — Simple Mode (recommended)
```tsx
<PromptEditor
  optimizeConfig={{
    url: 'https://api.openai.com/v1/chat/completions',
    headers: { Authorization: 'Bearer sk-...' },
    model: 'gpt-4o',
    platform: 'openai',  // 'openai' | 'dify' | 'bailian' | 'auto'
  }}
  ...
/>
```

### AI Optimization — Advanced Mode (full control)
```tsx
const handleOptimize = (request: OptimizeRequest) => {
  streamAPI(request.messages, request.signal)
    .then(content => request.applyOptimizedContent(content))
    .catch(err => request.setOptimizeError(err));
};
<PromptEditor onOptimizeRequest={handleOptimize} ... />
```

### Variable Insertion
```tsx
const DataSelector = ({ onSelect, onCancel }: DataSelectorComponentProps) => (
  <Modal open onCancel={onCancel}>
    <Button onClick={() => onSelect({ id: 'var1', label: '@username', value: 'username' })}>
      @username
    </Button>
  </Modal>
);

<PromptEditor
  dataSelector={DataSelector}
  onVariableChange={(nodeId, variables) => console.log(nodeId, variables)}
  ...
/>
```

### Preview Mode
```tsx
<PromptEditor previewMode value={data} previewRenderMode="markdown" />
// previewRenderMode: 'readonly-editor' (default) | 'markdown'
```

### Custom Node Actions
```tsx
<PromptEditor
  renderNodeActions={({ node, defaultActions, isDarkMode }) => (
    <Space>
      <Button onClick={defaultActions.handleRun}>Run</Button>
      <Button onClick={defaultActions.handleOptimize}>AI</Button>
      <Button onClick={defaultActions.handleOpenDataSelector}>Variable</Button>
    </Space>
  )}
  ...
/>
```

### Custom Toolbar
```tsx
<PromptEditor
  renderToolbar={(actions) => (
    <Button onClick={() => actions.addRootNode()}>+ Add Node</Button>
  )}
  ...
/>
```

### Drag-and-Drop & Theme & i18n
```tsx
import { zhCN, enUS } from 'react-prompt-editor';
<PromptEditor draggable theme="dark" locale={enUS} onChange={setData} ... />
// theme: 'system' | 'light' | 'dark'
```

## Full API Reference

See [references/api_reference.md](references/api_reference.md) for complete prop/type documentation including all interfaces and callback signatures.

## Troubleshooting

- **Styles missing**: Ensure `import 'react-prompt-editor/styles/index.css'` is present.
- **Peer dep errors**: Install `antd` and `@ant-design/x` alongside the package.
- **onChange not firing**: Confirm you're passing both `value` and `onChange` (controlled mode).
- **optimizeConfig not working**: Check `platform` matches your API (`'auto'` for auto-detection).
- **Variables not showing**: `dataSelector` must be a React component, not a render function.
