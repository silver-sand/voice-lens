# Visual Consistency Audit Report

**Date:** 2026-11-08  
**Project:** Voice Lens  
**Auditor:** Phase 4 Final Polish

---

## Executive Summary

This audit compares all components against the design tokens defined in `src/index.css`. **14 categories of inconsistency** were found across 10 components. The most critical issues are hardcoded values bypassing the design token system, which breaks theming and maintainability.

---

## Design Token Reference (from `src/index.css`)

| Category | Tokens |
|----------|--------|
| **Colors** | `--color-bg`, `--color-surface`, `--color-surface-elevated`, `--color-text`, `--color-text-muted`, `--color-primary`, `--color-primary-hover`, `--color-border`, `--color-border-strong`, `--color-focus` |
| **Typography** | `--font-display` (Fraunces), `--font-ui` (Inter), `--font-mono` (JetBrains Mono), `--text-*` clamp scales |
| **Spacing** | `--space-1` through `--space-12`, `--space-section` |
| **Radii** | `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-xl`, `--radius-full` |
| **Shadows** | `--shadow-sm`, `--shadow-md`, `--shadow-lg`, `--shadow-xl` |
| **Animations** | `--duration-fast`, `--duration-normal`, `--duration-slow`, `--ease-out-expo`, `--ease-spring`, `--animate-fade-in`, `--animate-slide-up`, `--animate-scale-in` |

---

## Inconsistencies Found

### 1. Spacing — Hardcoded Values Instead of Design Tokens

| File | Line | Current | Should Use |
|------|------|---------|------------|
| `src/components/landing/Hero.tsx` | 31 | `py-16` | `py-[var(--space-section)]` |
| `src/components/landing/Hero.tsx` | 63 | `gap-8` | `gap-[var(--space-8)]` or `gap-8` (Tailwind maps to same) |
| `src/components/landing/TrustIndicators.tsx` | 15 | `py-16` | `py-[var(--space-section)]` |
| `src/components/landing/TrustIndicators.tsx` | 22 | `gap-8` | `gap-[var(--space-8)]` |
| `src/pages/DemoPage.tsx` | 23 | `py-16` | `py-[var(--space-section)]` |
| `src/pages/DemoPage.tsx` | 35 | `gap-12` | `gap-[var(--space-10)]` or `gap-[var(--space-12)]` |
| `src/pages/AboutPage.tsx` | 23 | `py-16` | `py-[var(--space-section)]` |
| `src/pages/AboutPage.tsx` | 35 | `gap-12` | `gap-[var(--space-10)]` or `gap-[var(--space-12)]` |
| `src/pages/AboutPage.tsx` | 105 | `gap-8` | `gap-[var(--space-8)]` |
| `src/pages/AboutPage.tsx` | 135 | `gap-8` | `gap-[var(--space-8)]` |
| `src/pages/WritingWorkspace.tsx` | 142 | `gap-6` | `gap-[var(--space-6)]` |
| `src/pages/WritingWorkspace.tsx` | 155 | `p-4` | `p-[var(--space-4)]` |
| `src/pages/WritingWorkspace.tsx` | 180 | `p-6` | `p-[var(--space-6)]` |

**Note:** Tailwind's `py-16` = `4rem` which matches `--space-section` (`clamp(4rem, 3rem + 5vw, 10rem)`), but using the CSS variable ensures consistency with the design system and respects future changes.

---

### 2. Typography — Inconsistent Font Family Usage

| File | Line | Current | Should Use |
|------|------|---------|------------|
| `src/components/landing/Hero.tsx` | 34 | `font-serif` (hardcoded) | `font-display` (uses `--font-display`) |
| `src/components/landing/Hero.tsx` | 78 | `font-mono` (hardcoded) | `font-mono` is OK (maps to `--font-mono`) |
| `src/components/ComparisonView/HighlightedText.tsx` | 47 | `font-mono` (hardcoded) | `font-mono` is OK |
| `src/components/ComparisonView/HighlightedText.tsx` | 55 | `font-mono` (hardcoded) | `font-mono` is OK |
| `src/pages/WritingWorkspace.tsx` | 170 | `font-mono` (hardcoded) | `font-mono` is OK |
| `src/components/demo/DemoEditor.tsx` | 32 | `font-mono` (hardcoded) | `font-mono` is OK |

