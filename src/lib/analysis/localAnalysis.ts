import type { Finding } from '../../lib/types';

export const FORMULAIC_PHRASES = [
  'in today\'s world',
  'in conclusion',
  'it is important to note',
  'plays a crucial role',
  'delve into',
  'tapestry',
  'landscape',
  'realm',
  'unleash',
  'unlock',
  'harness',
  'pivotal',
  'paramount',
  'leverage',
  'synergy',
  'holistic',
  'robust',
  'seamless',
  'transformative',
  'paradigm',
  'deep dive',
  'at the end of the day',
  'game-changer',
  'move the needle',
  'low-hanging fruit',
  'touch base',
  'circle back',
  'bandwidth',
  'drill down',
  'core competency',
  'best practice',
  'value-add',
  'think outside the box',
  'hit the ground running',
  'on the same page',
  'going forward',
  'reach out',
  'ping',
  'align',
  'socialize',
  'iterate',
  'pivot',
  'disruptive',
  'innovative',
  'cutting-edge',
  'state-of-the-art',
  'world-class',
  'best-in-class',
  'scalable',
  'actionable',
  'granular',
  'high-level',
  'drill-down',
  'deep-dive',
  '360-degree view',
  'bird\'s-eye view',
  'big picture',
  'bottom line',
  'key takeaways',
  'action items',
  'next steps',
  'moving forward',
  'it goes without saying',
  'needless to say',
  'it should be noted',
  'it is worth noting',
  'bear in mind',
  'keep in mind',
  'take into account',
  'take into consideration',
  'as a matter of fact',
  'in fact',
  'as a result',
  'consequently',
  'therefore',
  'thus',
  'hence',
  'accordingly',
  'subsequently',
  'furthermore',
  'moreover',
  'additionally',
  'in addition',
  'besides',
  'also',
  'likewise',
  'similarly',
  'correspondingly',
  'by the same token',
  'in the same way',
  'just as',
  'equally',
  'identically',
  'comparably',
  'analogously',
  'on the other hand',
  'conversely',
  'in contrast',
  'by contrast',
  'however',
  'nevertheless',
  'nonetheless',
  'notwithstanding',
  'despite this',
  'in spite of this',
  'all the same',
  'at the same time',
  'still',
  'yet',
  'though',
  'although',
  'even though',
  'while',
  'whereas',
  'but',
];

export const OVERUSED_TRANSITIONS = [
  'furthermore',
  'moreover',
  'additionally',
  'in addition',
  'besides',
  'also',
  'therefore',
  'thus',
  'hence',
  'consequently',
  'accordingly',
  'subsequently',
  'in conclusion',
  'to conclude',
  'ultimately',
  'finally',
  'in summary',
  'to summarize',
  'briefly',
  'in short',
  'on the whole',
  'overall',
  'all things considered',
  'by and large',
  'for example',
  'for instance',
  'such as',
  'including',
  'particularly',
  'especially',
  'specifically',
  'notably',
  'chiefly',
  'mainly',
  'mostly',
  'largely',
  'primarily',
  'principally',
  'in fact',
  'indeed',
  'certainly',
  'obviously',
  'clearly',
  'evidently',
  'manifestly',
  'undoubtedly',
  'unquestionably',
  'without doubt',
  'needless to say',
  'it goes without saying',
  'it is clear that',
  'it is evident that',
  'it is obvious that',
  'first',
  'second',
  'third',
  'fourth',
  'fifth',
  'sixth',
  'seventh',
  'eighth',
  'ninth',
  'tenth',
  'eleventh',
  'twelfth',
];

export const FORMULAIC_SENTENCE_STARTS = [
  'it is important to',
  'it is crucial to',
  'it is essential to',
  'it is vital to',
  'it is necessary to',
  'it is imperative to',
  'it is worth noting that',
  'it should be noted that',
  'it is worth mentioning that',
  'it is important to note that',
  'it is crucial to note that',
  'it is essential to understand that',
  'it is vital to understand that',
  'it is necessary to understand that',
  'it is worth understanding that',
  'in order to',
  'in an effort to',
  'in an attempt to',
  'with the aim of',
  'with the goal of',
  'with the intention of',
  'for the purpose of',
  'for the sake of',
  'so as to',
  'based on',
  'it is',
];

