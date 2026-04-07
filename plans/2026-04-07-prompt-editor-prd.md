# 提示词编辑器组件库 - 产品需求文档 (PRD)

**版本**: v1.0  
**创建日期**: 2026-04-07  
**基于文档**: [2026-04-03-prompt-editor-design.review.md](../production/2026-04-03-prompt-editor-design.review.md)  
**开发模式**: Vibe Coding (Trae IDE + Qwen3.5-Plus)  
**预计周期**: 10 周 (Phase 1: React + 默认主题)

---

## Problem Statement

在 AI 应用开发中，开发者需要将复杂的提示词工作流组织成层级化结构，并管理步骤间的依赖关系。然而：

1. **现有编辑器过于简单**：大多数编辑器只支持单一文本编辑，无法组织复杂的层级化提示词工作流
2. **缺乏依赖管理**：无法可视化地管理提示词步骤间的依赖关系
3. **运行与优化割裂**：运行结果、AI 优化等功能分散在不同工具中，缺乏一体化解决方案
4. **性能瓶颈**：当提示词节点数量达到数百上千时，现有工具性能急剧下降
5. **集成困难**：缺少可复用的组件库，每次都需要从头实现

用户需要一个专门的树形提示词编辑器组件库，提供层级化管理、依赖配置、运行与 AI 优化的一体化解决方案。

---

## Solution

开发一个基于 React 的树形提示词编辑器组件库 `react-prompt-editor`，核心特性：

1. **树形结构管理**：支持层级化提示词组织，可视化拖拽编辑
2. **依赖管理**：配置节点间依赖关系，运行时自动拼接依赖内容
3. **运行与回调**：节点级运行按钮，通过回调函数处理结果（组件不展示结果）
4. **AI 优化**：集成 AI 优化能力，支持选中文本优化
5. **锁定机制**：运行后可锁定节点，防止误改影响下游
6. **高性能**：支持 2000+ 节点流畅编辑（虚拟化渲染 + Map 数据结构）
7. **CodeMirror 编辑器**：使用 CodeMirror 作为默认编辑器，支持降级到纯文本
8. **dumi 文档**：基于 dumi 构建组件文档与 Demo 展示

技术亮点：
- 内部使用 `Map<string, TaskNodeMinimal>` 存储，O(1) 查找性能
- children 只存储 ID 引用，减少 60-70% 内存占用
- 对外 API 保持传统树形数组格式，符合开发者直觉
- 自动处理 Map ↔ Array 转换，对使用者透明

---

## User Stories

### 树形结构管理

1. 作为前端工程师，我希望**以树形结构组织提示词节点**，以便清晰地表达步骤间的层级关系
2. 作为用户，我希望**通过拖拽移动节点**，以便快速调整树形结构
3. 作为用户，我希望**自动看到节点序号**（如 1, 1.1, 1.1.1），以便理解节点在树中的位置
4. 作为用户，我希望**互斥展开同层节点**，以便专注于当前编辑的分支
5. 作为用户，我希望**展开/折叠节点**，以便控制可见的内容范围
6. 作为用户，我希望**新增/删除节点**，以便动态调整工作流结构
7. 作为用户，我希望**拖拽时禁止拖入子孙节点**，以避免形成循环依赖

### 编辑器功能

8. 作为用户，我希望**在展开节点时看到 CodeMirror 编辑器**，以便编写 Markdown 格式的提示词
9. 作为用户，我希望**编辑器懒加载**，以便减少初始渲染时间
10. 作为用户，我希望**CodeMirror 不可用时降级到纯文本编辑**，以确保基本编辑能力
11. 作为用户，我希望**编辑器支持 Markdown 语法高亮**，以便更好地编写提示词
12. 作为用户，我希望**锁定后禁止编辑内容**，以避免误改已运行的节点

### 依赖管理

