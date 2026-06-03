import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TaskNode } from '../../types';
import {
  getNode,
  renderPromptEditor,
} from './promptEditorTestHelpers';

describe('PromptEditor - locked state visual cue (004)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  it('applies red border to title of unlocked leaf when highlightUnlocked is true (A1)', async () => {
    const onAllNodesLocked = vi.fn();
    // Two sibling leaves with non-empty content, both unlocked. The user
    // restricted the cue to leaves with non-empty content; this test now
    // uses two flat leaves to match the rule.
    const tree: TaskNode[] = [
      {
        id: '1',
        title: 'Root 1',
        content: '# Root 1',
        isLocked: false,
        hasRun: true,
        dependencies: [],
        children: [],
      },
      {
        id: '2',
        title: 'Root 2',
        content: '# Root 2',
        isLocked: false,
        hasRun: true,
        dependencies: [],
        children: [],
      },
    ];

    renderPromptEditor({
      initialValue: tree,
      highlightUnlocked: true,
      onAllNodesLocked,
    });

    // Both '1' and '2' are unlocked leaves with non-empty content → both
    // node rows should carry the red-border marker.
    const rootRow = getNode('1').getByTestId('node-row');
    expect(rootRow.getAttribute('data-is-highlighted')).toBe('true');
    expect(rootRow.className).toMatch(/border-red-500/);

    const c1Row = getNode('2').getByTestId('node-row');
    expect(c1Row.getAttribute('data-is-highlighted')).toBe('true');
    expect(c1Row.className).toMatch(/border-red-500/);
  });

  it('auto-expands unlocked leaf when highlightUnlocked is true (A2)', async () => {
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
            content: 'c1 content',
            isLocked: false,
            hasRun: true,
            dependencies: [],
            children: [],
          },
          {
            id: 'c2',
            title: 'Child 2',
            content: 'c2 content',
            isLocked: false,
            hasRun: true,
            dependencies: [],
            children: [],
          },
        ],
      },
    ];

    renderPromptEditor({
      initialValue: tree,
      highlightUnlocked: true,
      onAllLeafNodesLocked,
    });

    // Initially the root's children are not expanded, so c1 is not in DOM.
    // Lock c2 to fire the union computation (but the predicate is not yet
    // satisfied). Then lock c1 to satisfy the predicate.
    await user.click(getNode('r').getByLabelText('Expand Children'));
    await user.click(getNode('c2').getByLabelText('Lock Node'));
    await user.click(getNode('c1').getByLabelText('Lock Node'));

    // After predicate satisfied, auto-expand added c1, c2 to expandedNodes.
    // The predicate fires exactly once with [].
    expect(onAllLeafNodesLocked).toHaveBeenCalledTimes(1);
    expect(onAllLeafNodesLocked).toHaveBeenLastCalledWith([]);
  });

  it('does not apply red border or auto-expand when highlightUnlocked is false (A3)', async () => {
    const user = userEvent.setup();
    const onAllNodesLocked = vi.fn();
    const tree: TaskNode[] = [
      {
        id: '1',
        title: 'Root',
        content: '# Root',
        isLocked: false,
        hasRun: true,
        dependencies: [],
        children: [],
      },
    ];

    renderPromptEditor({
      initialValue: tree,
      highlightUnlocked: false,
      onAllNodesLocked,
    });

    const rootTitle = getNode('1').getByTestId('node-title');
    expect(rootTitle.getAttribute('data-is-highlighted')).not.toBe('true');
    const rootRow = getNode('1').getByTestId('node-row');
    expect(rootRow.className).not.toMatch(/red-500/);

    // Lock the node, but no highlight should be applied.
    await user.click(getNode('1').getByLabelText('Lock Node'));
    expect(onAllNodesLocked).toHaveBeenCalledTimes(1);
    const rootRow2 = getNode('1').getByTestId('node-row');
    expect(rootRow2.className).not.toMatch(/red-500/);
  });

  it('removes red border when the last unlocked node is locked (A5)', async () => {
    const user = userEvent.setup();
    const onAllNodesLocked = vi.fn();
    const tree: TaskNode[] = [
      {
        id: 'a',
        title: 'A',
        content: 'a content',
        isLocked: false,
        hasRun: true,
        dependencies: [],
        children: [],
      },
      {
        id: 'b',
        title: 'B',
        content: 'b content',
        isLocked: false,
        hasRun: true,
        dependencies: [],
        children: [],
      },
    ];

    renderPromptEditor({
      initialValue: tree,
      highlightUnlocked: true,
      onAllNodesLocked,
    });

    // Both unlocked → both rows highlighted
    expect(getNode('a').getByTestId('node-row').getAttribute('data-is-highlighted')).toBe('true');
    expect(getNode('b').getByTestId('node-row').getAttribute('data-is-highlighted')).toBe('true');

    // Lock a → a no longer highlighted, b still
    await user.click(getNode('a').getByLabelText('Lock Node'));
    expect(getNode('a').getByTestId('node-row').getAttribute('data-is-highlighted')).not.toBe('true');
    expect(getNode('b').getByTestId('node-row').getAttribute('data-is-highlighted')).toBe('true');

    // Lock b → predicate fires, neither highlighted
    await user.click(getNode('b').getByLabelText('Lock Node'));
    expect(onAllNodesLocked).toHaveBeenCalledTimes(1);
    expect(getNode('a').getByTestId('node-row').getAttribute('data-is-highlighted')).not.toBe('true');
    expect(getNode('b').getByTestId('node-row').getAttribute('data-is-highlighted')).not.toBe('true');
  });

  it('auto-expand is idempotent across multiple lock cycles (A6)', async () => {
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
            title: 'C1',
            content: 'c1 content',
            isLocked: false,
            hasRun: true,
            dependencies: [],
            children: [],
          },
        ],
      },
    ];

    renderPromptEditor({
      initialValue: tree,
      highlightUnlocked: true,
      onAllLeafNodesLocked,
    });

    await user.click(getNode('r').getByLabelText('Expand Children'));

    // c1 is the only leaf → locking it fires onAllLeafNodesLocked with []
    await user.click(getNode('c1').getByLabelText('Lock Node'));
    expect(onAllLeafNodesLocked).toHaveBeenCalledTimes(1);
    expect(onAllLeafNodesLocked).toHaveBeenLastCalledWith([]);

    // Unlock then re-lock c1: callback fires again on the second lock.
    await user.click(getNode('c1').getByLabelText('Unlock Node'));
    expect(onAllLeafNodesLocked).toHaveBeenCalledTimes(1);
    await user.click(getNode('c1').getByLabelText('Lock Node'));
    expect(onAllLeafNodesLocked).toHaveBeenCalledTimes(2);
    expect(onAllLeafNodesLocked).toHaveBeenLastCalledWith([]);

    // Auto-expand invariant: c1 is now locked → not highlighted, and the
    // expandedNodes set is idempotent (no feedback loop on re-lock).
    const c1Row = getNode('c1').getByTestId('node-row');
    expect(c1Row.getAttribute('data-is-highlighted')).not.toBe('true');
  });

  it('suppresses red border when title is in edit mode (B1)', async () => {
    const user = userEvent.setup();
    const onAllNodesLocked = vi.fn();
    const tree: TaskNode[] = [
      {
        id: 'n1',
        title: 'Editable Root',
        content: 'content',
        isLocked: false,
        hasRun: true,
        dependencies: [],
        children: [],
      },
    ];

    renderPromptEditor({
      initialValue: tree,
      highlightUnlocked: true,
      onAllNodesLocked,
    });

    // baseline: unlocked + leaf with non-empty content → red cue visible
    const rowBefore = getNode('n1').getByTestId('node-row');
    expect(rowBefore.getAttribute('data-is-highlighted')).toBe('true');
    expect(rowBefore.className).toMatch(/border-red-500/);

    // double-click the title text to enter edit mode (Input takes over)
    const titleText = getNode('n1').getByText('Editable Root');
    await user.dblClick(titleText);

    // during edit: highlighted suppressed + red class removed
    const rowDuring = getNode('n1').getByTestId('node-row');
    expect(rowDuring.getAttribute('data-is-highlighted')).toBe('false');
    expect(rowDuring.className).not.toMatch(/red-500/);

    // ESC cancels the edit; red cue returns because node is still unlocked
    await user.keyboard('{Escape}');
    const rowAfter = getNode('n1').getByTestId('node-row');
    expect(rowAfter.getAttribute('data-is-highlighted')).toBe('true');
    expect(rowAfter.className).toMatch(/border-red-500/);
  });

  it('does NOT show red border on internal (non-leaf) nodes even if unlocked (leaf-only rule)', async () => {
    const onAllNodesLocked = vi.fn();
    const tree: TaskNode[] = [
      {
        id: 'parent',
        title: 'Parent',
        content: '# parent content',
        isLocked: false,
        hasRun: true,
        dependencies: [],
        children: [
          {
            id: 'leaf1',
            title: 'Leaf 1',
            content: 'leaf 1 content',
            isLocked: false,
            hasRun: true,
            dependencies: [],
            children: [],
          },
        ],
      },
    ];

    renderPromptEditor({
      initialValue: tree,
      highlightUnlocked: true,
      onAllNodesLocked,
    });

    // The parent is internal (has children) → must NOT show the red border
    // even though it is unlocked and has content.
    const parentRow = getNode('parent').getByTestId('node-row');
    expect(parentRow.getAttribute('data-is-highlighted')).toBe('false');
    expect(parentRow.className).not.toMatch(/red-500/);

    // Expand the parent so the leaf becomes visible.
    const user = userEvent.setup();
    await user.click(getNode('parent').getByLabelText('Expand Children'));

    // The leaf is unlocked + leaf + non-empty content → MUST show the red border.
    const leafRow = getNode('leaf1').getByTestId('node-row');
    expect(leafRow.getAttribute('data-is-highlighted')).toBe('true');
    expect(leafRow.className).toMatch(/border-red-500/);
  });

  it('does NOT show red border on leaf nodes whose content is empty (content-required rule)', async () => {
    const onAllNodesLocked = vi.fn();
    const tree: TaskNode[] = [
      {
        id: 'empty',
        title: 'Empty Leaf',
        content: '',
        isLocked: false,
        hasRun: true,
        dependencies: [],
        children: [],
      },
    ];

    renderPromptEditor({
      initialValue: tree,
      highlightUnlocked: true,
      onAllNodesLocked,
    });

    // Leaf but content is empty → no red border, no data-is-highlighted="true".
    const emptyRow = getNode('empty').getByTestId('node-row');
    expect(emptyRow.getAttribute('data-is-highlighted')).toBe('false');
    expect(emptyRow.className).not.toMatch(/red-500/);
  });
});