**Finding:** The Hero component uses `font-serif` directly instead of the design token `font-display`. All mono usage is consistent with `--font-mono`.

---

### 3. Border Radii — Mixed Token Usage

| File | Line | Current | Should Use |
|------|------|---------|------------|
| `src/components/landing/Hero.tsx` | 71 | `rounded-xl` | `rounded-[var(--radius-xl)]` |
| `src/components/landing/TrustIndicators.tsx` | 28 | `rounded-xl` | `rounded-[var(--radius-xl)]` |
| `src/pages/DemoPage.tsx` | 30 | `rounded-2xl` | `rounded-[var(--radius-xl)]` or new `--radius-2xl` token |
| `src/pages/AboutPage.tsx` | 30 | `rounded-2xl` | `rounded-[var(--radius-xl)]` or new `--radius-2xl` token |
| `src/pages/AboutPage.tsx` | 100 | `rounded-xl` | `rounded-[var(--radius-xl)]` |
| `src/pages/AboutPage.tsx` | 130 | `rounded-xl` | `rounded-[var(--radius-xl)]` |
| `src/pages/WritingWorkspace.tsx` | 155 | `rounded-lg` | `rounded-[var(--radius-lg)]` |
| `src/pages/WritingWorkspace.tsx` | 180 | `rounded-xl` | `rounded-[var(--radius-xl)]` |
| `src/components/ComparisonView/ComparisonPanel.tsx` | 85 | `rounded-xl` | `rounded-[var(--radius-xl)]` |
| `src/components/ComparisonView/ComparisonPanel.tsx` | 140 | `rounded-lg` | `rounded-[var(--radius-lg)]` |
| `src/components/AnalysisPanel/AnalysisPanel.tsx` | 45 | `rounded-xl` | `rounded-[var(--radius-xl)]` |
| `src/components/AnalysisPanel/FindingCard.tsx` | 28 | `rounded-lg` | `rounded-[var(--radius-lg)]` |
| `src/components/BYOPSection/ConnectionCard.tsx` | 45 | `rounded-xl` | `rounded-[var(--radius-xl)]` |
| `src/components/BYOPSection/DetailsPanel.tsx` | 45 | `rounded-xl` | `rounded-[var(--radius-xl)]` |
| `src/components/demo/DemoWorkspace.tsx` | 25 | `rounded-xl` | `rounded-[var(--radius-xl)]` |

**Finding:** Components use Tailwind's `rounded-xl`, `rounded-2xl`, `rounded-lg` directly. These should use CSS variables for consistency. Consider adding `--radius-2xl` if 2xl is intentional.

---

### 4. Shadows — Hardcoded Tailwind Shadows

