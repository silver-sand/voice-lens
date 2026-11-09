# Voice Lens — Redesign Specification

**Version:** 1.0  
**Date:** 2026-11-06  
**Status:** Draft — Pending Approval

---

## Executive Summary

Transform Voice Lens from a functional prototype into a **premium editorial writing studio** — a product that feels deliberately designed, has a strong identity, and provides an exceptional writing experience. This is not a minor styling exercise; it's a complete reimagining of the product's visual language, interaction model, and first-time experience.

**Core Vision:** "Your writing has a voice. Let's make it unmistakably yours."

---

## 1. Design Identity & Visual Language

### 1.1 Color System

| Token | Light | Dark | Purpose |
|-------|-------|------|---------|
| `--background` | `#FAF8F5` (warm ivory) | `#0D0C0B` (near-black) | Page background |
| `--surface` | `#FFFFFF` | `#141311` | Cards, panels |
| `--surface-elevated` | `#F5F2ED` | `#1A1917` | Hover states, modals |
| `--foreground` | `#1A1816` | `#F5F2ED` | Primary text |
| `--muted-foreground` | `#6B6660` | `#9B958E` | Secondary text |
| `--border` | `#E8E4DD` | `#2A2825` | Dividers, borders |
| `--primary` | `#2D5A4A` (deep forest) | `#7FD4A8` (soft sage) | Primary actions, accents |
| `--primary-foreground` | `#FFFFFF` | `#0D0C0B` | Text on primary |
| `--accent` | `#C47A3D` (warm amber) | `#E8B87D` | Highlights, warnings |
| `--destructive` | `#B84A3D` | `#E8847D` | Errors, disconnect |
| `--ring` | `#2D5A4A` | `#7FD4A8` | Focus rings |

**No pure white/black.** No gray scales. Every color is warm and intentional.

### 1.2 Typography System

| Role | Font | Weights | Purpose |
|------|------|---------|---------|
| **Display** | `Fraunces` (serif) | 400, 600, 700 | Hero headline, major section titles |
| **UI Sans** | `Inter` | 400, 500, 600 | All interface text, labels, buttons |
| **Editor** | `JetBrains Mono` | 400, 500 | Writing surface, code-like precision |
| **Reading** | `Fraunces` | 400, 500 | Comparison view, rewritten text |

**Scale (clamped):**
- `--text-xs`: `0.75rem`
- `--text-sm`: `0.875rem`
- `--text-base`: `clamp(1rem, 0.95rem + 0.25vw, 1.125rem)`
- `--text-lg`: `clamp(1.125rem, 1.05rem + 0.375vw, 1.25rem)`
- `--text-xl`: `clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)`
- `--text-2xl`: `clamp(1.5rem, 1.2rem + 1.5vw, 2rem)`
- `--text-3xl`: `clamp(2rem, 1.5rem + 2.5vw, 3rem)`
- `--text-4xl`: `clamp(2.5rem, 1.8rem + 3.5vw, 4rem)`
- `--text-hero`: `clamp(3rem, 2rem + 5vw, 6rem)`

### 1.3 Spacing Rhythm

```css
--space-1: 0.25rem;  --space-2: 0.5rem;  --space-3: 0.75rem;
--space-4: 1rem;     --space-5: 1.25rem;  --space-6: 1.5rem;
--space-8: 2rem;     --space-10: 2.5rem;  --space-12: 3rem;
--space-16: 4rem;    --space-20: 5rem;    --space-24: 6rem;
--space-section: clamp(4rem, 3rem + 5vw, 8rem);
```

### 1.4 Border Radius

```css
--radius-sm: 0.375rem;   --radius-md: 0.5rem;
--radius-lg: 0.75rem;    --radius-xl: 1rem;
--radius-2xl: 1.5rem;    --radius-full: 9999px;
```

### 1.5 Shadows (Editorial, not Material)

