import type { Preview } from '@storybook/react'
import i18n from './i18next'

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      test: 'todo'
    },

    i18n,
  },
  
  initialGlobals: {
    locale: 'zh-CN',
    locales: {
      'zh-CN': { icon: '🇨🇳', title: '简体中文', right: 'CN' },
      'en': { icon: '🇺🇸', title: 'English', right: 'US' },
    },
  },
};

export default preview;
