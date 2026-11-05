# Voice Lens

**Pollinations Quest #19180 — An app about the LLM voice**

Voice Lens is a premium, local-first writing-style analysis tool that helps writers identify and improve patterns in their prose that are commonly associated with LLM-generated text. It provides deterministic local analysis (no API costs, no data leaves your browser) plus optional AI-powered interpretation and rewrites via Pollinations BYOP (Bring Your Own Provider).

---

## ✨ Features

### Local Deterministic Analysis (Always Free, Always Private)
- **Repetition Detection** — Finds repeated words and phrases across your text
- **Formulaic Phrase Detection** — Identifies 123+ overused LLM-style phrases (e.g., "in today's world", "delve into", "a testament to")
- **Sentence Structure Analysis** — Detects monotonous sentence length and repetitive sentence openings
- **Transition Overuse** — Flags 75+ overused transitions including ordinals (first, second, third...)
- **Vocabulary Diversity** — Measures unique word ratio and flags generic vocabulary
- **Real-time Highlighting** — Visual overlay in the editor showing exactly where issues occur

### AI-Powered Interpretation (Optional, Requires Pollen Connection)
- **Contextual Explanation** — Why these patterns matter for your writing
- **Key Insights** — 3 actionable takeaways specific to your text
- **Intelligent Rewrite** — Preserves your meaning and voice while reducing formulaic patterns
- **Confidence Scoring** — How confident the model is in its analysis

### Premium UX
- **Editor + Analysis Side-by-Side** — See findings next to your writing
- **Comparison View** — Side-by-side original vs. rewritten with highlighted diffs
- **Motion.dev Animations** — Smooth, purposeful transitions throughout
- **Dark/Light Mode** — Respects system preference
- **Keyboard Shortcuts** — `Ctrl/Cmd+Enter` to analyze
- **Export** — Download analysis as JSON for your records
- **Copy Rewrite** — One-click copy of the improved version

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Voice Lens App                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐    ┌─────────────────┐    ┌───────────────┐  │
│  │  TextEditor  │───▶│  useTextAnalysis │───▶│ AnalysisPanel │  │
│  │  (with       │    │  (orchestrates) │    │  (findings +  │  │
│  │   highlights)│    │                 │    │  interpretation)│ │
│  └──────────────┘    └────────┬────────┘    └───────────────┘  │
│                               │                                 │
│                    ┌──────────┴──────────┐                     │
│                    ▼                     ▼                     │
│           ┌───────────────┐     ┌──────────────────┐          │
│           │ Local Analysis│     │ Pollinations API │          │
│           │ (deterministic│     │ (interpretWith   │          │
│           │  ~50ms, free) │     │  Pollinations)   │          │
│           └───────────────┘     └──────────────────┘          │
│                    │                     │                     │
│                    └──────────┬──────────┘                     │
│                               ▼                                 │
│                    ┌──────────────────┐                         │
│                    │  ComparisonView  │                         │
│                    │ (diff + actions) │                         │
│                    └──────────────────┘                         │
└─────────────────────────────────────────────────────────────────┘
```

### Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Local-first analysis** | No API costs, zero latency, complete privacy — text never leaves browser unless user explicitly connects Pollen |
| **Deterministic algorithms** | 7 exported functions with fixed phrase dictionaries — same input always produces same output |
| **Separation of concerns** | Local analysis (objective) vs AI interpretation (subjective) — user sees both |
| **PKCE OAuth (S256)** | Industry-standard secure auth flow for Pollinations Pay; tokens only in `sessionStorage` |
| **No `localStorage`** | Tokens never persist across browser sessions; cleared on tab close |
| **Motion.dev over Framer Motion** | Modern, actively maintained animation library with smaller bundle |
| **shadcn/ui patterns** | Accessible, composable primitives built on Radix UI |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- pnpm (or npm/yarn)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd quest-19180-llm-voice

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

Open http://localhost:5173 in your browser.

### Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with HMR |
| `pnpm build` | Production build (TypeScript + Vite) |
| `pnpm preview` | Preview production build locally |
| `pnpm test` | Run unit tests with Vitest |
| `pnpm test:ui` | Run tests with Vitest UI |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm lint` | Run oxlint |
| `pnpm e2e` | Run Playwright E2E tests |
| `pnpm e2e:ui` | Run E2E tests with Playwright UI |

