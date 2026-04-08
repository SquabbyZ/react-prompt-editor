/**
 * CodeMirror 国际化配置
 * 用于配置 CodeMirror 搜索框等 UI 元素的文本
 */
import type { Locale } from './locales/zh-CN';
import { createTranslator } from './types';

/**
 * 获取 CodeMirror 的 Phrases 配置
 * 参考: https://codemirror.net/docs/ref/#search.SearchCursor
 */
export function getCodeMirrorPhrases(locale: Locale) {
  const t = createTranslator(locale);

  return {
    // 搜索相关文本
    search: t('codemirror.search'),
    replace: t('codemirror.replace'),
    'replace all': t('codemirror.replaceAll'),
    case: t('codemirror.caseSensitive'),
    word: t('codemirror.wholeWord'),
    regexp: t('codemirror.regexp'),
    prev: t('codemirror.previousMatch'),
    next: t('codemirror.nextMatch'),
    close: t('codemirror.close'),
  };
}

/**
 * CodeMirror 搜索插件配置类型
 */
export interface CodeMirrorSearchConfig {
  phrases?: ReturnType<typeof getCodeMirrorPhrases>;
}
