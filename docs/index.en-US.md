---
hero:
  badge: Prompt Engineering Workspace
  title: RPEditor
  description: A tree-based prompt editor for complex AI workflows, with node execution, dependency orchestration, streaming responses, and conversational AI refinement.
  note: Designed for system prompts, task decomposition, few-shot examples, multi-step agent prompts, and reusable prompt assets.
  actions:
    - text: Explore the Component
      link: /en-US/components/prompt-editor
    - text: GitHub
      link: https://github.com/SquabbyZ/react-prompt-editor
featuresEyebrow: Product Highlights
featuresTitle: Built for structured prompt engineering
featuresDescription: More than a prompt input box. RPEditor acts as a focused workspace for <strong>tree composition, dependency-aware execution, and AI-assisted prompt refinement</strong>.
features:
  - title: Tree-based prompt composition
    description: Break system prompts, constraints, few-shot examples and sub-tasks into maintainable nodes.
    emoji: 🌳
  - title: Node execution and dependency orchestration
    description: Run each node independently and forward <code>dependenciesContent</code> so your app can assemble real execution context.
    emoji: ▶️
  - title: Conversational AI optimization
    description: Support full-text optimization, selected-text refinement, follow-up prompts, stop generation, retry and apply result.
    emoji: 🤖
  - title: Streaming-friendly by design
    description: Built-in SSE parsing works with OpenAI, Dify, Alibaba Bailian and generic JSON-style responses.
    emoji: ⚡
  - title: Ready for large prompt trees
    description: Uses Map-based storage and virtualized rendering for browsing, editing and running large node sets.
    emoji: 🧩
  - title: Presentation and theming support
    description: Includes preview mode, drag-and-drop sorting, theme modes and bilingual support for both editing and showcase flows.
    emoji: 🌍
---

## Why RPEditor

RPEditor is built for structured prompt engineering rather than plain text entry. It helps you turn complex prompt workflows into a tree, pass dependent context between nodes, refine prompts with AI, and preserve reusable prompt assets for teams.

## 🚀 Quick Demo

<code src="./components/examples/basic.tsx" title="Live Demo" iframe></code>

## Common Use Cases

- **Agent workflow authoring**: model each step as a node and organize context through dependencies.
- **System prompt maintenance**: split roles, constraints, formatting rules and examples into manageable parts.
- **Prompt review and showcase**: present a structured prompt tree in preview mode instead of sharing raw text.
- **Human + AI refinement**: draft manually, then iteratively optimize full sections or selected snippets with AI.

## Installation

```bash
pnpm add react-prompt-editor
```

Before rendering the component, complete these two steps:

- Component import: `import { PromptEditor } from 'react-prompt-editor';`
- Style import: `import 'react-prompt-editor/styles/index.css';`

> Import the stylesheet before rendering the component, otherwise it will appear as unstyled raw content.

## 🔗 Links

- [Component Documentation](/en-US/components/prompt-editor)
- [Quick Start](/en-US/components/prompt-editor#quick-start)
- [Streaming Example](/en-US/components/prompt-editor#streaming-output-example)
- [Internationalization](/en-US/i18n)
- [GitHub Repository](https://github.com/SquabbyZ/react-prompt-editor)
