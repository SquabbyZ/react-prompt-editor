---
demo:
  - cols: 1
    iframe: 600
---

# PromptEditor

RPEditor is a prompt-engineering-focused tree editor component for hierarchical authoring, node-level execution, dependency orchestration, streaming AI optimization, and structured showcase flows.

## Best Fit Scenarios

- Maintaining complex system prompts, rule blocks, few-shot examples and multi-step task instructions
- Feeding dependency context into your own execution pipeline for agents or staged generation flows
- Embedding AI refinement directly into the editing workflow instead of copying prompts into external tools
- Presenting prompt structure, node status and results to teammates in preview mode

## ⚠️ Before You Start

**You must import the style file before using the component!**

- Component import: `import { PromptEditor } from 'react-prompt-editor';`
- Style import: `import 'react-prompt-editor/styles/index.css';`

If you don't import the style file, the component will lose all styles and display as unformatted raw content.

> Start with the quick start example, then enable execution, AI optimization, drag-and-drop, and localization as your workflow grows.

## Quick Start

The simplest way to use it, just provide data and onChange callback:

<code src="../examples/quickstart.tsx" iframe></code>

## Core Workflow Example

Complete example with execution and AI optimization features:

<code src="../examples/basic.tsx" iframe></code>

## Preview Mode

Use the `previewMode` prop to enable read-only display and hide all operation buttons:

<code src="../examples/preview.tsx" iframe></code>

## Drag and Drop Sorting

Use the `draggable` prop to enable node drag-and-drop sorting functionality, allowing you to adjust node positions and hierarchy through dragging:

<code src="../examples/draggable.tsx" iframe></code>

**Drag and Drop Features:**

- ✅ Drag nodes above/below other nodes to reorder
- ✅ Drag nodes inside another node to make them children
- ✅ Automatically detects and prevents circular dependencies (cannot drag parent into its child)
- ❌ Locked nodes cannot be dragged
- ❌ Cannot drag in preview mode

## Large Dataset Demo

This example focuses on how `PromptEditor` behaves with larger prompt trees. Switch between the `200 / 1000 / 2000` presets or generate your own dataset in custom mode; the docs demo currently supports up to `10000` nodes and `10` levels so you can compare loading, expanding, scrolling, and basic content editing under the same editor setup.

<code src="./examples/large-dataset.tsx"></code>

## Streaming Output Example

Demonstrates how to implement true streaming AI optimization (simulating SSE responses from APIs like OpenAI, Qwen, etc.):

<code src="./examples/streaming.tsx"></code>

## Custom Optimize Content Demo

If you want to replace the default AI optimization content area with your own UI, use `optimizeCustomContent` together with `onOptimizeRequest` and mock data to build an interactive custom panel:

<code src="./examples/callback-platforms.tsx"></code>

## 🌍 Internationalization

The component supports Chinese and English switching. CodeMirror editor's search box and other UI elements will also automatically switch languages:

<code src="./examples/i18n-demo.tsx" iframe></code>

### Usage

```tsx
import { PromptEditor, zhCN, enUS } from 'react-prompt-editor';

// Use Chinese
const App = () => <PromptEditor locale={zhCN} />;

// Use English
const AppEn = () => <PromptEditor locale={enUS} />;
```

For more language packs and extension guidance, please refer to: [Internationalization Documentation](../i18n)

## 🎨 Theme Mode

The component supports light/dark theme switching, which can follow the system or be manually specified:

<code src="../examples/theme-demo.tsx" ></code>

### Usage

```tsx
import { PromptEditor } from 'react-prompt-editor';

// Follow system (default)
const App = () => <PromptEditor theme="system" />;

// Force light mode
const AppLight = () => <PromptEditor theme="light" />;

// Force dark mode
const AppDark = () => <PromptEditor theme="dark" />;
```

**Theme Mode Description:**

- `system`: Follows system settings, automatically detects user's system theme preference
- `light`: Forces light theme, does not change with system
- `dark`: Forces dark theme, does not change with system

## API

### PromptEditor Props

#### Props

