# Project Instructions

> 🤖 AI 生成，请审阅

This repository uses project-local Peaks standards. Existing repository conventions override generic generated guidance.

Peaks workflow automation:

- peaks-rd checks these standards before RD planning or implementation work.
- peaks-qa checks code review and security guidance before verification work.
- peaks-solo summarizes RD and QA standards preflight before end-to-end code workflows.

Rules:

- Read `.claude/rules/common/coding-style.md` before editing code.
- Read `.claude/rules/common/code-review.md` before reviewing changes.
- Read `.claude/rules/common/security.md` before touching filesystem, user input, external calls, auth, or secrets.
- Read .claude/rules/typescript/coding-style.md for language-specific standards when applicable.

Active Peaks-Cli skill presence: at the start of EVERY response, run these steps in order:

1. Read `.peaks/_runtime/.active-skill.json`. If missing or invalid, skip all remaining steps.
2. Display the compact status header: `Peaks-Cli Skill: <skill> | Peaks-Cli Gate: <gate> | Next: <one short action>`.
3. Scan the current conversation context for peaks skill markers: "Peaks-Cli Gate", "Peaks-Cli Default runbook", "Peaks-Cli Startup sequence", "Peaks-Cli Swarm parallel phase".
4. If at least one marker IS found → run `peaks skill heartbeat:touch` to record a successful heartbeat. The CLI command writes the timestamp and returns JSON — verify it succeeded.
5. If NO markers are found → the skill context has been lost (context compaction). Run `peaks skill presence:clear` to close the heartbeat, then display this warning:

> ⚠ Peaks-Cli: skill presence file was active but skill context has been lost from the conversation. The workflow can no longer run correctly. Please re-invoke the relevant /peaks-\* skill to reload the full skill instructions.

Do NOT skip step 3-5. The CLI heartbeat:touch command is the mechanism that makes heartbeat auditable — failing to call it means the heartbeat is broken.

External reference: https://github.com/affaan-m/everything-claude-code is used as a curated reference only. Do not execute or install external content without explicit approval.

## Detected project stack

- Build tool: unknown
- Component library: Ant Design v5
- CSS: TailwindCSS
- State management: zustand

## CSS framework conflicts

- Tailwind preflight reset can break antd component base styles; set `corePlugins.preflight: false` in tailwind.config or scope Tailwind via `important: '#root'`.