```css
--shadow-subtle: 0 1px 3px rgba(26,24,22,0.06), 0 1px 2px rgba(26,24,22,0.04);
--shadow-soft: 0 4px 12px rgba(26,24,22,0.08), 0 2px 4px rgba(26,24,22,0.05);
--shadow-elevated: 0 12px 32px rgba(26,24,22,0.12), 0 4px 8px rgba(26,24,22,0.08);
--shadow-focus: 0 0 0 3px hsl(var(--primary) / 0.25);
```

### 1.6 Animation Tokens

```css
--duration-fast: 120ms;
--duration-normal: 200ms;
--duration-slow: 350ms;
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);
--ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

**Motion principles:** Subtle, purposeful, respects `prefers-reduced-motion`. No decorative animations on every component.

---

## 2. Application Structure

### 2.1 Route Architecture

```
/                    → Landing / Hero (unauthenticated)
/write               → Writing Workspace (editor + analysis)
/write?sample=true   → Writing Workspace with interactive demo preloaded
/demo                → Interactive demonstration page
/about               → Product philosophy, privacy, credits
```

### 2.2 Layout System

```
┌─────────────────────────────────────────────────────────────┐
│  Header (sticky, translucent, 64px)                         │
│  ┌──────────────────────┐              ┌────────────────┐  │
│  │ Voice Lens + tagline │              │ Connection +   │  │
│  │                      │              │ Theme + Menu   │  │
│  └──────────────────────┘              └────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│  Main (max-width 1280px, centered, generous padding)       │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Workspace: [Editor 65%] │ [Analysis 35%]             │ │
│  │                           (desktop)                   │ │
│  │  Mobile: Stacked, Analysis in drawer                  │ │
│  └───────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│  Footer (minimal, 48px)                                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Page Specifications

### 3.1 Landing Page (`/`)

**Purpose:** First impression. Communicate value in 5 seconds. Drive to workspace.

**Structure:**

```tsx
<Header />                    // Minimal: Logo + "Start Writing" CTA
<Hero />
  <Headline>                  // "Your writing has a voice.\nLet's make it unmistakably yours."
  <Subhead>                   // "See the patterns behind your prose. Discover what feels repetitive, what feels natural, and where your writing can become more distinctly yours."
  <CTA Group>
    <PrimaryCTA>Start Writing</PrimaryCTA>        // → /write
    <SecondaryCTA>Explore Example</SecondaryCTA>  // → /demo
  </CTA Group>
<TrustIndicators />           // "Local-first • No account required • Pollinations optional"
<Footer />
```

**Hero Visual:** A subtle, animated text sample showing "before/after" highlighting in slow motion — purely decorative, no interaction required. Demonstrates the product's core value visually.

**Requirements:**
- No empty editor state
- No dashboard layout
- Loads in < 1.5s (LCP)
- Works without JS for core message (progressive enhancement)

---

### 3.2 Interactive Demo (`/demo`)

**Purpose:** Show the product working without any setup. The "aha!" moment.

**Structure:**

```tsx
<Header />
<DemoHero>
  <Title>See Voice Lens in action</Title>
  <Description>No connection required. This is a real analysis of the sample text below.</Description>
</DemoHero>

<DemoWorkspace>
  <DemoEditor>
    // Pre-filled with sample text
    // Read-only but selectable
    // Highlights animate in on load (staggered)
  </DemoEditor>
  
  <DemoAnalysis>
    <FindingCards />         // Interactive: click finding → scrolls editor to evidence
    <InterpretationPreview /> // Shows AI interpretation (mocked)
    <RewritePreview />       // Shows original vs rewritten
  </DemoAnalysis>
</DemoWorkspace>

<DemoCTA>
  <PrimaryCTA>Try with your own writing</PrimaryCTA>  // → /write
</DemoCTA>

<Footer />
```

