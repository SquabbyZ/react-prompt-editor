/**
 * 国际化语言包 - 中文
 */
export default {
  // 通用
  common: {
    confirm: '确定',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    save: '保存',
    loading: '加载中...',
    success: '成功',
    error: '错误',
    warning: '警告',
    info: '提示',
  },

  // PromptEditor 组件
  editor: {
    addRootNode: '添加一级标题',
    nodeLocked: '节点已锁定',
    nodeUnlocked: '节点已解锁',
    nodeDeleted: '节点已删除',
    childNodeAdded: '子节点添加成功',
    rootTitleAdded: '一级标题添加成功',
    dependencyAdded: '依赖添加成功',
    dependencyRemoved: '依赖已移除',
    expandEditor: '展开编辑器',
    collapseEditor: '折叠编辑器',
    addChildNode: '添加子节点',
    lockNode: '锁定节点',
    unlockNode: '解锁节点',
    deleteNode: '删除节点',
    lockedCannotAddChild: '节点已锁定，无法添加子节点',
    lockedCannotDelete: '节点已锁定，无法删除',
    lockedCannotEdit: '节点已锁定，无法编辑',
    previewModeNoEdit: '预览模式下无法编辑',
    notRun: '未运行',
    runFirst: '请先运行',
    childTitle: '子标题',
    lock: '锁定',
    unlock: '解锁',
    deleteConfirmTitle: '删除节点',
    deleteConfirmDesc: '确定要删除这个节点吗？',
    cancelledDelete: '已取消删除',
    editPrompt: '编辑提示词',
  },

  // Node 操作按钮
  node: {
    run: '运行',
    aiOptimize: 'AI 优化',
    expandChildren: '展开子节点',
    collapseChildren: '折叠子节点',
  },

  // 依赖配置
  dependency: {
    title: '依赖任务',
    placeholder: '选择依赖节点（只能选择已锁定的节点）',
    hint: '只能选择已锁定且序号靠前的节点',
    noDependency: '暂无依赖，点击下方按钮添加（只能选择已锁定的前置节点）',
    locked: '已锁定',
  },

  // AI 优化弹窗
  optimize: {
    title: 'AI 提示词优化',
    selectedContent: '已选中 {length} 字',
    selectedContentHint: '选中的内容（{length} 字）',
    inputPlaceholder: '请输入优化指令...',
    inputPlaceholderWithSelection: '请输入优化指令（已选中 {length} 字内容）',
    apply: '替换',
    exit: '退出',
    disclaimer: '内容由AI生成，无法确保真实准确，仅供参考。',
    copied: '已复制到剪贴板',
    optimizeFailed: '优化失败，请重试',
    noOptimizeContent: '暂无优化内容可应用',
    contentApplied: '优化内容已应用',
    replaceSelected: '已替换选中内容',
    replaceAll: '已替换全部内容',
    replaceFailed: '替换失败，请重试',
    optimizeComplete: '优化完成',
    emptyState: '输入优化指令，AI 将为您优化提示词',
    provideCallback: '请提供 onOptimizeRequest 回调',
  },

  // CodeMirror 编辑器
  editor_toolbar: {
    undo: '撤回 (Ctrl+Z)',
    redo: '还原 (Ctrl+Y)',
  },

  // CodeMirror 界面文本
  codemirror: {
    search: '搜索',
    replace: '替换',
    replaceAll: '全部替换',
    caseSensitive: '区分大小写',
    wholeWord: '全字匹配',
    regexp: '正则表达式',
    previousMatch: '上一个匹配',
    nextMatch: '下一个匹配',
    close: '关闭',
    findPlaceholder: '查找...',
    replacePlaceholder: '替换为...',
  },

  // 消息提示
  message: {
    titleModified: '标题修改成功',
    titleEmpty: '标题不能为空',
    editCancelled: '已取消编辑',
    clickToLoad: '点击加载编辑器...',
  },
};

export type Locale = {
  common: Record<string, string>;
  editor: Record<string, string>;
  node: Record<string, string>;
  dependency: Record<string, string>;
  optimize: Record<string, string>;
  editor_toolbar: Record<string, string>;
  message: Record<string, string>;
};
