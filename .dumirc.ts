import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'docs-dist',
  themeConfig: {
    name: 'react-prompt-editor',
    logo: 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicZB.svg',
    socialLinks: {
      github: 'https://github.com/your-repo/react-prompt-editor',
    },
  },
  resolve: {
    entryFile: 'src/index.ts',
  },
  // 禁用 dumi 的一些特性以减少警告
  apiParser: false,
});
