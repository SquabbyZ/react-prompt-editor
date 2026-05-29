# Performance Findings: 002-all-nodes-locked-callback
**Date:** 2026-05-29
**Session:** 2026-05-29-session-c0aed4

## Assessment

Minimal code addition (+16 lines across 2 files). No new dependencies, no new renders, no new network calls.

## Checks

| Check | Result |
|-------|--------|
| Lines added | +16 (types: +7, component: +9) |
| New renders | 0 |
| New state subscriptions | 0 |
| New network calls | 0 |
| getAllNodes() scan | O(n), guarded by `newLocked &&` (only on lock, not unlock) |
| Bundle size impact | Negligible |

## Conclusion

No performance impact. The `all.every()` scan only runs on lock operations and iterates over nodes (typically < 100). Negligible overhead.
