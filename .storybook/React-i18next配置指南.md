# Storybook React-i18next 完整汉化配置指南

## ✅ 配置完成！

恭喜！你的 Storybook 现在已经配置了完整的汉化支持。

## 📦 安装的依赖

已安装以下依赖包：

```json
{
  "devDependencies": {
    "storybook-react-i18next": "^10.1.1"
  },
  "dependencies": {
    "i18next": "^25.10.10",
    "react-i18next": "^16.6.6",
    "i18next-browser-languagedetector": "^8.0.0",
    "i18next-http-backend": "^3.0.0"
  }
}
```

## 🔧 配置文件说明

### 1. `.storybook/main.ts`
添加了 `storybook-react-i18next` addon：

```typescript
{
  addons: [
    // ... 其他 addons
    "storybook-react-i18next"
  ]
}
```

### 2. `.storybook/i18next.ts` ⭐ 核心配置文件
包含完整的中文翻译：

- ✅ 侧边栏文本
- ✅ 工具栏文本
- ✅ 面板文本（控件、动作、文档、无障碍）
- ✅ 预览区域文本
- ✅ 设置菜单文本
- ✅ 常用操作文本

### 3. `.storybook/preview.tsx`
配置 i18n 参数和语言选项：

```typescript
import i18n from './i18next'

const preview: Preview = {
  parameters: {
    i18n,  // 引入 i18n 配置
  },
  initialGlobals: {
    locale: 'zh-CN',  // 默认语言
    locales: {
      'zh-CN': { icon: '🇨🇳', title: '简体中文', right: 'CN' },
      'en': { icon: '🇺🇸', title: 'English', right: 'US' },
    },
  },
}
```

## 🎯 如何使用

### 1. 启动 Storybook

```bash
npm run storybook
```

### 2. 访问 Storybook

访问：http://localhost:6006

### 3. 切换语言

1. 点击右上角工具栏的 **🌐 地球图标**
2. 选择 **"简体中文"** 或 **"English"**
3. **界面立即切换为中文**！✨

## 📝 汉化效果

### ✅ 已汉化的界面元素

#### 侧边栏 (Sidebar)
- ✅ 搜索框提示：搜索组件...
- ✅ 导航：首页、探索

#### 工具栏 (Toolbar)
- ✅ 参数面板
- ✅ 大纲
- ✅ 测量
- ✅ 背景
- ✅ 视口
- ✅ 无障碍
- ✅ 文档
- ✅ 动作
- ✅ 设置

#### 控件面板 (Controls Panel)
- ✅ 没有可用的控件
- ✅ 重置
- ✅ 清除

#### 动作面板 (Actions Panel)
- ✅ 没有动作
- ✅ 清除全部

#### 文档面板 (Docs Panel)
- ✅ 描述
- ✅ 属性
- ✅ 源码
- ✅ 示例

#### 无障碍面板 (A11y Panel)
- ✅ 违规
- ✅ 已通过
- ✅ 测试
- ✅ 运行中

#### 预览区域 (Preview)
- ✅ 加载中...
- ✅ 发生错误
- ✅ 重新加载
- ✅ 全屏
- ✅ 在新标签页打开
- ✅ 复制链接

#### 设置菜单 (Settings)
- ✅ 主题
  - ✅ 浅色
  - ✅ 深色
  - ✅ 自动
- ✅ 关于

## 🔧 自定义翻译

### 添加新的翻译

编辑 `.storybook/i18next.ts` 文件，在 `zhCN` 对象中添加：

```typescript
const zhCN = {
  // 现有翻译...
  'your.custom.key': '你的中文翻译',
}
```

### 修改现有翻译

直接在 `.storybook/i18next.ts` 中修改对应的翻译文本。

### 常用翻译键参考

```typescript
const zhCN = {
  // 侧边栏
  'sidebar.search.placeholder': '搜索组件...',
  'sidebar.nav.home': '首页',
  'sidebar.nav.explore': '探索',
  
  // 工具栏
  'toolbar.argPanel': '参数',
  'toolbar.docs': '文档',
  'toolbar.actions': '动作',
  
  // 控件
  'controls.noControls': '没有可用的控件',
  'controls.reset': '重置',
  
  // 文档
  'docs.description': '描述',
  'docs.props': '属性',
  
  // 通用
  'common.loading': '加载中',
  'common.error': '错误',
  'common.success': '成功',
}
```

## 📚 编写中文故事

现在你可以完全使用中文编写组件故事：

### 示例：Button.stories.ts

