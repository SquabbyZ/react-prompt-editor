# 生产环境 Console 安全指南

## 🔒 为什么需要移除 Console？

在生产环境中保留 `console` 语句存在以下风险：

1. **信息泄露** - 可能暴露敏感数据、API 密钥、内部逻辑
2. **性能影响** - 大量 console 会降低浏览器性能
3. **代码体积** - 增加 bundle 大小
4. **用户体验** - 控制台输出混乱，影响调试

## ✅ 当前项目的防护措施

### 1. ESLint 规则（开发阶段）

已在 `.eslintrc.js` 中配置：

```javascript
rules: {
  // 禁止使用 console（生产环境安全）
  'no-console': [
    'warn',
    {
      allow: ['warn', 'error'], // 允许 console.warn 和 console.error
    },
  ],
  // 禁止使用 debugger
  'no-debugger': 'error',
}
```

**效果：**
- ⚠️ 使用 `console.log/info/debug` 时会收到警告
- ❌ 使用 `debugger` 会报错
- ✅ 允许使用 `console.warn/error`（用于错误追踪）

### 2. 最佳实践

#### ✅ 推荐做法

```typescript
// 开发调试时使用
console.log('Debug info:', data); // 提交前删除

// 生产环境保留
console.error('Critical error:', error); // 错误追踪
console.warn('Deprecation warning');     // 警告信息
```

#### ❌ 避免做法

```typescript
// 不要在生产代码中使用
console.log('User data:', userData);
console.info('API response:', response);
console.debug('Internal state:', state);
debugger; // 绝对禁止！
```

## 🛠️ 构建时自动移除 Console（可选）

如果需要在构建时自动移除所有 console 语句，可以使用以下方案：

### 方案 1: 使用 Terser（推荐）

如果使用 Webpack/Vite 等打包工具，可以配置 Terser：

```javascript
// webpack.config.js
module.exports = {
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,  // 移除所有 console
            drop_debugger: true, // 移除 debugger
          },
        },
      }),
    ],
  },
};
```

### 方案 2: 使用 Babel 插件

安装插件：
```bash
pnpm add -D babel-plugin-transform-remove-console
```

配置 `.babelrc`：
```json
{
  "plugins": [
    ["transform-remove-console", { 
      "exclude": ["error", "warn"] 
    }]
  ]
}
```

### 方案 3: 手动清理脚本

创建 `scripts/remove-console.js`：

```javascript
const fs = require('fs');
const path = require('path');

function removeConsole(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  content = content.replace(/console\.(log|info|debug)\([^)]*\);?/g, '');
  fs.writeFileSync(filePath, content, 'utf-8');
}

// 递归处理 dist 目录
function processDir(dir) {
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      processDir(filePath);
    } else if (file.endsWith('.js')) {
      removeConsole(filePath);
    }
  });
}

processDir('./dist');
```

在 `package.json` 中添加：
```json
{
  "scripts": {
    "build:prod": "father build && node scripts/remove-console.js"
  }
}
```

## 📋 检查清单

在发布到生产环境前，请确认：

- [ ] 运行 `pnpm lint` 无 console 相关警告
- [ ] 检查代码中没有遗留的 `console.log/info/debug`
- [ ] 确认只保留了必要的 `console.warn/error`
- [ ] 没有 `debugger` 语句
- [ ] 敏感信息未通过 console 输出

## 🔍 如何检查

```bash
# 查找所有 console 使用
grep -r "console\." src/ --include="*.ts" --include="*.tsx"

# 查找 debugger 语句
grep -r "debugger" src/ --include="*.ts" --include="*.tsx"

# 运行 ESLint 检查
pnpm lint:es
```

## 💡 建议

1. **开发阶段** - 自由使用 console 调试
2. **提交前** - 删除所有调试用的 console
3. **生产环境** - 只保留错误追踪用的 console.error/warn
4. **自动化** - 配置 CI/CD 流程自动检查

---

**最后更新**: 2026-04-08