interface AnalysisOptions {
  minPhraseLength?: number;
  minRepeatCount?: number;
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\n+/g, ' ')
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findContextForMatches(text: string, phrase: string, maxMatches: number): string[] {
  // Find all occurrences with their indices in original text (case-insensitive)
  const lowerText = text.toLowerCase();
  const lowerPhrase = phrase.toLowerCase();
  let index = 0;
  const evidence: string[] = [];

  while (true) {
    const foundIndex = lowerText.indexOf(lowerPhrase, index);
    if (foundIndex === -1) break;

    const start = Math.max(0, foundIndex - 50);
    const end = Math.min(text.length, foundIndex + phrase.length + 50);
    const context = text.slice(start, end);
    evidence.push('...' + context + '...');

    index = foundIndex + 1;
    if (evidence.length >= maxMatches) break;
  }

  return evidence;
}

export function analyzeText(text: string, options: AnalysisOptions = {}) {
  const {
    minPhraseLength = 2,
    minRepeatCount = 2,
  } = options;

  const findings: Finding[] = [];

  // 1. Repeated phrases (n-grams)
  findings.push(...findRepeatedPhrases(text, minPhraseLength, minRepeatCount));

  // 2. Formulaic phrases
  findings.push(...findFormulaicPhrases(text));

  // 3. Overused transitions
  findings.push(...findOverusedTransitions(text));

  // 4. Repetitive sentence openings
  findings.push(...findRepetitiveSentenceOpenings(text));

  // 5. Sentence length variation
  findings.push(...analyzeSentenceLengthVariation(text));

  // 6. Excessive formulaic sentence starts
  findings.push(...findFormulaicSentenceStarts(text));

  const summary = computeSummary(text, findings);

  return { findings, summary };
}

export function findRepeatedPhrases(text: string, minLength: number = 2, minCount: number = 2): Finding[] {
  const findings: Finding[] = [];
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const seen = new Map<string, number[]>();

  for (let n = minLength; n <= 6; n++) {
    for (let i = 0; i <= words.length - n; i++) {
      const phrase = words.slice(i, i + n).join(' ');
      if (!seen.has(phrase)) {
        seen.set(phrase, []);
      }
      seen.get(phrase)!.push(i);
    }
  }

  for (const [phrase, positions] of seen.entries()) {
    if (positions.length >= minCount && phrase.length > 5) {
      // Use findContextForMatches to get original-case evidence
      const evidence = findContextForMatches(text, phrase, 3);

      findings.push({
        id: crypto.randomUUID(),
        category: 'repetition',
        severity: positions.length > 3 ? 'high' : positions.length > 2 ? 'medium' : 'low',
        title: 'Repeated phrase detected',
        description: `The phrase "${phrase}" appears ${positions.length} times in the text.`,
        evidence,
        suggestion: 'Consider using synonyms or restructuring sentences to avoid repetition.',
      });
    }
  }

  return findings;
}

