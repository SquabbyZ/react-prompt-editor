# Testing Foundation Design

## 背景

当前仓库还是以手工回归为主：

- `package.json` 中没有自动化测试脚本
- `TESTING.md` 记录了大量人工检查步骤
- 项目本质是“组件库 + dumi 示例站”，既有纯逻辑层，也有适合浏览器自动化的 demo 入口

这导致两个问题同时存在：

1. 底层逻辑和组件行为缺少稳定、快速的回归保护
2. 页面级主流程只能依赖人工点测，迭代后容易把旧能力改坏

因此需要补一套“分层测试基础设施”，既能在本地开发时快速反馈，也能把现有手工清单逐步转成自动化回归。

## 目标

本轮实现第一版测试基础设施，形成“单元/组件 + 浏览器回归”的最小闭环。

第一版必须满足：

1. 接入 `Vitest` 作为单元和组件测试运行器
2. 接入 `@testing-library/react` 与 `@testing-library/user-event` 做 React 交互测试
3. 接入 `Playwright` 作为浏览器自动化测试底座
4. 在 `Playwright` 之上预留并落地最小 `Midscene.js` 集成
5. 新增至少一组纯逻辑测试
6. 新增至少一组组件行为测试
7. 新增至少一条浏览器冒烟回归用例
8. 让本地通过统一脚本运行这些测试

## 非目标

- 不在第一版一次性覆盖所有 hooks、stores、utils 和 UI 分支
- 不把 `TESTING.md` 全量转成自动化
- 不在第一版引入复杂 CI 编排、分片执行、测试报告平台
- 不依赖真实 AI 服务、真实运行接口或外部后端
- 不把 `Midscene.js` 用作单元测试框架

## 方案选择

本次采用分层方案：

- `Vitest + Testing Library` 负责确定性强的逻辑层和组件层
- `Playwright + Midscene.js` 负责 dumi demo 上的真实浏览器主流程回归

原因：

1. 单元测试更快、更稳定，适合保护纯逻辑和状态流转
2. 组件测试更适合验证回调触发、按钮状态和局部交互
3. Midscene 更适合高层回归与验收，不适合替代底层单测
4. 当前仓库已经有 demo 页面，浏览器层自动化入口成本低

## 测试分层设计

### 1. 单元测试层

职责：

- 验证纯函数和无 DOM 依赖的逻辑
- 覆盖树结构转换和基础数据不变量

第一版目标模块：

- `src/utils/tree-utils.ts`

第一版目标用例：

- `arrayToMap` 能把树结构正确转成扁平 `Map`
- `arrayToMap` 能保留 `parentId`、`children`、`dependencies`
- `mapToArray` 能把 `Map` 正确还原为原始树结构
- `mapToArray` 在传入 `rootOrder` 时按指定顺序返回根节点

### 2. 组件测试层

职责：

- 验证 `PromptEditor` 的关键交互和回调行为
- 避免只依赖浏览器 E2E 才发现组件行为退化

第一版目标模块：

- `src/components/PromptEditor/index.tsx`

第一版目标用例：

- 未传 `onRunRequest` 时，点击运行显示保护提示，不触发异常
- 传入 `onRunRequest` 时，点击运行能构造正确请求
- 点击新增根节点后会触发 `onChange`
- 删除节点后会触发 `onChange`

实现原则：

- 优先验证对外行为，不测试过多内部实现细节
- 尽量 mock `message`、`ResizeObserver`、虚拟滚动等浏览器依赖
- 如某个交互对真实 CodeMirror 依赖过强，可在测试中选择更稳定的触发路径

### 3. 浏览器回归层

职责：

- 在真实浏览器中验证 dumi demo 主流程
- 把人工回归中最关键、最易坏的链路自动化

第一版入口：

- 复用 dumi dev 服务
- 优先使用已有的基础 demo 页面和最小测试页

第一版目标用例：

1. 打开 demo 页面
2. 展开节点
3. 触发运行
4. 验证运行结果反馈
5. 进行锁定与解锁
6. 删除节点并验证节点消失

### 4. Midscene 使用边界

`Midscene.js` 仅用于浏览器回归层。

