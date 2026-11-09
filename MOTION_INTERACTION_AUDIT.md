# Motion and Interaction Polish Audit Report

**Date:** 2026-11-08  
**Project:** Voice Lens  
**Auditor:** Phase 4 Final Polish

---

## Executive Summary

This audit evaluates motion and interaction polish across the Voice Lens application, focusing on:
- `prefers-reduced-motion` support
- Animation consistency and design token usage
- Stagger delays and easing
- Motion quality across components

**Overall Status:** ✅ Good foundation with minor inconsistencies in token usage

---

## Reduced Motion Support

### Global CSS (✅ Comprehensive)
`src/index.css:302-311` — Global reduced motion media query disables all animations and transitions:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

### Component-Level Usage

| Component | Uses `useReducedMotion` | Implementation |
|-----------|------------------------|----------------|
| `Hero.tsx` | ✅ Yes | Stagger animation disabled, all segments shown immediately |
| `WritingWorkspace.tsx` | ✅ Yes | Pulse/fade-in animations disabled in editor highlights |
| `DemoWorkspace.tsx` | ✅ Yes | Passed to `DemoEditor` |
| `DemoEditor.tsx` | ✅ Yes | Pulse/fade-in animations disabled |
| `ComparisonPanel.tsx` | ❌ No | Uses motion.div without reduced motion check |
| `AnalysisPanel.tsx` | ❌ No | Uses motion.div without reduced motion check |
| `FindingCard.tsx` | ❌ No | Uses motion.div without reduced motion check |
| `FindingGroup.tsx` | ❌ No | Uses motion.div without reduced motion check |
| `ConnectionCard.tsx` | ❌ No | Uses motion.div for loading spinner |
| `DetailsPanel.tsx` | ❌ No | Uses motion.div for expand/collapse |
| `BYOPSection.tsx` | ❌ No | Uses motion.div for enter animation |
| `DemoWorkspace.tsx` (analysis panel) | ❌ No | Uses CSS transitions only |

### Findings

**Critical Gap:** Motion.dev components (`motion.div`, `motion.span`) do **not** automatically respect the global CSS reduced motion setting. They need explicit `reducedMotion` prop or conditional rendering.

**Components needing fixes:**
1. `ComparisonPanel.tsx` — 5 motion.div instances
2. `AnalysisPanel.tsx` — 8 motion.div instances
3. `FindingCard.tsx` — 6 motion.div instances
4. `FindingGroup.tsx` — 2 motion.div instances
5. `ConnectionCard.tsx` — 2 motion.div instances (spinner + error)
6. `DetailsPanel.tsx` — 2 motion.div instances
7. `BYOPSection.tsx` — 1 motion.div instance

---

## Animation Consistency

### Design Tokens Available (`src/index.css`)

```css
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
--animate-fade-in: fade-in 0.4s var(--ease-out);
--animate-slide-up: slide-up 0.4s var(--ease-out);
--animate-slide-in-right: slide-in-right 0.3s var(--ease-out);
--animate-pulse-dot: pulse-dot 2s ease-in-out infinite;
--animate-pulse-highlight: pulse-highlight 2s var(--ease-out);
--animate-accordion-down: accordion-down 0.2s var(--ease-out);
--animate-accordion-up: accordion-up 0.2s var(--ease-out);
```

### Current Usage vs. Tokens

| Component | Animation | Current | Should Use |
|-----------|-----------|---------|------------|
| `Hero.tsx` | Stagger delay | `index * 120ms` (DEMO_CONFIG) | `--duration-normal` / custom |
| `Hero.tsx` | Headline | `animate-fade-in` + inline delays | ✅ Uses token |
| `TrustIndicators.tsx` | Hover | `transition-all duration-300` | `transition-[var(--duration-normal)] ease-[var(--ease-out-expo)]` |
| `ComparisonPanel.tsx` | Slide-in | `initial={{ x: -20 }}` + `duration: 0.4` | `--animate-slide-in-left` / `--duration-slow` + `--ease-out-expo` |
| `AnalysisPanel.tsx` | Interpretation | `initial={{ y: -20 }}` | `--animate-slide-up` |
| `FindingCard.tsx` | Stagger | `delay: index * 0.05` | Consistent with tokens |
| `FindingGroup.tsx` | Expand | `initial={{ opacity: 0, height: 0 }}` | `--animate-fade-in` + height |
| `ConnectionCard.tsx` | Spinner | `animate={{ rotate: [0, 360] }}` + `duration: 1` | Custom infinite spin |
| `DetailsPanel.tsx` | Expand | `initial={{ opacity: 0, height: 0 }}` | `--animate-fade-in` + height |
| `BYOPSection.tsx` | Enter | `initial={{ y: 20 }}` | `--animate-slide-up` |
| `DemoWorkspace.tsx` | Panel expand | CSS `transition-all duration-300` | `transition-[var(--duration-normal)]` |

