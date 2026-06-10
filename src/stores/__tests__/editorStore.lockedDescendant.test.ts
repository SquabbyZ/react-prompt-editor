import { beforeEach, describe, expect, it } from 'vitest';
import { createEditorStore } from '../editorStore';
import type { TaskNode } from '../../types';

/**
 * 004-parent-deletion-blocked-by-child-lock
 *
 * 这些测试覆盖 editorStore.removeNode 的"防御性拒绝"行为：
 * - 当被删节点的任意后代被锁定,removeNode 必须拒绝执行并返回 false
 * - 节点无锁定后代时,正常删除并返回 true
 * - 节点自身被锁定但后代未被锁定时,自身规则不在本 slice 范围内,保持原有行为
 *   (此时 removeNode 仍允许执行,因为"自身被锁定"是另一个父规则)
 */

const makeLockedTree = (): TaskNode[] => [
  {
    id: 'r1',
    title: 'Root 1',
    content: '',
    isLocked: false,
    hasRun: true,
    dependencies: [],
    children: [
      {
        id: 'r1-1',
        title: 'Child',
        content: '',
        parentId: 'r1',
        isLocked: true,
        hasRun: true,
        dependencies: [],
        children: [],
      },
    ],
  },
];

const makeUnlockedTree = (): TaskNode[] => [
  {
    id: 'r1',
    title: 'Root 1',
    content: '',
    isLocked: false,
    hasRun: true,
    dependencies: [],
    children: [
      {
        id: 'r1-1',
        title: 'Child',
        content: '',
        parentId: 'r1',
        isLocked: false,
        hasRun: true,
        dependencies: [],
        children: [],
      },
    ],
  },
];

const makeSelfLockedTree = (): TaskNode[] => [
  {
    id: 'r1',
    title: 'Self locked',
    content: '',
    isLocked: true,
    hasRun: true,
    dependencies: [],
    children: [],
  },
];

const makeDeepLockedTree = (): TaskNode[] => [
  {
    id: 'r1',
    title: 'Root',
    content: '',
    isLocked: false,
    hasRun: true,
    dependencies: [],
    children: [
      {
        id: 'r1-1',
        title: 'Mid',
        content: '',
        parentId: 'r1',
        isLocked: false,
        hasRun: true,
        dependencies: [],
        children: [
          {
            id: 'r1-1-1',
            title: 'Deep locked',
            content: '',
            parentId: 'r1-1',
            isLocked: true,
            hasRun: true,
            dependencies: [],
            children: [],
          },
        ],
      },
    ],
  },
];

describe('editorStore.removeNode — 防御性拒绝 (locked descendant)', () => {
  it('rejects deletion when a direct child is locked and returns false', () => {
    const store = createEditorStore(makeLockedTree());
    const result = store.getState().removeNode('r1');
    expect(result).toBe(false);
    // 节点必须仍在
    expect(store.getState().getNode('r1')).toBeDefined();
    expect(store.getState().getNode('r1-1')).toBeDefined();
  });

  it('rejects deletion when a deeply nested descendant is locked', () => {
    const store = createEditorStore(makeDeepLockedTree());
    const result = store.getState().removeNode('r1');
    expect(result).toBe(false);
    expect(store.getState().getNode('r1')).toBeDefined();
    expect(store.getState().getNode('r1-1')).toBeDefined();
    expect(store.getState().getNode('r1-1-1')).toBeDefined();
  });

  it('allows deletion when no descendant is locked and returns true', () => {
    const store = createEditorStore(makeUnlockedTree());
    const result = store.getState().removeNode('r1');
    expect(result).toBe(true);
    expect(store.getState().getNode('r1')).toBeUndefined();
    expect(store.getState().getNode('r1-1')).toBeUndefined();
  });

  it('allows deletion of a leaf child when the rest of the tree is fine', () => {
    const tree: TaskNode[] = [
      {
        id: 'a',
        title: 'a',
        content: '',
        isLocked: false,
        hasRun: true,
        dependencies: [],
        children: [
          {
            id: 'a-1',
            title: 'a-1',
            content: '',
            parentId: 'a',
            isLocked: false,
            hasRun: true,
            dependencies: [],
            children: [],
          },
        ],
      },
      {
        id: 'b',
        title: 'b',
        content: '',
        isLocked: true, // 兄弟子树锁了,不影响 a-1 的删除
        hasRun: true,
        dependencies: [],
        children: [],
      },
    ];
    const store = createEditorStore(tree);
    const result = store.getState().removeNode('a-1');
    expect(result).toBe(true);
    expect(store.getState().getNode('a-1')).toBeUndefined();
    expect(store.getState().getNode('a')).toBeDefined();
    expect(store.getState().getNode('b')).toBeDefined();
  });

  it('handles non-existent node id gracefully (returns false, no throw)', () => {
    const store = createEditorStore(makeUnlockedTree());
    expect(() => store.getState().removeNode('does-not-exist')).not.toThrow();
    const result = store.getState().removeNode('does-not-exist');
    expect(result).toBe(false);
  });

  it('self-locked node without locked descendants is out of scope for this slice', () => {
    // 本 slice 只处理"后代被锁定"。节点自身被锁定是另一个 UI 规则。
    // store 层应保留原有行为——允许删除,这样旧测试与新规则的边界清晰。
    const store = createEditorStore(makeSelfLockedTree());
    const result = store.getState().removeNode('r1');
    expect(result).toBe(true);
    expect(store.getState().getNode('r1')).toBeUndefined();
  });
});
