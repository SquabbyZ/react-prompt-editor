import { Check, ArrowRightLeft } from 'lucide-react';
import { Button } from 'antd';
import React, { memo, useEffect, useRef, useState } from 'react';

interface SelectionToolbarProps {
  visible: boolean;
  position: { top: number; left: number };
  onReplace: () => void;
  onClose: () => void;
}

export const SelectionToolbar: React.FC<SelectionToolbarProps> = memo(
  ({ visible, position, onReplace, onClose }) => {
    const toolbarRef = useRef<HTMLDivElement>(null);
    const [isReplacing, setIsReplacing] = useState(false);

    // 计算调整后的位置，防止超出视口
    const adjustedPosition = React.useMemo(() => {
      if (!visible) return position;

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let { top, left } = position;

      // 浮窗宽度约 120px（按钮实际宽度），防止超出右边界
      if (left + 120 > viewportWidth) {
        left = viewportWidth - 120;
      }

      // 防止超出左边界
      if (left - 60 < 0) {
        left = 60;
      }

      // 浮窗在选区正上方，留出 8px 间距（类似微信）
      const toolbarTop = top - 48;

      // 防止超出上边界（如果上方空间不够，显示在选区下方）
      if (toolbarTop < 0) {
        top = top + 28; // 显示在选区下方，留出 8px 间距
      } else {
        top = toolbarTop;
      }

      // 防止超出下边界
      if (top + 60 > viewportHeight) {
        top = viewportHeight - 70;
      }

      return { top, left };
    }, [position, visible]);

    // 点击外部关闭浮窗
    useEffect(() => {
      if (!visible) return;

      const handleClickOutside = (e: MouseEvent) => {
        if (
          toolbarRef.current &&
          !toolbarRef.current.contains(e.target as Node)
        ) {
          onClose();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [visible, onClose]);

    // 处理替换按钮点击
    const handleReplaceClick = (e: React.MouseEvent) => {
      e.stopPropagation(); // 阻止事件冒泡
      setIsReplacing(true);
      setTimeout(() => {
        try {
          onReplace();
        } catch (error) {
          console.error('替换失败:', error);
        }
        setIsReplacing(false);
        // onClose 已经在 onReplace 内部调用（handleSelectionReplace 中）
        // 不需要在这里再次调用
      }, 400);
    };

    if (!visible) return null;

    return (
      <div
        ref={toolbarRef}
        className="fixed z-[10000]"
        style={{
          top: adjustedPosition.top,
          left: adjustedPosition.left,
          transform: 'translateX(-50%)',
          animation: 'toolbar-appear 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}
        onMouseDown={(e) => {
          // 阻止 mousedown 事件冒泡，防止 MessageList 的 handleClickOutside 误触发 clearSelection
          e.stopPropagation();
        }}
      >
        <style>{`
          @keyframes toolbar-appear {
            from {
              opacity: 0;
              transform: translateX(-50%) translateY(-8px) scale(0.96);
            }
            to {
              opacity: 1;
              transform: translateX(-50%) translateY(0) scale(1);
            }
          }
          @keyframes btn-pulse {
            0%, 100% {
              box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4);
            }
            50% {
              box-shadow: 0 0 0 8px rgba(99, 102, 241, 0);
            }
          }
          .toolbar-appear {
            animation: toolbar-appear 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .btn-pulse {
            animation: btn-pulse 2s ease-in-out infinite;
          }
        `}</style>

        <div className="toolbar-appear flex items-center gap-1.5 rounded-xl border border-white/80 bg-white/95 px-2 py-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.06)] backdrop-blur-xl dark:border-gray-700/60 dark:bg-gray-800/95">
          {/* 替换按钮 */}
          <Button
            type="primary"
            icon={isReplacing ? <Check size={14} /> : <ArrowRightLeft size={14} />}
            onClick={handleReplaceClick}
            disabled={isReplacing}
            size="small"
            className="z-[10001] shadow-lg transition-all duration-200"
          >
            {isReplacing ? '完成' : '替换'}
          </Button>
        </div>
      </div>
    );
  },
);