| Parameter | Description | Type | Default |
| --- | --- | --- | --- |
| initialValue | Initial tree data (uncontrolled mode) | `TaskNode[]` | `[]` |
| value | Tree data (controlled mode) | `TaskNode[]` | - |
| optimizeConfig | AI optimization config (component handles requests and streaming/non-streaming rendering) | `OptimizeConfig` | - |
| autoOptimize | Whether to automatically start optimization when opening the optimization modal | `boolean` | `true` |
| className | Custom class name | `string` | - |
| style | Custom styles | `React.CSSProperties` | - |
| renderToolbar | Custom top toolbar | `(actions) => ReactNode` | - |
| optimizeCustomContent | Enables an external custom optimize flow; when non-null, clicking AI optimize skips the built-in modal | `ReactNode \| null` | `null` |
| previewMode | Preview mode (read-only, hides editing features) | `boolean` | `false` |
| locale | Internationalization configuration (similar to Ant Design's language pack) | `Locale` | `zhCN` |
| theme | Theme mode (controls light/dark theme) | `'system' \| 'light' \| 'dark'` | `'system'` |
| draggable | Enable drag-and-drop sorting (allows adjusting node positions and hierarchy via dragging) | `boolean` | `false` |

#### Events

| Parameter | Description | Type | Default |
| --- | --- | --- | --- |
| onChange | Data change callback | `(data: TaskNode[]) => void` | - |
| onRunRequest | Run request callback (called when triggered, user handles async requests) | `(request: RunTaskRequest) => void` | - |
| onOptimizeRequest | Optimize request callback (advanced mode, user handles requests and applies results via request.applyOptimizedContent) | `(request: OptimizeRequest) => void` | - |
| onNodeRun | Node run completion callback (user calls after completing run request to notify component) | `(nodeId: string, result: RunTaskResponse) => void` | - |
| onNodeOptimize | Node optimize completion callback (user calls after completing optimize request) | `(nodeId: string, result: OptimizeResponse) => void` | - |
| onNodeLock | Node lock callback | `(nodeId: string, isLocked: boolean) => void` | - |
| onTreeChange | Tree change callback | `(tree: TaskNode[]) => void` | - |
| onLike | AI optimization message like callback | `(messageId: string) => void` | - |
| onDislike | AI optimization message dislike callback | `(messageId: string) => void` | - |

## Data Types

### TaskNode

```typescript
interface TaskNode {
  id: string; // Unique node identifier
  title: string; // Node title
  content: string; // Markdown content
  parentId?: string; // Parent node ID
  children?: TaskNode[]; // Child nodes array
  isLocked: boolean; // Whether locked
  hasRun: boolean; // Whether executed
  dependencies?: string[]; // Dependent node IDs array
}
```

### RunTaskRequest

```typescript
interface RunTaskRequest {
  nodeId: string; // Node ID
  content: string; // Node content
  dependenciesContent: DependencyInfo[]; // Dependent node information
  stream?: boolean; // Whether streaming output
  meta?: Record<string, unknown>; // Additional metadata
}

interface DependencyInfo {
  nodeId: string; // Dependent node ID
  title: string; // Dependent node title
  content: string; // Dependent node content
  hasRun: boolean; // Whether executed
}
```

### OptimizeRequest

````typescript
interface OptimizeRequest {
  content: string; // Original content
  selectedText?: string; // Selected text (if any)
  instruction?: string; // Optimization instruction (including context concatenation)
  messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>; // Structured conversation history
  signal?: AbortSignal; // Abort signal for canceling the request
  applyOptimizedContent: (content: string) => void; // Apply the optimized result to current selection or node
  setOptimizeError: (error: string | Error) => void; // Set optimization error
  closeOptimizeDialog: () => void; // Close the optimization dialog manually
  meta?: Record<string, unknown>;
}

### OptimizeConfig (Simplified Mode Config)

```typescript
interface OptimizeConfig {
  url: string; // API endpoint (OpenAI compatible or backend proxy)
  headers?: Record<string, string>; // Request headers (usually for auth)
  model?: string; // Model name, default: gpt-3.5-turbo
  temperature?: number; // Temperature parameter, default: 0.7
  stream?: boolean; // Enable streaming output, default true. If false, frontend simulates typing effect
  platform?: 'auto' | 'openai' | 'dify' | 'bailian'; // Platform adaptation, default 'auto'
  extraParams?: Record<string, unknown>; // Other custom parameters
}
```

**Platform Adaptation:**

- **OpenAI Standard**: Automatically parses `choices[0].delta.content`.
- **Dify Platform**: Listens for `event: message` and extracts the `answer` field.
- **Ali Bailian**: Automatically parses `text` field, detects format via `usage` field, ends when `finish_reason: "stop"`.
- **Generic JSON**: Fallback to extract `content`, `text`, etc., from the root node.
- **Error Tolerance**: Skips non-standard JSON lines; terminates streaming with a warning if errors exceed the threshold.`

````

## Usage Guide

### Data Binding

Use `value` and `onChange` for controlled mode data binding:

```typescript
const [value, setValue] = useState<TaskNode[]>(initialData);

<PromptEditor
  value={value}
  onChange={setValue}
/>
```

### Pure Callback Mode Explained

The component uses a **pure callback mode** design, giving users control over asynchronous requests:

- **onRunRequest**: Triggered when user clicks the run button
- **onOptimizeRequest**: Triggered when user clicks AI optimization

```typescript
<PromptEditor
  value={value}
  onChange={setValue}
  onRunRequest={(request) => {
    // 1. Execute your async request
    fetch('/api/run', { method: 'POST', body: JSON.stringify(request) })
      .then(res => res.json())
      .then(result => {
        // 2. Notify component that execution is complete
        onNodeRun(request.nodeId, result);
      });
  }}
/>
```

#### Run Request Example

```typescript
const handleRunRequest = (request: RunTaskRequest) => {
  // 1. Execute your API call
  fetch('/api/run', {
    method: 'POST',
    body: JSON.stringify(request),
  })
    .then((res) => res.json())
    .then((result) => {
      // 2. Call onNodeRun to notify component
      onNodeRun(request.nodeId, result);
    })
    .catch((error) => {
      // Handle error
      message.error('Execution failed');
    });
};
```

#### Optimize Request Example

```typescript
const handleOptimizeRequest = async (request: OptimizeRequest) => {
  try {
    const response = await fetch('/api/optimize', {
      method: 'POST',
      body: JSON.stringify({
        messages: request.messages,
        instruction: request.instruction,
      }),
      signal: request.signal,
    });

    const data = await response.json();
    request.applyOptimizedContent(data.optimizedContent);
  } catch (error) {
    if ((error as Error).name === 'AbortError') return;
    request.setOptimizeError(error as Error);
  }
};
```

### AI Optimization (Two Ways to Integrate)

The component supports two ways to integrate AI optimization capabilities:

#### 1. Simplified Mode (Configuration-based)

If you are using a backend that follows the OpenAI API specification (supports SSE streaming), you can configure it directly via `optimizeConfig`. The component will automatically handle request initiation, streaming parsing, and conversation display.

```tsx | pure
<PromptEditor
  optimizeConfig={{
    url: '/api/ai/optimize',
    headers: { Authorization: 'Bearer your_token' },
    model: 'gpt-4',
    temperature: 0.8,
  }}
/>
```

#### 2. Advanced Mode (Callback-based)

If you need full control over the request process (e.g., non-standard APIs, custom auth, custom backend protocols), use `onOptimizeRequest`.

Now with **Structured Messages**, **Abort Signals**, and a command-style result API, the mental model is much closer to `onRunRequest`:

```typescript
const handleOptimizeRequest = async (request: OptimizeRequest) => {
  const { messages, signal } = request;

  try {
    const response = await fetch('/api/optimize', {
      method: 'POST',
      body: JSON.stringify({ messages }),
      signal,
    });

    const data = await response.json();
    request.applyOptimizedContent(data.optimizedContent);
  } catch (error) {
    if ((error as Error).name === 'AbortError') return;
    request.setOptimizeError(error as Error);
  }
};
```

You can also enable an external custom optimize flow with `optimizeCustomContent`. When it is non-null, clicking AI optimize no longer opens the built-in modal and directly triggers `onOptimizeRequest`, so you can handle the interaction outside the component.

### Preview Mode

Use the `previewMode` prop to enable read-only display:

```typescript
<PromptEditor
  value={data}
  previewMode={true}  // Hide all operation buttons
/>
```

**Preview Mode Features:**

- ✅ Display node titles and numbers
- ✅ Display editor content (read-only)
- ✅ Can expand/collapse child nodes
- ❌ Hide top toolbar
- ❌ Hide all operation buttons (edit, add, lock, delete, etc.)
- ❌ Hide run and AI optimization buttons
- ❌ Editor set to read-only state

### Zustand State Management

The component uses **Zustand** internally for state management:

#### Multiple Instance Support

Each `<PromptEditor />` instance has an independent store, they don't interfere with each other:

```typescript
const Editor1 = () => <PromptEditor initialValue={tree1} />;
const Editor2 = () => <PromptEditor initialValue={tree2} />;
```

### Controlled/Uncontrolled Mode

**Uncontrolled Mode** (recommended for simple scenarios):

```typescript
<PromptEditor initialValue={initialData} />
```

**Controlled Mode** (when external state control is needed):

```typescript
const [value, setValue] = useState<TaskNode[]>([]);
<PromptEditor value={value} onChange={setValue} />
```

For detailed code examples, please check the basic example above.
