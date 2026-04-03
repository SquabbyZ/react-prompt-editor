# 提示词编辑器组件库 - Vibe Coding 开发计划（评审稿，方案 B）

**版本**: v1.0-review  
**创建日期**: 2026-04-03  
**最后更新**: 2026-04-03  
**开发模式**: Vibe Coding（Trae IDE）  
**目标**: 先交付 v1.0（默认主题 + 核心闭环），再交付 v1.1（Ant Design 主题），Vue 延后

---

## 0. 计划说明（与当前仓库对齐）

当前仓库已经具备：
- Vite 应用骨架与 Storybook（Storybook 10.x）
- React 19 运行环境（可兼容 React 18+ 的库设计）
- Vitest + Playwright 的 Storybook 测试集成
- ESLint 配置与 i18n 相关配置

本计划不再从零创建新项目，而是在现有仓库内完成以下重构与交付：
- 将核心代码收敛到 `src/` 下的库结构（components/hooks/utils/styles），并通过统一出口导出。
- 保留 Storybook 作为组件开发与验收入口，同时保留/增强 Demo（可选）用于串联流程验证。
- 将构建目标从“应用构建”调整为“组件库构建（ESM 为主）”，并确保外部化 React 等依赖。

---

## 1. 版本与里程碑（方案 B）

### v1.0（10 周）：React 核心功能 + 默认主题

交付物：
- 可安装/可集成组件库（PromptEditor）
- Storybook：覆盖核心场景、降级场景、大数据场景
- 基础文档：README / API / 集成示例

### v1.1（2 周）：Ant Design 主题 + antd-x 更深集成

交付物：
- `theme="ant-design"` 可用
- antd-x（可选 peer）在结果展示的体验增强完整落地

### v1.2+：Vue 适配（不在本评审稿的详细排期内）

---

## 2. 工作方式（Vibe Coding 的落地规则）

为减少返工，本计划强调两点：
- 每个功能点都必须绑定“可验收入口”（Storybook story 或 Demo 页面）。
- 每个阶段都有“关口决策”（例如虚拟化方案是否需要双栈），到点必须做取舍并记录。

建议循环节奏（可选）：
- 明确本次迭代的验收点
- 快速实现
- 用 Storybook/Demo 验证
- 记录边界与遗留项，进入下一循环

### 2.1 统一交付物（每个计划点都要产出）

- Storybook Stories：至少 1 个主路径 + 1 个降级/错误态（按需求）
- 最小单测：优先覆盖纯函数 utils 与关键状态逻辑（避免用 JSDOM 测 FPS）
- 文档更新：README/API/集成示例或本计划文档的对应章节
- 记录项：本次决策点结论（例如虚拟化方案、降级策略）

### 2.2 通用提示词模板（适用于所有计划点）

```prompt
# Role
你是一位资深的前端组件库工程师，擅长 React + TypeScript、Storybook 驱动开发、性能与可维护性优化。

# Task
帮我完成【<计划点名称>】的实现与验收入口（Storybook/Demo），并更新相关文档。

# Context
- 仓库：react-prompt-editor（Vite + React + Storybook）
- 目标：先交付 v1.0（默认主题 + 核心闭环），再做 v1.1（Ant Design 主题）

# Requirements
1. 给出最小可用实现（MVP），并明确未覆盖项
2. 提供 Storybook stories 覆盖主路径与至少一个异常/降级路径
3. 提供必要的类型定义与对外 API（保持向后兼容）
4. 给出可执行的验收清单（Given/When/Then 或 checklist）

# Output
1. 涉及的文件清单与关键变更点
2. Storybook 入口与如何验证
3. 风险点与后续改进建议（不超过 5 条）
```

---

## 3. Phase 1（v1.0）详细计划（10 周）

### Week 1：库化改造 + 基础骨架

**目标**
- 形成组件库目录结构与统一导出
- 明确 peerDependencies 与构建出口
- Storybook 能加载 PromptEditor 空壳并渲染

**任务**
- 建立目录：
  - `src/components/PromptEditor/*`
  - `src/components/TreeNode/*`
  - `src/components/MonacoEditorWrapper/*`
  - `src/hooks/*`
  - `src/utils/*`
  - `src/styles/*`（默认主题）
  - `src/index.ts`（库出口）
