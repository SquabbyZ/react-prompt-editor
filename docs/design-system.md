# React Prompt Editor - Design System

> A refined, utilitarian design system for professional prompt editing

## Design Philosophy

**Aesthetic Direction**: Refined Utilitarian

Inspired by tools like Linear, Raycast, and Vercel's design language - precise, purposeful, and polished without being flashy.

### Core Principles

1. **Clarity Over Decoration** - Every visual element serves a purpose
2. **Hierarchy Through Restraint** - Use subtle contrasts instead of bold statements
3. **Motion with Intent** - Animations guide, never distract
4. **Consistency Through System** - Token-driven design ensures predictability

---

## Color Palette

### Primary Colors

```
--color-primary-50:  #fefce8   (Lightest amber - backgrounds)
--color-primary-100: #fef08a   (Light amber - hover states)
--color-primary-500: #f59e0b   (Amber - primary actions)
--color-primary-600: #d97706   (Dark amber - active states)
--color-primary-700: #b45309   (Deeper amber - pressed)
```

**Why Amber?** - Stands out from the sea of purple/blue tools. Conveys warmth and professionalism.

### Neutral Scale

```
--color-neutral-50:  #fafafa   (Backgrounds)
--color-neutral-100: #f4f4f5   (Surfaces)
--color-neutral-200: #e4e4e7   (Borders)
--color-neutral-300: #d4d4d8   (Disabled borders)
--color-neutral-400: #a1a1aa   (Placeholder text)
--color-neutral-500: #71717a   (Secondary text)
--color-neutral-600: #52525b   (Primary text)
--color-neutral-700: #3f3f46   (Headings)
--color-neutral-800: #27272a   (Strong text)
--color-neutral-900: #18181b   (Darkest)
```

### Semantic Colors

```
--color-success: #10b981   (Green - success states)
--color-warning: #f59e0b   (Amber - warnings)
--color-error:   #ef4444   (Red - errors)
--color-info:    #3b82f6   (Blue - information)
```

---

## Typography

### Font Stack

```css
--font-display: 'DM Sans', -apple-system, sans-serif; /* UI elements */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace; /* Code content */
--font-body: 'DM Sans', -apple-system, sans-serif; /* Body text */
```

**Why these fonts?**

- **DM Sans**: Geometric, modern, distinct from the ubiquitous Inter
- **JetBrains Mono**: Superior code readability with ligatures support

### Type Scale (4px base)

```
--text-xs:   0.75rem   (12px) - Captions, badges
--text-sm:   0.875rem  (14px) - Small text, labels
--text-base: 1rem      (16px) - Body text
--text-lg:   1.125rem  (18px) - Subheadings
--text-xl:   1.25rem   (20px) - Section titles
--text-2xl:  1.5rem    (24px) - Page titles
```

### Line Heights

```
--leading-tight:  1.25   (Headings)
--leading-normal: 1.5    (Body text)
--leading-relaxed: 1.75  (Long form content)
```

---

## Spacing System

Based on 4px grid for perfect alignment.

```
--space-0:  0        (0px)
--space-1:  0.25rem  (4px)
--space-2:  0.5rem   (8px)
--space-3:  0.75rem  (12px)
--space-4:  1rem     (16px)
--space-5:  1.25rem  (20px)
--space-6:  1.5rem   (24px)
--space-8:  2rem     (32px)
--space-10: 2.5rem   (40px)
--space-12: 3rem     (48px)
--space-16: 4rem     (64px)
```

---

## Border Radius

```
--radius-none:  0          (Sharp edges)
--radius-sm:    0.25rem    (4px)  - Small elements
--radius-base:  0.5rem     (8px)  - Cards, inputs
--radius-lg:    0.75rem    (12px) - Modals, large cards
--radius-xl:    1rem       (16px) - Hero elements
--radius-full:  9999px     (Pills, badges)
```

**Design Note**: Medium radius (8px) as default creates approachable yet professional feel.

---

## Shadow System

Subtle shadows create depth without distraction.

```
--shadow-sm:  0 1px 2px rgba(0, 0, 0, 0.04)
              0 1px 3px rgba(0, 0, 0, 0.06)

--shadow-base: 0 1px 3px rgba(0, 0, 0, 0.08)
               0 1px 2px rgba(0, 0, 0, 0.04)

--shadow-lg:  0 10px 15px rgba(0, 0, 0, 0.08)
              0 4px 6px rgba(0, 0, 0, 0.04)

--shadow-xl:  0 20px 25px rgba(0, 0, 0, 0.1)
              0 10px 10px rgba(0, 0, 0, 0.04)
```

**Key Principle**: Shadows should be felt, not seen. They add depth, not drama.

---

## Motion & Transitions

### Timing Functions

```
--ease-out:      cubic-bezier(0.16, 1, 0.3, 1)   (Exiting elements)
--ease-in-out:   cubic-bezier(0.65, 0, 0.35, 1)  (Smooth transitions)
--ease-spring:   cubic-bezier(0.34, 1.56, 0.64, 1) (Playful interactions)
```

### Duration Scale

```
--duration-fast:   100ms  (Micro-interactions)
--duration-base:   200ms  (Standard transitions)
--duration-slow:   300ms  (Large animations)
--duration-slower: 500ms  (Page transitions)
```

### Usage Guidelines

- Hover states: 100-200ms
- Modal open/close: 300ms
- Staggered reveals: 50ms delay between items
- Never animate layout properties (width, height, top, left)

---

## Component Patterns

### Cards

```
Background: var(--color-neutral-50)
Border: 1px solid var(--color-neutral-200)
Border-radius: var(--radius-base)
Shadow: var(--shadow-sm)
Padding: var(--space-6)
```

### Buttons

```
Height: 40px
Padding: var(--space-3) var(--space-5)
Font-size: var(--text-sm)
Font-weight: 500
Border-radius: var(--radius-base)
```

### Inputs

```
Height: 40px
Border: 1px solid var(--color-neutral-300)
Border-radius: var(--radius-base)
Focus: 2px solid var(--color-primary-500)
```

---

## Accessibility

### Contrast Ratios

- Normal text (≥14px): 4.5:1 minimum
- Large text (≥18px): 3:1 minimum
- UI components: 3:1 minimum

### Focus States

All interactive elements must have visible focus indicators:

```css
outline: 2px solid var(--color-primary-500);
outline-offset: 2px;
```

---

## Implementation

### CSS Variables

All design tokens are implemented as CSS custom properties in `src/styles/design-tokens.css`.

### Tailwind Integration

Design tokens are mapped to Tailwind classes for consistent usage across the codebase.

### Best Practices

1. Always use design tokens instead of hardcoded values
2. Reference semantic names (primary, success) over literal colors
3. Maintain spacing multiples of 4px
4. Use motion purposefully, not decoratively

---

## Examples

### Before (Generic)

```css
.card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

### After (Design System)

```css
.card {
  background: var(--color-neutral-50);
  border: 1px solid var(--color-neutral-200);
  border-radius: var(--radius-base);
  padding: var(--space-4);
  box-shadow: var(--shadow-base);
  transition: box-shadow var(--duration-base) var(--ease-out);
}

.card:hover {
  box-shadow: var(--shadow-lg);
}
```

---

_Last updated: 2026-04-08_
