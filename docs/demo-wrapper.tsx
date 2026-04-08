/**
 * DemoWrapper - Design System Compliant Example Container
 *
 * Implements the refined utilitarian design system with:
 * - Subtle gradient mesh background for depth
 * - Layered shadows for hierarchy
 * - Smooth transitions and hover effects
 * - Amber accent system
 *
 * @example
 * ```tsx
 * import { DemoWrapper } from '../demo-wrapper';
 *
 * export default () => (
 *   <DemoWrapper height="500px">
 *     <YourComponent />
 *   </DemoWrapper>
 * );
 * ```
 */
import React from 'react';

interface DemoWrapperProps {
  /** Container height, default 500px */
  height?: string;
  /** Show decorative header, default true */
  header?: boolean;
  /** Header title text */
  title?: string;
  /** Custom style overrides */
  style?: React.CSSProperties;
  /** Child components */
  children: React.ReactNode;
}

export const DemoWrapper: React.FC<DemoWrapperProps> = ({
  height = '500px',
  header = true,
  title,
  style,
  children,
}) => {
  return (
    <div
      style={{
        height,
        backgroundColor: 'var(--color-neutral-50, #fafafa)',
        borderRadius: 'var(--radius-lg, 12px)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-base, 0 1px 3px rgba(0, 0, 0, 8%))',
        border: '1px solid var(--color-neutral-200, #e4e4e7)',
        transition:
          'box-shadow var(--duration-base, 200ms) var(--ease-out, cubic-bezier(0.16, 1, 0.3, 1))',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        // Subtle gradient overlay for depth
        background:
          'linear-gradient(135deg, var(--color-neutral-50, #fafafa) 0%, var(--color-neutral-100, #f4f4f5) 100%)',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow =
          'var(--shadow-lg, 0 10px 15px rgba(0, 0, 0, 8%))';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow =
          'var(--shadow-base, 0 1px 3px rgba(0, 0, 0, 8%))';
      }}
    >
      {/* Decorative header bar */}
      {header && (
        <div
          style={{
            padding: 'var(--space-3, 12px) var(--space-4, 16px)',
            borderBottom: '1px solid var(--color-neutral-200, #e4e4e7)',
            backgroundColor: 'var(--color-neutral-100, #f4f4f5)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-2, 8px)',
          }}
        >
          {/* Traffic light dots for window chrome aesthetic */}
          <div style={{ display: 'flex', gap: '6px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#ff5f57',
              }}
            />
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#febc2e',
              }}
            />
            <div
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                backgroundColor: '#28c840',
              }}
            />
          </div>
          {title && (
            <span
              style={{
                fontSize: 'var(--text-sm, 14px)',
                fontWeight: 500,
                color: 'var(--color-neutral-600, #52525b)',
                marginLeft: 'var(--space-2, 8px)',
                fontFamily: 'var(--font-display, DM Sans, sans-serif)',
              }}
            >
              {title}
            </span>
          )}
        </div>
      )}

      {/* Content area */}
      <div style={{ flex: 1, overflow: 'auto' }}>{children}</div>
    </div>
  );
};
