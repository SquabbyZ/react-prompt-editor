---
hero:
  badge: Prompt Engineering Workspace
  title: RPEditor
  description: 面向复杂 AI 工作流的树形 Prompt 编辑器，支持节点运行、依赖编排、流式响应与 AI 对话式优化。
  note: 适合 system prompt、任务拆解、few-shot 示例、多阶段 Agent 提示词和团队协作式 Prompt 资产沉淀。
  actions:
    - text: 查看组件文档
      link: /components/prompt-editor
    - text: GitHub
      link: https://github.com/SquabbyZ/react-prompt-editor
featuresEyebrow: Product Highlights
featuresTitle: 为复杂 Prompt 工程化场景而设计
featuresDescription: 不只是一个提示词输入框，而是一套用于<strong>树形拆解、依赖组织、节点运行与 AI 精修</strong>的前端工作台。
features:
  - title: 树形 Prompt 编排
    description: 把 system prompt、约束、few-shot 示例和子任务拆成可维护节点，适合长链路和多角色协作。
    emoji: 🌳
  - title: 节点级执行与依赖编排
    description: 每个节点都可以独立运行，并携带 <code>dependenciesContent</code> 给业务侧处理真实上下文拼装。
    emoji: ▶️
  - title: AI 对话式优化
    description: 支持整段优化、选区精修、多轮追问、停止生成、复制重试和结果应用。
    emoji: 🤖
  - title: 真正适配流式响应
    description: 内置 SSE 解析和平台兼容逻辑，可接 OpenAI、Dify、阿里百炼及通用 JSON 响应。
    emoji: ⚡
  - title: 面向大规模节点
    description: 基于 Map 存储和虚拟列表渲染，适合大 Prompt 树的浏览、编辑和运行反馈。
    emoji: 🧩
  - title: 展示与主题能力
    description: 支持预览模式、拖拽排序、主题模式与中英文切换，既能编辑也能拿来展示。
    emoji: 🌍
---

## 为什么使用 RPEditor

RPEditor 面向的是“结构化 Prompt 工程”而不是单一文本框输入。它适合把复杂提示词拆成树、把节点结果串成上下文、把 AI 优化能力嵌入编辑流程，并最终沉淀为可复用的 Prompt 资产。

## 典型场景

- **Agent 工作流 Prompt 设计**：把多步骤任务拆成树状节点，按依赖关系组织上下文。
- **复杂 system prompt 维护**：把角色、规则、格式要求、示例拆成独立节点，减少长文案失控。
- **Prompt 评审与展示**：通过预览模式向团队展示结构化提示词，而不是裸文本。
- **人机协同优化**：先人工编排，再对整段或选区发起 AI 精修，逐步迭代提示词质量。

## 快速体验

<code src="./components/examples/basic.tsx" title="在线 Demo" iframe></code>

## 安装与接入

当前 npm 版本是基于 Ant Design UI 的实现，适合已经使用或接受引入 Ant Design 体系的 React 项目。后续会逐步提供其他 UI 库版本。

### 完整安装（推荐）

```bash
pnpm add react-prompt-editor antd @ant-design/x
```

### 分步安装

```bash
# 1. 安装主库
pnpm add react-prompt-editor

# 2. 安装 Peer Dependencies
pnpm add antd @ant-design/x
```

#### 为什么需要手动安装这些依赖？

当前版本明确定位为 Ant Design UI 版本，因此将 `antd` 和 `@ant-design/x` 作为 `peerDependencies` 交由宿主项目提供：

- ✅ **UI 体系一致**：与你项目中的 Ant Design 主题和配置保持一致
- ✅ **避免重复**：如果你的项目已有 antd，不会重复加载
- ✅ **版本控制**：你可以自行控制 Ant Design 相关版本
- ✅ **版本规划清晰**：当前版本专注 Ant Design，后续再扩展其他 UI 库版本

详细安装说明请查看 [INSTALL.md](https://github.com/SquabbyZ/react-prompt-editor/blob/main/INSTALL.md)

### 样式导入

接入时请完成以下步骤：

- 组件导入：`import { PromptEditor } from 'react-prompt-editor';`
- 样式导入：`import 'react-prompt-editor/styles/index.css';`

> ⚠️ **重要**：使用组件前请先引入样式文件，否则会显示为未格式化的原始内容。

## 快速上手入口

- [组件文档](/components/prompt-editor)
- [快速上手](/components/prompt-editor#快速上手)
- [流式输出示例](/components/prompt-editor#流式输出示例)
- [国际化](/i18n)
- [GitHub 仓库](https://github.com/SquabbyZ/react-prompt-editor)

## AI 辅助开发工具

### 🤖 Peaks Skills for RPEditor

我们提供了专门的 **peaks-react-prompt-editor** Skill，帮助你在 AI 辅助开发中更高效地使用 RPEditor。

**功能特性**：

- ✅ 完整的组件 API 参考和用法示例
- ✅ 常见场景的最佳实践指导
- ✅ 问题排查和调试建议
- ✅ 配置优化和性能调优指南

**使用方式**：

1. **安装 Skills**

   ```bash
   npx skills add https://www.npmjs.com/package/peaks-skills
   ```

2. **在 AI 对话中使用**
   - 当你询问 RPEditor 相关问题时，AI 会自动加载该 Skill
   - 例如："如何使用 PromptEditor 组件？"
   - 例如："如何实现变量插入功能？"
   - 例如："如何配置流式输出？"

3. **获取帮助**
   - 访问 [peaks-skills NPM 包](https://www.npmjs.com/package/peaks-skills)
   - 查看 `peaks-react-prompt-editor` Skill 的详细文档

**适用场景**：

- 🚀 快速了解组件功能和 API
- 🔧 解决集成和使用中的问题
- 💡 学习最佳实践和设计模式
- 📚 获取详细的代码示例
