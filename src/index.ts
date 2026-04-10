export { PromptEditor } from './components/PromptEditor';
export * from './types';

// 国际化支持 - 类似 Ant Design 的使用方式
export { default as enUS } from './i18n/locales/en-US';
export { default as zhCN } from './i18n/locales/zh-CN';
export type { Locale } from './i18n/locales/zh-CN';
export { createTranslator, defaultLocale } from './i18n/types';

// Store 相关类型（用于高级自定义场景）
export type { ChatMessage } from './stores';
