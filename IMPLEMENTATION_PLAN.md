# Voice Lens — Implementation Plan

**Version:** 1.0  
**Date:** 2026-11-06  
**Status:** Active — Phase 1 In Progress

---

## Test Baseline (Must Maintain Throughout)

| Suite | Tests | Status |
|-------|-------|--------|
| Unit (vitest) | 71 | ✅ Passing |
| E2E (Playwright) | 35 | ✅ Passing |
| Lint (oxlint) | 4 warnings | ⚠️ Non-blocking |
| Build | - | ✅ Clean |

**Rule:** Every phase must pass all tests before proceeding. No broken commits.

---

## Phase 1: Foundation (Typography, Theme, Layout, Routing)

### 1.1 Font Setup — Self-hosted WOFF2

**Files to Create:**
```
public/fonts/
├── fraunces/
│   ├── Fraunces-400.woff2
│   ├── Fraunces-500.woff2
│   ├── Fraunces-600.woff2
│   └── Fraunces-700.woff2
├── inter/
│   ├── Inter-400.woff2
│   ├── Inter-500.woff2
│   └── Inter-600.woff2
└── jetbrains-mono/
    ├── JetBrainsMono-400.woff2
    └── JetBrainsMono-500.woff2
```

**Files to Modify:**
- `src/index.css` — Add `@font-face` declarations, update `--font-*` tokens

**Commands:**
```bash
# Download and subset fonts (run once)
npx @fontsource/fraunces@latest --weights 400,500,600,700 --subsets latin
npx @fontsource/inter@latest --weights 400,500,600 --subsets latin
npx @fontsource/jetbrains-mono@latest --weights 400,500 --subsets latin
# Copy from node_modules/@fontsource/*/files/ to public/fonts/
# Add preload links to index.html
```

**index.html additions:**
```html
<link rel="preload" as="font" type="font/woff2" crossorigin href="/voice-lens/fonts/fraunces/Fraunces-600.woff2">
<link rel="preload" as="font" type="font/woff2" crossorigin href="/voice-lens/fonts/inter/Inter-400.woff2">
<link rel="preload" as="font" type="font/woff2" crossorigin href="/voice-lens/fonts/jetbrains-mono/JetBrainsMono-400.woff2">
```

**Test:** Build passes, fonts load, no CORS errors.

---

### 1.2 Complete Theme Overhaul — `src/index.css`

**Replace entire file with new design tokens** (per REDESIGN_SPEC §1).

**Key Changes:**
- New color system (warm editorial palette)
- New typography scale (clamped)
- New spacing rhythm
- New shadows, radius, animation tokens
- `@font-face` declarations for self-hosted fonts
- Dark mode via class strategy (already working)

**Files to Modify:**
- `src/index.css` — Complete replacement

**Test:** `pnpm build` passes, CSS bundle size reasonable, dark mode works.

---

### 1.3 Layout Components

**Files to Create:**
```
src/components/layout/
├── PageLayout.tsx        # Consistent page wrapper (header + main + footer)
├── Header.tsx            # Logo, connection, theme, focus mode, menu
├── Footer.tsx            # Minimal footer
└── index.ts              # Barrel export
```

**Files to Modify:**
- `src/App.tsx` — Use `PageLayout`, add routing

**PageLayout Structure:**
```tsx
<PageLayout>
  <Header />
  <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
    {children}
  </main>
  <Footer />
</PageLayout>
```

**Header Props:**
```tsx
interface HeaderProps {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onThemeToggle: () => void;
  onFocusModeToggle: () => void;
  isFocusMode: boolean;
  theme: 'light' | 'dark' | 'system';
}
```

**Test:** Unit tests for Header, PageLayout render. E2E: header visible, theme toggle works.

---

### 1.4 Client-Side Routing — `wouter`

**Install:**
```bash
pnpm add wouter
```

**Files to Create:**
```
src/routes/
├── routes.tsx            # Route definitions
└── index.ts              # Barrel export
```

**Files to Modify:**
- `src/App.tsx` — Wrap with `Router`, render routes
- `vite.config.ts` — Ensure SPA fallback for GitHub Pages (`/voice-lens/`)

**Routes:**
```tsx
<Switch>
  <Route path="/"> <LandingPage /> </Route>
  <Route path="/write"> <WritingWorkspace /> </Route>
  <Route path="/demo"> <DemoPage /> </Route>
  <Route path="/about"> <AboutPage /> </Route>
</Switch>
```

