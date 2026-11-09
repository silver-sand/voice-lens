"use client";

import { useMemo } from "react";

interface ReadabilityScoreProps {
  text: string;
  className?: string;
}

interface ReadabilityMetrics {
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

function computeReadability(text: string): ReadabilityMetrics {
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

  // SMOG Index
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

function getEaseLabel(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "Very Easy", color: "text-green-600 dark:text-green-400" };
  if (score >= 80) return { label: "Easy", color: "text-green-500 dark:text-green-400" };
  if (score >= 70) return { label: "Fairly Easy", color: "text-emerald-600 dark:text-emerald-400" };
  if (score >= 60) return { label: "Standard", color: "text-primary dark:text-primary" };
  if (score >= 50) return { label: "Fairly Difficult", color: "text-amber-600 dark:text-amber-400" };
  if (score >= 30) return { label: "Difficult", color: "text-orange-600 dark:text-orange-400" };
  return { label: "Very Difficult", color: "text-destructive dark:text-destructive" };
}

function getGradeLabel(grade: number): { label: string; color: string } {
  if (grade <= 6) return { label: "Elementary", color: "text-green-600 dark:text-green-400" };
  if (grade <= 9) return { label: "Middle School", color: "text-emerald-600 dark:text-emerald-400" };
  if (grade <= 12) return { label: "High School", color: "text-primary dark:text-primary" };
  if (grade <= 14) return { label: "College", color: "text-amber-600 dark:text-amber-400" };
  if (grade <= 16) return { label: "University", color: "text-orange-600 dark:text-orange-400" };
  return { label: "Graduate", color: "text-destructive dark:text-destructive" };
}

export function ReadabilityScore({ text, className = "" }: ReadabilityScoreProps) {
  const metrics = useMemo(() => computeReadability(text), [text]);
  const ease = getEaseLabel(metrics.fleschReadingEase);
  const grade = getGradeLabel(metrics.fleschKincaidGrade);

  if (!text.trim()) {
    return (
      <div className={`flex items-center gap-3 text-sm ${className}`}>
        <div className="flex items-center gap-1.5">
          <span className="font-display text-xl font-semibold text-muted-foreground">—</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Reading Ease</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-display text-xl font-semibold text-muted-foreground">—</span>
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Grade Level</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 text-sm ${className}`}>
      <div className="flex items-center gap-1.5">
        <span className={`font-display text-xl font-semibold ${ease.color}`}>{metrics.fleschReadingEase}</span>
        <span className={`text-xs ${ease.color} uppercase tracking-wider`}>{ease.label}</span>
      </div>
      <div className="w-px h-6 bg-border" aria-hidden="true" />
      <div className="flex items-center gap-1.5">
        <span className={`font-display text-xl font-semibold ${grade.color}`}>{metrics.fleschKincaidGrade}</span>
        <span className={`text-xs ${grade.color} uppercase tracking-wider`}>{grade.label}</span>
      </div>
    </div>
  );
}