13. 作为用户，我希望**配置节点间的依赖关系**，以便表达步骤间的输入输出关系
14. 作为用户，我希望**可视化看到依赖列表**，以便理解当前节点依赖哪些上游节点
15. 作为用户，我希望**阻止循环依赖**，以避免逻辑错误
16. 作为用户，我希望**运行时自动包含依赖节点的 content**，以便构建完整的提示词上下文
17. 作为用户，我希望**删除被依赖的节点时收到提示**，以避免破坏依赖关系

### 运行与回调

18. 作为用户，我希望**点击运行按钮执行节点**，以便测试当前提示词的效果
19. 作为用户，我希望**看到运行中的 loading 状态**，以便知道任务正在执行
20. 作为用户，我希望**运行完成后触发 onNodeRun 回调**，以便在业务代码中处理结果
21. 作为用户，我希望**运行后更新 hasRun 状态**，以便解锁锁定功能
22. 作为用户，我希望**支持流式运行**，以便处理长时间的 AI 响应
23. 作为用户，我希望**运行错误时不崩溃**，以便重试或处理错误

### AI 优化功能

24. 作为用户，我希望**点击 AI 优化按钮**，以便优化当前提示词内容
25. 作为用户，我希望**输入优化指令**，以便指导 AI 优化的方向
26. 作为用户，我希望**优先优化选中的文本**，以便局部调整内容
27. 作为用户，我希望**看到 AI 的思考过程**，以便理解优化逻辑
28. 作为用户，我希望**确认后插入优化结果**，以便将优化内容写回编辑器
29. 作为用户，我希望**thinkingProcess 缺失时 UI 正常**，以便兼容不支持思考过程的 API

### 锁定机制

30. 作为用户，我希望**运行后锁定节点**，以防止误改影响下游依赖
31. 作为用户，我希望**锁定后禁止编辑/拖拽/删除**，以确保锁定效果
32. 作为用户，我希望**解锁后恢复编辑能力**，以便必要时修改
33. 作为用户，我希望**未运行时禁止锁定**，以避免锁定未验证的内容

### 数据管理与性能

34. 作为开发者，我希望**内部使用 Map 存储数据**，以获得 O(1) 的查找性能
35. 作为开发者，我希望**children 只存储 ID 引用**，以减少内存占用
36. 作为开发者，我希望**对外 API 使用树形数组**，以符合开发者直觉
37. 作为用户，我希望**2000 节点下流畅滚动**，以便处理大规模工作流
38. 作为用户，我希望**展开/折叠无明显卡顿**，以便快速浏览树结构
39. 作为开发者，我希望**Array ↔ Map 转换仅在初始化/提交时进行**，以减少开销

### 集成与扩展

40. 作为开发者，我希望**支持受控/非受控模式**，以便灵活集成到业务系统
41. 作为开发者，我希望**自定义 runAPI/optimizeAPI**，以便对接不同的后端服务
42. 作为开发者，我希望**自定义主题**，以便匹配产品的视觉风格
43. 作为开发者，我希望**基于 dumi 查看文档和 Demo**，以便快速上手
44. 作为开发者，我希望**看到空数据、大数据、错误态的 Demo**，以便了解各种场景

### 兼容性与降级

45. 作为用户，我希望**CodeMirror 不可用时降级到 textarea**，以确保基本编辑能力
46. 作为用户，我希望**降级不影响运行/锁定等功能**，以确保核心功能可用
47. 作为开发者，我希望**组件支持 React 18+**，以便兼容主流项目
48. 作为用户，我希望**键盘可操作核心功能**，以便提高操作效率

---

## Implementation Decisions

### 模块设计

#### 1. 核心数据结构

**内部存储（优化）**：
```typescript
type NodeStore = Map<string, TaskNodeMinimal>;

interface TaskNodeMinimal {
  id: string;
  title: string;
  content: string;
  parentId?: string;
  children: string[];  // 子节点 ID 数组
  isLocked: boolean;
  hasRun: boolean;
  dependencies: string[];  // 依赖节点 ID 数组
}
```

