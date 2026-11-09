/**
 * Readability metrics for text analysis
 * All functions are pure and have no side effects
 */

export interface ReadabilityMetrics {
  fleschKincaidGrade: number;
  fleschReadingEase: number;
  gunningFog: number;
  automatedReadabilityIndex: number;
  colemanLiauIndex: number;
  smogIndex: number;
  readingTimeMinutes: number;
  wordCount: number;
  sentenceCount: number;
  syllableCount: number;
  characterCount: number;
  characterCountNoSpaces: number;
}

function countWords(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

function countSentences(text: string): number {
  if (!text.trim()) return 0;
  const sentences = text.match(/[.!?]+(?:\s|$)/g);
  return sentences ? sentences.length : 1;
}

function countSyllables(text: string): number {
  const words = text.toLowerCase().match(/\b\w+\b/g);
  if (!words) return 0;

  let total = 0;
  for (const word of words) {
    const vowelGroups = word.match(/[aeiouy]+/g);
    let count = vowelGroups ? vowelGroups.length : 1;
    if (word.endsWith('e') && count > 1) count--;
    total += Math.max(1, count);
  }
  return total;
}

function countCharacters(text: string): number {
  return text.length;
}

function countCharactersNoSpaces(text: string): number {
  return text.replace(/\s/g, '').length;
}

export function analyzeReadability(text: string): ReadabilityMetrics {
  const words = countWords(text);
  const sentences = countSentences(text);
  const syllables = countSyllables(text);
  const characters = countCharacters(text);
  const charactersNoSpaces = countCharactersNoSpaces(text);

  if (words === 0 || sentences === 0) {
    return {
      fleschKincaidGrade: 0,
      fleschReadingEase: 0,
      gunningFog: 0,
      automatedReadabilityIndex: 0,
      colemanLiauIndex: 0,
      smogIndex: 0,
      readingTimeMinutes: 0,
      wordCount: 0,
      sentenceCount: 0,
      syllableCount: 0,
      characterCount: 0,
      characterCountNoSpaces: 0,
    };
  }

  const wordsPerSentence = words / sentences;
  const syllablesPerWord = syllables / words;
  const charactersPerWord = characters / words;

  // Flesch-Kincaid Grade Level
  const fleschKincaidGrade = 0.39 * wordsPerSentence + 11.8 * syllablesPerWord - 15.59;

  // Flesch Reading Ease (0-100, higher = easier)
  const fleschReadingEase = 206.835 - 1.015 * wordsPerSentence - 84.6 * syllablesPerWord;

  // Gunning Fog Index
  const complexWords = text.toLowerCase().match(/\b\w{7,}\b/g)?.length || 0;
  const gunningFog = 0.4 * (wordsPerSentence + 100 * (complexWords / words));

  // Automated Readability Index
  const automatedReadabilityIndex = 4.71 * charactersPerWord + 0.5 * wordsPerSentence - 21.43;

  // Coleman-Liau Index
  const lettersPer100Words = (charactersNoSpaces / words) * 100;
  const sentencesPer100Words = (sentences / words) * 100;
  const colemanLiauIndex = 0.0588 * lettersPer100Words - 0.296 * sentencesPer100Words - 15.8;

  // SMOG Index (requires 30+ sentences for accuracy, but we'll compute anyway)
  const smogIndex = 1.043 * Math.sqrt(complexWords * (30 / sentences)) + 3.1291;

  // Reading time (200 words per minute average)
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));

  return {
    fleschKincaidGrade: Math.max(0, Math.round(fleschKincaidGrade * 10) / 10),
    fleschReadingEase: Math.max(0, Math.min(100, Math.round(fleschReadingEase * 10) / 10)),
    gunningFog: Math.max(0, Math.round(gunningFog * 10) / 10),
    automatedReadabilityIndex: Math.max(0, Math.round(automatedReadabilityIndex * 10) / 10),
    colemanLiauIndex: Math.max(0, Math.round(colemanLiauIndex * 10) / 10),
    smogIndex: Math.max(0, Math.round(smogIndex * 10) / 10),
    readingTimeMinutes,
    wordCount: words,
    sentenceCount: sentences,
    syllableCount: syllables,
    characterCount: characters,
    characterCountNoSpaces: charactersNoSpaces,
  };
}

// Convenience functions for individual metrics
export function fleschKincaidGrade(text: string): number {
  return analyzeReadability(text).fleschKincaidGrade;
}

export function fleschReadingEase(text: string): number {
  return analyzeReadability(text).fleschReadingEase;
}

export function gunningFog(text: string): number {
  return analyzeReadability(text).gunningFog;
}

export function readingTimeMinutes(text: string): number {
  return analyzeReadability(text).readingTimeMinutes;
}