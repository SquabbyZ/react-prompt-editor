import { describe, expect, it } from 'vitest';
import { NodeStore, TaskNode } from '../../types';
import { arrayToMap, hasLockedDescendant, mapToArray } from '../tree-utils';

const sampleTree: TaskNode[] = [
  {
    id: 'root-1',
    title: 'Root 1',
    content: '# Root 1',
    isLocked: false,
    hasRun: true,
    dependencies: [],
    children: [
      {
        id: 'child-1',
        title: 'Child 1',
        content: 'Child content',
        parentId: 'root-1',
        isLocked: true,
        hasRun: true,
        dependencies: ['root-2'],
        children: [],
      },
    ],
  },
  {
    id: 'root-2',
    title: 'Root 2',
    content: '# Root 2',
    isLocked: false,
    hasRun: false,
    dependencies: [],
    children: [],
  },
];

describe('tree-utils', () => {
  it('arrayToMap keeps parent-child relationships and dependencies', () => {
    const store = arrayToMap(sampleTree);

    expect(store.size).toBe(3);
    expect(store.get('root-1')).toMatchObject({
      parentId: undefined,
      children: ['child-1'],
      dependencies: [],
    });
    expect(store.get('child-1')).toMatchObject({
      parentId: 'root-1',
      children: [],
      dependencies: ['root-2'],
      isLocked: true,
    });
  });

  it('mapToArray rebuilds the original tree structure', () => {
    const store = arrayToMap(sampleTree);

    expect(mapToArray(store)).toEqual(sampleTree);
  });

  it('mapToArray respects rootOrder when provided', () => {
    const store = arrayToMap(sampleTree);

    const reorderedTree = mapToArray(store, ['root-2', 'root-1']);

    expect(reorderedTree.map((node) => node.id)).toEqual(['root-2', 'root-1']);
    expect(reorderedTree[1].children?.[0].id).toBe('child-1');
  });
});

describe('hasLockedDescendant (pure)', () => {
  const makeNode = (overrides: Partial<TaskNode> = {}): TaskNode => ({
    id: 'n',
    title: 'n',
    content: '',
    isLocked: false,
    hasRun: false,
    dependencies: [],
    children: [],
    ...overrides,
  });

  it('returns false for a node with no children', () => {
    expect(hasLockedDescendant(makeNode())).toBe(false);
  });

  it('returns false when only the node itself has no locked children', () => {
    const node = makeNode({
      children: [makeNode({ id: 'a' }), makeNode({ id: 'b' })],
    });
    expect(hasLockedDescendant(node)).toBe(false);
  });

  it('returns true when a direct child is locked', () => {
    const node = makeNode({
      children: [makeNode({ id: 'a', isLocked: true })],
    });
    expect(hasLockedDescendant(node)).toBe(true);
  });

  it('returns true when a deeply nested descendant is locked', () => {
    const node = makeNode({
      children: [
        makeNode({
          id: 'a',
          children: [
            makeNode({
              id: 'b',
              children: [makeNode({ id: 'c', isLocked: true })],
            }),
          ],
        }),
      ],
    });
    expect(hasLockedDescendant(node)).toBe(true);
  });

  it('returns false when descendant flags are all false', () => {
    const node = makeNode({
      children: [
        makeNode({
          id: 'a',
          children: [makeNode({ id: 'b' }), makeNode({ id: 'c' })],
        }),
        makeNode({ id: 'd' }),
      ],
    });
    expect(hasLockedDescendant(node)).toBe(false);
  });

  it('returns true when the node is empty / nullish but a lookup is provided', () => {
    const store: NodeStore = arrayToMap([
      makeNode({
        id: 'a',
        children: [makeNode({ id: 'b', isLocked: true })],
      }),
    ]);
    // node is null/undefined but the lookup contains a locked descendant
    expect(hasLockedDescendant(null, store, 'a')).toBe(true);
    expect(hasLockedDescendant(undefined, store, 'a')).toBe(true);
  });

  it('returns false when only the root itself is locked in lookup mode', () => {
    // 自身 isLocked 不算"后代",按 PRD 严格语义
    const store: NodeStore = arrayToMap([
      makeNode({ id: 'a', isLocked: true }),
    ]);
    expect(hasLockedDescendant(null, store, 'a')).toBe(false);
  });

  it('returns false for an unknown id with a lookup', () => {
    const store: NodeStore = arrayToMap([makeNode({ id: 'a' })]);
    expect(hasLockedDescendant(null, store, 'missing-id')).toBe(false);
  });

  it('handles cycles in the tree without infinite recursion', () => {
    const a: any = makeNode({ id: 'a' });
    const b: any = makeNode({ id: 'b' });
    a.children = [b];
    b.children = [a]; // cycle
    expect(hasLockedDescendant(a)).toBe(false);
  });

  it('handles cycles and still detects a locked node reachable via cycle', () => {
    const a: any = makeNode({ id: 'a' });
    const b: any = makeNode({ id: 'b' });
    a.children = [b];
    b.children = [a, makeNode({ id: 'c', isLocked: true })];
    expect(hasLockedDescendant(a)).toBe(true);
  });
});