**Sample Text (curated):**
> "In today's world, technology plays a crucial role in our daily lives. It is important to note that we must leverage innovative solutions to unlock transformative potential. Furthermore, we should delve into the landscape of possibilities to harness cutting-edge capabilities. In conclusion, the paradigm has shifted and we must adapt."

**Findings to demonstrate:**
1. Formulaic: "In today's world" (high)
2. Formulaic: "plays a crucial role" (high)
3. Formulaic: "It is important to note" (high)
4. Formulaic: "leverage innovative solutions" (medium)
5. Formulaic: "unlock transformative potential" (medium)
6. Transition: "Furthermore" (medium)
7. Transition: "In conclusion" (low)
8. Sentence: Low variation (medium)
9. Repetition: "we must" / "we should" (low)

**Interaction:**
- Click any finding card → editor scrolls to evidence, highlights pulse
- Click "View Rewrite" → shows side-by-side comparison
- All interactions work without Pollinations connection
- Clear label: "This is a demonstration with sample data"

---

### 3.3 Writing Workspace (`/write`)

**Purpose:** The core product. Distraction-free writing with powerful analysis.

**Layout (Desktop):**
```
┌──────────────────────────────────────────────────────────────┐
│ Header (64px)                                                │
├──────────────────────────┬───────────────────────────────────┤
│                          │                                   │
│   EDITOR (65%)           │   ANALYSIS PANEL (35%)            │
│                          │                                   │
│  ┌────────────────────┐  │  ┌────────────────────────────┐  │
│  │                    │  │  │  Summary Stats              │  │
│  │   Writing Surface  │  │  ├────────────────────────────┤  │
│  │   (min-h: 500px)   │  │  │  Findings List              │  │
│  │                    │  │  │  (scrollable, sticky top)   │  │
│  │  Word: 247         │  │  │                             │  │
│  │  Char: 1,432       │  │  │  [Interpretation]           │  │
│  │  Sentences: 12     │  │  │  (when connected)           │  │
│  │  Readability: 72   │  │  │                             │  │
│  └────────────────────┘  │  ├────────────────────────────┤  │
│  [Analyze Style] btn     │  │  Comparison View            │  │
│                          │  │  (when rewrite available)   │  │
│                          │  │                             │  │
└──────────────────────────┴───────────────────────────────────┘
```

**Layout (Mobile < 1024px):**
- Single column
- Analysis panel becomes a bottom sheet / drawer (triggered by floating action button)
- Editor takes full viewport height minus header

**Editor Component:**

```tsx
interface EditorProps {
  text: string;
  onChange: (text: string) => void;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  findings: Finding[];
  isConnected: boolean;
  readOnly?: boolean;  // for demo mode
}
```

**Features:**
- Large writing surface (min-height 500px desktop, 400px mobile)
- Comfortable reading width (max-width 720px, centered within panel)
- Typography: `JetBrains Mono`, 16px, line-height 1.8
- Subtle highlight overlay (same as current, refined colors)
- Live word/character/sentence count in footer bar
- Readability score (Flesch-Kincaid proxy)
- `Ctrl/Cmd + Enter` to analyze
- Placeholder text adapts to connection state
- **Focus mode:** Header fades, analysis panel collapses (toggle)

**Analysis Panel:**

```tsx
interface AnalysisPanelProps {
  findings: Finding[];
  interpretation?: InterpretationResponse;
  summary: SummaryStats;
  isAnalyzing: boolean;
  isConnected: boolean;
  onFindingSelect: (findingId: string) => void;  // scrolls editor
}
```

**Features:**
- **Summary bar** (sticky top): Word count, sentences, readability, findings count
- **Findings list** (scrollable): Grouped by category, severity-indicated
- **Finding cards:** Expandable evidence, suggestion, click → scroll editor
- **Interpretation** (when connected): Collapsible, distinct visual treatment
- **Empty state:** Illustrated, encouraging, not "no data"
- **Loading state:** Skeleton matching card structure

