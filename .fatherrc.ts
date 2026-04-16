import { defineConfig } from 'father';

export default defineConfig({
  // ESM 格式:用于现代打包工具(webpack/vite等),支持 tree-shaking
  esm: {
    output: 'dist/esm',
    transformer: 'babel',
    extraBabelPlugins: [
      ['babel-plugin-transform-remove-console', { exclude: ['error', 'warn'] }],
    ],
  },
  // CJS 格式:用于旧版 Node.js 环境或某些测试框架
  cjs: {
    output: 'dist/lib',
    transformer: 'babel',
  },
});