| File | Line | Current | Should Use |
|------|------|---------|------------|
| `src/components/landing/TrustIndicators.tsx` | 28 | `shadow-lg` (via hover) | `shadow-[var(--shadow-lg)]` |
| `src/pages/DemoPage.tsx` | 30 | `shadow-xl` | `shadow-[var(--shadow-xl)]` |
| `src/pages/AboutPage.tsx` | 30 | `shadow-xl` | `shadow-[var(--shadow-xl)]` |
| `src/pages/AboutPage.tsx` | 100 | `shadow-md` | `shadow-[var(--shadow-md)]` |
| `src/pages/AboutPage.tsx` | 130 | `shadow-md` | `shadow-[var(--shadow-md)]` |
| `src/pages/WritingWorkspace.tsx` | 155 | `shadow-lg` | `shadow-[var(--shadow-lg)]` |
| `src/pages/WritingWorkspace.tsx` | 180 | `shadow-md` | `shadow-[var(--shadow-md)]` |
| `src/components/ComparisonView/ComparisonPanel.tsx` | 85 | `shadow-lg` | `shadow-[var(--shadow-lg)]` |
| `src/components/AnalysisPanel/AnalysisPanel.tsx` | 45 | `shadow-lg` | `shadow-[var(--shadow-lg)]` |
| `src/components/AnalysisPanel/FindingCard.tsx` | 28 | `shadow-sm` | `shadow-[var(--shadow-sm)]` |
| `src/components/BYOPSection/ConnectionCard.tsx` | 45 | `shadow-lg` | `shadow-[var(--shadow-lg)]` |
| `src/components/BYOPSection/DetailsPanel.tsx` | 45 | `shadow-md` | `shadow-[var(--shadow-md)]` |
| `src/components/demo/DemoWorkspace.tsx` | 25 | `shadow-lg` | `shadow-[var(--shadow-lg)]` |

**Finding:** All shadow usage bypasses design tokens. This prevents centralized shadow tuning and dark mode adjustments.

---

### 5. Colors — Hardcoded Hex/HSL Values (Critical)

| File | Line | Current | Should Use |
|------|------|---------|------------|
| `src/components/landing/Hero.tsx` | 79-87 | Inline `hsl(...)` for legend colors | Use CSS variables `--color-*` or highlight classes |
| `src/components/ComparisonView/HighlightedText.tsx` | 9-15 | `CATEGORY_COLORS_HEX` object with hardcoded hex | Use highlight CSS classes (`.highlight-repetition`, etc.) |
| `src/components/ComparisonView/Legend.tsx` | 9-15 | `CATEGORY_COLORS_HEX` object with hardcoded hex | Use CSS variables or highlight classes |
| `src/components/AnalysisPanel/FindingCard.tsx` | 45-50 | Hardcoded `red-500`, `yellow-500`, `blue-500` | Use semantic color tokens |
| `src/components/AnalysisPanel/SummaryBar.tsx` | 25-30 | Hardcoded `red-100`, `yellow-100`, `blue-100` | Use semantic color tokens |

**Critical:** The highlighting system uses two different color definitions:
1. CSS variables in `index.css` (`.highlight-repetition` etc. using `--color-primary`, `--color-warning`, etc.)
2. Hardcoded hex in `CATEGORY_COLORS_HEX` used by ComparisonView and Legend

**These MUST be unified.**

---

### 6. Animation — Inconsistent Duration/Easing Usage

| File | Line | Current | Should Use |
|------|------|---------|------------|
| `src/components/landing/Hero.tsx` | 55 | `transition-all duration-300` | `transition-[var(--duration-normal)] ease-[var(--ease-out-expo)]` |
| `src/components/landing/TrustIndicators.tsx` | 31 | `transition-all duration-300` | `transition-[var(--duration-normal)] ease-[var(--ease-out-expo)]` |
| `src/components/ComparisonView/ComparisonPanel.tsx` | 55 | `initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}` | Use `--animate-slide-in-left` or similar |
| `src/components/ComparisonView/ComparisonPanel.tsx` | 56 | `transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}` | Use `--duration-slow` and `--ease-out-expo` |
| `src/components/AnalysisPanel/AnalysisPanel.tsx` | 55 | `transition={{ duration: 0.3, delay: baseIndex * 0.05 }}` | Use `--duration-normal` |
| `src/components/AnalysisPanel/FindingCard.tsx` | 22 | `transition={{ duration: 0.3, delay: index * 0.05 }}` | Use `--duration-normal` |
| `src/components/BYOPSection/ConnectionCard.tsx` | 22 | `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}` | Use `--animate-slide-up` |
| `src/components/BYOPSection/DetailsPanel.tsx` | 22 | `initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}` | Use `--animate-fade-in` + height animation |
| `src/components/BYOPSection/BYOPSection.tsx` | 14 | `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}` | Use `--animate-slide-up` |
| `src/components/demo/DemoWorkspace.tsx` | 22 | `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}` | Use `--animate-slide-up` |