**Comparison View:**

```tsx
interface ComparisonViewProps {
  originalText: string;
  rewrittenText: string;
  findings: Finding[];
  onCopyRewrite: () => void;
  onExport: () => void;
  onAcceptRewrite: () => void;  // replaces editor text
  onRejectRewrite: () => void;
}
```

**Features:**
- Side-by-side on desktop, stacked on mobile
- Original: highlights preserved | Rewrite: clean
- Word count per panel
- Actions: Copy, Export, Accept (replace editor), Reject
- Legend (category colors) sticky at top

---

### 3.4 Header Component

**States:** Default | Scrolled | Focus Mode

```tsx
interface HeaderProps {
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onThemeToggle: () => void;
  onFocusModeToggle: () => void;
  isFocusMode: boolean;
}
```

**Structure:**
```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] Voice Lens    [Tagline: Style analysis for writers] │
│                                                              │
│  [Connection Status]  [Theme Toggle]  [Menu]  [Focus Toggle]│
└─────────────────────────────────────────────────────────────┘
```

**Details:**
- Logo: Custom wordmark (Fraunces, 20px, tracking-tight)
- Connection: Pill indicator (Connected/Not connected) + button
- Theme: Icon button (sun/moon/system), persists to localStorage
- Menu: Dropdown (About, Privacy, Keyboard Shortcuts, GitHub)
- Focus mode: "F" key toggle, hides header chrome, maximizes editor
- Scrolled state: Translucent backdrop-blur, subtle border

---

### 3.5 Connection Panel (BYOP)

**Refined from current:**
- Same OAuth flow (PKCE)
- Cleaner visual design matching new identity
- Token display: monospace, subtle
- Details panel: accordion, not modal
- Clear privacy messaging

---

### 3.6 Footer

Minimal. Three lines max:
- Copyright + version
- Privacy Policy link
- "Built for Pollinations Quest #19180" link

---

## 4. Component Architecture

### 4.1 New Components to Create

| Component | Path | Purpose |
|-----------|------|---------|
| `Header` | `src/components/layout/Header.tsx` | Navigation, connection, theme, focus mode |
| `Footer` | `src/components/layout/Footer.tsx` | Minimal footer |
| `Hero` | `src/components/landing/Hero.tsx` | Landing page hero |
| `DemoWorkspace` | `src/components/demo/DemoWorkspace.tsx` | Interactive demo page |
| `DemoEditor` | `src/components/demo/DemoEditor.tsx` | Read-only highlighted editor |
| `DemoAnalysis` | `src/components/demo/DemoAnalysis.tsx` | Demo findings + interpretation |
| `FocusModeProvider` | `src/providers/FocusModeProvider.tsx` | Context for focus mode state |
| `WordCount` | `src/components/editor/WordCount.tsx` | Live stats display |
| `ReadabilityScore` | `src/components/editor/ReadabilityScore.tsx` | Readability indicator |
| `SummaryBar` | `src/components/analysis/SummaryBar.tsx` | Sticky stats in analysis panel |
| `FindingCard` | `src/components/analysis/FindingCard.tsx` | Refined from current |
| `FindingGroup` | `src/components/analysis/FindingGroup.tsx` | Category grouping |
| `ComparisonPanel` | `src/components/comparison/ComparisonPanel.tsx` | Refined comparison view |
| `Legend` | `src/components/comparison/Legend.tsx` | Category color legend |
| `PageLayout` | `src/components/layout/PageLayout.tsx` | Consistent page wrapper |

### 4.2 Components to Refactor

| Component | Changes |
|-----------|---------|
| `TextEditor` | New typography, focus mode, live stats, refined highlights |
| `AnalysisPanel` | Summary bar, finding groups, interpretation styling |
| `ComparisonView` | Side-by-side layout, accept/reject actions |
| `BYOPSection` | Visual refinement, accordion details |
| `App` | Route-based rendering, focus mode provider |
| `index.css` | Complete theme overhaul (see §1) |

