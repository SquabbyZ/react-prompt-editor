# 依赖外部化评估报告

**评估时间**: 2026年4月16日  
**项目**: react-prompt-editor v0.0.1

---

## 📊 当前依赖分类

### Dependencies (生产依赖)

| 依赖包 | 版本 | 大小估算 | 使用频率 | 外部化优先级 |
|--------|------|---------|---------|------------|
| **antd** | ^5.29.3 | ~300 KB | 🔴 高频 | ⭐⭐⭐⭐⭐ |
| **@ant-design/x** | ^2.5.0 | ~50 KB | 🟡 中频 | ⭐⭐⭐⭐ |
| **@uiw/react-codemirror** | ^4.25.9 | ~80 KB | 🔴 高频 | ⭐⭐⭐⭐ |
| **@codemirror/*** | 多个包 | ~100 KB | 🔴 高频 | ⭐⭐⭐⭐ |
| **markdown-it** + plugins | 多个包 | ~60 KB | 🟡 中频 | ⭐⭐⭐ |
| **highlight.js** | ^11.11.1 | ~40 KB | 🟡 中频 | ⭐⭐⭐ |
| **zustand** | ^5.0.12 | ~3 KB | 🔴 高频 | ⭐⭐ |
| **react-window** | ^2.2.7 | ~10 KB | 🔴 高频 | ⭐⭐ |
| **lucide-react** | ^1.7.0 | ~2 KB/tree-shaken | 🔴 高频 | ⭐ |
| **uuid** | ^13.0.0 | ~1 KB | 🟢 低频 | ⭐ |
| **clsx** | ^2.1.1 | <1 KB | 🟢 低频 | ❌ |
| **tailwind-merge** | ^3.5.0 | ~2 KB | 🟢 低频 | ❌ |

---

## 🎯 外部化建议分级

### P0 - 强烈建议外部化 (高收益)

#### 1. **antd** ⭐⭐⭐⭐⭐

**理由：**
- ✅ 体积极大 (~300 KB+)
- ✅ 使用者几乎必定已安装
- ✅ Ant Design 是通用 UI 库，重复打包浪费严重
- ✅ 作为 peerDependency 符合最佳实践

**风险评估：**
- ⚠️ 需要使用者自行安装 antd
- ⚠️ 可能引入版本兼容性问题

**实施方案：**
```json
{
  "peerDependencies": {
    "react": ">=16.9.0",
    "react-dom": ">=16.9.0",
    "antd": "^5.0.0"
  },
  "dependencies": {
    // 移除 antd
  }
}
```

**预期收益：**
- 减少包体积: **~300 KB**
- 减少 Gzip 传输: **~100 KB**
- 避免重复加载: 如果宿主环境已有 antd

---

#### 2. **@ant-design/x** ⭐⭐⭐⭐

**理由：**
- ✅ 专用于 AI 对话场景的组件库
- ✅ 体积较大 (~50 KB)
- ✅ 使用者可能已经在使用或愿意单独安装
- ✅ 与 antd 配套使用

**风险评估：**
- ⚠️ 较新的库，普及度不如 antd
- ⚠️ 需要明确文档说明

**实施方案：**
```json
{
  "peerDependencies": {
    "@ant-design/x": "^2.0.0"
  }
}
```

**预期收益：**
- 减少包体积: **~50 KB**
- 减少 Gzip: **~15 KB**

---

#### 3. **@uiw/react-codemirror** ⭐⭐⭐⭐

**理由：**
- ✅ CodeMirror 封装，体积较大 (~80 KB)
- ✅ 代码编辑器是独立功能模块
- ✅ 使用者可能需要自定义编辑器配置
- ✅ 可以按需导入不同的语言支持

**风险评估：**
- ⚠️ 核心功能依赖，外部化后使用者必须安装
- ⚠️ 需要处理版本兼容性

**实施方案：**
```json
{
  "peerDependencies": {
    "@uiw/react-codemirror": "^4.0.0"
  }
}
```

**预期收益：**
- 减少包体积: **~80 KB**
- 减少 Gzip: **~25 KB**

---

#### 4. **@codemirror/*** 系列 ⭐⭐⭐⭐

**包含的包：**
- `@codemirror/commands`
- `@codemirror/lang-markdown`
- `@codemirror/theme-one-dark`

**理由：**
- ✅ CodeMirror 的核心模块
- ✅ 总体积较大 (~100 KB)
- ✅ 使用者可能需要其他语言支持
- ✅ 可以与 @uiw/react-codemirror 一起外部化

**风险评估：**
- ⚠️ 需要与 @uiw/react-codemirror 版本匹配

**实施方案：**
```json
{
  "peerDependencies": {
    "@codemirror/commands": "^6.0.0",
    "@codemirror/lang-markdown": "^6.0.0",
    "@codemirror/theme-one-dark": "^6.0.0"
  }
}
```

**预期收益：**
- 减少包体积: **~100 KB**
- 减少 Gzip: **~30 KB**

---

### P1 - 建议外部化 (中等收益)

#### 5. **markdown-it** + plugins ⭐⭐⭐

**包含的包：**
- `markdown-it`
- `markdown-it-container`
- `markdown-it-emoji`
- `markdown-it-footnote`
- `markdown-it-highlightjs`
- `markdown-it-task-lists`

**理由：**
- ✅ Markdown 解析器，可替换性强
- ✅ 多个插件累加体积较大 (~60 KB)
- ✅ 使用者可能有自己的 Markdown 配置需求

**风险评估：**
- ⚠️ 核心功能依赖
- ⚠️ 外部化后配置复杂度增加

**实施方案：**
```json
{
  "peerDependencies": {
    "markdown-it": "^14.0.0",
    "markdown-it-container": "^4.0.0",
    "markdown-it-emoji": "^3.0.0",
    "markdown-it-footnote": "^4.0.0",
    "markdown-it-highlightjs": "^4.0.0",
    "markdown-it-task-lists": "^2.0.0"
  }
}
```

**预期收益：**
- 减少包体积: **~60 KB**
- 减少 Gzip: **~20 KB**

---

#### 6. **highlight.js** ⭐⭐⭐

**理由：**
- ✅ 语法高亮库，有多个替代方案
- ✅ 体积较大 (~40 KB，取决于语言包)
- ✅ 使用者可能已经有全局的高亮配置

**风险评估：**
- ⚠️ markdown-it-highlightjs 依赖它
- ⚠️ 需要确保版本兼容

**预期收益：**
- 减少包体积: **~40 KB**
- 减少 Gzip: **~12 KB**

---

### P2 - 可选外部化 (低收益)

#### 7. **zustand** ⭐⭐

**理由：**
- ⚠️ 体积极小 (~3 KB)
- ⚠️ 状态管理是内部实现细节
- ⚠️ 外部化收益不明显

**不建议外部化的原因：**
- 收益太小 (<3 KB)
- 增加使用者负担
- 暴露内部实现细节

---

#### 8. **react-window** ⭐⭐

**理由：**
- ⚠️ 虚拟滚动库，体积小 (~10 KB)
- ⚠️ 性能优化必需
- ⚠️ 有替代方案但切换成本高

**建议：**
- 保持为 dependencies
- 如果未来重构虚拟滚动逻辑再考虑

---

### P3 - 不建议外部化

#### 9. **lucide-react** ❌

**理由：**
- ✅ Tree-shaking 友好
- ✅ 实际打包体积很小 (~2 KB)
- ✅ 图标库选择是设计决策
- ❌ 外部化会增加使用者配置复杂度

---

#### 10. **uuid** ❌

**理由：**
- ✅ 体积极小 (~1 KB)
- ✅ 内部工具函数
- ❌ 外部化得不偿失

---

#### 11. **clsx** & **tailwind-merge** ❌

**理由：**
- ✅ 体积极小 (<3 KB)
- ✅ 样式工具函数
- ✅ 不影响功能，只是便利性
- ❌ 完全没有外部化必要

---

## 📈 外部化方案对比

### 方案 A: 保守方案 (仅 antd)

```json
{
  "peerDependencies": {
    "react": ">=16.9.0",
    "react-dom": ">=16.9.0",
    "antd": "^5.0.0"
  }
}
```

**收益：**
- 减少体积: ~300 KB
- 减少 Gzip: ~100 KB
- 风险: 低
- 实施难度: ⭐

---

### 方案 B: 平衡方案 (推荐) ⭐⭐⭐

```json
{
  "peerDependencies": {
    "react": ">=16.9.0",
    "react-dom": ">=16.9.0",
    "antd": "^5.0.0",
    "@ant-design/x": "^2.0.0",
    "@uiw/react-codemirror": "^4.0.0",
    "@codemirror/commands": "^6.0.0",
    "@codemirror/lang-markdown": "^6.0.0",
    "@codemirror/theme-one-dark": "^6.0.0"
  }
}
```

**收益：**
- 减少体积: **~530 KB**
- 减少 Gzip: **~170 KB**
- 风险: 中等
- 实施难度: ⭐⭐

**优势：**
- 显著减少包体积 (60%+)
- 外部化的都是大型通用库
- 使用者通常已经安装这些依赖

---

### 方案 C: 激进方案 (全部外部化)

```json
{
  "peerDependencies": {
    "react": ">=16.9.0",
    "react-dom": ">=16.9.0",
    "antd": "^5.0.0",
    "@ant-design/x": "^2.0.0",
    "@uiw/react-codemirror": "^4.0.0",
    "@codemirror/commands": "^6.0.0",
    "@codemirror/lang-markdown": "^6.0.0",
    "@codemirror/theme-one-dark": "^6.0.0",
    "markdown-it": "^14.0.0",
    "markdown-it-container": "^4.0.0",
    "markdown-it-emoji": "^3.0.0",
    "markdown-it-footnote": "^4.0.0",
    "markdown-it-highlightjs": "^4.0.0",
    "markdown-it-task-lists": "^2.0.0",
    "highlight.js": "^11.0.0"
  }
}
```

**收益：**
- 减少体积: **~630 KB**
- 减少 Gzip: **~200 KB**
- 风险: 高
- 实施难度: ⭐⭐⭐

**劣势：**
- 使用者需要安装太多依赖
- 配置复杂度高
- 可能降低采用率

---

## 🎯 推荐方案：方案 B (平衡方案)

### 实施步骤

#### 1. 更新 package.json

```json
{
  "peerDependencies": {
    "react": ">=16.9.0",
    "react-dom": ">=16.9.0",
    "antd": "^5.0.0",
    "@ant-design/x": "^2.0.0",
    "@uiw/react-codemirror": "^4.0.0",
    "@codemirror/commands": "^6.0.0",
    "@codemirror/lang-markdown": "^6.0.0",
    "@codemirror/theme-one-dark": "^6.0.0"
  },
  "dependencies": {
    "clsx": "^2.1.1",
    "highlight.js": "^11.11.1",
    "lucide-react": "^1.7.0",
    "markdown-it": "^14.1.0",
    "markdown-it-container": "^4.0.0",
    "markdown-it-emoji": "^3.0.0",
    "markdown-it-footnote": "^4.0.0",
    "markdown-it-highlightjs": "^4.3.0",
    "markdown-it-task-lists": "^2.1.1",
    "react-window": "^2.2.7",
    "tailwind-merge": "^3.5.0",
    "uuid": "^13.0.0",
    "zustand": "^5.0.12"
  }
}
```

#### 2. 更新文档

在 README.md 中添加安装说明：

```markdown
## 安装

```bash
npm install react-prompt-editor
```

### Peer Dependencies

本库需要以下依赖，请确保已安装：

```bash
npm install antd @ant-design/x @uiw/react-codemirror \
  @codemirror/commands @codemirror/lang-markdown @codemirror/theme-one-dark
```
```

#### 3. 提供示例项目

创建一个完整的示例项目，展示如何正确安装和使用。

---

## ⚠️ 风险和缓解措施

### 风险 1: 使用者需要安装更多依赖

**影响：** 可能降低采用率

**缓解：**
- ✅ 清晰的文档说明
- ✅ 提供一键安装命令
- ✅ 创建 starter template
- ✅ 在 npm 页面突出显示

---

### 风险 2: 版本兼容性问题

**影响：** 可能导致运行时错误

**缓解：**
- ✅ 使用宽松的版本范围 (^5.0.0)
- ✅ 定期测试主流版本组合
- ✅ 提供版本兼容性表格
- ✅ 添加运行时版本检查

---

### 风险 3: Breaking Changes

**影响：** 外部依赖的大版本升级可能破坏功能

**缓解：**
- ✅ 遵循语义化版本
- ✅ 在 CHANGELOG 中标注依赖变更
- ✅ 提供迁移指南
- ✅ 保持向后兼容

---

## 📊 预期效果对比

| 指标 | 当前 | 方案 A | 方案 B (推荐) | 方案 C |
|------|------|--------|--------------|--------|
| **原始体积** | 287.64 KB | ~250 KB | ~220 KB | ~200 KB |
| **Gzip 压缩** | 105.65 KB | ~75 KB | ~60 KB | ~50 KB |
| **减少比例** | - | 29% | 43% | 53% |
| **peerDependencies** | 2 | 3 | 8 | 15 |
| **实施难度** | - | ⭐ | ⭐⭐ | ⭐⭐⭐ |
| **维护成本** | 低 | 低 | 中 | 高 |

---

## 🚀 实施建议

### 第一阶段：准备 (1-2 天)

1. ✅ 完成依赖使用情况审计
2. ✅ 创建详细的迁移文档
3. ✅ 准备示例项目
4. ✅ 更新 CI/CD 测试流程

### 第二阶段：实施 (1 天)

1. ✅ 修改 package.json
2. ✅ 运行完整测试套件
3. ✅ 验证构建产物
4. ✅ 更新文档

### 第三阶段：发布 (1 天)

1. ✅ 发布 major 版本 (v1.0.0)
2. ✅ 发布公告和迁移指南
3. ✅ 监控用户反馈
4. ✅ 及时修复问题

---

## 💡 额外优化建议

### 1. 提供 UMD/CDN 版本

对于不想管理依赖的用户，提供预打包的 UMD 版本：

```html
<script src="https://cdn.example.com/react-prompt-editor.min.js"></script>
```

### 2. 创建 Create-React-App Template

```bash
npx create-react-app my-app --template prompt-editor
```

### 3. 提供 Next.js 集成示例

展示如何在 Next.js 中正确使用（特别是 SSR 场景）。

### 4. 添加依赖版本检查

在运行时检查 peerDependencies 版本：

```javascript
function checkPeerDependencies() {
  const requiredVersions = {
    'antd': '^5.0.0',
    '@ant-design/x': '^2.0.0',
    // ...
  };
  
  Object.entries(requiredVersions).forEach(([pkg, range]) => {
    try {
      const version = require(`${pkg}/package.json`).version;
      if (!satisfies(version, range)) {
        console.warn(`Warning: ${pkg}@${version} may not be compatible. Required: ${range}`);
      }
    } catch {
      console.error(`Missing peer dependency: ${pkg}`);
    }
  });
}
```

---

## 📝 结论

### 推荐执行方案 B (平衡方案)

**理由：**
1. ✅ 显著的体积减少 (43%)
2. ✅ 合理的外部化范围
3. ✅ 可控的实施风险
4. ✅ 符合行业最佳实践

**下一步行动：**
1. 团队讨论并确认方案
2. 准备迁移文档和示例
3. 安排发布时间窗口
4. 通知现有用户

---

**评估人**: AI Assistant  
**评估日期**: 2026年4月16日  
**下次复审**: 建议在实施后 3 个月重新评估