**Base Path Handling:**
- All internal links use `/voice-lens/` prefix
- `wouter` doesn't have built-in base path — handle via `useLocation` wrapper or prefix all routes

**Test:** Navigation works, refresh on `/write` works, GitHub Pages SPA fallback verified.

---

### 1.5 Context Providers & Hooks

**Files to Create:**
```
src/providers/
├── FocusModeProvider.tsx   # Focus mode state + localStorage persistence
├── ThemeProvider.tsx       # Theme state + localStorage + system sync
└── index.ts                # Barrel export

src/hooks/
├── useFocusMode.ts         # Consume focus mode context
├── useTheme.ts             # Consume theme context
├── useWordCount.ts         # Memoized text stats (words, chars, sentences, readability)
├── useKeyboardShortcuts.ts # Global shortcut registration
└── index.ts                # Barrel export
```

**Files to Modify:**
- `src/App.tsx` — Wrap with providers
- `src/hooks/useTextAnalysis.ts` — Integrate `useWordCount`, add focus mode awareness

**FocusModeProvider:**
```tsx
// localStorage key: 'voice-lens:focus-mode'
// Default: false
// Toggle: 'F' key (via useKeyboardShortcuts)
```

**ThemeProvider:**
```tsx
// localStorage key: 'voice-lens:theme'
// Values: 'light' | 'dark' | 'system'
// Sync with matchMedia('(prefers-color-scheme: dark)')
// Apply .dark class to <html>
```

**useWordCount:**
```tsx
interface TextStats {
  words: number;
  characters: number;
  sentences: number;
  paragraphs: number;
  readability: number; // Flesch-Kincaid grade level
}
```

**Test:** Unit tests for hooks. E2E: theme persists, focus mode toggles with 'F', stats update live.

---

### 1.6 Utility Libraries

**Files to Create:**
```
src/lib/
├── readability.ts        # Flesch-Kincaid, Gunning Fog, etc.
├── textStats.ts          # Word, char, sentence, paragraph counts
├── sampleText.ts         # Curated demo text + expected findings
└── index.ts              # Barrel export
```

**readability.ts:**
```tsx
export function fleschKincaidGrade(text: string): number
export function gunningFog(text: string): number
export function readingTime(text: string): number // minutes
```

**sampleText.ts:**
```tsx
export const DEMO_TEXT = `In today's world, technology plays a crucial role in our daily lives. It is important to note that we must leverage innovative solutions to unlock transformative potential. Furthermore, we should delve into the landscape of possibilities to harness cutting-edge capabilities. In conclusion, the paradigm has shifted and we must adapt.`;

export const DEMO_FINDINGS = [
  // Expected findings for the demo text
];
```

**Test:** Unit tests for readability functions, textStats.

---

## Phase 2: Landing & Demo Pages

### 2.1 Landing Page (`/`)

**Files to Create:**
```
src/pages/
├── LandingPage.tsx
└── index.ts

src/components/landing/
├── Hero.tsx
├── TrustIndicators.tsx
└── index.ts
```

**Hero Component:**
- Headline: "Your writing has a voice.\nLet's make it unmistakably yours."
- Subhead: Product value proposition
- CTA Group: "Start Writing" → `/write`, "Explore Example" → `/demo`
- Animated text sample (staggered highlights, respects reduced motion)

**Test:** E2E: page loads, CTAs navigate correctly, animations respect reduced motion.

---

### 2.2 Demo Page (`/demo`)

**Files to Create:**
```
src/pages/
├── DemoPage.tsx
└── (add to index.ts)

src/components/demo/
├── DemoWorkspace.tsx
├── DemoEditor.tsx
├── DemoAnalysis.tsx
├── DemoFindingCard.tsx
└── index.ts
```

**DemoWorkspace:**
- Side-by-side layout (editor 65%, analysis 35%) on desktop
- Stacked on mobile with analysis drawer

**DemoEditor:**
- Read-only textarea with highlight overlay
- Pre-filled with `DEMO_TEXT`
- Highlights animate in on mount (staggered, 100ms delay each)
- Click finding → scroll to evidence + pulse highlight

**DemoAnalysis:**
- Summary bar (sticky)
- Finding groups (repetition, formulaic, transitions, structure, vocabulary)
- Click finding card → triggers editor scroll
- Interpretation preview (mocked, shows AI explanation)
- "Try with your own writing" CTA → `/write`

**Test:** E2E: demo loads, findings clickable, editor scrolls, CTA navigates.

---

### 2.3 About Page (`/about`)

**Files to Create:**
```
src/pages/
├── AboutPage.tsx
└── (add to index.ts)
```

**Content:** Product philosophy, privacy (local-first), credits, Pollinations Quest #19180 link.

**Test:** E2E: page loads, links work.

---

## Phase 3: Workspace Refactor (`/write`)

### 3.1 WritingWorkspace Page

**Files to Create:**
```
src/pages/
├── WritingWorkspace.tsx
└── (add to index.ts)
```

**Structure:**
```tsx
<PageLayout>
  <WritingWorkspace>
    <EditorPanel />
    <AnalysisPanel />
  </WritingWorkspace>