**Finding:** Motion.dev animations use hardcoded values instead of design tokens. The design tokens include `--duration-fast/normal/slow`, `--ease-out-expo`, `--ease-spring`, and named animations `--animate-*`.

---

### 7. Focus Styles — Inconsistent Focus Rings

| File | Line | Current | Should Use |
|------|------|---------|------------|
| `src/components/ui/button.tsx` | 45 | `focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary` | ✅ Uses `ring-primary` (good) |
| `src/pages/WritingWorkspace.tsx` | 95 | `focus-visible:ring-2 focus-visible:ring-primary` | ✅ Consistent |
| `src/components/ComparisonView/ComparisonPanel.tsx` | Various | No visible focus styles on interactive elements | Add focus-visible styles |
| `src/components/AnalysisPanel/FindingCard.tsx` | Various | No visible focus styles | Add focus-visible styles |
| `src/components/BYOPSection/ConnectionCard.tsx` | Various | No visible focus styles on buttons | Add focus-visible styles |

**Finding:** Button component has proper focus styles, but other interactive components (cards, panels) lack consistent focus indicators.

---

### 8. Iconography — Inconsistent Icon Sizing

| File | Line | Current | Should Use |
|------|------|---------|------------|
| `src/components/landing/TrustIndicators.tsx` | 38 | `size={28}` | Standardize to design token (e.g., `--icon-lg: 1.75rem`) |
| `src/components/landing/Hero.tsx` | 74 | `size={20}` | Standardize |
| `src/pages/WritingWorkspace.tsx` | Various | `size={16}`, `size={18}`, `size={20}` | Standardize |
| `src/components/AnalysisPanel/FindingCard.tsx` | 35 | `size={16}` | Standardize |
| `src/components/AnalysisPanel/SummaryBar.tsx` | 35 | `size={14}` | Standardize |
| `src/components/BYOPSection/ConnectionCard.tsx` | Various | `size={16}`, `size={20}` | Standardize |

**Finding:** Icon sizes are arbitrary. Should define `--icon-sm`, `--icon-md`, `--icon-lg`, `--icon-xl` tokens.

---

### 9. Container Widths — Inconsistent Max-Width

| File | Line | Current | Should Use |
|------|------|---------|------------|
| `src/components/landing/Hero.tsx` | 28 | `max-w-4xl` | Use `--container-max` or similar token |
| `src/components/landing/TrustIndicators.tsx` | 18 | `max-w-4xl` | Use `--container-max` |
| `src/pages/DemoPage.tsx` | 20 | `max-w-4xl` | Use `--container-max` |
| `src/pages/AboutPage.tsx` | 20 | `max-w-4xl` | Use `--container-max` |
| `src/pages/WritingWorkspace.tsx` | 140 | `max-w-5xl` | Use `--container-max-wide` or similar |

**Finding:** Container max-widths vary (`4xl` vs `5xl`). Should standardize with design tokens.

---

### 10. Text Color Usage — Mixed Approaches

| File | Line | Current | Should Use |
|------|------|---------|------------|
| `src/components/landing/Hero.tsx` | 37 | `text-text` (via CSS variable) | ✅ Good |
| `src/components/landing/Hero.tsx` | 40 | `text-text-muted` (via CSS variable) | ✅ Good |
| `src/pages/WritingWorkspace.tsx` | 150 | `text-text-muted` | ✅ Good |
| `src/components/ComparisonView/ComparisonPanel.tsx` | 95 | `text-text-muted` | ✅ Good |
| `src/components/AnalysisPanel/SummaryBar.tsx` | 28 | `text-red-600`, `text-yellow-600`, `text-blue-600` | Use semantic tokens |
| `src/components/AnalysisPanel/FindingCard.tsx` | 48 | `text-red-600`, `text-yellow-600`, `text-blue-600` | Use semantic tokens |

