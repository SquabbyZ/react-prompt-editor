module.exports = {
  extends: require.resolve('@umijs/lint/dist/config/eslint'),
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
  },
};