第一版采用“Playwright 为主，Midscene 最小接入”的策略：

- 主测试框架仍然是 `Playwright`
- Midscene 只作为增强能力和后续扩展示例
- 如果本地没有模型 key，普通 Playwright 用例仍应可跑
- 不让整套测试因为缺少 Midscene 环境变量而完全失效

这样做的目的是先把回归链路跑通，再逐步把更复杂的自然语言交互迁入 Midscene。

## 目录与文件设计

建议新增或修改以下文件：

- `package.json`
- `vitest.config.ts`
- `vitest.setup.ts`
- `playwright.config.ts`
- `e2e/basic-flow.spec.ts`
- `e2e/midscene.fixture.ts` 或等价的 Midscene 集成文件
- `src/utils/__tests__/tree-utils.test.ts`
- `src/components/__tests__/PromptEditor.test.tsx`

如集成细节需要，也可以新增：

- `test/` 或 `tests/` 目录下的通用 mock/setup 文件

但第一版不额外引入复杂目录层级，优先保持结构直观。

## 脚本设计

`package.json` 需要补以下脚本：

- `test`：运行 `Vitest`
- `test:watch`：运行 `Vitest` 监听模式
- `test:e2e`：运行 `Playwright`
- `test:smoke`：运行第一条最小浏览器回归用例

如实现过程中发现有必要，也可以补充：

- `test:ui`
- `test:coverage`

但这两项不是第一版必须项。

## dumi 联动设计

浏览器回归不额外创建独立测试应用，而是直接复用 dumi 开发站。

原因：

1. 当前项目本来就是组件库文档驱动开发
2. demo 已经承载了真实交互入口
3. 直接测 dumi 页面，更接近后续手工回归场景

`Playwright` 通过 `webServer` 自动启动 `dumi dev`。

如果端口选择需要固定，必须选一个当前仓库稳定可用的端口，并保证测试用例引用一致。

## Mock 与稳定性策略

为了让测试稳定，第一版统一采用本地 mock 行为：

- `onRunRequest` 使用 demo 内的模拟异步逻辑
- `onOptimizeRequest` 不依赖外部 AI 服务
- 不对真实网络请求做强依赖
- 组件测试中对 `antd` 的 message 和浏览器能力做必要 mock

这意味着第一版重点验证：

- 交互是否触发
- 状态是否变化
- 关键 UI 反馈是否存在

而不是验证外部系统是否正确返回数据。

## 失败处理与环境约束

### 单元/组件层

- 任何测试都不应依赖真实浏览器窗口尺寸
- 需要的 DOM API 在 `vitest.setup.ts` 中集中补齐
- 缺失 `ResizeObserver`、`matchMedia` 等浏览器对象时统一在 setup 中处理

### 浏览器层

- `Playwright` 用例尽量使用稳定的文本和角色定位
- 必要时再引入 `data-testid`
- Midscene 环境变量缺失时，相关增强能力可跳过，但主 smoke case 不能失效

## 第一版验收标准

交付完成后，至少满足：

1. `Vitest` 能正常启动并运行新增测试
2. `Playwright` 能拉起 dumi dev 并跑通至少一条回归用例
3. 缺少 Midscene 配置时，基础浏览器测试仍可执行
4. 新增代码通过现有 lint 与基础诊断检查

## 后续扩展方向

第一版稳定后，可继续按以下顺序扩展：

1. 补 `useTreeState`、`useUndoRedo`、`virtual-tree` 的单测
2. 扩大 `PromptEditor` 组件测试覆盖面
3. 把 `TESTING.md` 中的手工核心流程逐步迁移到 `Playwright`
4. 将更复杂、对 selector 敏感的页面交互逐步迁移为 `Midscene` 自然语言步骤
5. 后续再考虑接入 CI 与覆盖率统计

## 本轮实现范围确认

本轮实际编码以“最小可跑闭环”为准：

- 完成测试依赖与配置接入
- 完成一组 `tree-utils` 单测
- 完成一组 `PromptEditor` 组件测试
- 完成一条 dumi 浏览器冒烟回归
- 完成最小 Midscene 集成与环境兼容设计

不在本轮继续扩展更多高级测试能力。
