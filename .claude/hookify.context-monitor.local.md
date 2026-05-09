---
name: context-monitor
description: Context 使用监控，自动 Compact
---

# Context Monitor

## 阈值
- **Warning**: 70%
- **Danger**: 85%
- **Max**: 95%

## 自动 Compact 条件
- contextEstimate >= 85%
- 执行 `/compact` 清理上下文

## 检查点
| Context 占用 | 动作 |
|-------------|------|
| < 70% | 正常继续 |
| 70-85% | 警告 + 产出检查点 |
| >= 85% | 强制 Compact |