### 4.3 Components to Remove

None — all current functional components are preserved and enhanced.

---

## 5. Interaction Design

### 5.1 Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| `Ctrl/Cmd + Enter` | Run analysis | Editor focused |
| `F` | Toggle focus mode | Anywhere |
| `Escape` | Exit focus mode / close dropdowns | Anywhere |
| `Ctrl/Cmd + K` | Command palette (future) | Anywhere |
| `Tab` | Navigate findings | Analysis panel focused |
| `Enter` | Expand finding / scroll to evidence | Finding focused |

### 5.2 Focus Mode

- **Trigger:** `F` key or header button
- **Effect:** Header collapses to minimal bar, analysis panel slides out, editor expands to full width
- **Exit:** `Escape`, `F`, or header button
- **Persists:** localStorage

### 5.3 Finding ↔ Editor Linking

- Click finding card → editor scrolls to evidence, highlight pulses (2s)
- Hover finding card → evidence highlighted in editor (subtle)
- Keyboard nav in findings → same behavior

### 5.4 Comparison Actions

- **Accept Rewrite:** Replaces editor text, closes comparison, shows toast
- **Reject Rewrite:** Closes comparison, keeps original
- **Copy:** Clipboard + toast
- **Export:** Downloads JSON (current behavior)

### 5.5 Reduced Motion

All animations respect `prefers-reduced-motion: reduce`:
- Disable stagger delays
- Disable rotating spinners → use pulse
- Disable slide/fade transitions → instant
- Keep functional state changes (loading, errors)

---

## 6. Technical Implementation

### 6.1 Routing

**Option A (chosen):** Client-side routing with `wouter` (1.5kb) or `react-router` v7
- `/` → Landing
- `/write` → Workspace
- `/demo` → Demo
- `/about` → About

**Base path:** `/voice-lens/` (GitHub Pages) — all routes prefixed.

### 6.2 State Management

| State | Location | Persistence |
|-------|----------|-------------|
| Editor text | `useTextAnalysis` hook | sessionStorage (restore on reload) |
| Focus mode | Context + localStorage | localStorage |
| Theme | Context + localStorage | localStorage |
| Connection | `usePollinationsAuth` | sessionStorage (token) |
| Demo mode | URL param (`?sample=true`) | URL only |

### 6.3 New Hooks

| Hook | Purpose |
|------|---------|
| `useFocusMode` | Focus mode state + toggle + keyboard listener |
| `useTheme` | Theme state + toggle + system preference sync |
| `useWordCount` | Memoized word/char/sentence/readability from text |
| `useKeyboardShortcuts` | Global shortcut registration |

### 6.4 Utilities to Add

| Utility | Path | Purpose |
|---------|------|---------|
| `readability.ts` | `src/lib/readability.ts` | Flesch-Kincaid, Gunning Fog, etc. |
| `textStats.ts` | `src/lib/textStats.ts` | Word, char, sentence, paragraph counts |
| `sampleText.ts` | `src/lib/sampleText.ts` | Curated demo text + expected findings |

---

## 7. Accessibility

### 7.1 Requirements

- **WCAG 2.1 AA** minimum
- Semantic HTML: `header`, `main`, `footer`, `section`, `article`, `aside`
- Heading hierarchy: h1 → h2 → h3 (no skipping)
- Focus visible: Custom focus rings using `--ring`
- Color contrast: All text ≥ 4.5:1, UI elements ≥ 3:1
- Keyboard navigable: All interactive elements
- Screen reader: ARIA labels, live regions for analysis results
- Reduced motion: Respected globally

### 7.2 Specific Patterns

- **Finding cards:** `article` with `aria-labelledby` on title
- **Comparison view:** `section` with `aria-label="Comparison"`
- **Loading states:** `role="status" aria-live="polite"`
- **Toasts:** `role="alert" aria-live="assertive"`
- **Focus mode toggle:** `button[aria-pressed]`

