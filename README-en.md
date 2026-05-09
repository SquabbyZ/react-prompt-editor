# React Prompt Editor

A tree-based Prompt Editor component for complex AI workflows, node orchestration, and collaborative multi-section editing.

Built with Ant Design UI components. Your host project needs to provide `antd` and `@ant-design/x`.

- Documentation: https://www.rpeditor.asia
- npm: https://www.npmjs.com/package/react-prompt-editor
- GitHub: https://github.com/SquabbyZ/react-prompt-editor

## Installation

```bash
pnpm add react-prompt-editor antd @ant-design/x
```

`react`, `react-dom`, `antd`, and `@ant-design/x` are `peerDependencies`. React should be provided by your application. The current UI version requires you to install `antd` and `@ant-design/x` separately.

## Quick Start

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

## Common Props

| Prop | Description |
| --- | --- |
| `initialValue` | Uncontrolled initial tree data |
| `value` | Controlled mode data |
| `onChange` | Tree data change callback |
| `onRunRequest` | Node execution request callback |
| `optimizeConfig` | Built-in AI optimization configuration |
| `onOptimizeRequest` | Custom AI optimization flow |
| `previewMode` | Read-only preview mode |
| `previewRenderMode` | Preview render mode: `readonly-editor` or `markdown` |
| `draggable` | Enable drag-and-drop reordering |
| `theme` | Theme mode: `system` / `light` / `dark` |
| `locale` | Internationalization locale |
| `renderToolbar` | Custom top toolbar render function |
| `dataSelector` | Data selector component for `@` variable insertion |

## Additional Exports

```tsx
import { enUS, zhCN } from 'react-prompt-editor';
```

## Key Features

### 🔖 Data Selector (Variable Insertion)

Trigger the data selector via `@` symbol to insert variable tags into the editor. Variables are displayed as highlighted tags and automatically replaced with actual values when the node is executed:

```tsx
import { PromptEditor } from 'react-prompt-editor';
import { SimpleDataSelector } from './MyDataSelector';

const App = () => (
  <PromptEditor
    initialValue={initialValue}
    dataSelector={SimpleDataSelector}
    onRunRequest={(request) => {
      // Variables in request.content have been replaced with actual values (e.g., {{user.name}})
      console.log('Processed content:', request.content);
      // Execute async request...
      request.meta?.onNodeRun?.(request.nodeId, { result: '✅ Success' });
    }}
  />
);
```

#### Multi-Select Mode

The data selector supports multi-select mode, allowing users to select multiple variables at once and batch insert them into the editor:

```tsx
import { PromptEditor } from 'react-prompt-editor';
import { MultiSelectDataSelector } from './MultiSelectDataSelector';

const App = () => (
  <PromptEditor
    initialValue={initialValue}
    dataSelector={MultiSelectDataSelector}
  />
);
```

### 🔗 Node Dependency Management

Establish dependency relationships between nodes via the `dependencies` field. When a node is executed, the `dependenciesContent` in the `onRunRequest` callback automatically includes detailed information about all dependent nodes (including id, number, title, content, and execution status):

```tsx
const [value, setValue] = useState<TaskNode[]>([
  {
    id: 'role',
    title: 'Role Definition',
    content: '# Role\n\nYou are a helpful assistant.',
    hasRun: true,
    dependencies: [],
  },
  {
    id: 'task',
    title: 'Current Task',
    content: 'Complete the task based on the role definition...',
    dependencies: ['role'],
  },
]);

<PromptEditor
  value={value}
  onChange={setValue}
  onRunRequest={(request) => {
    console.log('Dependent nodes:', request.dependenciesContent.map(d => ({
      id: d.nodeId,
      number: d.nodeNumber,
      title: d.title,
      content: d.content,
      hasRun: d.hasRun,
    })));
  }}
/>
```

### 🎨 Custom Toolbar

Use `renderToolbar` to fully control the content and layout of the top toolbar:

```tsx
<PromptEditor
  initialValue={initialValue}
  renderToolbar={(actions) => (
    <div style={{ display: 'flex', gap: '8px' }}>
      <span>📝 My Prompt Workspace</span>
      <button onClick={() => actions.addRootNode()}>Add Node</button>
    </div>
  )}
/>
```

### 👁️ Preview Mode

Two preview rendering modes are available:

```tsx
// Read-only editor mode
<PromptEditor
  previewMode
  previewRenderMode="readonly-editor"
/>

// Markdown reading mode
<PromptEditor
  previewMode
  previewRenderMode="markdown"
/>
```

## Documentation

- Full documentation and examples: https://www.rpeditor.asia
- Issue Tracker: https://github.com/SquabbyZ/react-prompt-editor/issues

## License

MIT