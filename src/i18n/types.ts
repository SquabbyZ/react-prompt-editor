/**
 * 国际化类型定义和工具函数
 */
import type { Locale as LocaleType } from './locales/zh-CN';
import zhCN from './locales/zh-CN';

export type Locale = LocaleType;

// 默认语言包
export const defaultLocale = zhCN;
export { default as enUS } from './locales/en-US';
export { default as zhCN } from './locales/zh-CN';

/**
 * 获取嵌套对象的值
 */
export function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((acc, part) => acc?.[part], obj);
}

/**
 * 替换模板字符串中的变量
 */
export function formatString(
  template: string,
  params?: Record<string, any>,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return params[key] !== undefined ? String(params[key]) : `{${key}}`;
  });
}

/**
 * 创建翻译函数
 */
export function createTranslator(locale: Locale = defaultLocale) {
  return (key: string, params?: Record<string, any>) => {
    const value = getNestedValue(locale, key);

    if (typeof value === 'string') {
      return formatString(value, params);
    }

    console.warn(`i18n: Translation key "${key}" not found`);
    return key;
  };
}
