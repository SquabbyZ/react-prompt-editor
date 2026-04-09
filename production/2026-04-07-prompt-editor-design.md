# 提示词编辑器组件库 - 产品设计评审稿（方案 B）

**版本**: v1.0-review  
**创建日期**: 2026-04-03  
**最后更新**: 2026-04-07  
**状态**: 待评审（Review Draft）  
**规划策略**: 方案 B（v1.1 优先 Ant Design 主题，Vue 往后放）
**文档工具**: 基于 dumi 构建组件文档与 Demo

---

## 1. 产品概述

### 1.1 产品定位

一个基于 React 的树形提示词编辑器组件库，面向 AI 工作流场景，提供层级化提示词管理、可视化编辑、任务依赖、运行与 AI 优化能力，并保持 UI 与核心逻辑可拆分以支持后续主题/框架扩展。

### 1.2 目标与非目标

**目标**

- 在 React 中提供可复用的 PromptEditor 组件：树 + 编辑器 + 运行/优化 + 锁定/依赖的完整闭环。
- 支持大规模树数据（目标 2000 节点）的可用体验：可滚动、可展开、可编辑、可运行。
- 提供清晰的受控/非受控模式与扩展点：主题、API 对接、节点渲染。
- 默认主题可用且稳定；v1.1 支持 Ant Design 风格与更深的 antd-x 集成。
- 基于 dumi 构建组件文档与 Demo 展示，提供研发与使用的一站式体验。

**非目标（v1.0/v1.1 不做）**

- Vue 2 / Vue 3 适配（计划放到 v1.2+）。
- ShadcnUI / Mantine 等多主题体系的全面铺开（计划放到 v2.0）。
- 复杂权限/多用户协作/版本管理等"工作流平台"能力（仅做组件库，不做平台）。
- 运行结果的可视化展示（运行后仅触发回调，不展示结果）。

### 1.3 关键用户与场景

**用户**

- 前端工程师：在业务系统/内部工具中嵌入提示词工作流编辑器。
- AI 应用开发者：将提示词分步骤组织成树结构，便于复用与依赖管理。

**核心场景**

- 构建"分步骤提示词"工作流：每个节点对应一个步骤提示词，可依赖上游步骤输出/提示词。
- 运行某一节点：自动拼接依赖提示词与当前提示词，调用业务 API，触发回调（不展示结果）。
- AI 优化某一节点：基于指令优化当前内容或选中文本，用户确认后写回。
- 锁定：运行通过后锁定节点，避免误改影响下游。

### 1.4 成功指标（建议用于验收）

- 可用性：核心流程（新增/删除/拖拽/编辑/运行/锁定/依赖配置）可在 dumi Demo 中完成。
- 性能：2000 节点数据下，滚动与展开/折叠无明显卡顿（以浏览器 Performance profile + 手动门禁为准）。
- 兼容：CodeMirror 不可用时可降级编辑（不阻断运行/锁定等功能）。
- 可集成：可在外部项目以受控模式接入并接管数据与 API。

---

## 2. 版本规划（方案 B）

### v1.0（React + 默认主题）MVP

- React 版本组件库可用（支持 React 18+，对当前仓库 React 19 兼容）。
- 默认主题（CSS Variables）完成。
- 树形管理、编辑、依赖、运行、AI 优化、锁定形成闭环。
- 基于 dumi 的组件文档与 Demo 展示完成。

### v1.1（Ant Design 主题 + 深度集成）

- Ant Design 风格主题与 Token 对齐（视觉与交互更贴近 AntD）。
- 更完善的 dumi 文档与 Demo 示例。

### v1.2（Vue 3 适配）

- 将核心逻辑拆分为框架无关 core（若尚未完成），并完成 Vue 3 版本适配。

### v1.3（Vue 2 适配）

- 完成 Vue 2 兼容与必要 polyfill 策略。

### v2.0（主题扩展）

- ShadcnUI / Mantine 等主题扩展与更完善的主题切换能力。

