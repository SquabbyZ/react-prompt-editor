/**
 * 国际化 Hook
 * 提供翻译函数，替代硬编码的文本
 */
import { useCallback, useMemo } from 'react';
import type { Locale } from '../i18n/locales/zh-CN';
import { createTranslator, defaultLocale } from '../i18n/types';

export function useI18n(locale?: Locale) {
  const translator = useMemo(() => {
    return createTranslator(locale || defaultLocale);
  }, [locale]);

  const t = useCallback(
    (key: string, params?: Record<string, any>) => {
      return translator(key, params);
    },
    [translator],
  );

  return { t, locale: locale || defaultLocale };
}