- 调整构建目标：
  - 明确库模式输出（至少 ESM），并外部化 `react` / `react-dom`
  - 增加类型声明输出（d.ts）
  - 明确 CSS 输出策略（单 CSS 文件或按组件拆分）
- 增加“验收入口”：
  - Storybook `PromptEditor/Default`（空数据/最小数据）

**验收**
- `PromptEditor` 能在 Storybook 里渲染（无报错）
- 受控/非受控 props 骨架存在（功能可留空但 API 稳定）

**基础提示词**
```prompt
# Role
你是一位 React 组件库架构师，擅长把应用工程改造成可发布的库工程。

# Task
将当前仓库整理为“组件库形态”：建立 PromptEditor 的目录结构与统一导出，并提供 Storybook 的空壳验收入口。

# Requirements
1. 建立 src/components、src/hooks、src/utils、src/styles、src/index.ts 的库结构
2. PromptEditor 组件最小可渲染（空数据/最小数据），支持受控与非受控 props 骨架
3. 明确外部化依赖策略（react/react-dom 等），避免把宿主依赖打进包
4. 产出 1 个 Storybook story：PromptEditor/Default

# Output
1. 新增/调整的文件路径与内容要点
2. Storybook story 文件与使用说明
3. 后续 Week 2-3 的接口/目录演进建议
```

### Week 2：核心类型 + 树工具函数（可测试）

**目标**
- TaskNode/Props 定型（以产品评审稿为准）
- 树工具函数可单测（flatten/find/move/numbering 基础）

**任务**
- 定义类型：TaskNode、Run/Optimize 请求响应、RunResultConfig
- 实现 utils：
  - 树遍历与查找
  - 序号生成（不写回数据）
  - move/insert/remove 的纯函数实现（为拖拽服务）
- 单元测试：
  - numbering 正确
  - move 不产生环

**验收**
- 单测可运行且稳定（不依赖浏览器 FPS）
- 类型对外导出一致

**基础提示词**
```prompt
# Role
你是一位 TypeScript 类型系统与数据结构专家。

# Task
为 PromptEditor 定型核心类型（TaskNode/Props/API types），并实现可单测的树工具函数（序号/查找/移动/循环检测基础）。

# Requirements
1. 类型对外导出稳定：TaskNode、Run/Optimize 请求响应、RunResultConfig
2. 工具函数尽量纯函数化：flatten/find/insert/remove/move/numbering
3. 提供最小单测覆盖：序号正确、move 不产生树环/依赖环

# Output
1. types 与 utils 的文件清单
2. 单测覆盖点与如何运行
3. 需要在 Week 3-4 落地的接口约束（不变量）
```

### Week 3-4：树渲染 + 展开/拖拽（虚拟化决策点）

**目标**
- 树可渲染、可展开、可拖拽移动
- 互斥展开规则落地

**任务**
- 集成树组件（候选：react-arborist）
- 实现互斥展开逻辑（同层互斥 + 路径保留）
- 实现拖拽规则：
  - 禁止拖入子孙
  - 更新 parent/children 结构
- 决策点：虚拟化方案
  - 优先使用 tree 组件自带虚拟化能力（避免双重虚拟化）
  - 仅在性能不达标时再引入额外虚拟列表（例如 react-virtuoso）

**验收**
- Storybook：拖拽演示 story
- 1000 节点数据下：滚动与展开无明显卡顿（手动门禁 + Performance profile 记录模板）

**基础提示词**
```prompt
# Role
你是一位树形交互与可视化组件专家（React + DnD + 虚拟化）。

# Task
实现树渲染、互斥展开与拖拽移动，并在 Storybook 提供可验证的交互演示。

# Requirements
1. 落地互斥展开规则（同层互斥 + 路径保留）
2. 落地拖拽规则：禁止拖入子孙；拖拽后结构正确；序号展示自动更新
3. 决策虚拟化方案：优先使用树组件自带虚拟化；避免双重虚拟化
4. Storybook stories：DragAndDrop、LargeData(1000)

# Output
1. 树组件选型与关键配置
2. 拖拽与展开逻辑的核心实现点
3. 性能门禁的手动验证步骤（Performance profile 记录项）
```

### Week 5-6：编辑器集成（Monaco）+ 懒加载 + 降级

**目标**
- Monaco 编辑器可用（CDN/本地策略明确）
- 懒加载可用，避免 2000 节点下的编辑器雪崩
- 支持多级降级：Monaco → CodeMirror → 纯文本

