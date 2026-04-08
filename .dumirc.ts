import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'docs-dist',
  // 设置默认语言为中文
  locales: [
    { id: 'zh-CN', name: '中文' },
    { id: 'en-US', name: 'English' },
  ],
  themeConfig: {
    name: 'promptED',
    logo: '/logo.png',
    socialLinks: {
      github: 'https://github.com/SquabbyZ/react-prompt-editor',
    },
    favicon: '/favicon.ico',
  },
  resolve: {
    entryFile: 'src/index.ts',
  },
  // 全局引入组件样式
  styles: ['src/styles/tailwind.css'],
  // 禁用 dumi 的一些特性以减少警告
  apiParser: false,
  // 优化示例展示样式
  extraBabelPlugins: [],
});
