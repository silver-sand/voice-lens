import type { Finding } from '../lib/types';

export const HIGHLIGHT_CLASS_MAP: Record<Finding['category'], string> = {
  repetition: 'highlight-repetition',
  formulaic: 'highlight-formulaic',
  sentence: 'highlight-sentence',
  transition: 'highlight-transition',
  vocabulary: 'highlight-vocabulary',
  passive: 'highlight-passive',
  hedging: 'highlight-hedging',
};

export function getHighlightClass(category: Finding['category']): string {
  return HIGHLIGHT_CLASS_MAP[category] || '';
}

export interface HighlightSegment {
  text: string;
  className: string;
}

/**
 * Build highlighted text segments from findings using a more robust algorithm.
 * Uses a position-based approach to handle overlapping findings correctly.
 */
export function buildHighlightedSegments(text: string, findings: Finding[]): HighlightSegment[] {
  if (!text || findings.length === 0) return [{ text, className: '' }];

  // Build a map of character positions to their highlight class
  // This handles overlaps by prioritizing the first finding that claims a position
  const positionToClass = new Map<number, string>();

  // Sort findings by position in text (earliest first)
  const sortedFindings = [...findings].sort((a, b) => {
    const aPos = findFirstMatchPosition(text, a.evidence[0] || '');
    const bPos = findFirstMatchPosition(text, b.evidence[0] || '');
    return aPos - bPos;
  });

  for (const finding of sortedFindings) {
    for (const evidence of finding.evidence) {
      const cleanEvidence = evidence.replace(/^\.\.\./, '').replace(/\.\.\.$/, '').trim();
      if (!cleanEvidence) continue;

      let searchIndex = 0;
      while (true) {
        const index = text.toLowerCase().indexOf(cleanEvidence.toLowerCase(), searchIndex);
        if (index === -1) break;

        // Mark positions that aren't already highlighted
        for (let i = index; i < index + cleanEvidence.length; i++) {
          if (!positionToClass.has(i)) {
            positionToClass.set(i, getHighlightClass(finding.category));
          }
        }

        searchIndex = index + 1;
      }
    }
  }

  // Build segments from the position map
  const segments: HighlightSegment[] = [];
  let currentClass = '';
  let currentText = '';

  for (let i = 0; i < text.length; i++) {
    const charClass = positionToClass.get(i) || '';
    const char = text[i];

    if (charClass !== currentClass) {
      // Flush current segment
      if (currentText.length > 0) {
        segments.push({ text: currentText, className: currentClass });
      }
      currentClass = charClass;
      currentText = char;
    } else {
      currentText += char;
    }
  }

  // Flush final segment
  if (currentText.length > 0) {
    segments.push({ text: currentText, className: currentClass });
  }

  // Merge adjacent segments with the same class
  const mergedSegments: HighlightSegment[] = [];
  for (const segment of segments) {
    const last = mergedSegments[mergedSegments.length - 1];
    if (last && last.className === segment.className) {
      last.text += segment.text;
    } else {
      mergedSegments.push({ ...segment });
    }
  }

  return mergedSegments.length > 0 ? mergedSegments : [{ text, className: '' }];
}

/**
 * Find the first position of evidence in text (case-insensitive)
 */
function findFirstMatchPosition(text: string, evidence: string): number {
  const cleanEvidence = evidence.replace(/^\.\.\./, '').replace(/\.\.\.$/, '').trim();
  if (!cleanEvidence) return Infinity;
  return text.toLowerCase().indexOf(cleanEvidence.toLowerCase());
}