**Finding:** Most components use CSS variables correctly, but AnalysisPanel uses hardcoded Tailwind colors for severity.

---

### 11. Background Colors — Mixed Approaches

| File | Line | Current | Should Use |
|------|------|---------|------------|
| `src/components/landing/TrustIndicators.tsx` | 28 | `bg-surface-elevated/50` | ✅ Uses CSS variable with opacity |
| `src/pages/DemoPage.tsx` | 30 | `bg-surface-elevated` | ✅ Good |
| `src/pages/AboutPage.tsx` | 30 | `bg-surface-elevated` | ✅ Good |
| `src/pages/AboutPage.tsx` | 100 | `bg-surface-elevated` | ✅ Good |
| `src/pages/AboutPage.tsx` | 130 | `bg-surface-elevated` | ✅ Good |
| `src/pages/WritingWorkspace.tsx` | 155 | `bg-surface` | ✅ Good |
| `src/pages/WritingWorkspace.tsx` | 180 | `bg-surface-elevated` | ✅ Good |
| `src/components/ComparisonView/ComparisonPanel.tsx` | 85 | `bg-surface-elevated` | ✅ Good |
| `src/components/AnalysisPanel/AnalysisPanel.tsx` | 45 | `bg-surface-elevated` | ✅ Good |
| `src/components/AnalysisPanel/FindingCard.tsx` | 28 | `bg-surface` | ✅ Good |
| `src/components/BYOPSection/ConnectionCard.tsx` | 45 | `bg-surface-elevated` | ✅ Good |
| `src/components/BYOPSection/DetailsPanel.tsx` | 45 | `bg-surface` | ✅ Good |
| `src/components/demo/DemoWorkspace.tsx` | 25 | `bg-surface-elevated` | ✅ Good |

**Finding:** Background colors are mostly consistent using CSS variables. Good!

---

### 12. Border Colors — Mixed Approaches

| File | Line | Current | Should Use |
|------|------|---------|------------|
| `src/components/landing/TrustIndicators.tsx` | 28 | `border-border/50` | ✅ Uses CSS variable |
| `src/pages/DemoPage.tsx` | 30 | `border-border` | ✅ Good |
| `src/pages/AboutPage.tsx` | 30 | `border-border` | ✅ Good |
| `src/pages/AboutPage.tsx` | 100 | `border-border` | ✅ Good |
| `src/pages/AboutPage.tsx` | 130 | `border-border` | ✅ Good |
| `src/pages/WritingWorkspace.tsx` | 155 | `border-border` | ✅ Good |
| `src/pages/WritingWorkspace.tsx` | 180 | `border-border` | ✅ Good |
| `src/components/ComparisonView/ComparisonPanel.tsx` | 85 | `border-border` | ✅ Good |
| `src/components/AnalysisPanel/AnalysisPanel.tsx` | 45 | `border-border` | ✅ Good |
| `src/components/AnalysisPanel/FindingCard.tsx` | 28 | `border-border` | ✅ Good |
| `src/components/BYOPSection/ConnectionCard.tsx` | 45 | `border-border` | ✅ Good |
| `src/components/BYOPSection/DetailsPanel.tsx` | 45 | `border-border` | ✅ Good |

**Finding:** Border colors are consistent. Good!

---

### 13. Highlight System — Dual Color Definitions (Critical)

**Files involved:**
- `src/index.css` — Lines 150-200: CSS variables for highlight colors (`.highlight-repetition`, `.highlight-formulaic`, etc.)
- `src/components/ComparisonView/HighlightedText.tsx` — Lines 9-15: `CATEGORY_COLORS_HEX` hardcoded hex
- `src/components/ComparisonView/Legend.tsx` — Lines 9-15: `CATEGORY_COLORS_HEX` hardcoded hex
- `src/lib/highlighting.ts` — Lines 3-11: `HIGHLIGHT_CLASS_MAP` mapping to CSS classes

