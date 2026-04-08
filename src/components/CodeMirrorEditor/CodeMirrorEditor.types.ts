import type { Locale } from '../../i18n/locales/zh-CN';

export interface CodeMirrorEditorProps {
  value: string;
  onChange?: (value: string) => void;
  isReadOnly?: boolean;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  /**
   * 国际化配置
   */
  locale?: Locale;
}
