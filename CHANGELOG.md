# Changelog

All notable changes to this project will be documented in this file.
本文件用于记录项目中所有重要的变更。

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project follows [Semantic Versioning](https://semver.org/).
格式参考 [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)，
并遵循 [Semantic Versioning](https://semver.org/) 规范。

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
