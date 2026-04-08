import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'docs-dist',
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
