# Proposal: add-interactive-unlock-buttons

## Why

Request 005 shipped 3 docs examples that demonstrated the new locked-callback APIs + the `highlightUnlocked` visual cue. However, the demos only let the reader test the **"all locked"** success path — to test the **"unlocked state"** visual feedback (red border + auto-expand from request 004), the reader needed an explicit way to inspect the current locked state.

This change adds 4 interactive buttons to each of the 3 docs examples:
1. **全部锁定** — set every node's `isLocked: true`
2. **全部解锁** — set every node's `isLocked: false`
3. **重置** / **Reset** — restore the initial demo state
4. **校验 (检查未锁定)** — run `validateLockState(value)` (mirrors `fireAllLockedCallbacks` predicates) and display the result with the unlocked subset for each predicate

The 校验 button is the user-requested feature: it lets the reader manually inspect the current locked state at any time, regardless of which callbacks are wired up.

## What Changes

- `docs/examples/all-nodes-locked.tsx` (modified) — adds 4 buttons + `validateLockState` helper + `validation` state + validation result div
- `docs/examples/leaf-and-content-locked.tsx` (modified) — same 4 buttons + helper + state
- `docs/examples/locked-state-visual-cue.tsx` (modified) — same 4 buttons + helper + state
- `e2e/locked-callbacks-harness.spec.ts` (modified) — adds 3 new tests (TC-4, TC-5, TC-6)

## Impact

- No `src/` changes
- No new dependencies
- No new bundle size
- 6/6 E2E tests pass in real Chromium browser
- 3 new screenshots captured at `.peaks/2026-06-02-session-45259d/qa/screenshots/006-*.png`

## Acceptance Criteria

- A1: 4 buttons per demo (全部锁定 / 全部解锁 / 重置 / 校验)
- A2: 校验 button uses `validateLockState` that mirrors `fireAllLockedCallbacks` predicates
- A3: Persistent validation result div (`data-test-message="validation-result"`) appears after click, hidden initially
- A4: 全部锁定 button manually invokes the all-locked callback with `[]` to keep the persistent indicator in sync (since programmatic value updates bypass `handleNodeLock`)
- A5: 6/6 E2E tests pass
- A6: 校验 result shows unlocked subset for each predicate when not all locked
- A7: 校验 result shows "✅ 全部锁定" for all 3 predicates when all locked

## Risks

- **State proliferation:** the demos now have 4-5 button handlers + state for validation result. Mitigated by clear naming and consistent patterns across the 3 demos.
- **Manual callback invocation in 全部锁定:** the demos manually call the all-locked callback handlers when 全部锁定 is clicked, because the underlying callback only fires from the per-node lock button. Documented in code.
- **No new public API:** this is docs-only; no impact on consumers.

## Rollback

Revert the 3 modified docs files and the E2E spec:

```bash
git checkout HEAD -- docs/examples/all-nodes-locked.tsx \
  docs/examples/leaf-and-content-locked.tsx \
  docs/examples/locked-state-visual-cue.tsx \
  e2e/locked-callbacks-harness.spec.ts
```

No data migration needed.

## Status

- **state:** shipped
- **author:** peaks-solo
- **date:** 2026-06-03
- **session:** 2026-06-02-session-45259d
- **request-id:** 006-interactive-unlock-buttons-in-docs
- **prd:** .peaks/2026-06-02-session-45259d/prd/requests/006-interactive-unlock-buttons-in-docs.md
- **qa-report:** .peaks/2026-06-02-session-45259d/qa/test-reports/006-interactive-unlock-buttons-in-docs.md
- **commit-boundary:** single commit "docs: add 全部锁定/全部解锁/重置/校验 buttons to lock-callback demos"