---

## 3. v1.0 范围定义（Must / Should / Could / Won’t）

**Must（必须交付）**

- 树：增删、拖拽移动、互斥展开、自动序号展示。
- 编辑：节点内容编辑（CodeMirror 优先），编辑器按需加载与降级（CodeMirror → 纯文本）。
- 依赖：配置依赖、可视化展示、运行时自动包含依赖内容；依赖循环检测与阻止。
- 运行：节点级运行按钮、运行中状态、运行回调（不展示结果）。
- 锁定：运行后可锁定；锁定后严格限制可编辑操作（见规则矩阵）。
- 集成：受控/非受控数据模式；对外 API 适配（runAPI/optimizeAPI）。
- 降级：CodeMirror 不可用时降级到纯文本编辑。

**Should（推荐交付）**

- AI 优化支持"选中文本优先优化"。
- dumi Demo 覆盖：空数据、大数据、错误态、降级态。

**Could（可选）**

- 更丰富的依赖可视化（例如依赖列表可跳转定位）。

**Won’t（明确不做）**

- 多人协作与实时同步。
- 节点权限控制与审计。

---

## 4. 核心概念与数据模型

### 4.1 任务节点（TaskNode）

建议将“结构字段”与“状态字段”分离，减少拖拽/重排导致的不一致。

```ts
export interface TaskNode {
  id: string;
  title: string;
  content: string;
  parentId?: string;
  children?: TaskNode[];

  isLocked: boolean;
  hasRun: boolean;
  dependencies?: string[];
}
```

### 4.2 派生属性（不写回数据）

- `number`: 节点序号展示（1 / 1.1 / 1.1.1），由树位置动态计算。
- `depth`: 节点深度，由 parent 链路动态计算。
- `visibleNodes`: 由展开状态计算可见节点集合，用于虚拟化渲染。

### 4.3 数据不变量（必须保证）

- `id` 全局唯一且稳定。
- 树结构无环：禁止把节点拖入自身子孙。
- 依赖无环：禁止依赖形成循环；禁止依赖不存在的节点。
- 删除节点时必须处理"被依赖者"引用（见依赖规则）。

### 4.4 内部存储结构（优化方案）

**采用 Map + 数组混合结构**

```ts
// 内部存储：使用 Map 实现 O(1) 查找
type NodeStore = Map<string, TaskNodeMinimal>;

interface TaskNodeMinimal {
  id: string;
  title: string;
  content: string;
  parentId?: string;
  children: string[]; // 子节点 ID 数组（不存储完整对象）
  isLocked: boolean;
  hasRun: boolean;
  dependencies: string[]; // 依赖节点 ID 数组
}
```

**设计优势**

- O(1) 时间复杂度查找/更新任意节点
- children 只存储 ID 引用，避免对象重复，减少内存占用
- 序列化友好（Map 可轻松转换为数组/对象进行持久化）
- 实现简单，维护成本低

**数据转换**

- 内部操作：使用 Map 结构，节点通过 ID 索引
- 对外 API：转换为 `TaskNode[]` 数组格式（兼容传统树形结构）
- 持久化：Map → 数组 → JSON 序列化

**一致性维护**

- 添加子标题：同时更新子节点的 `parentId` 和父节点的 `children` 数组
- 删除子节点：同时清理父节点 `children` 引用和子节点的 `parentId`
- 移动节点：更新 `parentId` 并维护原父节点和新父节点的 `children` 数组

---

## 5. 交互规则（v1.0 必须明确并实现）

### 5.1 互斥展开规则（建议采用“同层互斥 + 路径保留”）

1. 同一父节点下的子节点：最多展开一个（同层互斥）。
2. 展开一个节点时：自动确保其祖先路径可见（祖先需处于展开态）。
3. 切换到同层另一个节点时：折叠同层已展开节点，但不强制折叠祖先。

### 5.2 锁定规则矩阵

锁定的目标是“防误改”，建议 v1.0 采用保守策略：

