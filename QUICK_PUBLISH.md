# 🚀 React Prompt Editor 快速发布指南

## 首次发布步骤

### 1️⃣ 准备工作（一次性）

```bash
# 注册 npm 账号（如果还没有）
# 访问: https://www.npmjs.com/signup

# 登录 npm
npm login

# 验证登录
npm whoami
```

### 2️⃣ 更新项目信息

编辑 `package.json`，将 `yourusername` 替换为你的 GitHub 用户名：

```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/YOUR_USERNAME/react-prompt-editor.git"
  },
  "homepage": "https://github.com/YOUR_USERNAME/react-prompt-editor#readme",
  "bugs": {
    "url": "https://github.com/YOUR_USERNAME/react-prompt-editor/issues"
  }
}
```

### 3️⃣ 设置版本号

```bash
# 首次发布建议从 1.0.0 开始
npm version 1.0.0

# 这会同时更新 package.json 和创建 git tag
```

### 4️⃣ 执行发布

#### 方式一：使用自动化脚本（推荐）

```bash
pnpm publish:package
```

这个脚本会自动：
- ✅ 检查分支状态
- ✅ 检查未提交更改
- ✅ 清理缓存并重新构建
- ✅ 运行 doctor 检查
- ✅ 运行测试
- ✅ 显示将要发布的文件
- ✅ 等待确认后发布

#### 方式二：手动发布

```bash
# 1. 清理并构建
pnpm clean-cache
pnpm build:prod

# 2. 检查
pnpm doctor
pnpm test

# 3. 预览打包内容
npm pack --dry-run

# 4. 发布
npm publish
```

### 5️⃣ 验证发布

```bash
# 等待几分钟后，查看包信息
npm view react-prompt-editor

# 尝试安装
mkdir test-install
cd test-install
npm init -y
npm install react-prompt-editor antd @ant-design/x @uiw/react-codemirror \
  @codemirror/commands @codemirror/lang-markdown @codemirror/theme-one-dark

# 检查是否安装成功
ls node_modules/react-prompt-editor
```

### 6️⃣ 发布后操作

```bash
# 推送 Git tag（如果使用了 npm version）
git push origin v1.0.0

# 在 GitHub 创建 Release
# 访问: https://github.com/YOUR_USERNAME/react-prompt-editor/releases/new
```

## 📌 后续版本更新

### 补丁版本（Bug 修复）
```bash
npm version patch  # 1.0.0 -> 1.0.1
pnpm publish:package
```

### 次版本（新功能，向下兼容）
```bash
npm version minor  # 1.0.1 -> 1.1.0
pnpm publish:package
```

### 主版本（不兼容的 API 变更）
```bash
npm version major  # 1.1.0 -> 2.0.0
pnpm publish:package
```

## 🎯 发布 Beta/Alpha 版本

```bash
# 设置预发布版本号
npm version prerelease --preid=beta  # 1.0.0 -> 1.0.1-beta.0

# 发布 beta 版本
pnpm publish:beta

# 或发布 alpha 版本
pnpm publish:alpha
```

用户安装时需要指定 tag：
```bash
npm install react-prompt-editor@beta
```

## ⚠️ 重要提醒

1. **包名唯一性**：`react-prompt-editor` 目前未被占用，但发布前最好再确认一次
   ```bash
   npm view react-prompt-editor
   ```

2. **Peer Dependencies**：确保用户在 README 中看到需要安装的依赖
   - antd
   - @ant-design/x
   - @uiw/react-codemirror
   - @codemirror/commands
   - @codemirror/lang-markdown
   - @codemirror/theme-one-dark

3. **样式文件**：提醒用户必须引入 CSS
   ```jsx
   import 'react-prompt-editor/styles/index.css';
   ```

4. **72 小时规则**：npm 只允许在发布后 72 小时内撤销（unpublish）

5. **CDN 同步延迟**：发布后可能需要几分钟才能在全球 CDN 上可用

## 🔧 故障排除

### 问题：发布失败 - "You cannot publish over previously published versions"
**解决**：需要提升版本号
```bash
npm version patch  # 或其他版本类型
```

### 问题：发布失败 - "npm ERR! 403 Forbidden"
**解决**：检查是否登录了正确的账号
```bash
npm whoami  # 查看当前登录用户
npm logout  # 退出登录
npm login   # 重新登录
```

### 问题：发布后找不到包
**解决**：等待 CDN 同步（通常 1-5 分钟）
```bash
# 清除本地缓存
npm cache clean --force

# 稍后再试
npm view react-prompt-editor
```

### 问题：构建产物不正确
**解决**：清理后重新构建
```bash
rm -rf dist
pnpm clean-cache
pnpm build:prod
```

## 📊 发布检查清单

每次发布前确认：

- [ ] 代码已提交到 Git
- [ ] 所有测试通过 (`pnpm test`)
- [ ] 构建成功 (`pnpm build:prod`)
- [ ] Doctor 检查通过 (`pnpm doctor`)
- [ ] 版本号已更新
- [ ] CHANGELOG 已更新
- [ ] README 文档是最新的
- [ ] 已登录正确的 npm 账号
- [ ] 在 main/master 分支上

## 💡 最佳实践

1. **语义化版本**：严格遵守 SemVer 规范
2. **频繁小版本**：优先发布小改动，避免大版本积压
3. **Beta 测试**：重大变更前先发布 beta 版本测试
4. **文档同步**：每次发布都更新文档
5. **Git Tag**：为每个版本创建 Git tag
6. **Release Notes**：在 GitHub 上编写详细的 Release 说明

## 🎉 恭喜！

完成以上步骤后，你的组件库就成功发布到 npm 了！

查看你的包：https://www.npmjs.com/package/react-prompt-editor
