import { render, within } from '@testing-library/react';
import React from 'react';
import enUS from '../../i18n/locales/en-US';
import { TaskNode } from '../../types';
import { PromptEditor } from '../PromptEditor';

export const baseValue: TaskNode[] = [
  {
    id: '1',
    title: 'Root Node',
    content: '# Root Node',
    isLocked: false,
    hasRun: false,
    dependencies: [],
    children: [],
  },
];

export function renderPromptEditor(
  props: Partial<React.ComponentProps<typeof PromptEditor>> = {},
) {
  return render(
    <div style={{ height: 800 }}>
      <PromptEditor
        initialValue={baseValue}
        locale={enUS}
        theme="light"
        {...props}
      />
    </div>,
  );
}

export function getNode(nodeId: string) {
  const element = document.querySelector(`[data-node-id="${nodeId}"]`);
  if (!element) {
    throw new Error(`Node ${nodeId} not found`);
  }
  return within(element as HTMLElement);
}
