# Changelog

All notable changes to this project will be documented in this file.
本文件用于记录项目中所有重要的变更。

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/).
格式参考 [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)，
并遵循 [Semantic Versioning](https://semver.org/) 规范。

## [Unreleased]

## [1.0.5] - 2026-04-22

### Changed

- Migrated CodeMirror from v6 (`@uiw/react-codemirror`) to v5 (`codemirror@5.65.20` + `react-codemirror2@7.3.0`) to fix Chinese IME input.
  将 CodeMirror 从 v6（`@uiw/react-codemirror`）迁移至 v5（`codemirror@5.65.20` + `react-codemirror2@7.3.0`），修复中文 IME 输入问题。

- Replaced variable tag widgets with plain text insertion. Variables are now inserted as plain text labels at the cursor position.
  将变量标签 widget 替换为纯文本插入，变量现在以纯文本标签形式插入到光标位置。

- Fixed editor height to 220px with internal scrollbar, eliminating dynamic height calculation issues.
  将编辑器高度固定为 220px 并启用内部滚动条，消除动态高度计算问题。

### Removed

- Removed `onVariableChange` prop and `EditorVariable` type from public API. Variable tracking is no longer needed since variables are plain text.
  从公共 API 中移除 `onVariableChange` 属性和 `EditorVariable` 类型，变量为纯文本后无需跟踪。

### Fixed

- Fixed node title position shifting after pressing Enter in the editor (caused by height cache invalidation on every keystroke).
  修复在编辑器中按下回车后节点标题位置偏移的问题（由每次按键时高度缓存失效引起）。

## [1.0.4] - 2026-04-21

### Changed

- Optimized CodeMirror variable rendering by wrapping `extensions` array with
  `useMemo`, ensuring the variable plugin updates correctly when the variable
  list changes.
  使用 `useMemo` 优化 CodeMirror `extensions` 数组，确保变量列表变化时插件能正确更新。

### Fixed

- Fixed variable tag rendering in CodeMirror by switching from
  `Decoration.widget` to `Decoration.replace`, covering the entire variable
  label (position to position + length) so it displays as a styled tag instead
  of plain text.
  修复 CodeMirror 变量标签渲染：从 `Decoration.widget` 改为
  `Decoration.replace`，覆盖整个变量标签（position 到 position + length），
  使其以样式标签而非纯文本显示。
- Fixed runtime variable replacement logic: now strips the `@` prefix from the
  label and replaces tags from back to front to avoid position offsets. Added
  fallback to global string replacement if exact position match fails.
  修复运行时变量替换逻辑：去掉 label 的 `@` 前缀，按位置从后往前替换避免偏移；
  增加位置匹配失败时的全局字符串替换兜底。
- Fixed missing `@` prefix in `SimpleDataSelector` mock data labels.
  修复 `SimpleDataSelector` 示例数据中 label 缺少 `@` 前缀的问题。
- Fixed `onRunRequest` callback missing in documentation examples by adding it
  to `docs/components/examples/data-selector.tsx`.
  修复文档示例中缺失 `onRunRequest` 回调的问题。
- Fixed variable management in `PromptEditor` by properly passing
  `nodeVariables` and `onVariableChange` through `rowProps` to avoid stale
  closures in virtualized rows.
  修复 `PromptEditor` 变量管理：通过 `rowProps` 正确传递 `nodeVariables` 和
  `onVariableChange`，避免虚拟滚动行中的闭包过期问题。

## [Unreleased]

### Added

- Added `dataSelector` and `onVariableChange` props to `PromptEditor` to support
  custom data/variable selection functionality.
  为 `PromptEditor` 新增 `dataSelector` 和 `onVariableChange` 属性，支持自定义
  数据/变量选择功能。
- Added `@` variable insertion feature with CodeMirror Widget rendering for
  dynamic variable tags in editor content.
  新增 `@` 变量插入功能，使用 CodeMirror Widget 在编辑器内容中渲染动态变量标签。
- Added `renderToolbar` prop to `PromptEditor` for customizing the top toolbar
  layout and actions.
  为 `PromptEditor` 新增 `renderToolbar` 属性，支持自定义顶部工具栏布局和操作。
- Added multiple new documentation examples: data-selector, custom-toolbar,
  dependencies, multi-instance, controlled-uncontrolled, preview-render-modes.
  新增多个文档示例：数据选择器、自定义工具栏、依赖节点、多实例、受控/非受控模式、
  预览渲染模式。
- Added `previewRenderMode` to `PromptEditor` to support two preview renderers:
  `readonly-editor` and `markdown`.
  为 `PromptEditor` 新增 `previewRenderMode` 配置，支持 `readonly-editor`
  与 `markdown` 两种预览渲染方式。
- Added configurable `minHeight` and `maxHeight` props to `CodeMirrorEditor`
  so preview mode can use a more compact read-only height.
  为 `CodeMirrorEditor` 新增可配置的 `minHeight` 与 `maxHeight`，
  以便在预览模式下使用更紧凑的只读高度。
- Added preview-mode tests covering the default read-only editor branch and the
  Markdown preview branch.
  新增预览模式测试，覆盖默认只读编辑器分支和 Markdown 预览分支。

### Changed

- Kept preview mode behavior backward compatible by defaulting
  `previewRenderMode` to `readonly-editor`.
  保持预览模式向后兼容，默认将 `previewRenderMode` 设为
  `readonly-editor`。
- Tuned the preview-mode read-only editor height to reduce excessive blank space
  after expanding a node.
  微调预览模式下只读编辑器的展开高度，减少节点展开后的多余留白。
- Updated virtual list height estimation and fallback logic to better match
  preview-mode expanded content.
  更新虚拟列表高度估算与回退逻辑，使其更贴合预览模式下的展开内容高度。
- Updated preview examples and component docs to explain the new preview render
  configuration.
  更新预览示例与组件文档，说明新的预览渲染配置方式。

### Fixed

- Fixed layout overlap and height mismatch in `PromptEditor` when expanding
  nodes in `previewMode`.
  修复 `PromptEditor` 在 `previewMode` 下展开节点时出现的布局重叠与高度错位问题。
- Improved expanded content height measurement so virtualized rows can recalculate
  after preview content renders.
  改进展开内容的高度测量方式，使虚拟列表能够在预览内容渲染后正确重新计算行高。