| 操作              | hasRun=false & isLocked=false | hasRun=true & isLocked=false | isLocked=true |
| ----------------- | ----------------------------- | ---------------------------- | ------------- |
| 编辑 content      | ✅                            | ✅                           | ❌            |
| 改 title          | ✅                            | ✅                           | ❌            |
| 拖拽移动/重排     | ✅                            | ✅                           | ❌            |
| 删除节点          | ✅                            | ✅                           | ❌            |
| 变更 dependencies | ✅                            | ✅                           | ❌            |
| 运行              | ✅                            | ✅                           | ✅            |
| 锁定/解锁         | ❌（需先运行）                | ✅                           | ✅            |

### 5.3 依赖规则（建议 v1.0 采用“运行时实时取内容”）

- 依赖存储为 `dependencies: string[]`（节点 id 列表）。
- 运行时取依赖节点的最新 `content` 作为 `dependenciesContent` 传给 runAPI（实时取内容，不做快照）。
- 删除节点时：
  - 若该节点被其他节点依赖：阻止删除并提示“先移除依赖”；或在确认后自动从依赖列表移除（两者选一，v1.0 建议阻止删除）。
- 拖拽移动不改变依赖关系（依赖按 id，不按序号）。
- 必须提供依赖循环检测：配置依赖时阻止形成环。

### 5.4 拖拽规则

- 禁止拖拽到自身子孙节点内部。
- 拖拽后只更新树结构；序号展示自动变化。
- 拖拽不影响 `hasRun/isLocked`，但会影响“依赖可视化的序号展示”。

### 5.5 编辑器懒加载触发

- 节点展开或节点内容区域首次聚焦时加载编辑器。
- 编辑器降级链路（默认自动）：CodeMirror → 纯文本（textarea）。
- CodeMirror 不可用（未安装或初始化失败）时切换到纯文本编辑。
- 降级不影响运行/锁定/依赖等功能。

---

## 6. API 契约（组件侧约定）

### 6.1 runAPI

```ts
export interface RunTaskRequest {
  nodeId: string;
  content: string;
  dependenciesContent: string[];
  stream?: boolean;
  meta?: Record<string, unknown>;
}

export interface RunTaskResponse {
  result: string;
  stream?: boolean;
  meta?: Record<string, unknown>;
}
```

**流式建议（组件侧约定，服务端可选实现）**

- 推荐 SSE 或 fetch stream（ReadableStream）；若服务端不支持则 `stream=false` 走一次性响应。
- 流式响应仅用于回调通知，组件侧不展示结果。

**错误约定（建议统一）**

```ts
export interface APIError {
  code: string;
  message: string;
  details?: unknown;
}
```

组件应支持：

- 错误处理（不崩溃）、可重试（由宿主决定）。
- 取消（若宿主 runAPI 支持 AbortSignal，可在扩展点中接入）。
- 运行结果仅通过 onNodeRun 回调通知宿主，组件侧不展示。

### 6.2 optimizeAPI

```ts
export interface OptimizeRequest {
  content: string;
  selectedText?: string;
  instruction?: string;
  meta?: Record<string, unknown>;
}

export interface OptimizeResponse {
  optimizedContent: string;
  thinkingProcess?: string;
  meta?: Record<string, unknown>;
}
```

约定：

- `thinkingProcess` 可选；缺失时 UI 不展示“思考过程”区域。
- “替换写回”必须是用户确认后的动作（Insert/Apply）。

---

## 7. 对外组件 API（v1.0 建议收敛）

建议保持对外 API 小而稳定，扩展点通过配置对象与渲染插槽提供。

**数据格式说明**

- 对外 API 使用传统树形数组结构 `TaskNode[]`（符合用户直觉）
- 内部存储使用 `Map<string, TaskNodeMinimal>`（优化查找性能）
- 组件自动处理 Map ↔ Array 的双向转换

