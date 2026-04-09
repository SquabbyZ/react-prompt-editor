import { LockOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import React, { memo } from 'react';
import { useI18n } from '../../hooks/useI18n';
import type { Locale } from '../../i18n/locales/zh-CN';

/**
 * 节点状态指示器属性
 */
export interface NodeStatusIndicatorProps {
  /** 节点是否已运行 */
  hasRun: boolean;
  /** 节点是否已锁定 */
  isLocked: boolean;
  /** 国际化配置 */
  locale?: Locale;
}

export enum NodeStatus {
  NotRun = 'notRun',
  HasRun = 'hasRun',
  Locked = 'locked',
}

/**
 * 节点状态指示器组件 - 统一处理未运行、已运行、锁定状态
 *
 * 状态说明：
 * - 未运行：显示灰色小圆点
 * - 已运行：显示蓝色圆点 + "已运行" 文字
 * - 已锁定：显示绿色锁图标
 */
export const NodeStatusIndicator: React.FC<NodeStatusIndicatorProps> = memo(
  ({ hasRun, isLocked, locale }) => {
    const { t } = useI18n(locale);

    // 确定状态
    let status = NodeStatus.NotRun;

    if (isLocked) {
      status = NodeStatus.Locked;
    } else if (hasRun) {
      status = NodeStatus.HasRun;
    }

    // 根据状态确定样式和文案
    const statusConfig = {
      [NodeStatus.NotRun]: {
        color: 'text-gray-400',
        bgColor: 'bg-gray-400',
        tooltip: t('editor.notRun'),
        showText: false,
      },
      [NodeStatus.HasRun]: {
        color: 'text-blue-500',
        bgColor: 'bg-blue-500',
        tooltip: t('editor.hasRun'),
        showText: true,
      },
      [NodeStatus.Locked]: {
        color: 'text-green-500',
        bgColor: 'bg-green-500',
        tooltip: t('editor.nodeLocked'),
        showText: false,
      },
    };

    const config = statusConfig[status];

    return (
      <Tooltip title={config.tooltip}>
        <div className="flex flex-shrink-0 items-center gap-1.5">
          {status === NodeStatus.Locked ? (
            <LockOutlined className={`text-xs ${config.color}`} />
          ) : (
            <span
              className={
                config.showText
                  ? `flex items-center gap-1 text-xs ${config.color}`
                  : `inline-block h-1.5 w-1.5 rounded-full ${config.bgColor}`
              }
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${config.bgColor}`}
              />
              {config.showText && (
                <span className="text-[11px] leading-none">
                  {config.tooltip}
                </span>
              )}
            </span>
          )}
        </div>
      </Tooltip>
    );
  },
);

NodeStatusIndicator.displayName = 'NodeStatusIndicator';