**任务**
- MonacoEditorWrapper：
  - CDN 模式（默认）
  - 本地模式（可选配置，明确 worker 策略）
- TreeNode 懒加载：
  - 展开/聚焦才挂载编辑器
  - 占位符与 loading 体验
- 降级策略：
  - Monaco 加载失败/超时 => CodeMirror（可选 peer，宿主安装后启用）
  - CodeMirror 不可用（未安装或初始化失败）=> textarea

**验收**
- Storybook：Monaco 正常 / Monaco 失败降级到 CodeMirror / Monaco 失败且 CodeMirror 不可用降级到纯文本 三个 story
- 大数据 story 下不会一次性加载大量编辑器

**基础提示词**
```prompt
# Role
你是一位前端编辑器集成专家（Monaco / CodeMirror / 降级策略 / 性能优化）。

# Task
实现编辑器三层降级链路：Monaco（CDN/本地）→ CodeMirror（可选 peer）→ 纯文本，并配合 TreeNode 懒加载保证大数据性能。

# Requirements
1. Monaco 支持 CDN 与本地两种模式（可配置），并能按需加载
2. 失败判定明确：加载失败/初始化失败/超时，触发降级到下一层
3. CodeMirror 作为可选 peer：存在则启用，不存在则直接 textarea
4. TreeNode 展开/聚焦才挂载编辑器（懒加载 + 占位符）
5. Storybook stories：MonacoOK、MonacoFailToCodeMirror、MonacoFailAndNoCodeMirrorToPlaintext

# Output
1. 编辑器适配层（EditorAdapter）或选择逻辑的实现说明
2. 降级与错误兜底策略
3. Storybook 验收入口与验证步骤
```

### Week 7-8：核心闭环（运行 / AI 优化 / 锁定 / 依赖）

**目标**
- 运行、依赖、锁定形成可用闭环
- AI 优化可用（thinkingProcess 可选）

**任务**
- 依赖管理：
  - 依赖配置 UI（最小可用）
  - 循环依赖检测
  - 删除被依赖节点的策略落地（阻止删除或确认后移除依赖，按产品评审稿执行）
- 运行：
  - 收集 dependenciesContent（运行时实时取内容）
  - loading / error / cancel（若宿主支持）
- 锁定：
  - 按锁定矩阵禁用编辑类操作
  - 未运行不可锁定的提示
- AI 优化：
  - 指令输入、结果预览、确认写回
  - thinkingProcess 缺失时 UI 不显示该区域

**验收**
- Storybook：完整流程 story（依赖 -> 运行 -> 锁定 -> 再次运行）
- 锁定矩阵行为一致

**基础提示词**
```prompt
# Role
你是一位前端功能闭环与状态机设计专家。

# Task
实现 PromptEditor 的核心闭环：依赖配置/循环检测、运行调用、AI 优化、锁定矩阵，并提供完整流程的 Storybook 验收入口。

# Requirements
1. 依赖：可配置、可视化、阻止循环依赖；删除策略按产品评审稿执行
2. 运行：收集 dependenciesContent；loading/error 状态完整；可扩展 cancel（若宿主支持）
3. 锁定：严格按锁定矩阵禁用编辑类操作；未运行不可锁定
4. AI 优化：指令输入、结果预览、确认写回；thinkingProcess 可选显示
5. Storybook story：FullFlow（依赖->运行->锁定->再运行）

# Output
1. 状态字段与状态流转说明
2. API 对接点与错误处理策略
3. 验收用例清单（最少 8 条）
```

### Week 9：运行结果展示（默认方案 + 可扩展）

**目标**
- 默认结果展示可用，支持流式/非流式（按 runAPI 能力）
- 允许自定义渲染（组件/函数）

**任务**
- RunResultCard：
  - 默认文本展示
  - antd-x 存在时增强（Bubble.List），不存在时降级
- 透传配置：
  - bubbleProps / contentRender / 自定义组件
- 流式展示：
  - 若 runAPI 返回 stream 或提供增量回调，支持增量追加渲染

**验收**
- 无 antd-x 环境：结果展示正常
- 有 antd-x 环境：Bubble/List 正常（作为增强能力）

