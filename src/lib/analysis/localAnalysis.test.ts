import { describe, it, expect } from 'vitest';
import {
  analyzeText,
  computeSummary,
  findRepeatedPhrases,
  findFormulaicPhrases,
  findOverusedTransitions,
  findRepetitiveSentenceOpenings,
  analyzeSentenceLengthVariation,
  findFormulaicSentenceStarts,
} from './localAnalysis';

describe('localAnalysis', () => {
  describe('findRepeatedPhrases', () => {
    it('detects repeated 3-grams', () => {
      const text = 'The quick brown fox jumps over the lazy dog. The quick brown fox is fast.';
      const findings = findRepeatedPhrases(text);
      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].category).toBe('repetition');
      expect(findings[0].evidence.some(e => e.includes('The quick brown'))).toBe(true);
    });

    it('detects repeated 2-grams', () => {
      const text = 'In conclusion, the data shows. In conclusion, we agree.';
      const findings = findRepeatedPhrases(text);
      expect(findings.some(f => f.evidence.some(e => e.includes('In conclusion')))).toBe(true);
    });

    it('returns empty for unique text', () => {
      const text = 'Every sentence here is completely different and unique.';
      const findings = findRepeatedPhrases(text);
      expect(findings.length).toBe(0);
    });

    it('handles empty text', () => {
      const findings = findRepeatedPhrases('');
      expect(findings.length).toBe(0);
    });
  });

  describe('findFormulaicPhrases', () => {
    it('detects common LLM openers', () => {
      const text = 'In today\'s world, technology is important. Furthermore, it changes rapidly.';
      const findings = findFormulaicPhrases(text);
      expect(findings.some(f => f.evidence.some(e => e.includes('In today\'s world')))).toBe(true);
      expect(findings.some(f => f.evidence.some(e => e.includes('Furthermore')))).toBe(true);
    });

    it('detects "It is important to note"', () => {
      const text = 'It is important to note that the results vary.';
      const findings = findFormulaicPhrases(text);
      expect(findings.some(f => f.evidence.some(e => e.includes('It is important to note')))).toBe(true);
    });

    it('detects "crucial role" pattern', () => {
      const text = 'AI plays a crucial role in modern society.';
      const findings = findFormulaicPhrases(text);
      expect(findings.some(f => f.evidence.some(e => e.includes('plays a crucial role')))).toBe(true);
    });

    it('returns empty for natural writing', () => {
      const text = 'The cat sat on the mat and purred loudly.';
      const findings = findFormulaicPhrases(text);
      expect(findings.length).toBe(0);
    });
  });

  describe('findOverusedTransitions', () => {
    it('detects multiple transition words', () => {
      const text = 'First, we start. However, there is a problem. Therefore, we fix it. Moreover, we test.';
      const findings = findOverusedTransitions(text);
      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].category).toBe('transition');
    });

    it('flags 4+ transitions as high severity', () => {
      const text = 'First, however, therefore, moreover, additionally, consequently.';
      const findings = findOverusedTransitions(text);
      expect(findings.some(f => f.severity === 'high')).toBe(true);
    });

    it('returns empty for few transitions', () => {
      const text = 'The cat sat. However, it left.';
      const findings = findOverusedTransitions(text);
      expect(findings.length).toBe(0);
    });
  });

  describe('findRepetitiveSentenceOpenings', () => {
    it('detects repeated sentence starters', () => {
      const text = 'The cat runs. The cat jumps. The cat sleeps.';
      const findings = findRepetitiveSentenceOpenings(text);
      expect(findings.some(f => f.evidence.some(e => e.includes('The cat')))).toBe(true);
    });

    it('detects "This is" pattern', () => {
      const text = 'This is a test. This is another test. This is the end.';
      const findings = findRepetitiveSentenceOpenings(text);
      expect(findings.some(f => f.evidence.some(e => e.includes('This is')))).toBe(true);
    });

    it('returns empty for varied openings', () => {
      const text = 'First, we begin. Next comes the middle. Finally, we end.';
      const findings = findRepetitiveSentenceOpenings(text);
      expect(findings.length).toBe(0);
    });
  });

  describe('analyzeSentenceLengthVariation', () => {
    it('flags low variation (uniform length)', () => {
      const text = 'The cat runs. The dog barks. The bird flies. The fish swims.';
      const findings = analyzeSentenceLengthVariation(text);
      expect(findings.length).toBeGreaterThan(0);
      expect(findings[0].category).toBe('sentence');
    });

    it('returns empty for varied lengths', () => {
      const text = 'Short. This is a medium length sentence with more words. And this one is very long indeed with many words added to make it much longer than the others.';
      const findings = analyzeSentenceLengthVariation(text);
      expect(findings.length).toBe(0);
    });

    it('handles single sentence', () => {
      const text = 'Only one sentence here.';
      const findings = analyzeSentenceLengthVariation(text);
      expect(findings.length).toBe(0);
    });
  });

  describe('findFormulaicSentenceStarts', () => {
    it('detects "Based on" pattern', () => {
      const text = 'Based on the data, we conclude. Based on the results, we decide.';
      const findings = findFormulaicSentenceStarts(text);
      expect(findings.some(f => f.evidence.some(e => e.includes('Based on')))).toBe(true);
    });

    it('detects "It is" pattern', () => {
      const text = 'It is clear that this works. It is obvious that we need more.';
      const findings = findFormulaicSentenceStarts(text);
      expect(findings.some(f => f.evidence.some(e => e.includes('It is')))).toBe(true);
    });
  });

  describe('computeSummary', () => {
    it('computes correct summary stats', () => {
      const text = 'The cat runs. The dog barks. The bird flies.';
      const summary = computeSummary(text);
      expect(summary.wordCount).toBe(9);
      expect(summary.sentenceCount).toBe(3);
      expect(summary.avgWordsPerSentence).toBe(3);
    });

    it('handles empty text', () => {
      const summary = computeSummary('');
      expect(summary.wordCount).toBe(0);
      expect(summary.sentenceCount).toBe(0);
      expect(summary.avgWordsPerSentence).toBe(0);
    });
  });

  describe('analyzeText (integration)', () => {
    it('returns complete analysis result', () => {
      const text = 'In today\'s world, AI plays a crucial role. Furthermore, it is important to note that AI changes rapidly. However, we must be careful. Therefore, regulation is needed.';
      const result = analyzeText(text);

      expect(result.findings).toBeDefined();
      expect(result.summary).toBeDefined();
      expect(result.summary.wordCount).toBeGreaterThan(0);
      expect(result.summary.sentenceCount).toBeGreaterThan(0);
    });

    it('includes multiple finding categories', () => {
      const text = 'The quick brown fox jumps. The quick brown fox runs. In today\'s world, technology matters. Furthermore, it evolves. However, we adapt. Therefore, we learn.';
      const result = analyzeText(text);

      const categories = new Set(result.findings.map(f => f.category));
      expect(categories.size).toBeGreaterThan(1);
    });

    it('assigns severity levels', () => {
      const text = 'First, second, third, fourth, fifth, sixth, seventh, eighth, ninth, tenth.';
      const result = analyzeText(text);

      const severities = new Set(result.findings.map(f => f.severity));
      expect(severities.size).toBeGreaterThan(0);
    });
  });
});