```typescript
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './Button'

/**
 * Button 按钮组件
 * 
 * 按钮是用户界面中最基础的交互组件，用于：
 * - 触发动作（如提交表单）
 * - 导航跳转
 * - 交互操作（如确认、取消）
 */
const meta = {
  title: '组件库/按钮',
  component: Button,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
## Button 按钮

按钮是常用的基础组件，用于触发操作或跳转链接。

### 设计原则

- **清晰可见** - 用户能轻松识别
- **明确反馈** - 点击时有视觉反馈
- **易于访问** - 支持键盘和屏幕阅读器

### 使用场景

1. 表单提交
2. 对话框操作
3. 导航跳转
4. 触发弹出
        `,
      },
    },
  },
  argTypes: {
    label: {
      control: 'text',
      description: '按钮显示的文本',
      table: {
        type: { summary: 'string' },
        defaultValue: { summary: 'Button' },
      },
    },
    primary: {
      control: 'boolean',
      description: '是否为主要样式',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
      description: '按钮尺寸',
      table: {
        type: { summary: '"small" | "medium" | "large"' },
        defaultValue: { summary: '"medium"' },
      },
    },
    disabled: {
      control: 'boolean',
      description: '是否禁用按钮',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
  },
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

/**
 * 主要按钮
 * 
 * 用于强调重要的操作，如"提交"、"保存"、"立即购买"等
 * 
 * 主要按钮在视觉上更加突出，能够吸引用户的注意力
 */
export const 主要按钮：Story = {
  args: {
    primary: true,
    label: '立即提交',
  },
}

/**
 * 次要按钮
 * 
 * 用于一般性操作，如"取消"、"返回"、"查看更多"等
 */
export const 次要按钮：Story = {
  args: {
    label: '取消操作',
  },
}

/**
 * 禁用状态
 * 
 * 当操作不可用时使用禁用状态
 * 
 * 禁用按钮：
 * - 不响应点击事件
 * - 视觉上有明显的禁用样式
 * - 屏幕阅读器会告知用户该按钮不可用
 */
export const 禁用状态：Story = {
  args: {
    primary: true,
    label: '不可点击',
    disabled: true,
  },
}
```

## 🎨 高级用法

### 1. 故事级别的语言覆盖

为特定故事设置固定语言：

```typescript
export const 中文版：Story = {
  parameters: {
    locale: 'zh-CN',
  },
}

export const EnglishVersion: Story = {
  parameters: {
    locale: 'en',
  },
}
```

### 2. 使用 i18n Hook

在组件中使用 i18n：

```typescript
import { useTranslation } from 'react-i18next'

function MyComponent() {
  const { t, i18n } = useTranslation()
  
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <button onClick={() => i18n.changeLanguage('zh-CN')}>
        切换到中文
      </button>
    </div>
  )
}
```

### 3. 监听语言变化

在 preview.tsx 中监听语言变化事件：

```typescript
import { addons } from '@storybook/preview-api'

addons.getChannel().on('LOCALE_CHANGED', (newLocale) => {
  console.log('语言已切换为:', newLocale)
  // 在这里执行自定义逻辑
})
```

## 💡 常见问题

### Q: 为什么有些文本还是英文？

A: 
1. 检查 `.storybook/i18next.ts` 中是否有对应的翻译
2. 某些 Storybook 内置组件可能使用硬编码的英文
3. 第三方 addons 可能有自己的翻译系统

### Q: 如何添加新的翻译键？

A: 
1. 在 `.storybook/i18next.ts` 的 `zhCN` 对象中添加
2. 重启 Storybook 服务器
3. 刷新浏览器

### Q: 语言切换后没有立即生效？

A: 
1. 刷新页面（Cmd + R）
2. 清除浏览器缓存
3. 重启 Storybook 服务器

### Q: 可以为不同的项目使用不同的翻译吗？

A: 可以！为每个项目创建独立的 `.storybook/i18next.ts` 配置文件。

## 🔍 调试技巧

### 1. 查看当前语言

在浏览器控制台输入：

```javascript
// 查看当前语言
console.log(i18next.language)

// 查看所有翻译资源
console.log(i18next.store.data)
```

### 2. 检查翻译是否存在

```javascript
// 检查翻译键
console.log(i18next.t('sidebar.search.placeholder'))
```

### 3. 启用调试模式

在 `.storybook/i18next.ts` 中设置：

```typescript
i18n.init({
  debug: true,  // 启用调试
  // ... 其他配置
})
```

## 📖 学习资源

### 官方文档
- [storybook-react-i18next](https://storybook.js.org/addons/storybook-react-i18next)
- [i18next](https://www.i18next.com/)
- [react-i18next](https://react.i18next.com/)

### 教程
- [Storybook 国际化指南](https://storybook.js.org/docs/api/main-config/main-config-i18n)
- [i18next 快速入门](https://www.i18next.com/overview/getting-started)

## 🎉 总结

**✅ 已完成：**
- ✅ 安装 storybook-react-i18next 和相关依赖
- ✅ 配置 i18next 翻译系统
- ✅ 添加完整的中文翻译
- ✅ 配置语言切换器
- ✅ 支持中英文切换

**🎯 现在你可以：**
- ✅ 使用完全汉化的 Storybook 界面
- ✅ 用中文编写组件文档
- ✅ 在中文环境下高效开发
- ✅ 自定义和扩展翻译

---

**🎊 恭喜！你现在拥有了一个完全汉化的 Storybook 开发环境！**

如有任何问题，请随时询问。