**Issue:** The highlighting system has TWO color definitions:
1. **CSS-in-JS approach** (Hero, DemoEditor, WritingWorkspace): Uses CSS classes like `highlight-repetition` that reference CSS variables
2. **Inline style approach** (ComparisonView): Uses `CATEGORY_COLORS_HEX` with hardcoded hex colors applied via inline `style={{ backgroundColor }}`

**Impact:** 
- Dark mode colors won't work for ComparisonView
- Theme changes require updates in two places
- Inconsistent visual appearance between pages

**Fix:** Unify to use CSS classes from `HIGHLIGHT_CLASS_MAP` everywhere.

---

### 14. Severity Colors — Hardcoded in AnalysisPanel (Critical)

**Files:**
- `src/components/AnalysisPanel/FindingCard.tsx` — Lines 45-50: Hardcoded `red-500`, `yellow-500`, `blue-500` for severity icons/badges
- `src/components/AnalysisPanel/SummaryBar.tsx` — Lines 25-30: Hardcoded `red-100`, `yellow-100`, `blue-100` for badges

**Should use:** Semantic color tokens like `--color-error`, `--color-warning`, `--color-info` with appropriate background variants.

---

## Priority Fix List

| Priority | Issue | Effort | Impact |
|----------|-------|--------|--------|
| **P0** | Unify highlight color system (Issue #13) | Medium | High — affects 3 components, breaks dark mode |
| **P0** | Replace severity hardcoded colors (Issue #14) | Low | High — affects AnalysisPanel consistency |
| **P1** | Replace all hardcoded shadows with tokens (Issue #4) | Low | Medium — 13 occurrences |
| **P1** | Replace all hardcoded radii with tokens (Issue #3) | Low | Medium — 15 occurrences |
| **P1** | Replace all hardcoded spacing with tokens (Issue #1) | Low | Medium — 13 occurrences |
| **P1** | Fix Hero font-serif to font-display (Issue #2) | Trivial | High — headline font consistency |
| **P2** | Standardize animation tokens (Issue #6) | Medium | Medium — 10 occurrences |
| **P2** | Add focus styles to interactive non-button elements (Issue #7) | Low | High — accessibility |
| **P2** | Standardize icon sizes (Issue #8) | Low | Low — visual polish |
| **P2** | Standardize container max-widths (Issue #9) | Low | Low — layout consistency |
| **P3** | Add icon size design tokens to index.css | Low | Low — foundation for Issue #8 |

---

## Recommendations

1. **Add missing design tokens** to `src/index.css`:
   - `--radius-2xl` (if 2xl is intentional)
   - `--icon-sm`, `--icon-md`, `--icon-lg`, `--icon-xl`
   - `--container-max`, `--container-max-wide`
   - `--color-error`, `--color-error-bg`, `--color-warning`, `--color-warning-bg`, `--color-info`, `--color-info-bg`

2. **Create a highlight utility** that both CSS-class and inline-style consumers can use

3. **Run visual regression tests** after fixes to ensure no unintended changes

4. **Consider a Tailwind config** that maps design tokens to utilities for easier migration (e.g., `rounded-xl` → `rounded-[var(--radius-xl)]`)

---

## Verification Checklist

After fixes, verify:
- [ ] All pages render identically in light and dark mode
- [ ] Highlight colors match across Hero, Demo, WritingWorkspace, ComparisonView
- [ ] Focus indicators visible on all interactive elements
- [ ] Spacing rhythm consistent across all pages
- [ ] Shadows, radii, animations use design tokens
- [ ] No hardcoded hex/hsl colors remain (except in index.css definitions)
- [ ] Bundle size still under 140KB gzipped