import { initReactI18next } from 'react-i18next'
import i18n from 'i18next'
import Backend from 'i18next-http-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

// 中文翻译
const zhCN = {
  // 侧边栏
  'sidebar.search.placeholder': '搜索组件...',
  'sidebar.nav.home': '首页',
  'sidebar.nav.explore': '探索',
  
  // 工具栏
  'toolbar.argPanel': '参数',
  'toolbar.outline': '大纲',
  'toolbar.measure': '测量',
  'toolbar.backgrounds': '背景',
  'toolbar.viewport': '视口',
  'toolbar.a11y': '无障碍',
  'toolbar.docs': '文档',
  'toolbar.actions': '动作',
  'toolbar.settings': '设置',
  
  // 控件面板
  'controls.noControls': '没有可用的控件',
  'controls.reset': '重置',
  'controls.clear': '清除',
  
  // 动作面板
  'actions.noActions': '没有动作',
  'actions.clearAll': '清除全部',
  
  // 文档面板
  'docs.description': '描述',
  'docs.props': '属性',
  'docs.source': '源码',
  'docs.examples': '示例',
  
  // 无障碍面板
  'a11y.violations': '违规',
  'a11y.passed': '已通过',
  'a11y.test': '测试',
  'a11y.running': '运行中',
  
  // 预览区域
  'preview.loading': '加载中...',
  'preview.error': '发生错误',
  'preview.reload': '重新加载',
  'preview.fullscreen': '全屏',
  'preview.newTab': '在新标签页打开',
  'preview.copyLink': '复制链接',
  
  // 设置
  'settings.theme': '主题',
  'settings.theme.light': '浅色',
  'settings.theme.dark': '深色',
  'settings.theme.auto': '自动',
  'settings.about': '关于',
  
  // 其他常用文本
  'common.loading': '加载中',
  'common.error': '错误',
  'common.success': '成功',
  'common.cancel': '取消',
  'common.confirm': '确认',
  'common.close': '关闭',
  'common.open': '打开',
  'common.save': '保存',
  'common.delete': '删除',
  'common.edit': '编辑',
  'common.add': '添加',
  'common.remove': '移除',
  'common.search': '搜索',
  'common.filter': '筛选',
  'common.sort': '排序',
  'common.reset': '重置',
  'common.clear': '清除',
  'common.all': '全部',
  'common.none': '无',
}

// 英文翻译（使用默认）
const en = {}

const ns = ['translation']
const supportedLngs = ['zh-CN', 'en']

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(Backend)
  .init({
    debug: false,
    lng: 'zh-CN',
    fallbackLng: 'en',
    defaultNS: 'translation',
    ns,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    supportedLngs,
    resources: {
      'zh-CN': {
        translation: zhCN,
      },
      'en': {
        translation: en,
      },
    },
  })

export default i18n
