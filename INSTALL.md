# 安装指南

当前 npm 包为基于 Ant Design UI 的版本。它面向已使用或愿意接入 Ant Design 体系的 React 项目，后续会逐步提供其他 UI 库版本。

## 📦 快速开始

### 方式一：完整安装（推荐）

一键安装所有必需的依赖：

```bash
npm install react-prompt-editor antd @ant-design/x
```

或使用 Yarn：

```bash
yarn add react-prompt-editor antd @ant-design/x
```

或使用 pnpm：

```bash
pnpm add react-prompt-editor antd @ant-design/x
```

---

### 方式二：分步安装

#### 1. 安装主库

```bash
npm install react-prompt-editor
```

#### 2. 安装 Peer Dependencies

npm 会显示警告提示需要安装的依赖：

```
npm WARN react-prompt-editor@1.0.0 requires a peer of antd@^5.0.0 
but none is installed. You must install peer dependencies yourself.
```

按照提示安装：

```bash
npm install antd @ant-design/x
```

---

## 📋 依赖说明

### Peer Dependencies（需要手动安装）

这些依赖**必须**由你的项目提供：

| 依赖 | 版本要求 | 用途 | 大小 |
|------|---------|------|------|
| **react** | >=16.9.0 | React 核心 | - |
| **react-dom** | >=16.9.0 | React DOM | - |
| **antd** | ^5.0.0 | 当前 UI 基座 | ~300 KB |
| **@ant-design/x** | ^2.0.0 | 当前 AI 交互 UI 组件 | ~50 KB |

**为什么需要手动安装？**
- ✅ 当前版本明确基于 Ant Design UI，由宿主项目提供 UI 体系
- ✅ 复用你项目里的 Ant Design 主题、Token 和配置
- ✅ 避免重复打包（如果你的项目已有 antd）
- ✅ 让你控制 Ant Design 相关依赖版本
- ✅ 后续扩展其他 UI 库版本时，产品边界更清晰

---

### Dependencies（自动安装）

这些依赖会**自动安装**，无需关心：

- `clsx` - 样式类名工具
- `@uiw/react-codemirror` - 编辑器 React 封装
- `@codemirror/commands` - CodeMirror 命令
- `@codemirror/lang-markdown` - Markdown 语言支持
- `@codemirror/theme-one-dark` - 暗色主题
- `highlight.js` - 语法高亮
- `lucide-react` - 图标库
- `markdown-it` + plugins - Markdown 解析
- `react-window` - 虚拟滚动
- `tailwind-merge` - Tailwind 类名合并
- `uuid` - UUID 生成
- `zustand` - 状态管理

---

## 🔧 版本兼容性

### 推荐的版本组合

```json
{
  "dependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0",
    "antd": "^5.29.0",
    "@ant-design/x": "^2.5.0",
    "react-prompt-editor": "^1.0.0"
  }
}
```

### 版本范围说明

我们使用宽松的版本范围（如 `^5.0.0`），这意味着：
- ✅ 兼容 5.x.x 的任何小版本更新
- ✅ 自动获取 bug 修复和安全更新
- ⚠️ 大版本升级（如 5.x → 6.x）需要手动处理

---

## ⚠️ 常见问题

### Q1: 忘记安装 peerDependencies 会怎样？

**A:** npm/yarn 会显示警告，但库仍然可以安装。不过运行时可能会报错：

```
Module not found: Can't resolve 'antd'
```

**解决方案：** 按照上面的安装命令重新安装。

---

### Q2: 我的项目已经有 antd 了，还需要安装吗？

**A:** 不需要重复安装！只需要确保版本兼容：

```bash
# 检查当前 antd 版本
npm ls antd

# 如果版本不兼容，升级 antd
npm install antd@^5.0.0
```

---

### Q3: 为什么只需要额外安装 antd 和 @ant-design/x？

**A:** 因为当前版本定位为 Ant Design UI 版本。编辑器相关依赖已经由库本身自动安装，而 UI 体系依赖继续交由宿主项目提供。

如果你的项目不希望引入 Ant Design，可以等待后续其他 UI 库版本。

---

### Q4: 如何检查依赖是否正确安装？

**A:** 运行以下命令：

```bash
# 查看所有安装的依赖
npm ls react-prompt-editor antd @ant-design/x

# 检查是否有未满足的 peerDependencies
npm ls --depth=0
```

应该看到类似输出：

```
your-project@1.0.0
├── antd@5.29.3
├── @ant-design/x@2.5.0
├── react-prompt-editor@1.0.0
└── ...
```

---

## 🚀 使用示例

### 基础用法

```jsx
import { PromptEditor } from 'react-prompt-editor';
import 'react-prompt-editor/dist/styles/index.css';

function App() {
  return (
    <PromptEditor
      initialValue={[]}
      onChange={(value) => console.log(value)}
    />
  );
}
```

### 完整示例

查看我们的示例项目：
- [基础示例](./examples/basic)
- [AI 优化示例](./examples/ai-optimize)
- [自定义主题示例](./examples/custom-theme)

---

## 📦 CDN 使用（可选）

如果你不想管理依赖，可以使用 UMD 版本（即将提供）：

```html
<!-- 加载依赖 -->
<script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/antd@5/dist/antd.min.js"></script>

<!-- 加载库 -->
<script src="https://cdn.jsdelivr.net/npm/react-prompt-editor@1/dist/umd/index.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/react-prompt-editor@1/dist/styles/index.css">
```

---

## 🆘 获取帮助

遇到问题？

1. 📖 查看 [完整文档](../README.md)
2. 🔍 搜索 [Issues](https://github.com/your-repo/issues)
3. 💬 提交新的 [Issue](https://github.com/your-repo/issues/new)
4. 📧 联系维护团队

---

## 📝 更新日志

查看每个版本的变更：[CHANGELOG.md](../CHANGELOG.md)

---

**最后更新**: 2026年4月16日  
**当前版本**: v1.0.0