### Stagger Delays

| Component | Delay Pattern | Consistency |
|-----------|---------------|-------------|
| `Hero.tsx` | `index * 120ms` | Custom constant `DEMO_CONFIG.highlightStaggerDelay` |
| `FindingCard.tsx` | `index * 0.05s` (50ms) | ✅ Reasonable |
| `FindingGroup.tsx` | `index * 0.05s` (50ms) | ✅ Reasonable |
| `AnalysisPanel.tsx` | `baseIndex * 0.05s` | ✅ Consistent |

**Finding:** Stagger delays are inconsistent (120ms vs 50ms). Should standardize.

---

## Motion Quality Assessment

### Good Practices ✅

1. **Global reduced motion CSS** — Comprehensive, covers all CSS animations/transitions
2. **Per-component reduced motion hooks** — Hero, WritingWorkspace, DemoEditor correctly disable animations
3. **Staggered entrances** — Consistent pattern for list animations
4. **Meaningful animations** — Slide/fade for content appearance, not gratuitous
5. **Hover/tap feedback** — Buttons and cards have transition-colors
6. **Loading states** — Spinner in ConnectionCard, analyzing indicator in WritingWorkspace
7. **Focus mode transitions** — Smooth header collapse/expand with motion.div

### Issues to Address ❌

| Issue | Severity | Components Affected |
|-------|----------|---------------------|
| Motion.dev components ignore global reduced motion | **High** | ComparisonPanel, AnalysisPanel, FindingCard, FindingGroup, ConnectionCard, DetailsPanel, BYOPSection |
| Hardcoded durations/easing instead of tokens | Medium | TrustIndicators, ComparisonPanel, AnalysisPanel, FindingCard, ConnectionCard, DetailsPanel, BYOPSection, DemoWorkspace |
| Inconsistent stagger delays (120ms vs 50ms) | Low | Hero vs FindingCard/FindingGroup |
| Loading spinner uses 1s linear (not token) | Low | ConnectionCard |
| Some motion.div lack `role` or `aria-live` for dynamic content | Medium | ComparisonPanel, AnalysisPanel |

---

## Recommendations

### P0 — Critical (Reduced Motion for Motion.dev)

All motion.dev components must respect `prefers-reduced-motion`. Two approaches:

**Option A: Conditional rendering** (recommended)
```tsx
const reducedMotion = useReducedMotion();

return reducedMotion ? (
  <div className="animate-none">...</div>  // Static version
) : (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>...</motion.div>
);
```

**Option B: Reduced motion prop**
```tsx
<motion.div 
  initial={reducedMotion ? false : { opacity: 0 }}
  animate={reducedMotion ? { opacity: 1 } : { opacity: 1 }}
  transition={reducedMotion ? { duration: 0 } : { duration: 0.3 }}
>
```

### P1 — High (Token Consistency)

Replace all hardcoded durations/easing with design tokens:

```tsx
// Instead of:
transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}

// Use:
transition={{ 
  duration: 0.4, // or parse from --duration-slow
  ease: [0.16, 1, 0.3, 1] // or parse from --ease-out-expo
}}

// For CSS transitions:
className="transition-[var(--duration-normal)] ease-[var(--ease-out-expo)]"
```

### P2 — Medium (Stagger Standardization)

Standardize stagger delay to **50ms** (used by FindingCard/FindingGroup) or make it a design token:
```css
--stagger-delay: 50ms;
```

### P3 — Low (Accessibility)

Add `aria-live="polite"` to motion.div that reveal dynamic content:
- `ComparisonPanel.tsx` comparison panels
- `AnalysisPanel.tsx` interpretation section
- `FindingGroup.tsx` evidence expansion

---

## Verification Checklist

After fixes, verify:
- [ ] All motion.dev components respect `prefers-reduced-motion: reduce`
- [ ] No animations run when reduced motion is enabled (test in browser dev tools)
- [ ] All durations/easing use design tokens
- [ ] Stagger delays are consistent
- [ ] Dynamic content announcements work with screen readers
- [ ] Bundle size still under 140KB gzipped
- [ ] All 43 E2E tests still pass