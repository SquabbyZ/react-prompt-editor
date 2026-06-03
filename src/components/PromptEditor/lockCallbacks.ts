import type { TaskNodeMinimal } from '../../types';

type NodesSnapshot = TaskNodeMinimal[];

export interface LockedCallbacks {
  onAllNodesLocked?: (unlockedNodeIds: string[]) => void;
  onAllLeafNodesLocked?: (unlockedNodeIds: string[]) => void;
  onAllNonEmptyContentNodesLocked?: (unlockedNodeIds: string[]) => void;
}

/**
 * Result returned by fireAllLockedCallbacks containing the per-predicate
 * "not locked" ID arrays. The arrays are computed in the same O(n) passes
 * that evaluate the predicates, so the component can use them for
 * highlight + auto-expand without re-traversing getAllNodes().
 */
export interface FireAllLockedResult {
  /** IDs of nodes that are NOT locked (across all nodes). */
  unlockedAllIds: string[];
  /** IDs of unlocked leaf nodes (children.length === 0 && !isLocked). */
  unlockedLeafIds: string[];
  /** IDs of unlocked nodes with non-empty content (!isLocked && content.trim() !== ''). */
  unlockedNonEmptyIds: string[];
}

export function fireAllLockedCallbacks(
  all: NodesSnapshot,
  callbacks: LockedCallbacks,
): FireAllLockedResult {
  // Compute the "not locked" sets once. Empty when the corresponding predicate
  // is satisfied (i.e. the callback only fires on the "all locked" transition).
  const allUnlocked = all.filter((n) => !n.isLocked).map((n) => n.id);
  const leavesUnlocked = all
    .filter((n) => n.children.length === 0 && !n.isLocked)
    .map((n) => n.id);
  const nonEmptyUnlocked = all
    .filter((n) => n.content.trim() !== '' && !n.isLocked)
    .map((n) => n.id);

  if (callbacks.onAllNodesLocked) {
    if (all.length > 0 && all.every((n) => n.isLocked)) {
      callbacks.onAllNodesLocked([]);
    }
  }
  if (callbacks.onAllLeafNodesLocked) {
    const leaves = all.filter((n) => n.children.length === 0);
    if (leaves.length > 0 && leaves.every((n) => n.isLocked)) {
      callbacks.onAllLeafNodesLocked([]);
    }
  }
  if (callbacks.onAllNonEmptyContentNodesLocked) {
    const nonEmpty = all.filter((n) => n.content.trim() !== '');
    if (nonEmpty.length > 0 && nonEmpty.every((n) => n.isLocked)) {
      callbacks.onAllNonEmptyContentNodesLocked([]);
    }
  }

  return {
    unlockedAllIds: allUnlocked,
    unlockedLeafIds: leavesUnlocked,
    unlockedNonEmptyIds: nonEmptyUnlocked,
  };
}

/**
 * Shallow set equality check used to dedup state updates when the union of
 * unlocked IDs has not actually changed between lock cycles.
 */
export function sameSet(a: Set<string>, b: Set<string>): boolean {
  if (a.size !== b.size) return false;
  let equal = true;
  a.forEach((v) => {
    if (!b.has(v)) equal = false;
  });
  return equal;
}
