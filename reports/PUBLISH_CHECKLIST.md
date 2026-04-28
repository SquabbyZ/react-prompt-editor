# React Prompt Editor 发布清单

## 📋 发布前检查清单

- [ ] 更新 `package.json` 中的版本号（遵循语义化版本）
- [ ] 更新 `CHANGELOG.md` 或 `README.md` 中的更新日志
- [ ] 确保所有更改已提交到 Git
- [ ] 当前分支为 `main` 或 `master`
- [ ] 运行 `pnpm build:prod` 确认构建成功
- [ ] 运行 `pnpm test` 确认测试通过
- [ ] 运行 `pnpm doctor` 确认无警告
- [ ] 检查 `dist/` 目录包含正确的文件

## 🚀 发布步骤

### 方式一：使用发布脚本（推荐）

```bash
# 发布正式版本
pnpm publish:package

# 发布 beta 版本
pnpm publish:beta

# 发布 alpha 版本
pnpm publish:alpha
```

### 方式二：手动发布

```bash
# 1. 登录 npm
npm login

# 2. 清理并构建
pnpm clean-cache
pnpm build:prod

# 3. 本地测试打包
npm pack

# 4. 发布
npm publish          # 正式发布
# 或
npm publish --tag beta   # beta 版本
```

## 📝 发布后操作

- [ ] 创建 Git tag: `git tag v1.0.0`
- [ ] 推送 tag: `git push origin v1.0.0`
- [ ] 在 GitHub 创建 Release
- [ ] 更新项目文档
- [ ] 通知团队成员

## 🔍 验证发布

```bash
# 查看包信息
npm view react-prompt-editor

# 安装测试
npm install react-prompt-editor

# 清除缓存后重新安装
npm cache clean --force
npm install react-prompt-editor
```

## ⚠️ 注意事项

1. **版本号规范**（语义化版本 SemVer）
   - `MAJOR.MINOR.PATCH` (例如: 1.0.0)
   - MAJOR: 不兼容的 API 变更
   - MINOR: 向下兼容的功能性新增
   - PATCH: 向下兼容的问题修正

2. **Tag 说明**
   - `latest`: 默认标签，用户直接安装时的版本
   - `beta`: 测试版本，需要 `npm install react-prompt-editor@beta`
   - `alpha`: 早期测试版本

3. **撤销发布**
   ```bash
   # 仅在发布后 72 小时内有效
   npm unpublish react-prompt-editor@1.0.0
   
   # 废弃某个版本（推荐）
   npm deprecate react-prompt-editor@1.0.0 "此版本有严重问题，请使用 1.0.1"
   ```

4. **对等依赖提醒**
   - 确保 README 中清楚说明了需要手动安装的 peerDependencies
   - 用户在安装时需要同时安装 antd、CodeMirror 等相关依赖

## 🐛 常见问题

### Q: 发布时提示 "You do not have permission to publish"
A: 检查是否已登录正确的 npm 账号，以及包名是否已被占用

### Q: 发布后无法立即安装
A: npm  CDN 同步可能需要几分钟，可以稍后再试或使用 `npm cache clean --force`

### Q: 如何更新已发布的包？
A: 
1. 修改代码
2. 更新版本号: `npm version patch/minor/major`
3. 重新构建: `pnpm build:prod`
4. 再次发布: `npm publish`

### Q: 发布的内容不对怎么办？
A: 
- 72 小时内可以使用 `npm unpublish` 撤销
- 超过 72 小时只能发布新版本，并废弃旧版本

## 📚 相关资源

- [npm 官方文档](https://docs.npmjs.com/)
- [语义化版本规范](https://semver.org/lang/zh-CN/)
- [package.json 详解](https://docs.npmjs.com/cli/v9/configuring-npm/package-json)
