# Storybook 汉化配置指南

## 📚 目录

- [快速开始](#快速开始)
- [配置说明](#配置说明)
- [语言切换](#语言切换)
- [自定义汉化](#自定义汉化)
- [常见问题](#常见问题)

## 🚀 快速开始

Storybook 已经配置好中文语言支持！你现在可以：

1. **访问 Storybook**: http://localhost:6006
2. **切换语言**: 点击右上角工具栏的 🌐 地球图标，选择"简体中文"
3. **浏览组件**: 在左侧侧边栏查看组件列表

## ⚙️ 配置说明

### 1. 语言配置文件

- **`.storybook/preview.tsx`**: 主要配置文件
  - 设置默认语言为简体中文
  - 添加语言切换工具栏
  - 配置语言装饰器

- **`.storybook/locale.ts`**: 中文翻译文件
  - 包含 Storybook UI 的中文翻译
  - 可以自定义所有界面文本

### 2. 已汉化的界面元素

✅ 工具栏（Toolbar）
- 语言切换器
- 背景设置
- 视口选择
- 无障碍测试

✅ 侧边栏（Sidebar）
- 搜索框
- 导航菜单
- 组件列表

✅ 面板（Panels）
- 控件（Controls）
- 动作（Actions）
- 文档（Docs）
- 无障碍（A11y）

## 🌐 语言切换

### 方法一：工具栏切换

1. 打开 Storybook (http://localhost:6006)
2. 点击右上角的 🌐 地球图标
3. 选择"简体中文"或"English"

### 方法二：修改默认语言

编辑 `.storybook/preview.tsx`：

```typescript
globalTypes: {
  locale: {
    defaultValue: 'zh-CN', // 修改默认语言
    // ...
  },
},
```

## 🔧 自定义汉化

### 添加新的翻译

编辑 `.storybook/locale.ts`，添加新的翻译键值对：

```typescript
export const zhCN: Locale = {
  // 现有的翻译...
  'your.custom.key': '你的中文翻译',
}
```

### 修改现有翻译

直接在 `.storybook/locale.ts` 中修改对应的翻译文本。

### 常用翻译键

```typescript
{
  'storybook.app.sidebar.search.placeholder': '搜索组件...',
  'storybook.app.controls.reset': '重置',
  'storybook.app.docs.description': '描述',
  'storybook.app.toolbar.a11y': '无障碍',
  // ... 更多键值见 locale.ts
}
```

## ❓ 常见问题

### Q1: 为什么有些文本还是英文？

A: Storybook 的部分核心 UI 文本需要通过官方语言包来汉化。目前我们配置了主要的界面元素，但某些深层组件可能仍显示英文。

### Q2: 如何贡献完整的汉化？

A: 你可以：
1. 在 `.storybook/locale.ts` 中添加更多翻译
2. 参考 Storybook 官方文档了解完整的翻译键列表
3. 向 Storybook 官方提交中文语言包 PR

### Q3: 语言切换后没有立即生效？

A: 尝试以下方法：
1. 刷新页面（Ctrl/Cmd + R）
2. 清除浏览器缓存
3. 重启 Storybook 开发服务器

### Q4: 可以为不同的故事设置不同的语言吗？

A: 可以！在故事文件中使用 `globals` 参数：

```typescript
// Button.stories.ts
export const Default = {
  parameters: {
    locale: 'zh-CN',
  },
}
```

## 📖 学习资源

- [Storybook 官方文档](https://storybook.js.org/docs)
- [Storybook 国际化指南](https://storybook.js.org/docs/api/main-config/main-config-i18n)
- [Storybook 中文社区](https://discord.gg/storybook)

## 🎯 下一步

1. **浏览示例组件**: 查看 `src/stories/` 目录下的示例
2. **创建你的组件**: 开始编写你的第一个组件故事
3. **配置主题**: 在工具栏中切换浅色/深色主题
4. **学习快捷键**: 按 `?` 键查看快捷键列表

---

**提示**: 如果你在开发过程中遇到任何问题，可以查看 `.storybook/` 目录下的配置文件，或者重启 Storybook 服务器。