</PageLayout>
```

---

### 3.2 Editor Panel Refactor

**Files to Modify:**
```
src/components/TextEditor/
├── TextEditor.tsx        # Major refactor
├── WordCount.tsx         # New: live stats display
├── ReadabilityScore.tsx  # New: readability indicator
└── index.ts
```

**TextEditor Changes:**
- Typography: `JetBrains Mono`, 16px, line-height 1.8
- Min-height: 500px desktop, 400px mobile
- Max-width: 720px (comfortable reading width)
- Live stats bar (WordCount + ReadabilityScore)
- Focus mode: header fades, panel expands to full width
- Placeholder adapts to connection state
- `Ctrl/Cmd + Enter` → analyze
- Highlight overlay refined (new colors from theme)

**WordCount Component:**
```tsx
// Shows: Words, Characters, Sentences, Readability grade
// Updates on every keystroke (debounced via useWordCount)
```

**Test:** Unit tests for TextEditor, WordCount, ReadabilityScore. E2E: typing updates stats, analyze works, focus mode toggles.

---

### 3.3 Analysis Panel Refactor

**Files to Modify:**
```
src/components/AnalysisPanel/
├── AnalysisPanel.tsx     # Major refactor
├── SummaryBar.tsx        # New: sticky stats + findings count
├── FindingGroup.tsx      # New: category grouping
├── FindingCard.tsx       # Refined from current
└── index.ts
```

**AnalysisPanel Changes:**
- SummaryBar (sticky top): word count, sentences, readability, findings count
- FindingGroup: collapsible sections per category
- FindingCard: expandable evidence, suggestion, click → scroll editor
- Interpretation section (when connected): distinct visual treatment
- Empty state: illustrated, encouraging
- Loading state: skeleton matching card structure

**Test:** Unit tests for new components. E2E: findings group correctly, click scrolls editor, interpretation shows when connected.

---

### 3.4 Comparison View Refactor

**Files to Modify:**
```
src/components/ComparisonView/
├── ComparisonView.tsx    # Major refactor
├── ComparisonPanel.tsx   # New: side-by-side panel
├── Legend.tsx            # New: category color legend
└── index.ts
```

**Changes:**
- Side-by-side on desktop, stacked on mobile
- Original: highlights preserved | Rewrite: clean
- Word count per panel
- Actions: Copy, Export, Accept (replace editor), Reject
- Legend sticky at top
- Accept: immediate + 5s undo toast

**Test:** Unit tests. E2E: comparison renders, accept/reject/copy/export work, undo works.

---

### 3.5 BYOP Section Refactor

**Files to Modify:**
```
src/components/BYOPSection/
├── BYOPSection.tsx       # Visual refinement
├── ConnectionStatus.tsx  # New: pill indicator
├── DetailsAccordion.tsx  # New: accordion (not modal)
└── index.ts
```

**Changes:**
- Visual polish matching new identity
- Connection status: pill (Connected/Not connected)
- Details: accordion with "How it works", "Pollen Usage", "Privacy Note"
- Token display: monospace, subtle
- Clear privacy messaging

**Test:** E2E: connect/disconnect works, details accordion works, token displayed.

---

## Phase 4: Polish & Accessibility

### 4.1 Keyboard Shortcuts

**Implementation:**
- `F` → Toggle focus mode (global)
- `Escape` → Exit focus mode / close dropdowns
- `Ctrl/Cmd + Enter` → Run analysis (editor)
- `Tab` / `Shift+Tab` → Navigate findings (analysis panel)
- `Enter` → Expand finding / scroll to evidence

**Files to Modify:**
- `src/hooks/useKeyboardShortcuts.ts` — Register global listeners
- `src/components/TextEditor/TextEditor.tsx` — Handle `Ctrl+Enter`
- `src/components/AnalysisPanel/FindingCard.tsx` — Handle keyboard nav

**Test:** E2E: all shortcuts work, no conflicts.

---

### 4.2 Finding ↔ Editor Linking

**Implementation:**
- Click finding card → editor scrolls to evidence, highlight pulses (2s)
- Hover finding card → evidence highlighted in editor (subtle)
- Keyboard nav in findings → same behavior

**Files to Modify:**
- `src/components/TextEditor/TextEditor.tsx` — Add `scrollToFinding(id)` method
- `src/components/AnalysisPanel/FindingCard.tsx` — Call scroll method
- `src/hooks/useTextAnalysis.ts` — Expose scroll function via context or ref

**Test:** E2E: click finding scrolls editor, pulse animation, keyboard nav works.

---

### 4.3 Reduced Motion Support

**Implementation:**
- Global `prefers-reduced-motion` media query listener
- Disable stagger delays on demo highlights
- Disable rotating spinners → use pulse
- Disable slide/fade transitions → instant
- Keep functional state changes (loading, errors)

**Files to Modify:**
- `src/index.css` — Add `@media (prefers-reduced-motion: reduce)` overrides
- `src/components/demo/DemoEditor.tsx` — Check reduced motion for stagger
- `src/hooks/useReducedMotion.ts` — New hook for components

**Test:** E2E: with reduced motion enabled, no stagger, instant transitions.

---

### 4.4 ARIA & Accessibility Audit

**Checklist:**
- [ ] Semantic HTML: `header`, `main`, `footer`, `section`, `article`, `aside`
- [ ] Heading hierarchy: h1 → h2 → h3 (no skipping)
- [ ] Focus visible: Custom focus rings using `--ring`
- [ ] Color contrast: All text ≥ 4.5:1, UI elements ≥ 3:1
- [ ] Keyboard navigable: All interactive elements
- [ ] Screen reader: ARIA labels, live regions for analysis results
- [ ] Finding cards: `article` with `aria-labelledby` on title
- [ ] Comparison view: `section` with `aria-label="Comparison"`
- [ ] Loading states: `role="status" aria-live="polite"`
- [ ] Toasts: `role="alert" aria-live="assertive"`
- [ ] Focus mode toggle: `button[aria-pressed]`

**Files to Modify:** All components — add ARIA attributes

**Test:** axe-core automated testing, manual screen reader testing (NVDA/VoiceOver).

---

### 4.5 Dark Mode Refinement

**Verify:**
- All new components work in dark mode
- Colors from theme tokens (no hardcoded values)
- Shadows visible but not harsh
- Focus rings visible

**Test:** E2E: dark mode toggle, all pages render correctly.

---

### 4.6 Mobile Responsive Testing

**Breakpoints:**
- 320px, 375px, 768px, 1024px, 1440px, 1920px

**Verify:**
- No horizontal overflow
- Touch targets ≥ 44×44px
- Analysis drawer works on mobile
- Comparison view stacks on mobile
- Hero text readable at 320px

**Test:** Playwright screenshots at all breakpoints, manual device testing.

---

## Phase 5: Testing & Deploy

### 5.1 Test Updates

**Unit Tests (vitest):**
- Update existing tests for refactored components
- Add tests for new components (Hero, DemoWorkspace, SummaryBar, FindingGroup, Legend, etc.)
- Target: ≥ 80% coverage maintained

**E2E Tests (Playwright):**
- Update `style-analysis.spec.ts` for new routes and components
- Update `css-verification.spec.ts` for new theme tokens
- Add tests for: `/`, `/demo`, `/write`, `/about` routes
- Add tests for: focus mode, keyboard shortcuts, finding linking, undo
- Target: All 35+ new tests passing

**Commands:**
```bash
pnpm test          # Unit tests
pnpm test:e2e      # E2E tests
pnpm lint          # Lint
pnpm build         # Production build
```

---

### 5.2 Performance Audit

**Tools:** Lighthouse CI, WebPageTest

**Targets:**
| Metric | Target |
|--------|--------|
| LCP | < 2.0s |
| INP | < 150ms |
| CLS | < 0.05 |
| FCP | < 1.2s |
| JS Bundle (gzipped) | < 140kb (initial route) |
| CSS Bundle (gzipped) | < 10kb |

**Optimization:**
- Dynamic import for ComparisonView, DemoWorkspace
- Verify font preloading works
- Check for unused CSS/JS

---

### 5.3 Cross-Browser Testing

**Browsers:** Chrome, Firefox, Safari (WebKit)

**Test:** Playwright cross-browser, manual verification.

---

### 5.4 Deploy to GitHub Pages

**Commands:**
```bash
git add -A
git commit -m "feat: complete redesign — premium editorial writing studio"
git push origin main
# GitHub Actions builds and deploys
```

**Verification:**
- Live site: https://silver-sand.github.io/voice-lens/
- All routes work on refresh
- No console errors
- Visual QA matches spec

---

## File Creation Summary

### New Files (~45)

| Category | Count | Examples |
|----------|-------|----------|
| Fonts | ~12 | WOFF2 files in public/fonts/ |
| Layout | 4 | PageLayout, Header, Footer |
| Landing | 3 | LandingPage, Hero, TrustIndicators |
| Demo | 5 | DemoPage, DemoWorkspace, DemoEditor, DemoAnalysis, DemoFindingCard |
| Workspace | 1 | WritingWorkspace |
| Editor | 3 | WordCount, ReadabilityScore, (refactor TextEditor) |
| Analysis | 4 | SummaryBar, FindingGroup, FindingCard, (refactor AnalysisPanel) |
| Comparison | 3 | ComparisonPanel, Legend, (refactor ComparisonView) |
| BYOP | 3 | ConnectionStatus, DetailsAccordion, (refactor BYOPSection) |
| Providers | 2 | FocusModeProvider, ThemeProvider |
| Hooks | 5 | useFocusMode, useTheme, useWordCount, useKeyboardShortcuts, useReducedMotion |
| Utils | 3 | readability, textStats, sampleText |
| Routes | 2 | routes, App integration |
| Pages | 4 | LandingPage, DemoPage, WritingWorkspace, AboutPage |

### Modified Files (~12)

| File | Scope |
|------|-------|
| `src/index.css` | Complete theme replacement |
| `src/App.tsx` | Routing, providers, layout |
| `src/hooks/useTextAnalysis.ts` | Integrate useWordCount, focus mode |
| `src/components/TextEditor/TextEditor.tsx` | Major refactor |
| `src/components/AnalysisPanel/AnalysisPanel.tsx` | Major refactor |
| `src/components/ComparisonView/ComparisonView.tsx` | Major refactor |
| `src/components/BYOPSection/BYOPSection.tsx` | Visual refinement |
| `vite.config.ts` | SPA fallback for GitHub Pages |
| `index.html` | Font preload links |
| `package.json` | Add wouter, fontsource packages |
| `playwright.config.ts` | May need base URL updates |
| E2E test files | Update for new routes/components |

---

## Phase Dependencies

```
Phase 1 (Foundation)
    ↓