---

## 🔐 Pollinations BYOP Setup (Optional)

To unlock AI interpretation and rewrites:

1. **Get a Pollinations Account** — Sign up at [pollinations.ai](https://pollinations.ai)
2. **Connect Pollen** — Click "Connect Pollen" in the header
3. **Authorize** — Complete the OAuth flow (PKCE S256)
4. **Analyze** — Run analysis on any text; AI interpretation will appear alongside local findings

### What Pollen Provides
- Access to 100+ models via Pollinations API
- Bring Your Own Provider (BYOP) — use your own API keys
- Secure token management (handled entirely in-browser)

### Privacy
- Your text is **only sent to Pollinations** when you explicitly run analysis with a connected Pollen account
- Local analysis runs **entirely in your browser** — zero network requests
- Tokens stored in `sessionStorage` only — **never** in `localStorage`, never logged
- See [PRIVACY_POLICY.md](PRIVACY_POLICY.md) for full details

---

## 🧪 Testing

### Unit & Component Tests (Vitest + React Testing Library)
```bash
pnpm test        # Run once
pnpm test:watch  # Watch mode
pnpm test:ui     # Visual test UI
```

**Coverage**: 71 tests across 5 test files
- `localAnalysis.test.ts` — 24 tests for all 7 deterministic analysis functions
- `TextEditor.test.tsx` — 10 tests for editor behavior and highlighting
- `AnalysisPanel.test.tsx` — 15 tests for findings display and interpretation card
- `ComparisonView.test.tsx` — 8 tests for diff view and actions
- `BYOPSection.test.tsx` — 14 tests for OAuth flow and connection state

### E2E Tests (Playwright)
```bash
pnpm e2e        # Headless
pnpm e2e:headed # Headed (visible browser)
pnpm e2e:ui     # Playwright UI
```

**Coverage**: 20+ scenarios including:
- Full analysis flow (local + AI)
- OAuth connect/disconnect
- Keyboard shortcuts
- Copy/export actions
- Responsive layout (mobile/desktop)
- Accessibility (headings, labels, color independence)
- Error handling

---

## 📁 Project Structure

```
quest-19180-llm-voice/
├── public/                     # Static assets
├── src/
│   ├── components/
│   │   ├── AnalysisPanel/      # Findings list + AI interpretation card
│   │   ├── BYOPSection/        # Pollen connection UI (header)
│   │   ├── ComparisonView/     # Side-by-side diff with actions
│   │   ├── TextEditor/         # Editor with real-time highlighting
│   │   └── ui/                 # shadcn/ui primitives (Button, ScrollArea)
│   ├── hooks/
│   │   ├── usePollinationsAuth.ts  # OAuth state management
│   │   └── useTextAnalysis.ts    # Analysis pipeline orchestration
│   ├── lib/
│   │   ├── analysis/
│   │   │   └── localAnalysis.ts  # 7 deterministic analysis functions
│   │   ├── pollinations/
│   │   │   ├── api.ts            # Pollinations chat/completions
│   │   │   └── auth.ts           # PKCE OAuth (generate, exchange, storage)
│   │   ├── types.ts              # TypeScript interfaces
│   │   └── utils.ts              # cn() utility for class merging
│   ├── test-setup.ts             # Vitest global mocks
│   ├── App.tsx                   # Root component
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Tailwind v4 + CSS custom properties
├── e2e/
│   └── style-analysis.spec.ts    # Playwright E2E tests
├── index.html
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── vitest.config.ts
├── README.md
└── PRIVACY_POLICY.md
```

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | React 19 + TypeScript |
| **Build** | Vite 8 |
| **Styling** | Tailwind CSS v4 (CSS-first) |
| **Animation** | Motion.dev (framer-motion successor) |
| **UI Primitives** | shadcn/ui patterns + Radix UI |
| **Icons** | Lucide React |
| **Testing (Unit)** | Vitest + React Testing Library + @testing-library/jest-dom |
| **Testing (E2E)** | Playwright |
| **Linting** | oxlint |
| **Auth** | OAuth 2.0 + PKCE (S256) |
| **API** | Pollinations (chat/completions, models, BYOP) |

---

## 📊 Local Analysis Details

The deterministic analyzer exports 7 functions (all pure, no side effects):

| Function | Purpose |
|----------|---------|
| `analyzeRepetition(text)` | Repeated words (≥3) and phrases (≥2 occurrences) |
| `analyzeFormulaicPhrases(text)` | 123+ formulaic phrases from curated dictionary |
| `analyzeSentenceStructure(text)` | Low sentence length variance, repetitive openings |
| `analyzeTransitions(text)` | 75+ overused transitions including ordinals |
| `analyzeVocabulary(text)` | Unique word ratio, generic word flags |
| `analyzeText(text)` | Orchestrates all analyzers, returns combined findings |
| `computeSummary(text, findings)` | Readability score, word/sentence counts, averages |

### Phrase Dictionaries (Excerpt)

**Formulaic Phrases (123 entries):**
- "in today's world", "in the modern era", "in the digital age"
- "delve into", "dive deep", "a deep dive into"
- "a testament to", "a reflection of", "a reminder that"
- "it is important to note", "it is worth noting", "it should be noted"
- "crucial role", "pivotal role", "instrumental in"
- "landscape", "tapestry", "realm", "unlock", "unleash"

**Overused Transitions (75 entries including ordinals):**
- "however", "furthermore", "moreover", "additionally"
- "therefore", "consequently", "as a result", "thus"
- "first", "second", "third", ... "twelfth"
- "in conclusion", "to summarize", "ultimately"

**Formulaic Sentence Starts (27 entries):**
- "In today's world,", "In the modern era,", "In the digital age,"
- "It is important to note that", "It is worth noting that"
- "This is because", "This means that", "This suggests that"

---

## 🎨 Design System

### CSS Custom Properties (Light/Dark)

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --ring: 221.2 83.2% 53.3%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  /* ... */
}
```

### Highlight Classes (for findings overlay)

```css
.highlight-repetition     { background: oklch(75% 0.15 85 / 0.35); }
.highlight-formulaic      { background: oklch(70% 0.18 45 / 0.35); }
.highlight-sentence       { background: oklch(75% 0.12 220 / 0.3); }
.highlight-transition     { background: oklch(72% 0.16 290 / 0.35); }
.highlight-vocabulary     { background: oklch(68% 0.14 140 / 0.3); }
```

### Severity Colors
- **High** — Red border (`border-l-red-500`), red badge
- **Medium** — Yellow/amber border (`border-l-yellow-500`), amber badge
- **Low** — Blue border (`border-l-blue-500`), blue badge

---

## 🔒 Security

- **No hardcoded secrets** — All configuration via environment
- **PKCE (S256)** — OAuth code challenge/verifier prevents auth code interception
- **SessionStorage only** — Tokens never touch `localStorage` or disk
- **No logging of tokens** — Console output sanitized
- **HTTPS-only APIs** — Pollinations endpoints use TLS
- **CSP-ready** — No inline scripts, nonce-compatible structure

---

## 📝 License

MIT License — See LICENSE file for details.

---

## 🙏 Acknowledgments

- **Pollinations** — For the Quest platform and BYOP infrastructure
- **shadcn/ui** — For accessible component patterns
- **Motion.dev** — For the animation library
- **Tailwind CSS** — For the utility-first styling
- **Vitest + Playwright** — For the testing ecosystem

---

## 📬 Quest Submission

This project implements **Pollinations Quest #19180: "An app, tool, or agent about the LLM voice"**.

**Key deliverables:**
- ✅ Frontend-only (Vite + React 19 + TypeScript)
- ✅ Pollinations Pay OAuth 2.0 with PKCE (S256)
- ✅ BYOP model support
- ✅ Deterministic local analysis (separated from AI interpretation)
- ✅ Premium UI with Motion.dev + shadcn/ui patterns
- ✅ Tokens only in sessionStorage
- ✅ Comprehensive testing (71 unit + 20+ E2E tests with mocked APIs)
- ✅ No hardcoded secrets, production build passes
- ✅ Privacy policy included
- ✅ README with deployment instructions

Built with care for the Pollinations Quest program.