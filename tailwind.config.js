/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './docs/**/*.{md,mdx,ts,tsx}',
    './dist/**/*.{js,jsx,ts,tsx}',
  ],
  // 配置暗色模式：支持 class 和 dumi 的 data-prefers-color 属性
  darkMode: ['selector', '[data-prefers-color="dark"]'],
  theme: {
    extend: {
      // 注册 Ant Design Token CSS 变量为 Tailwind 工具类
      colors: {
        // 主色调
        primary: {
          DEFAULT: 'var(--pe-color-primary)',
          hover: 'var(--pe-color-primary-hover)',
          active: 'var(--pe-color-primary-active)',
          bg: 'var(--pe-color-primary-bg)',
          border: 'var(--pe-color-primary-border)',
        },
        // 成功色
        success: {
          DEFAULT: 'var(--pe-color-success)',
          hover: 'var(--pe-color-success-hover)',
          active: 'var(--pe-color-success-active)',
          bg: 'var(--pe-color-success-bg)',
          border: 'var(--pe-color-success-border)',
        },
        // 警告色
        warning: {
          DEFAULT: 'var(--pe-color-warning)',
          hover: 'var(--pe-color-warning-hover)',
          active: 'var(--pe-color-warning-active)',
          bg: 'var(--pe-color-warning-bg)',
          border: 'var(--pe-color-warning-border)',
        },
        // 错误色
        error: {
          DEFAULT: 'var(--pe-color-error)',
          hover: 'var(--pe-color-error-hover)',
          active: 'var(--pe-color-error-active)',
          bg: 'var(--pe-color-error-bg)',
          border: 'var(--pe-color-error-border)',
        },
        // 信息色
        info: {
          DEFAULT: 'var(--pe-color-info)',
          hover: 'var(--pe-color-info-hover)',
          active: 'var(--pe-color-info-active)',
          bg: 'var(--pe-color-info-bg)',
          border: 'var(--pe-color-info-border)',
        },
        // 文字颜色
        text: {
          DEFAULT: 'var(--pe-color-text)',
          secondary: 'var(--pe-color-text-secondary)',
          tertiary: 'var(--pe-color-text-tertiary)',
          quaternary: 'var(--pe-color-text-quaternary)',
        },
        // 填充色
        fill: {
          DEFAULT: 'var(--pe-color-fill)',
          secondary: 'var(--pe-color-fill-secondary)',
          tertiary: 'var(--pe-color-fill-tertiary)',
          quaternary: 'var(--pe-color-fill-quaternary)',
        },
        // 背景色
        bg: {
          container: 'var(--pe-color-bg-container)',
          elevated: 'var(--pe-color-bg-elevated)',
          layout: 'var(--pe-color-bg-layout)',
          spotlight: 'var(--pe-color-bg-spotlight)',
          mask: 'var(--pe-color-bg-mask)',
        },
        // 边框色
        border: {
          DEFAULT: 'var(--pe-color-border)',
          secondary: 'var(--pe-color-border-secondary)',
        },
      },
      // 圆角
      borderRadius: {
        'ant-sm': 'var(--pe-radius-sm)',
        ant: 'var(--pe-radius)',
        'ant-lg': 'var(--pe-radius-lg)',
        'ant-xl': 'var(--pe-radius-xl)',
        'ant-outer': 'var(--pe-radius-outer)',
      },
      // 间距（Margin & Padding）
      spacing: {
        'ant-xs': 'var(--pe-margin-xs)',
        'ant-sm': 'var(--pe-margin-sm)',
        'ant-md': 'var(--pe-margin-md)',
        'ant-lg': 'var(--pe-margin-lg)',
        'ant-xl': 'var(--pe-margin-xl)',
        'ant-xxl': 'var(--pe-margin-xxl)',
      },
      // 内边距
      padding: {
        'ant-xs': 'var(--pe-padding-xs)',
        'ant-sm': 'var(--pe-padding-sm)',
        'ant-md': 'var(--pe-padding-md)',
        'ant-lg': 'var(--pe-padding-lg)',
        'ant-xl': 'var(--pe-padding-xl)',
        'ant-xxl': 'var(--pe-padding-xxl)',
      },
      margin: {
        'ant-xs': 'var(--pe-margin-xs)',
        'ant-sm': 'var(--pe-margin-sm)',
        'ant-md': 'var(--pe-margin-md)',
        'ant-lg': 'var(--pe-margin-lg)',
        'ant-xl': 'var(--pe-margin-xl)',
        'ant-xxl': 'var(--pe-margin-xxl)',
      },
      // 阴影
      boxShadow: {
        ant: 'var(--pe-box-shadow)',
        'ant-secondary': 'var(--pe-box-shadow-secondary)',
        'ant-tertiary': 'var(--pe-box-shadow-tertiary)',
      },
      // 字体大小
      fontSize: {
        'ant-sm': ['var(--pe-font-size-sm)', { lineHeight: 'var(--pe-line-height-sm)' }],
        ant: ['var(--pe-font-size)', { lineHeight: 'var(--pe-line-height)' }],
        'ant-lg': ['var(--pe-font-size-lg)', { lineHeight: 'var(--pe-line-height-lg)' }],
        'ant-xl': ['var(--pe-font-size-xl)', { lineHeight: 'var(--pe-line-height-lg)' }],
      },
      // 字体族
      fontFamily: {
        ant: 'var(--pe-font-family)',
        'ant-code': 'var(--pe-font-family-code)',
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-down': 'slide-down 0.2s ease-out',
        'slide-up': 'slide-up 0.2s ease-out',
        'expand-in': 'expand-in 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        'collapse-out': 'collapse-out 0.2s cubic-bezier(0.65, 0, 0.35, 1)',
        'slide-down-children': 'slide-down-children 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-down': {
          from: { transform: 'translateY(-8px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(0)', opacity: '1' },
          to: { transform: 'translateY(-8px)', opacity: '0' },
        },
        'expand-in': {
          from: { transform: 'scaleY(0.95)', opacity: '0' },
          to: { transform: 'scaleY(1)', opacity: '1' },
        },
        'collapse-out': {
          from: { transform: 'scaleY(1)', opacity: '1' },
          to: { transform: 'scaleY(0.95)', opacity: '0' },
        },
        'slide-down-children': {
          from: { maxHeight: '0', opacity: '0', transform: 'translateY(-4px)' },
          to: { maxHeight: '2000px', opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
  ],
  corePlugins: {
    preflight: false,
  },
};
