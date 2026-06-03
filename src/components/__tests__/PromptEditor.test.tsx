import { cleanup, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../i18n/locales/en-US';
import { TaskNode } from '../../types';
import { PromptEditor } from '../PromptEditor';
import {
  baseValue,
  getNode,
  renderPromptEditor,
} from './promptEditorTestHelpers';

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

vi.mock('../AIOptimizeModal/MarkdownRenderer', () => ({
  MarkdownRenderer: ({
    content,
  }: {
    content: string;
  }) => <div data-testid="mock-markdown-renderer">{content}</div>,
}));

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
        nodeNumber: '1',
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

  it('uses readonly editor as the default preview render mode', async () => {
    const user = userEvent.setup();
    renderPromptEditor({ previewMode: true });

    await user.click(screen.getByText('Root Node'));

    const readonlyEditor = await screen.findByLabelText('Mock CodeMirror Editor');
    expect(readonlyEditor.getAttribute('readonly')).not.toBeNull();
    expect(
      screen.getByTestId('mock-virtual-list').querySelector(
        '[data-preview-render-mode="readonly-editor"]',
      ),
    ).toBeTruthy();
  });

  it('renders markdown preview when previewRenderMode is markdown', async () => {
    const user = userEvent.setup();
    renderPromptEditor({
      previewMode: true,
      previewRenderMode: 'markdown',
    });

    await user.click(screen.getByText('Root Node'));

    expect(
      (await screen.findByTestId('mock-markdown-renderer')).textContent,
    ).toContain('# Root Node');
    expect(
      screen.getByTestId('mock-virtual-list').querySelector(
        '[data-preview-render-mode="markdown"]',
      ),
    ).toBeTruthy();
    expect(screen.queryByLabelText('Mock CodeMirror Editor')).toBeNull();
  });

  it('does not indent level-1 (root) nodes (regression for h1-padding-left-fix)', () => {
    // 根节点 (level=1) 的 paddingLeft 必须是 0px,这是该 bugfix 的核心断言。
    // 子节点默认折叠,不在本测试范围内 — 实现是单行 (level-1) * 16,根=0。
    const tree: TaskNode[] = [
      {
        id: 'r',
        title: 'Root',
        content: '# Root',
        isLocked: false,
        hasRun: false,
        dependencies: [],
        children: [
          {
            id: 'c',
            title: 'Child',
            content: '## Child',
            isLocked: false,
            hasRun: false,
            dependencies: [],
            children: [],
          },
        ],
      },
    ];

    render(
      <div style={{ height: 800 }}>
        <PromptEditor initialValue={tree} locale={enUS} theme="light" />
      </div>,
    );

    const rootNode = document.querySelector('[data-node-id="r"]') as HTMLElement;
    expect(rootNode).toBeTruthy();

    // Node 把 data-node-id 和 style 放在同一个 div 上,style 应含 paddingLeft
    // (实际渲染: <div data-node-id="r" style="padding-left: 0px; box-sizing: border-box;">)
    expect(rootNode.style.paddingLeft).toBe('0px');
    expect(rootNode.style.boxSizing).toBe('border-box');

    // 回归:Node header 的水平 padding 应为 px-4(16px),与 toolbar 的 px-4 对齐,
    // 避免出现"一级标题与添加标题按钮左右不对齐 4px"的问题。
    const header = rootNode.querySelector('.prompt-editor-node-header');
    expect(header).toBeTruthy();
    expect(header!.className).toContain('px-4');
  });

  // -----------------------------------------------------------------------
  // 003-leaf-and-content-locked-callbacks
  // 覆盖 A1 / A2 / A4 / A5 / A6 / A7 / A8
  // -----------------------------------------------------------------------

  it('calls onAllLeafNodesLocked once when all leaf nodes are locked (A1)', async () => {
    const user = userEvent.setup();
    const onAllLeafNodesLocked = vi.fn();
    // root + 2 leaf children: leaves are the two children
    const tree: TaskNode[] = [
      {
        id: 'r',
        title: 'Root',
        content: '# Root',
        isLocked: false,
        hasRun: true,
        dependencies: [],
        children: [
          {
            id: 'c1',
            title: 'Child 1',
            content: 'child one',
            isLocked: false,
            hasRun: true,
            dependencies: [],
            children: [],
          },
          {
            id: 'c2',
            title: 'Child 2',
            content: 'child two',
            isLocked: false,
            hasRun: true,
            dependencies: [],
            children: [],
          },
        ],
      },
    ];

    renderPromptEditor({ initialValue: tree, onAllLeafNodesLocked });

    // Expand the root so its children (the leaves) become visible.
    await user.click(getNode('r').getByLabelText('Expand Children'));
    // Add child nodes are not visible until the parent is expanded, but the
    // leaves (c1, c2) are always rendered (root is collapsed-by-default,
    // children appear under the root via flattenVisibleNodes).
    await user.click(getNode('c1').getByLabelText('Lock Node'));
    await user.click(getNode('c2').getByLabelText('Lock Node'));

    expect(onAllLeafNodesLocked).toHaveBeenCalledTimes(1);
    expect(onAllLeafNodesLocked).toHaveBeenLastCalledWith([]);
  });

  it('does not call onAllLeafNodesLocked when at least one leaf is unlocked (A2)', async () => {
    const user = userEvent.setup();
    const onAllLeafNodesLocked = vi.fn();
    const tree: TaskNode[] = [
      {
        id: 'r',
        title: 'Root',
        content: '# Root',
        isLocked: false,
        hasRun: true,
        dependencies: [],
        children: [
          {
            id: 'c1',
            title: 'Child 1',
            content: 'child one',
            isLocked: false,
            hasRun: true,
            dependencies: [],
            children: [],
          },
          {
            id: 'c2',
            title: 'Child 2',
            content: 'child two',
            isLocked: false,
            hasRun: true,
            dependencies: [],
            children: [],
          },
        ],
      },
    ];

    renderPromptEditor({ initialValue: tree, onAllLeafNodesLocked });

    // Expand the root so c1 becomes visible.
    await user.click(getNode('r').getByLabelText('Expand Children'));
    // Lock only c1; c2 is still unlocked.
    await user.click(getNode('c1').getByLabelText('Lock Node'));

    expect(onAllLeafNodesLocked).not.toHaveBeenCalled();
  });

  it('calls onAllNonEmptyContentNodesLocked once when all non-empty content nodes are locked (A4)', async () => {
    const user = userEvent.setup();
    const onAllNonEmptyContentNodesLocked = vi.fn();
    const tree: TaskNode[] = [
      {
        id: 'a',
        title: 'A',
        content: 'content a',
        isLocked: false,
        hasRun: true,
        dependencies: [],
        children: [],
      },
      {
        id: 'b',
        title: 'B',
        content: 'content b',
        isLocked: false,
        hasRun: true,
        dependencies: [],
        children: [],
      },
    ];

    renderPromptEditor({
      initialValue: tree,
      onAllNonEmptyContentNodesLocked,
    });

    await user.click(getNode('a').getByLabelText('Lock Node'));
    await user.click(getNode('b').getByLabelText('Lock Node'));

    expect(onAllNonEmptyContentNodesLocked).toHaveBeenCalledTimes(1);
    expect(onAllNonEmptyContentNodesLocked).toHaveBeenLastCalledWith([]);
  });

  it('does not call onAllNonEmptyContentNodesLocked when at least one non-empty content node is unlocked (A5)', async () => {
    const user = userEvent.setup();
    const onAllNonEmptyContentNodesLocked = vi.fn();
    const tree: TaskNode[] = [
      {
        id: 'a',
        title: 'A',
        content: 'content a',
        isLocked: false,
        hasRun: true,
        dependencies: [],
        children: [],
      },
      {
        id: 'b',
        title: 'B',
        content: 'content b',
        isLocked: false,
        hasRun: true,
        dependencies: [],
        children: [],
      },
    ];

    renderPromptEditor({
      initialValue: tree,
      onAllNonEmptyContentNodesLocked,
    });

    await user.click(getNode('a').getByLabelText('Lock Node'));

    expect(onAllNonEmptyContentNodesLocked).not.toHaveBeenCalled();
  });

  it('does not call onAllNonEmptyContentNodesLocked when no node has non-empty content (A6)', async () => {
    const user = userEvent.setup();
    const onAllNonEmptyContentNodesLocked = vi.fn();
    const tree: TaskNode[] = [
      {
        id: 'a',
        title: 'A',
        content: '   ',
        isLocked: false,
        hasRun: true,
        dependencies: [],
        children: [],
      },
      {
        id: 'b',
        title: 'B',
        content: '',
        isLocked: false,
        hasRun: true,
        dependencies: [],
        children: [],
      },
    ];

    renderPromptEditor({
      initialValue: tree,
      onAllNonEmptyContentNodesLocked,
    });

    await user.click(getNode('a').getByLabelText('Lock Node'));
    await user.click(getNode('b').getByLabelText('Lock Node'));

    expect(onAllNonEmptyContentNodesLocked).not.toHaveBeenCalled();
  });

  it('re-fires leaf and non-empty-content callbacks after a new node is locked (A7)', async () => {
    const user = userEvent.setup();
    const onAllLeafNodesLocked = vi.fn();
    const onAllNonEmptyContentNodesLocked = vi.fn();
    // 2 flat (sibling) root nodes, both leaves.
    const tree: TaskNode[] = [
      {
        id: 'a',
        title: 'A',
        content: 'content a',
        isLocked: false,
        hasRun: true,
        dependencies: [],
        children: [],
      },
      {
        id: 'b',
        title: 'B',
        content: 'content b',
        isLocked: false,
        hasRun: true,
        dependencies: [],
        children: [],
      },
    ];

    renderPromptEditor({
      initialValue: tree,
      onAllLeafNodesLocked,
      onAllNonEmptyContentNodesLocked,
    });

    // Lock a only. b is still unlocked → no fire.
    await user.click(getNode('a').getByLabelText('Lock Node'));
    expect(onAllLeafNodesLocked).not.toHaveBeenCalled();
    expect(onAllNonEmptyContentNodesLocked).not.toHaveBeenCalled();

    // Lock b. All leaves (a, b) and all non-empty content nodes (a, b) locked → both fire.
    await user.click(getNode('b').getByLabelText('Lock Node'));
    expect(onAllLeafNodesLocked).toHaveBeenCalledTimes(1);
    expect(onAllNonEmptyContentNodesLocked).toHaveBeenCalledTimes(1);
    expect(onAllLeafNodesLocked).toHaveBeenLastCalledWith([]);
    expect(onAllNonEmptyContentNodesLocked).toHaveBeenLastCalledWith([]);

    // Unlock b (predicate broken) — callbacks should NOT fire on unlock path
    // (unlock path is guarded by `newLocked === true`).
    await user.click(getNode('b').getByLabelText('Unlock Node'));
    expect(onAllLeafNodesLocked).toHaveBeenCalledTimes(1);
    expect(onAllNonEmptyContentNodesLocked).toHaveBeenCalledTimes(1);

    // Re-lock b → predicate healed → both callbacks re-fire.
    await user.click(getNode('b').getByLabelText('Lock Node'));
    expect(onAllLeafNodesLocked).toHaveBeenCalledTimes(2);
    expect(onAllNonEmptyContentNodesLocked).toHaveBeenCalledTimes(2);
    expect(onAllLeafNodesLocked).toHaveBeenLastCalledWith([]);
    expect(onAllNonEmptyContentNodesLocked).toHaveBeenLastCalledWith([]);
  });

  it('fires all three all-locked callbacks independently in the same lock cycle (A8)', async () => {
    const user = userEvent.setup();
    const onAllNodesLocked = vi.fn();
    const onAllLeafNodesLocked = vi.fn();
    const onAllNonEmptyContentNodesLocked = vi.fn();
    // Flat tree of 2 leaves with non-empty content. In this tree:
    //   - all nodes = leaves = non-empty content (all three subsets coincide)
    const tree: TaskNode[] = [
      {
        id: 'a',
        title: 'A',
        content: 'content a',
        isLocked: false,
        hasRun: true,
        dependencies: [],
        children: [],
      },
      {
        id: 'b',
        title: 'B',
        content: 'content b',
        isLocked: false,
        hasRun: true,
        dependencies: [],
        children: [],
      },
    ];

    renderPromptEditor({
      initialValue: tree,
      onAllNodesLocked,
      onAllLeafNodesLocked,
      onAllNonEmptyContentNodesLocked,
    });

    await user.click(getNode('a').getByLabelText('Lock Node'));
    await user.click(getNode('b').getByLabelText('Lock Node'));

    expect(onAllNodesLocked).toHaveBeenCalledTimes(1);
    expect(onAllLeafNodesLocked).toHaveBeenCalledTimes(1);
    expect(onAllNonEmptyContentNodesLocked).toHaveBeenCalledTimes(1);
    expect(onAllNodesLocked).toHaveBeenLastCalledWith([]);
    expect(onAllLeafNodesLocked).toHaveBeenLastCalledWith([]);
    expect(onAllNonEmptyContentNodesLocked).toHaveBeenLastCalledWith([]);
  });
});
