# Existing System: react-prompt-editor
**Date:** 2026-05-29
**Session:** 2026-05-29-session-36c217

## Visual Tokens

### Colors (source: src/styles/variables.css)
All color tokens use `--pe-` prefix and map to antd 5.x design tokens.

| Token | Value | Category |
|---|---|---|
| `--pe-color-primary` | `#1677ff` | Primary |
| `--pe-color-primary-hover` | `#4096ff` | Primary |
| `--pe-color-primary-active` | `#0958d9` | Primary |
| `--pe-color-primary-bg` | `#e6f4ff` | Primary |
| `--pe-color-success` | `#52c41a` | Success |
| `--pe-color-warning` | `#faad14` | Warning |
| `--pe-color-error` | `#ff4d4f` | Error |
| `--pe-color-info` | `#1677ff` | Info |
| `--pe-color-text` | `rgba(0,0,0,88%)` | Text (4 levels: DEFAULT/secondary/tertiary/quaternary) |
| `--pe-color-fill` | `rgba(0,0,0,15%)` | Fill (4 levels) |
| `--pe-color-bg-container` | `#fff` | Background |
| `--pe-color-bg-elevated` | `#fff` | Background |
| `--pe-color-bg-layout` | `#f5f5f5` | Background |

### Spacing (source: src/styles/variables.css)
Standard antd spacing scale: `4px / 8px / 12px / 16px / 24px / 32px`

### Typography (source: src/styles/variables.css)
- Font sizes: 12px / 14px (base) / 16px / 20px + heading scale (38/30/24/20/16)
- Font family: System font stack (Apple/macOS optimized)
- Code font: SF Mono / Consolas / monospace stack
- Line heights: 1.5714 (base) / 1.5 (lg) / 1.6667 (sm)

### Radii
Standard antd scale: 2px / 6px (base) / 8px / 12px / 4px (outer)

### Tailwind Integration
- Colors, spacing, radii, shadows, and font sizes are mapped to Tailwind utility classes (tailwind.config.js)
- `preflight: false` to avoid antd style conflicts
- Tailwind layers: `tailwindcss-animate`, `tailwind-scrollbar`

## Conventions

### Component Naming
- PascalCase component directories under `src/components/`
- Each component: `index.tsx` (main), `<Name>.types.ts` (types), optional co-located files
- Sub-components (e.g., `NodeActions`, `EditorToolbar`) co-located with parent

### Directory Structure
```
src/
├── components/          # UI components
│   ├── PromptEditor/    # Main editor component
│   ├── TreeNode/        # Tree node component
│   ├── AIOptimizeModal/ # AI optimization modal
│   └── CodeMirrorEditor/ # CodeMirror wrapper
├── hooks/               # Custom hooks
├── stores/              # Zustand stores
├── utils/               # Utility functions
├── types/               # TypeScript type declarations
├── styles/              # CSS variables, Tailwind entry
└── i18n/                # Internationalization
```

### Hooks Pattern
- `use` prefix, camelCase: `useNodeEditor`, `useStreamParser`, `useUndoRedo`, `useTreeState`
- Hook files are single-purpose (one hook per file)

### State Management
- Zustand 5.x stores: `editorStore.ts`, `optimizeStore.ts`
- Store files in `src/stores/`, barrel-exported via `index.ts`

### Library Export
- Entry point: `src/index.ts`
- Exports are typed via `src/types/index.ts`
- ESM + CJS dual output via father

### No service layer abstraction
- API calls are direct in hooks (e.g., `useOptimizeAPI.ts`)
- Streaming responses handled via `useStreamParser.ts`

## Inconsistencies
- None detected by scan
