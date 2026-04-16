# 代码优化和压缩指南

本文档介绍如何对 react-prompt-editor 项目进行代码优化和压缩，以减小包体积并提高性能。

## 📋 目录

- [现有优化措施](#现有优化措施)
- [生产环境构建](#生产环境构建)
- [代码压缩配置](#代码压缩配置)
- [Tree-shaking 支持](#tree-shaking-支持)
- [优化建议](#优化建议)

## 🚀 现有优化措施

### 1. Tree-shaking 支持
项目采用 **Bundless ESM 模式**，保持模块化结构，便于打包工具进行 tree-shaking：

```typescript
// .fatherrc.ts
export default defineConfig({
  esm: {
    output: 'dist/esm',
    transformer: 'babel',
  },
  cjs: {
    output: 'dist/lib',
    transformer: 'babel',
  },
});
```

### 2. Console 清理
使用 `babel-plugin-transform-remove-console` 自动移除调试代码：

```javascript
// 已配置的 babel 插件
['babel-plugin-transform-remove-console', { 
  exclude: ['error', 'warn'] 
}]
```

### 3. CSS 压缩
Tailwind CSS 构建时使用 `--minify` 参数进行压缩。

## 🏭 生产环境构建

### 基本构建命令

```bash
# 开发构建（包含 console）
pnpm build

# 生产构建（移除 console + 代码压缩）
pnpm build:prod
```

### 构建流程说明

`build:prod` 命令执行以下步骤：

1. **Father 构建** - 编译 TypeScript/JavaScript 代码
2. **CSS 构建** - 编译和压缩 Tailwind CSS
3. **Console 清理** - 移除 console.log/info/debug
4. **代码压缩** - 使用 Terser 压缩 JavaScript 代码

## 🗜️ 代码压缩配置

### Terser 压缩选项

项目使用 Terser 进行代码压缩，配置如下：

```javascript
{
  compress: {
    drop_console: false,           // 保留 console.warn/error
    drop_debugger: true,           // 移除 debugger
    pure_funcs: [                  // 只移除这些 console
      'console.log',
      'console.info', 
      'console.debug'
    ],
    dead_code: true,               // 移除死代码
    unused: true,                  // 移除未使用的代码
    passes: 2,                     // 多次压缩
  },
  mangle: {
    toplevel: true,                // 混淆顶级变量名
    properties: false,             // 不混淆属性名
  },
  format: {
    comments: false,               // 移除注释
    beautify: false,
  },
  ecma: 2015,                      // ES6+ 支持
}
```

### 自定义压缩配置

如需调整压缩选项，可编辑 `scripts/compress-js.js` 文件中的 Terser 配置。

## 🌳 Tree-shaking 支持

### 正确使用方式

```javascript
// ✅ 推荐：按需导入
import { PromptEditor } from 'react-prompt-editor';

// ❌ 避免：全量导入
import * as Editor from 'react-prompt-editor';
```

### 依赖外部化

大型依赖（如 antd、react）应作为 peerDependencies，由使用者提供：

```json
{
  "peerDependencies": {
    "react": ">=16.9.0",
    "react-dom": ">=16.9.0"
  }
}
```

## 💡 优化建议

### 1. 代码分割

对于重型组件，使用 React.lazy 进行动态导入：

```javascript
const AIOptimizeModal = React.lazy(() => 
  import('./components/AIOptimizeModal')
);
```

### 2. 依赖优化

定期检查并更新依赖，移除未使用的包：

```bash
# 检查未使用的依赖
npx depcheck

# 分析包大小
pnpm build:analyze
```

### 3. 构建产物分析

使用内置的分析脚本检查包大小：

```bash
pnpm build:analyze
```

这将显示：
- 各文件的原始大小
- Gzip 压缩后的大小
- Brotli 压缩后的大小
- 优化建议

### 4. 性能监控

在生产环境中监控以下指标：
- 首屏加载时间
- Bundle 大小
- Tree-shaking 效果
- 运行时性能

## 🔧 故障排除

### 压缩失败

如果遇到压缩错误：

1. 检查 Node.js 版本（建议 v16+）
2. 确保 terser 已正确安装
3. 查看错误日志定位具体问题

### Tree-shaking 无效

如果 tree-shaking 不工作：

1. 确认使用的是 ESM 版本 (`dist/esm/`)
2. 检查是否有副作用代码
3. 验证打包工具的 tree-shaking 配置

### 包体积过大

如果包体积仍然很大：

1. 运行 `pnpm build:analyze` 分析构成
2. 检查是否有重复依赖
3. 考虑进一步代码分割
4. 评估是否可以外部化更多依赖

## 📊 预期效果

经过完整优化后，通常可以获得：

- **30-50%** 的代码体积减少（通过压缩）
- **60-80%** 的传输体积减少（通过 Gzip/Brotli）
- **更好的 tree-shaking** 效果（通过模块化设计）

## 🔄 持续优化

建议定期执行以下操作：

1. 运行构建分析检查包大小变化
2. 更新依赖到最新版本
3. 审查和优化代码结构
4. 监控实际使用场景的性能表现

---

如有问题或建议，请提交 Issue 或 PR。
