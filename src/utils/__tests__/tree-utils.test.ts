import { describe, expect, it } from 'vitest';
import { TaskNode } from '../../types';
import { arrayToMap, mapToArray } from '../tree-utils';

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
