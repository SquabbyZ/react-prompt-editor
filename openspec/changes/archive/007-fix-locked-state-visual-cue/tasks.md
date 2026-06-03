# Tasks: 007-fix-locked-state-visual-cue

| # | Task | Status | Evidence |
|---|------|--------|----------|
| 1 | Add `onEditingChange?: (editing: boolean) => void` to `EditableTitleProps`; fire at 3 setIsEditing sites | done | `git diff src/components/PromptEditor/EditableTitle.tsx` (+6 lines) |
| 2 | Add `titleEditing` local state in `Node.tsx`; pass `onEditingChange={setTitleEditing}` to `<EditableTitle>` | done | `git diff src/components/PromptEditor/Node.tsx` |
| 3 | Switch the **outer row wrapper** to switch `border-transparent` ↔ `border-red-500` based on `isHighlighted && !isLocked && !titleEditing && !isInternal && content.trim() !== ''`; add `data-testid="node-row"` and `data-is-highlighted` on the row; drop the old inner title outline | done | `git diff src/components/PromptEditor/Node.tsx` (Node.tsx:693-712 + 745-762) |
| 4 | Delete `ValidationNodeRef` / `ValidationResult` / `validateLockState` / `validation` state / 「校验」 button / `data-test-message="validation-result"` panel from demo; keep lock-all / unlock-all / reset + all-locked banner; update JSDoc | done | `git diff docs/examples/locked-state-visual-cue.tsx` (-100/+50 net) |
| 5 | Update textual references in `docs/components/prompt-editor.md` and `docs/examples/all-nodes-locked.tsx` to describe the row-level visual and the leaf+content rule | done | `git diff docs/components/prompt-editor.md docs/examples/all-nodes-locked.tsx` |
| 6 | Drop `locked-state-visual-cue` from `DEMOS` in `e2e/006-validate-screenshots.spec.ts` | done | `git diff e2e/006-validate-screenshots.spec.ts` |
| 7 | Switch class-attribute checks in `e2e/locked-callbacks-harness.spec.ts` and `e2e/_test-harness/verify.spec.ts` from `outline-red-500` on title wrapper to `border-red-500` on `[data-testid="node-row"]` | done | `git diff e2e/locked-callbacks-harness.spec.ts e2e/_test-harness/verify.spec.ts` |
| 8 | Update vitest tests: use `data-testid="node-row"` for class checks; add B1 (edit-mode suppression), B2 (internal node excluded), B3 (empty content excluded); simplify A1's tree to two flat leaves | done | `git diff src/components/__tests__/PromptEditor.lockedStateVisualCue.test.tsx` |
| 9 | Add `e2e/007-locked-state-visual-cue.spec.ts` with 6 Playwright cases (TC-A1..TC-A6), all using `data-testid="node-row"` | done | new file, 6/6 PASS |
| 10 | Verify vitest 28/28, playwright 17/17 (007 + verify + 006 + locked-callbacks-harness), grep guard `0` matches | done | `pnpm test` 28/28; `npx playwright test` 17/17; grep guard `0` |
| 11 | Code review + security review (both pass) | done | `rd/code-review.md`, `rd/security-review.md` |
| 12 | QA validation (verdict: pass, 28 vitest + 17 playwright = 45 TCs) | done | `qa/test-reports/007-fix-locked-state-visual-cue.md` |
| 13 | OpenSpec validate + archive (exit gate) | done | this change directory archived post-QA |

## Notes

- Node.tsx grew from 1016 → 1026 lines (+10 net); pre-existing 800-line cap violation remains. Out of scope.
- The new visual rule: **leaf with non-empty content + unlocked + not editing → `border-red-500` on the whole row** (and `data-is-highlighted="true"`). Internal/parent nodes and empty leaves are excluded even when unlocked.
- The TypeScript pre-existing error at `src/components/__tests__/promptEditorTestHelpers.tsx:19` is from request 004 and is not introduced by this change.
- Pre-existing known limitation: programmatic unlock via the "全部解锁" button bypasses the per-node lock handler that calls `fireAllLockedCallbacks`. The `unlockedHighlightIds` set is recomputed by the `[tree]` useEffect, so the visual usually catches up after a single React render; the harness spec's TC-4 documents this as a known limitation when the recomputation does not race correctly.
