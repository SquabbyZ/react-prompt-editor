import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../i18n/locales/en-US';
import { TaskNode } from '../../types';
import { PromptEditor } from '../PromptEditor';

const { messageApi } = vi.hoisted(() => ({
  messageApi: {
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('antd', async () => {
  const actual = await vi.importActual<typeof import('antd')>('antd');
  return {
    ...actual,
    message: messageApi,
  };
});

vi.mock('react-window', () => ({
  List: ({ rowCount, rowComponent: RowComponent, rowProps }: any) => (
    <div data-testid="mock-virtual-list">
      {Array.from({ length: rowCount }).map((_, index) => (
        <RowComponent key={index} index={index} style={{}} {...rowProps} />
      ))}
    </div>
  ),
}));

vi.mock('../CodeMirrorEditor', () => ({
  CodeMirrorEditor: React.forwardRef(function MockCodeMirrorEditor(
    {
      value,
      onChange,
      isReadOnly,
    }: {
      value: string;
      onChange?: (value: string) => void;
      isReadOnly?: boolean;
    },
    ref: React.ForwardedRef<HTMLTextAreaElement>,
  ) {
    return (
      <textarea
        ref={ref}
        aria-label="Mock CodeMirror Editor"
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        readOnly={isReadOnly}
      />
    );
  }),
}));

const baseValue: TaskNode[] = [
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

function renderPromptEditor(
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

function getNode(nodeId: string) {
  const element = document.querySelector(`[data-node-id="${nodeId}"]`);
  if (!element) {
    throw new Error(`Node ${nodeId} not found`);
  }
  return within(element as HTMLElement);
}

describe('PromptEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('shows a warning when run is clicked without onRunRequest', async () => {
    const user = userEvent.setup();
    renderPromptEditor();

    const expandButton = getNode('1').queryByLabelText('Expand Editor');
    if (expandButton) {
      await user.click(expandButton);
    }
    await user.click(getNode('1').getByLabelText('Run'));

    expect(messageApi.warning).toHaveBeenCalledWith(
      'Please provide onRunRequest callback',
    );
  });

  it('builds the run request payload when onRunRequest is provided', async () => {
    const user = userEvent.setup();
    const onRunRequest = vi.fn();
    renderPromptEditor({ onRunRequest });

    const expandButton = getNode('1').queryByLabelText('Expand Editor');
    if (expandButton) {
      await user.click(expandButton);
    }
    await user.click(getNode('1').getByLabelText('Run'));

    expect(onRunRequest).toHaveBeenCalledTimes(1);
    expect(onRunRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        nodeId: '1',
        content: '# Root Node',
        dependenciesContent: [],
        meta: expect.objectContaining({
          onNodeRun: expect.any(Function),
        }),
      }),
    );
  });

  it('calls onChange when adding a root node', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderPromptEditor({ onChange });

    await user.click(screen.getAllByRole('button', { name: 'Add Title' })[0]);

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    const latestTree = onChange.mock.calls.at(-1)?.[0] as TaskNode[];
    expect(latestTree).toHaveLength(2);
    expect(latestTree[1]).toMatchObject({
      title: '新标题',
      isLocked: false,
      hasRun: false,
    });
  });

  it('calls onChange when deleting a node', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderPromptEditor({ onChange });

    await user.click(getNode('1').getByLabelText('Delete Node'));
    await user.click(await screen.findByRole('button', { name: 'OK' }));

    await waitFor(() => {
      expect(onChange).toHaveBeenCalled();
    });

    const latestTree = onChange.mock.calls.at(-1)?.[0] as TaskNode[];
    expect(latestTree).toEqual([]);
  });
});
