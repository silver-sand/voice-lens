/**
 * Curated sample text for the interactive demo
 * Chosen to demonstrate all finding categories clearly
 */

export const DEMO_TEXT = `In today's world, technology plays a crucial role in our daily lives. It is important to note that we must leverage innovative solutions to unlock transformative potential. Furthermore, we should delve into the landscape of possibilities to harness cutting-edge capabilities. In conclusion, the paradigm has shifted and we must adapt.`;

/**
 * Expected findings for the demo text - used to verify demo behavior
 * These match what the local analysis should detect
 */
export interface DemoFinding {
  id: string;
  category: 'repetition' | 'formulaic' | 'sentence' | 'transition' | 'vocabulary';
  severity: 'high' | 'medium' | 'low';
  message: string;
  evidence: string;
  suggestion: string;
  startOffset: number;
  endOffset: number;
}

export const DEMO_FINDINGS: DemoFinding[] = [
  {
    id: 'demo-formulaic-1',
    category: 'formulaic',
    severity: 'high',
    message: 'Formulaic phrase detected: "In today\'s world"',
    evidence: 'In today\'s world',
    suggestion: 'Consider a more specific opening grounded in your actual subject',
    startOffset: 0,
    endOffset: 15,
  },
  {
    id: 'demo-formulaic-2',
    category: 'formulaic',
    severity: 'high',
    message: 'Formulaic phrase detected: "plays a crucial role"',
    evidence: 'plays a crucial role',
    suggestion: 'Replace with a precise verb: drives, shapes, defines, enables',
    startOffset: 32,
    endOffset: 52,
  },
  {
    id: 'demo-formulaic-3',
    category: 'formulaic',
    severity: 'high',
    message: 'Formulaic phrase detected: "It is important to note that"',
    evidence: 'It is important to note that',
    suggestion: 'Remove entirely — the statement speaks for itself',
    startOffset: 57,
    endOffset: 85,
  },
  {
    id: 'demo-formulaic-4',
    category: 'formulaic',
    severity: 'medium',
    message: 'Formulaic phrase detected: "leverage innovative solutions"',
    evidence: 'leverage innovative solutions',
    suggestion: 'Use concrete language: adopt new tools, apply fresh approaches',
    startOffset: 100,
    endOffset: 126,
  },
  {
    id: 'demo-formulaic-5',
    category: 'formulaic',
    severity: 'medium',
    message: 'Formulaic phrase detected: "unlock transformative potential"',
    evidence: 'unlock transformative potential',
    suggestion: 'Describe the specific outcome: enable growth, reduce costs, improve outcomes',
    startOffset: 131,
    endOffset: 157,
  },
  {
    id: 'demo-transition-1',
    category: 'transition',
    severity: 'medium',
    message: 'Formulaic transition: "Furthermore"',
    evidence: 'Furthermore',
    suggestion: 'Try: Additionally, Moreover, Also, or simply start the next point',
    startOffset: 162,
    endOffset: 173,
  },
  {
    id: 'demo-formulaic-6',
    category: 'formulaic',
    severity: 'medium',
    message: 'Formulaic phrase detected: "delve into the landscape of"',
    evidence: 'delve into the landscape of',
    suggestion: 'Replace with: explore, examine, investigate',
    startOffset: 182,
    endOffset: 207,
  },
  {
    id: 'demo-formulaic-7',
    category: 'formulaic',
    severity: 'medium',
    message: 'Formulaic phrase detected: "harness cutting-edge capabilities"',
    evidence: 'harness cutting-edge capabilities',
    suggestion: 'Be specific: use advanced features, apply new technology',
    startOffset: 212,
    endOffset: 242,
  },
  {
    id: 'demo-transition-2',
    category: 'transition',
    severity: 'low',
    message: 'Formulaic transition: "In conclusion"',
    evidence: 'In conclusion',
    suggestion: 'Try: Ultimately, Finally, This leads to, The result is',
    startOffset: 247,
    endOffset: 259,
  },
  {
    id: 'demo-repetition-1',
    category: 'repetition',
    severity: 'low',
    message: 'Repeated sentence opening: "we must" / "we should"',
    evidence: 'we must adapt',
    suggestion: 'Vary sentence structure: Adapting is essential; The shift requires adaptation',
    startOffset: 264,
    endOffset: 277,
  },
];

/**
 * Mock AI interpretation for demo
 */
export const DEMO_INTERPRETATION = {
  explanation: `Your writing shows several patterns typical of corporate and AI-generated text. The sample relies heavily on formulaic openings ("In today's world"), vague buzzwords ("leverage innovative solutions," "unlock transformative potential"), and mechanical transitions ("Furthermore," "In conclusion").

These patterns make writing feel generic and interchangeable. Readers instinctively recognize them as filler — the linguistic equivalent of elevator music.`,

  keyInsights: [
    'Replace 5+ formulaic phrases with specific, concrete language',
    'Vary your sentence openings — 3 of 4 sentences start with similar structures',
    'Transitions should connect ideas, not just mark sequence',
    'Cut "It is important to note that" entirely — it adds zero information',
  ],

  rewrite: `Technology shapes daily life in ways we're still discovering. We need practical tools, not buzzwords — specific solutions for specific problems. The landscape isn't something to "delve into"; it's territory to navigate with clear intent. Adaptation isn't a conclusion. It's the starting point.`,

  confidence: 0.92,
};

/**
 * Demo configuration
 */
export const DEMO_CONFIG = {
  text: DEMO_TEXT,
  findings: DEMO_FINDINGS,
  interpretation: DEMO_INTERPRETATION,
  // Stagger delay for highlight animations (ms)
  highlightStaggerDelay: 120,
  // Categories to show in demo (in order)
  categoryOrder: ['formulaic', 'transition', 'repetition', 'sentence', 'vocabulary'] as const,
};