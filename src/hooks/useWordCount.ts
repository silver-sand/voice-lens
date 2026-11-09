import { useMemo } from "react";

export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readability: number; // Flesch-Kincaid grade level
  readingTime: number; // minutes
}

function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

function countSentences(text: string): number {
  if (!text.trim()) return 0;
  // Simple sentence detection: periods, exclamation marks, question marks followed by space or end
  const sentences = text.match(/[.!?]+(?:\s|$)/g);
  return sentences ? sentences.length : 1;
}

function countParagraphs(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\n\s*\n/).length;
}

function fleschKincaidGrade(text: string): number {
  const words = countWords(text);
  const sentences = countSentences(text);
  const syllables = estimateSyllables(text);

  if (words === 0 || sentences === 0) return 0;

  // Flesch-Kincaid Grade Level = 0.39 * (words/sentences) + 11.8 * (syllables/words) - 15.59
  const grade = 0.39 * (words / sentences) + 11.8 * (syllables / words) - 15.59;
  return Math.max(0, Math.round(grade * 10) / 10);
}

function estimateSyllables(text: string): number {
  // Simple syllable estimation: count vowel groups
  const words = text.toLowerCase().match(/\b\w+\b/g);
  if (!words) return 0;

  let total = 0;
  for (const word of words) {
    // Count vowel groups (a, e, i, o, u, y)
    const vowelGroups = word.match(/[aeiouy]+/g);
    let count = vowelGroups ? vowelGroups.length : 1;
    // Subtract 1 for silent 'e' at end
    if (word.endsWith('e') && count > 1) count--;
    total += Math.max(1, count);
  }
  return total;
}

function readingTime(text: string): number {
  // Average reading speed: 200 words per minute
  const words = countWords(text);
  return Math.max(1, Math.ceil(words / 200));
}

export function useWordCount(text: string): TextStats {
  return useMemo(() => ({
    words: countWords(text),
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    sentences: countSentences(text),
    paragraphs: countParagraphs(text),
    readability: fleschKincaidGrade(text),
    readingTime: readingTime(text),
  }), [text]);
}