---

## 8. Performance Targets

| Metric | Target |
|--------|--------|
| LCP | < 2.0s |
| INP | < 150ms |
| CLS | < 0.05 |
| FCP | < 1.2s |
| JS Bundle (gzipped) | < 140kb |
| CSS Bundle (gzipped) | < 10kb |

**Strategies:**
- Dynamic import for ComparisonView, DemoWorkspace
- Font preloading (Fraunces display, Inter UI)
- Critical CSS inlined
- Motion.dev only where needed
- Tree-shake Lucide (import individual icons)

---

## 9. Migration Strategy (Phased)

### Phase 1: Foundation (Week 1)
- [ ] Update `index.css` with new design tokens (§1)
- [ ] Add Fraunces font (self-hosted via `@fontsource/fraunces`)
- [ ] Create `PageLayout`, `Header`, `Footer` components
- [ ] Implement routing (`wouter`)
- [ ] Add `FocusModeProvider`, `useTheme`, `useFocusMode` hooks
- [ ] Verify all tests pass

### Phase 2: Landing & Demo (Week 1-2)
- [ ] Build `Hero` component with animated text sample
- [ ] Build `/demo` page with `DemoWorkspace`, `DemoEditor`, `DemoAnalysis`
- [ ] Create curated sample text + expected findings
- [ ] Add "Try with your own writing" CTA → `/write`
- [ ] Verify E2E tests for new routes

### Phase 3: Workspace Refactor (Week 2)
- [ ] Refactor `TextEditor`: new typography, focus mode, live stats
- [ ] Refactor `AnalysisPanel`: summary bar, finding groups, refined cards
- [ ] Refactor `ComparisonView`: side-by-side, accept/reject actions
- [ ] Refactor `BYOPSection`: visual polish
- [ ] Integrate into `/write` route with `PageLayout`

### Phase 4: Polish & Accessibility (Week 2-3)
- [ ] Keyboard shortcuts (`F`, `Escape`, `Ctrl+Enter`)
- [ ] Finding ↔ editor linking (scroll + pulse)
- [ ] Reduced motion support
- [ ] ARIA audit + axe testing
- [ ] Dark mode refinement
- [ ] Mobile responsive testing

### Phase 5: Testing & Deploy (Week 3)
- [ ] Update unit tests for new components
- [ ] Update E2E tests for new routes + interactions
- [ ] Performance audit (Lighthouse CI)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Deploy to GitHub Pages
- [ ] Final verification

---

## 10. Test Baseline (Current)

| Suite | Tests | Status |
|-------|-------|--------|
| Unit (vitest) | 71 | ✅ Passing |
| E2E (Playwright) | 35 | ✅ Passing |
| Lint (oxlint) | 4 warnings | ⚠️ Non-blocking |
| Build | - | ✅ Clean |

**All new work must maintain or improve these baselines.**

---

## 11. Open Questions for Approval

1. **Routing library:** `wouter` (1.5kb, minimal) vs `react-router` v7 (full-featured)? Recommendation: `wouter`.
2. **Font loading:** Self-host Fraunces via `@fontsource/fraunces` (adds ~40kb) or Google Fonts with `preload`? Recommendation: self-host for privacy/performance.
3. **Demo sample text:** Use the curated text in §3.2 or create a different one?
4. **Focus mode persistence:** Should it persist across sessions? Recommendation: yes, localStorage.
5. **Animation budget:** Are the staggered highlight animations on demo page acceptable, or should they be simpler?
6. **Comparison "Accept" behavior:** Replace editor text immediately, or show confirmation dialog? Recommendation: immediate with toast + undo (5s).

---

## 12. Approval

**Reviewers:** [User]

**Decision:** ☐ Approved as-is  ☐ Approved with changes  ☐ Request revision

**Notes:**