**对外 API（传统树形）**：
```typescript
export interface TaskNode {
  id: string;
  title: string;
  content: string;
  parentId?: string;
  children?: TaskNode[];  // 嵌套子节点数组
  isLocked: boolean;
  hasRun: boolean;
  dependencies?: string[];
}
```

#### 2. 核心组件

- **PromptEditor**：主组件，提供完整编辑器能力
- **TreeNode**：树节点渲染组件
- **RunButton**：运行按钮组件
- **AIOptimizeButton**：AI 优化按钮组件
- **LockButton**：锁定按钮组件
- **DependencyConfig**：依赖配置组件

#### 3. 核心 Hooks

- **useTreeState**：树形状态管理（Map 存储 + 互斥展开 + 序号生成）
- **useEditorLazyLoad**：编辑器懒加载逻辑
- **useRunTask**：运行任务管理
- **useAIOptimize**：AI 优化管理

#### 4. 工具函数

- **arrayToMap()**：树形数组 → Map 存储
- **mapToArray()**：Map 存储 → 树形数组
- **flattenTree()**：扁平化树形结构
- **generateNodeNumber()**：生成节点序号
- **detectCycle()**：检测依赖循环

### 技术选型

#### 编辑器
- **CodeMirror**（优先）：轻量、可扩展、支持 Markdown
- **降级方案**：纯文本 textarea

#### 树形组件
- 待选型（需支持虚拟化 + 拖拽）
- 候选：react-arborist, react-dnd + 自定义虚拟化

#### 文档工具
- **dumi**：组件文档与 Demo 展示

#### 构建工具
- 使用项目现有的 father + dumi 构建体系

### API 契约

#### runAPI
```typescript
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

#### optimizeAPI
```typescript
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

### 关键交互规则

#### 互斥展开
- 同一父节点下的子节点：最多展开一个
- 展开一个节点时：确保其祖先路径可见
- 切换到同层另一个节点时：折叠同层已展开节点

#### 锁定规则矩阵
| 操作 | hasRun=false & isLocked=false | hasRun=true & isLocked=false | isLocked=true |
| --- | --- | --- | --- |
| 编辑 content | ✅ | ✅ | ❌ |
| 改 title | ✅ | ✅ | ❌ |
| 拖拽移动/重排 | ✅ | ✅ | ❌ |
| 删除节点 | ✅ | ✅ | ❌ |
| 变更 dependencies | ✅ | ✅ | ❌ |
| 运行 | ✅ | ✅ | ✅ |
| 锁定/解锁 | ❌（需先运行） | ✅ | ✅ |

#### 依赖规则
- 依赖存储为 `dependencies: string[]`（节点 id 列表）
- 运行时取依赖节点的最新 `content`（实时取内容，不做快照）
- 删除节点时：若被依赖，阻止删除并提示
- 拖拽移动不改变依赖关系

### 性能优化策略

#### 数据结构优化
- 内部存储使用 `Map<string, TaskNodeMinimal>` 实现 O(1) 节点查找
- children 只存储 ID 引用，减少 60-70% 内存占用
- 依赖关系使用 ID 数组，避免循环引用

#### 渲染优化
- 树渲染必须虚拟化
- CodeMirror 仅在需要时加载
- 关键计算（可见节点、序号）使用 useMemo 缓存

#### 转换优化
- Array ↔ Map 转换仅在初始化/提交时进行（低频操作）
- 内部操作直接使用 Map，避免重复转换开销

---

## Testing Decisions

### 测试策略

#### 单元测试
- **useTreeState Hook**：测试互斥展开、序号生成、拖拽逻辑
- **arrayToMap / mapToArray**：测试转换正确性
- **detectCycle**：测试依赖循环检测
- **generateNodeNumber**：测试序号生成算法

#### 集成测试
- **树形组件**：测试拖拽、展开/折叠、增删节点
- **编辑器集成**：测试 CodeMirror 加载、懒加载、降级
- **运行功能**：测试 runAPI 调用、回调触发
- **AI 优化**：测试 optimizeAPI 调用、结果插入