**基础提示词**
```prompt
# Role
你是一位 UI 组件集成与可扩展渲染方案设计专家。

# Task
实现运行结果展示：默认文本可用；可选增强 antd-x；并提供自定义渲染扩展点。

# Requirements
1. 默认结果展示必须无依赖可用（纯文本/基础卡片）
2. antd-x 作为可选增强：存在则启用 Bubble/List，不存在不影响使用
3. 提供扩展点：contentRender 或自定义组件
4. 支持流式/非流式（按 runAPI 能力），并保证 UI 不抖动

# Output
1. RunResultConfig 的最终接口说明
2. 默认/增强/自定义 三种路径的渲染策略
3. Storybook stories 与验证方式
```

### Week 10：默认主题收尾 + 文档 + 性能门禁

**目标**
- 默认主题完成并可读
- 文档齐全（安装/使用/API/示例）
- 大数据性能门禁可重复执行（半自动/手动）

**任务**
- 默认主题（CSS Variables）完善
- 文档：
  - README（快速开始、受控/非受控、API、降级、主题）
  - 示例代码（最小可运行）
- 性能门禁：
  - Storybook 大数据 story（2000 节点）
  - Performance profile 记录模板（采集口径一致）

**验收**
- v1.0 发布前 checklist 全绿（见第 5 节）

**基础提示词**
```prompt
# Role
你是一位组件库主题系统与工程化交付专家。

# Task
完成默认主题（CSS Variables）、补齐文档与性能门禁，确保 v1.0 可以对外发布/集成。

# Requirements
1. 默认主题样式一致、焦点态清晰、可读性良好
2. 文档包含：安装、快速开始、受控/非受控、API、降级策略、主题切换
3. 性能门禁：提供 2000 节点 Storybook story + Performance profile 记录模板与检查项
4. 结合 CI：确保 build/build-storybook/lint/typecheck 可作为门禁

# Output
1. 主题变量与样式入口说明
2. README/API 文档结构与关键段落
3. 性能门禁执行步骤与记录模板
```

---

## 4. Phase 2（v1.1）：Ant Design 主题（2 周）

**目标**
- Ant Design 风格主题（theme="ant-design"）完整可用
- 与 antd-x 增强展示的组合体验稳定

**任务**
- Token/变量对齐：
  - CSS Variables 映射到 Ant Design 视觉语义
- 组件样式 Ant Design 化：
  - 按钮、间距、边框、hover/focus 状态
- Storybook：
  - 主题对比 story（default vs ant-design）
  - 结果展示增强 story（antd-x）

**验收**
- 默认主题与 AntD 主题切换无布局抖动、无明显样式破坏

**基础提示词**
```prompt
# Role
你是一位 Ant Design 生态与主题系统集成专家。

# Task
在 v1.0 基础上实现 Ant Design 主题（theme="ant-design"），并增强 antd-x 的结果展示体验，提供对比验收入口。

# Requirements
1. 主题变量映射到 Ant Design 语义（颜色/边框/间距/圆角/字体）
2. 组件在 default 与 ant-design 主题之间切换稳定（无布局抖动）
3. antd-x 增强路径可选且稳定（未安装不影响默认路径）
4. Storybook：ThemeCompare、AntdResultEnhanced 等 stories

# Output
1. token/变量映射策略与主要变量列表
2. 组件样式改造范围与验收点
3. 风险与回退策略
```

---

## 5. 测试与验收（建议作为门禁）

### 5.1 自动化（适合 CI）
- utils/hook 的单测（树操作、序号、循环检测）
- Storybook 级别的交互测试（Vitest + Playwright）：核心流程 smoke test
- lint / typecheck / build / build-storybook

### 5.2 手动/半自动（性能与体验）
- Storybook：2000 节点 story
- 浏览器 Performance profile：
  - 初次渲染、滚动、展开/折叠、首次加载编辑器
- 降级场景检查：
  - Monaco CDN 失败
  - Monaco 失败降级到 CodeMirror
  - CodeMirror 不可用降级到纯文本
  - 无 antd-x

---

## 6. v1.0 发布前 Checklist

- PromptEditor：受控/非受控工作正常
- 树：拖拽/展开/序号符合规则
- 编辑：懒加载生效；Monaco 失败可降级到 CodeMirror；CodeMirror 不可用可降级到纯文本
- 依赖：可配置、可阻止循环、删除策略明确且一致
- 运行：loading/error/（可选 cancel）体验完整
- 锁定：矩阵行为一致
- 结果：默认可用；可扩展；antd-x 为增强且可选
- 文档：安装、API、示例、降级策略齐全
