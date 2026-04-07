# 📖 dumi 文档站点使用指南

**访问地址**: http://localhost:8000  
**启动命令**: `pnpm start`  
**状态**: ✅ 运行中

---

## 🎯 如何测试组件

### 方法一：dumi 文档站点（推荐）✅

1. **访问文档站点**
   - 打开浏览器访问：http://localhost:8000
   - 点击导航栏的 **"Guide"** 或 **"Components"** 
   - 找到 **PromptEditor** 组件文档

2. **在线 Demo**
   - 文档页面会显示完整的交互式 Demo
   - 可以直接在页面上测试所有功能
   - 打开浏览器控制台（F12）查看日志

3. **优势**
   - ✅ 真实的组件渲染
   - ✅ 完整的交互功能
   - ✅ 实时热更新（修改代码自动刷新）
   - ✅ 专业的文档展示

---

### 方法二：独立的测试页面

如果您想要一个更简洁的测试页面，可以访问：

**独立测试页**: http://localhost:8000/~demos/components/prompt-editor/basic

这个页面只包含组件本身，没有文档内容干扰。

---

## 📋 测试步骤

### 1️⃣ 访问文档页面

打开浏览器访问：http://localhost:8000/components/prompt-editor

### 2️⃣ 查看基础示例

页面会显示一个完整的交互式 Demo，包含：
- 2 个根节点（需求分析、方案设计）
- 1 个子节点（用户访谈）
- 所有功能按钮

### 3️⃣ 测试各项功能

#### 展开/折叠
- 点击节点左侧的 ▶/▼ 按钮
- 验证节点可以展开/折叠
- 观察互斥展开效果

#### 编辑器
- 展开一个节点
- 点击 "Click to load editor..." 加载编辑器
- 在编辑器中输入内容
- 验证 Markdown 语法高亮

#### 运行功能
- 点击 "运行" 按钮
- 等待 1 秒（模拟 API 调用）
- 查看弹出的成功提示
- 打开控制台查看日志

#### 锁定功能
- 运行节点后，点击 "🔒 锁定"
- 验证编辑器变为只读
- 验证删除按钮被禁用

#### AI 优化
- 点击 "AI 优化" 按钮
- 等待 1.5 秒
- 查看内容被追加优化文本
- 控制台查看思考过程

---

## 🔍 调试技巧

### 浏览器控制台日志

打开控制台（F12），您会看到：

```javascript
// 运行日志
Run API called: { nodeId, content, dependenciesContent }
✅ Node run: nodeId, result

// 锁定日志
🔒 Node lock: nodeId, isLocked

// 优化日志
✨ Node optimized: nodeId
🤔 思考过程：...

// 树变化日志
📊 Tree changed: [完整的树结构]
```

### 热更新

修改代码后，页面会自动刷新：
- 修改 `src/components/` 下的组件代码
- 修改 `docs/examples/basic.tsx` 中的示例代码
- 保存后自动更新到浏览器

---

## 📁 文件结构说明

```
react-prompt-editor/
├── docs/
│   ├── components/
│   │   └── prompt-editor.md    # 组件文档（Markdown）
│   └── examples/
│       └── basic.tsx            # Demo 示例代码
├── src/
│   ├── components/
│   │   ├── PromptEditor/        # 主组件
│   │   ├── TreeNode/            # 树节点组件
│   │   ├── CodeMirrorEditor/    # 编辑器组件
│   │   ├── RunButton/           # 运行按钮
│   │   ├── LockButton/          # 锁定按钮
│   │   └── AIOptimizeButton/    # AI 优化按钮
│   ├── hooks/
│   │   └── useTreeState.ts      # 状态管理 Hook
│   ├── utils/
│   │   └── tree-utils.ts        # 树工具函数
│   └── types/
│       └── index.ts             # 类型定义
└── .dumirc.ts                   # dumi 配置文件
```

---

## 🎨 自定义 Demo

如果您想创建自己的测试场景，可以：

### 1. 修改现有示例

编辑 `docs/examples/basic.tsx`：

```tsx
// 修改初始数据
const initialValue = [
  {
    id: '1',
    title: '我的自定义节点',
    content: '# 自定义内容',
    children: [],
    isLocked: false,
    hasRun: false,
  },
];
```

### 2. 创建新示例

创建 `docs/examples/advanced.tsx`：

```tsx
import React from 'react';
import { PromptEditor } from 'react-prompt-editor';

export default () => {
  // 您的自定义逻辑
  return <PromptEditor {...props} />;
};
```

然后在 `docs/components/prompt-editor.md` 中添加：

```markdown
## 高级示例

<code src="../examples/advanced.tsx" title="高级示例"></code>
```

---

## ❓ 常见问题

### Q: 为什么页面显示的是 dumi 默认内容？

A: 确保：
1. 访问的是 http://localhost:8000/components/prompt-editor
2. `docs/components/prompt-editor.md` 文件存在
3. 开发服务器正在运行

### Q: 如何查看组件源码？

A: 组件源码在 `src/components/` 目录下，可以使用 IDE 直接查看和编辑。

### Q: 如何测试 API 集成？

A: 修改 `docs/examples/basic.tsx` 中的 `runAPI` 和 `optimizeAPI` 函数，替换为真实的 API 调用。

### Q: 样式不生效怎么办？

A: 检查：
1. `src/styles/variables.css` 是否被正确导入
2. 浏览器开发者工具中查看 CSS 是否加载
3. 清除浏览器缓存

---

## 🚀 下一步

测试完成后，您可以：

1. **完善文档** - 在 `docs/components/prompt-editor.md` 中添加更多说明
2. **创建更多示例** - 在 `docs/examples/` 下添加不同场景的 Demo
3. **优化组件** - 根据测试结果改进组件功能
4. **构建发布** - 运行 `pnpm run build` 构建生产版本

---

**Happy Testing!** 🎉

如有问题，请查看浏览器控制台或终端日志。