#### 性能测试
- **2000 节点渲染**：初始渲染 < 100ms
- **滚动性能**：FPS > 60
- **展开/折叠**：< 16ms
- **内存占用**：< 200MB

### 测试模块

需要测试的模块：
1. useTreeState Hook
2. arrayToMap / mapToArray 工具函数
3. detectCycle 依赖检测
4. PromptEditor 主组件（集成测试）
5. TreeNode 组件（虚拟化渲染）

### 测试工具
- Vitest（项目现有测试框架）
- @testing-library/react
- Performance API（性能测试）

---

## Out of Scope

### v1.0 不做

1. **运行结果展示**：组件只触发回调，不展示运行结果
2. **Vue 2 / Vue 3 适配**：计划放到 v1.2+
3. **ShadcnUI / Mantine 等主题**：计划放到 v2.0
4. **复杂权限/多用户协作**：仅做组件库，不做工作流平台
5. **多人实时协作**：明确不做
6. **节点权限控制与审计**：明确不做
7. **Monaco Editor**：不使用，只用 CodeMirror

### 未来版本规划

#### v1.1（Ant Design 主题）
- Ant Design 风格主题与 Token 对齐
- 更完善的 dumi 文档与 Demo 示例

#### v1.2（Vue 3 适配）
- 将核心逻辑拆分为框架无关 core
- 完成 Vue 3 版本适配

#### v1.3（Vue 2 适配）
- 完成 Vue 2 兼容与必要 polyfill

#### v2.0（主题扩展）
- ShadcnUI / Mantine 等主题扩展
- 更完善的主题切换能力

---

## Further Notes

### 开发建议

#### 第一阶段（Week 1-2）：基础架构
- 搭建项目结构（基于现有 dumi + father 配置）
- 定义 TypeScript 类型系统
- 实现 useTreeState Hook（Map 存储 + 互斥展开）
- 实现 arrayToMap / mapToArray 工具函数

#### 第二阶段（Week 3-4）：树形组件
- 集成树形组件（支持虚拟化 + 拖拽）
- 实现 TreeNode 组件
- 实现序号生成算法
- 性能测试（1000 节点）

#### 第三阶段（Week 5-6）：编辑器集成
- 集成 CodeMirror
- 实现编辑器懒加载
- 实现降级逻辑（CodeMirror → textarea）
- 性能优化（React.memo, useMemo, useCallback）

#### 第四阶段（Week 7-8）：核心功能
- 实现运行按钮 + runAPI 集成
- 实现 AI 优化按钮 + optimizeAPI 集成
- 实现锁定机制
- 实现依赖配置组件

#### 第五阶段（Week 9-10）：完善与发布
- 完善默认主题（CSS Variables）
- 性能基准测试（2000 节点）
- 编写 dumi 文档与 Demo
- 发布 v1.0

### 关键风险

1. **树形组件选型**：需要同时支持虚拟化 + 拖拽，需仔细评估
2. **CodeMirror 性能**：大量编辑器实例可能影响性能，需优化懒加载
3. **Map ↔ Array 转换**：大数据量下转换耗时，需考虑 Web Worker
4. **依赖循环检测**：需高效的图算法，避免 O(n²) 复杂度

### 成功指标

- ✅ 核心功能闭环：树 + 编辑器 + 运行 + 优化 + 锁定 + 依赖
- ✅ 性能达标：2000 节点 @ 60fps
- ✅ 降级可用：CodeMirror 不可用时仍可编辑
- ✅ 文档完善：dumi Demo 覆盖所有场景
- ✅ 可集成：受控/非受控模式 + 清晰 API

### 与现有项目的关系

本项目基于现有的 `react-prompt-editor` 仓库开发，使用：
- dumi 作为文档工具
- father 作为构建工具
- React 19（向下兼容 React 18+）
- TypeScript 严格模式

所有开发遵循现有项目的工程规范。

---

**PRD 创建完成！** 🎉

下一步：调用 `writing-plans` 技能，基于此 PRD 创建详细的实施计划。