Phase 2 (Landing & Demo) ← Can start after 1.1-1.3
    ↓
Phase 3 (Workspace) ← Can start after 1.1-1.5
    ↓
Phase 4 (Polish) ← Can start after 2, 3
    ↓
Phase 5 (Test & Deploy)
```

**Parallelizable within phases:** Components within same phase can be built in parallel by different agents.

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Theme breakage | Incremental CSS changes, test after each token group |
| Routing issues on GitHub Pages | Test SPA fallback locally with `pnpm preview` |
| Font loading failures | Self-host, verify licenses, fallback stacks |
| E2E test flakiness | Use `page.evaluate()` clicks, pre-seed sessionStorage |
| Bundle size creep | Dynamic imports, analyze with `vite-bundle-analyzer` |
| Accessibility regressions | Run axe-core in CI, manual testing checklist |

---

## Acceptance Criteria (Definition of Done)

- [ ] All 71+ unit tests passing
- [ ] All 35+ E2E tests passing
- [ ] Lint clean (0 errors, ≤4 warnings)
- [ ] Production build clean
- [ ] Lighthouse scores meet targets
- [ ] Cross-browser verified (Chrome, Firefox, Safari)
- [ ] Mobile responsive at all breakpoints
- [ ] Reduced motion respected
- [ ] Accessibility: axe-core 0 violations, manual screen reader OK
- [ ] Deployed to GitHub Pages, live verification passes
- [ ] Visual QA matches REDESIGN_SPEC

---

## Start Command

```bash
cd C:\Users\abhis\gold\apex\pollinations-quests\quest-19180-llm-voice
# Phase 1.1: Font setup
# Phase 1.2: Theme overhaul
# Phase 1.3: Layout components
# Phase 1.4: Routing
# Phase 1.5: Providers & hooks
# Phase 1.6: Utilities
# Then verify: pnpm test && pnpm test:e2e && pnpm build
```