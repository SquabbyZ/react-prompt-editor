---
demo:
  - cols: 1
    iframe: 600
---

# PromptEditor

Tree-structured prompt editor component providing hierarchical prompt management, visual editing, task dependencies, execution and AI optimization capabilities.

## ⚠️ Important: Style Import

**You must import the style file before using the component!**

```typescript
import { PromptEditor } from 'react-prompt-editor';
import 'react-prompt-editor/styles/index.css'; // Required
```

If you don't import the style file, the component will lose all styles and display as unformatted raw content.

## Quick Start

The simplest way to use it, just provide data and onChange callback:

<code src="../examples/quickstart.tsx" iframe></code>

## Basic Usage

Complete example with execution and AI optimization features:

<code src="../examples/basic.tsx" iframe></code>

## Preview Mode

Use the `previewMode` prop to enable read-only display and hide all operation buttons:

<code src="../examples/preview.tsx" iframe></code>

## Streaming Output Example

Demonstrates how to implement true streaming AI optimization (simulating SSE responses from APIs like OpenAI, Qwen, etc.):

<code src="./examples/streaming.tsx"></code>

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

For more internationalization details, please refer to: [Internationalization Documentation](../i18n)

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

| Parameter         | Description                                                                                | Type                                                                     | Default    |
| ----------------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ | ---------- |
| initialValue      | Initial tree data (uncontrolled mode)                                                      | `TaskNode[]`                                                             | `[]`       |
| value             | Tree data (controlled mode)                                                                | `TaskNode[]`                                                             | -          |
| onChange          | Data change callback                                                                       | `(data: TaskNode[]) => void`                                             | -          |
| onRunRequest      | Run request callback (called when triggered, user handles async requests)                  | `(request: RunTaskRequest) => void`                                      | -          |
| optimizeConfig    | AI optimization config (component handles requests and streaming/non-streaming rendering)  | `OptimizeConfig`                                                         | -          |
| onOptimizeRequest | Optimize request callback (advanced mode, user handles requests and returns via onResponse)| `(request: OptimizeRequest, callbacks: { onResponse, onError }) => void` | -          |
| onNodeRun         | Node run completion callback (user calls after completing run request to notify component) | `(nodeId: string, result: RunTaskResponse) => void`                      | -          |
| onNodeOptimize    | Node optimize completion callback (user calls after completing optimize request)           | `(nodeId: string, result: OptimizeResponse) => void`                     | -          |
| onNodeLock        | Node lock callback                                                                         | `(nodeId: string, isLocked: boolean) => void`                            | -          |
| onTreeChange      | Tree change callback                                                                       | `(tree: TaskNode[]) => void`                                             | -          |
| className         | Custom class name                                                                          | `string`                                                                 | -          |
| style             | Custom styles                                                                              | `React.CSSProperties`                                                    | -          |
| renderToolbar     | Custom top toolbar                                                                         | `(actions) => ReactNode`                                                 | -          |
| onLike            | AI optimization message like callback                                                      | `(messageId: string) => void`                                            | -          |
| onDislike         | AI optimization message dislike callback                                                   | `(messageId: string) => void`                                            | -          |
| previewMode       | Preview mode (read-only, hides editing features)                                           | `boolean`                                                                | `false`    |
| locale            | Internationalization configuration (similar to Ant Design's language pack)                 | `Locale`                                                                 | `zhCN`     |
| theme             | Theme mode (controls light/dark theme)                                                     | `'system' \| 'light' \| 'dark'`                                          | `'system'` |

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
````

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

#### Streaming Output Example

```typescript
const handleOptimizeRequest = (
  request: OptimizeRequest,
  callbacks: { onResponse; onError },
) => {
  // Call your AI API (e.g., OpenAI, Qwen, etc.)
  fetch('/api/optimize', {
    method: 'POST',
    body: JSON.stringify(request),
  })
    .then((response) => {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      // Read SSE stream
      function readStream() {
        return reader.read().then(({ done, value }) => {
          if (done) return;

          const chunk = decoder.decode(value);
          fullText += chunk;

          // Call onResponse every time new data is received
          callbacks.onResponse({
            optimizedContent: fullText,
            thinkingProcess: 'Generating...',
          });

          return readStream();
        });
      }

      return readStream();
    })
    .catch((error) => callbacks.onError(error));
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

If you need full control over the request process (e.g., non-standard APIs, complex streaming, custom encryption), use `onOptimizeRequest`.

Now with support for **Structured Messages** and **Abort Signals**, implementation is even simpler:

```typescript
const handleOptimizeRequest = (
  request: OptimizeRequest,
  callbacks: { onResponse; onError },
) => {
  // 1. Get structured messages directly without manual parsing
  const { messages, signal } = request;

  // 2. Pass the signal to fetch for automatic request cancellation on modal close
  fetch('/api/optimize', {
    method: 'POST',
    body: JSON.stringify({ messages }),
    signal, // Abort support
  })
    .then((response) => {
      // ... Streaming logic (see example below)
    })
    .catch((error) => {
      if (error.name === 'AbortError') return; // Ignore manual cancellation
      callbacks.onError(error);
    });
};
```

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
