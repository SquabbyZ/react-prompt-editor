import type { Locale } from '../../i18n/locales/zh-CN';

export interface CodeMirrorEditorProps {
  value: string;
  onChange?: (value: string) => void;
  isReadOnly?: boolean;
  placeholder?: string;
  minHeight?: string;
  maxHeight?: string;
  className?: string;
  style?: React.CSSProperties;
  /**
   * 国际化配置
   */
  locale?: Locale;
  /**
   * 主题模式 - 控制明亮/暗色主题
   * - 'system': 跟随系统设置（默认）
   * - 'light': 强制明亮模式
   * - 'dark': 强制暗色模式
   * @default 'system'
   */
  theme?: 'system' | 'light' | 'dark';
}