export function findFormulaicPhrases(text: string): Finding[] {
  const findings: Finding[] = [];
  const lowerText = text.toLowerCase();

  for (const phrase of FORMULAIC_PHRASES) {
    const regex = new RegExp(`\\b${escapeRegExp(phrase)}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches && matches.length > 0) {
      findings.push({
        id: crypto.randomUUID(),
        category: 'formulaic',
        severity: matches.length > 2 ? 'high' : matches.length > 1 ? 'medium' : 'low',
        title: 'Formulaic expression detected',
        description: `The phrase "${phrase}" is commonly associated with LLM-style writing and appears ${matches.length} time${matches.length > 1 ? 's' : ''}.`,
        evidence: findContextForMatches(text, phrase, 3),
        suggestion: 'Consider replacing with more specific, concrete language.',
      });
    }
  }

  return findings;
}

export function findOverusedTransitions(text: string): Finding[] {
  const findings: Finding[] = [];
  const lowerText = text.toLowerCase();
  const transitionCounts = new Map<string, number>();

  for (const transition of OVERUSED_TRANSITIONS) {
    const regex = new RegExp(`\\b${escapeRegExp(transition)}\\b`, 'gi');
    const matches = lowerText.match(regex);
    if (matches && matches.length > 0) {
      transitionCounts.set(transition, matches.length);
    }
  }

  if (transitionCounts.size > 0) {
    const totalTransitions = Array.from(transitionCounts.values()).reduce((a, b) => a + b, 0);
    const evidence: string[] = [];
    let count = 0;
    for (const [transition, cnt] of transitionCounts.entries()) {
      if (count < 5) {
        evidence.push(`"${transition}" (${cnt} occurrences)`);
        count++;
      }
    }

    findings.push({
      id: crypto.randomUUID(),
      category: 'transition',
      severity: totalTransitions >= 4 ? 'high' : totalTransitions >= 2 ? 'medium' : 'low',
      title: 'Overused transition words',
      description: `Found ${totalTransitions} transition words/phrases that are commonly overused in LLM writing.`,
      evidence,
      suggestion: 'Vary your transitions. Consider removing some entirely or using simpler connectors.',
    });
  }

  return findings;
}

export function findRepetitiveSentenceOpenings(text: string): Finding[] {
  const findings: Finding[] = [];
  const sentences = splitSentences(text);
  const openings = new Map<string, number[]>();

  sentences.forEach((sentence, index) => {
    // Extract first 2 words as opening
    const words = sentence.trim().toLowerCase().match(/^\w+(?:\s+\w+)?/);
    if (words) {
      const opening = words[0];
      if (!openings.has(opening)) {
        openings.set(opening, []);
      }
      openings.get(opening)!.push(index);
    }
  });

  for (const [opening, indices] of openings.entries()) {
    if (indices.length >= 3 && opening.length > 2) {
      // Use original-case sentences for evidence
      findings.push({
        id: crypto.randomUUID(),
        category: 'sentence',
        severity: indices.length > 5 ? 'high' : indices.length > 4 ? 'medium' : 'low',
        title: 'Repetitive sentence openings',
        description: `${indices.length} sentences start with "${opening}". This creates a monotonous rhythm.`,
        evidence: indices.slice(0, 3).map(i => sentences[i].slice(0, 100)),
        suggestion: 'Vary sentence structure. Try starting with dependent clauses, prepositional phrases, or the subject directly.',
      });
    }
  }

  return findings;
}

export function analyzeSentenceLengthVariation(text: string): Finding[] {
  const findings: Finding[] = [];
  const sentences = splitSentences(text);
  const lengths = sentences.map(s => s.split(/\s+/).length);

  if (sentences.length < 4) {
    return findings;
  }

  const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((sum, len) => sum + Math.pow(len - avg, 2), 0) / lengths.length;
  const stdDev = Math.sqrt(variance);
  const cv = stdDev / avg; // coefficient of variation

  if (cv < 0.3) {
    findings.push({
      id: crypto.randomUUID(),
      category: 'sentence',
      severity: cv < 0.2 ? 'high' : 'medium',
      title: 'Low sentence length variation',
      description: `Sentences have very similar lengths (avg: ${avg.toFixed(1)} words, CV: ${cv.toFixed(2)}). This creates a robotic rhythm.`,
      evidence: [`Average sentence length: ${avg.toFixed(1)} words`, `Coefficient of variation: ${cv.toFixed(2)} (healthy > 0.4)`],
      suggestion: 'Mix short, punchy sentences with longer, more complex ones. Use fragments for emphasis.',
    });
  }

  return findings;
}

export function findFormulaicSentenceStarts(text: string): Finding[] {
  const findings: Finding[] = [];
  const sentences = splitSentences(text);
  let count = 0;
  const matched: string[] = [];

  for (const sentence of sentences) {
    const lower = sentence.toLowerCase().trim();
    for (const starter of FORMULAIC_SENTENCE_STARTS) {
      if (lower.startsWith(starter)) {
        count++;
        // Preserve original case from the sentence
        matched.push(sentence.slice(0, starter.length));
        break;
      }
    }
  }

  if (count > 0) {
    findings.push({
      id: crypto.randomUUID(),
      category: 'formulaic',
      severity: count > 4 ? 'high' : count > 2 ? 'medium' : 'low',
      title: 'Formulaic sentence structures',
      description: `${count} sentences begin with formulaic introductory phrases that are hallmarks of LLM-style writing.`,
      evidence: matched.slice(0, 5),
      suggestion: 'Start sentences directly with the subject. Cut hedging phrases like "It is important to note that".',
    });
  }

  return findings;
}

export function computeSummary(text: string, findings: Finding[] = []) {
  const sentences = splitSentences(text);
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const uniqueWords = new Set(words);
  const totalFindings = findings.length;

  // Simple readability proxy
  const avgSentenceLength = words.length / Math.max(sentences.length, 1);
  const uniqueWordRatio = uniqueWords.size / Math.max(words.length, 1);
  const readabilityScore = Math.max(0, Math.min(100, 100 - avgSentenceLength * 2 + uniqueWordRatio * 50));

  return {
    totalFindings,
    readabilityScore: Math.round(readabilityScore),
    wordCount: words.length,
    sentenceCount: sentences.length,
    avgWordsPerSentence: Math.round(avgSentenceLength * 10) / 10,
    uniqueWordRatio: Math.round(uniqueWordRatio * 100) / 100,
  };
}