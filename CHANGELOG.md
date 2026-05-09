# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.7] - 2026-05-09

### Fixed

- **依赖选择逻辑修复**: 解锁节点时自动清除其他节点的依赖选择
- **删除确认优化**: 显示完整树形子节点结构，包含层级编号
- **锁定状态判断**: 使用 `isLocked` 替代 `hasRun` 判断节点是否锁定
- **国际化补全**: 添加 `editor.willDeleteChildren` 中英文翻译

### Changed

- 删除确认弹窗现在显示完整子树结构，而非单层平面列表
- 依赖下拉选项中锁定状态标识使用 `isLocked` 而非 `hasRun`

## [1.0.6] - 2026-04-24

### Fixed

- 内置优化选中文案显示问题
- 新增最大新增子标题的层级卡控

## [1.0.5] - 2026-04-22

### Added

- CodeMirror 类型补充

### Fixed

- CodeMirror 光标问题

## [1.0.4] - 2026-04-15

### Changed

- 依赖管理增强，支持 nodeNumber

## [1.0.3] - 2026-04-08

### Changed

- 更新使用文档

## [1.0.0] - 2026-03-20

### Added

- 初始发布
- 树形 Prompt 编辑器核心功能
- 节点依赖管理
- AI 对话式优化
- 主题支持 (system/light/dark)
- 国际化支持 (zh-CN/en-US)
- 拖拽排序
- 预览模式