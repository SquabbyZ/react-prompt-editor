import React from 'react';
import { PromptEditor } from '../../src';
import '../../src/styles/tailwind.css';
import { TaskNode } from '../../src/types';
import { DemoWrapper } from '../demo-wrapper';

/**
 * Design System Showcase - Demonstrates the refined utilitarian design
 *
 * Features:
 * - Amber accent color system
 * - Layered shadow hierarchy
 * - Smooth hover transitions
 * - Window chrome aesthetic with traffic light dots
 * - Subtle gradient backgrounds
 */
export default () => {
  const [value, setValue] = React.useState<TaskNode[]>([
    {
      id: '1',
      title: 'Design System Showcase',
      content:
        '# Refined Utilitarian Design\n\nThis example demonstrates the new design system with:\n\n- Amber accent colors\n- Layered shadows for depth\n- Smooth transitions\n- Window chrome aesthetic\n\n## Color Palette\n\n- Primary: Amber (#f59e0b)\n- Success: Green (#10b981)\n- Error: Red (#ef4444)\n- Info: Blue (#3b82f6)',
      children: [
        {
          id: '1.1',
          title: 'Typography',
          content:
            'DM Sans for UI elements\nJetBrains Mono for code\n\nThe font choices are intentional:\n- DM Sans: Geometric, modern, distinctive\n- JetBrains Mono: Superior code readability',
          children: [],
          isLocked: false,
          hasRun: false,
        },
        {
          id: '1.2',
          title: 'Spacing',
          content:
            'Based on 4px grid system:\n\n- space-1: 4px\n- space-2: 8px\n- space-3: 12px\n- space-4: 16px\n- space-6: 24px\n\nConsistent spacing creates rhythm.',
          children: [],
          isLocked: false,
          hasRun: false,
        },
      ],
      isLocked: false,
      hasRun: false,
    },
    {
      id: '2',
      title: 'Motion & Transitions',
      content:
        '# Motion Design\n\n## Easing Functions\n\n- ease-out: cubic-bezier(0.16, 1, 0.3, 1)\n- ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)\n- ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)\n\n## Duration Scale\n\n- fast: 100ms\n- base: 200ms\n- slow: 300ms',
      children: [],
      isLocked: false,
      hasRun: false,
    },
  ]);

  return (
    <div style={{ padding: '16px' }}>
      <DemoWrapper height="600px" title="Design System Showcase">
        <PromptEditor value={value} onChange={setValue} />
      </DemoWrapper>
    </div>
  );
};