```ts
// 对外 API：树形数组结构（嵌套 children）
export interface TaskNode {
  id: string;
  title: string;
  content: string;
  parentId?: string;
  children?: TaskNode[]; // 嵌套子节点数组
  isLocked: boolean;
  hasRun: boolean;
  dependencies?: string[];
}

// 内部存储：扁平化结构（children 只存 ID）
interface TaskNodeMinimal {
  id: string;
  title: string;
  content: string;
  parentId?: string;
  children: string[]; // 子节点 ID 数组
  isLocked: boolean;
  hasRun: boolean;
  dependencies: string[];
}

export interface PromptEditorProps {
  initialValue?: TaskNode[]; // 输入：树形数组
  value?: TaskNode[]; // 受控模式：树形数组
  onChange?: (data: TaskNode[]) => void; // 输出：树形数组

  runAPI?: (req: RunTaskRequest) => Promise<RunTaskResponse>;
  optimizeAPI?: (req: OptimizeRequest) => Promise<OptimizeResponse>;

  onNodeRun?: (nodeId: string, result: RunTaskResponse) => void;
  onNodeOptimize?: (nodeId: string, result: OptimizeResponse) => void;
  onNodeLock?: (nodeId: string, isLocked: boolean) => void;
  onTreeChange?: (tree: TaskNode[]) => void;

  theme?: 'default' | 'ant-design';

  className?: string;
  style?: React.CSSProperties;
}
```

**转换工具函数（内部实现）**

```ts
// Array → Map：将树形数组转换为扁平 Map 结构
function arrayToMap(tree: TaskNode[]): NodeStore;

// Map → Array：将 Map 结构转换为树形数组（对外输出）
function mapToArray(store: NodeStore): TaskNode[];
```

---

## 8. 非功能设计（v1.0）

### 8.1 性能策略

**目标场景**

- 2000 节点树可浏览、可展开、可编辑。

**数据结构优化**

- 内部存储使用 `Map<string, TaskNodeMinimal>` 实现 O(1) 节点查找
- children 只存储 ID 引用，避免对象重复，减少内存占用（相比嵌套数组减少约 60-70% 内存）
- 依赖关系使用 ID 数组，避免循环引用

**渲染优化**

- 树渲染必须虚拟化（由 tree 组件或列表组件承担，避免双重虚拟化）。
- CodeMirror 仅在需要时加载，避免全量渲染节点编辑器。
- 关键计算（可见节点、序号）必须缓存（memo）并尽量使用纯函数。

**转换优化**

- Array ↔ Map 转换仅在初始化/提交时进行（低频操作）
- 内部操作直接使用 Map，避免重复转换开销
- 使用 Web Worker 处理大数据量转换（可选，视性能表现而定）

### 8.2 兼容与降级

- CodeMirror 不可用：降级到 textarea（保留 Markdown 文本编辑能力）。

### 8.3 可访问性（v1.0 最低要求）

- 键盘可操作：节点选择、展开/折叠、按钮可聚焦。
- 清晰的焦点样式与可读的按钮文案（支持 i18n）。

### 8.4 安全

- 若渲染 Markdown/HTML，默认必须做转义或使用安全白名单渲染策略，避免 XSS。
- 对外回调与日志不得包含敏感信息（token、模型密钥等由宿主处理）。

---

## 9. 验收清单（Review Checklist）

- 树：新增/删除/拖拽后结构正确，序号展示正确，互斥展开符合规则。
- 编辑：展开/聚焦后加载编辑器；CodeMirror/纯文本两层降级链路可验证；锁定后所有编辑类操作禁用符合矩阵。
- 依赖：可配置依赖；阻止循环依赖；删除被依赖节点的行为符合规则。
- 运行：runAPI 入参包含 dependenciesContent；支持 loading、错误处理；运行后触发回调（不展示结果）。
- AI 优化：optimizeAPI 可用；thinkingProcess 缺失时 UI 正常；插入/应用行为正确。
- 降级：CodeMirror 不可用时可编辑（纯文本）。
