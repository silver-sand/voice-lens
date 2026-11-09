"use client";

import { useMemo } from "react";

interface WordCountProps {
  text: string;
  className?: string;
}

interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  readingTime: number;
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

function countParagraphs(text: string): number {
  if (!text.trim()) return 0;
  return text.trim().split(/\n\s*\n/).length;
}

function readingTime(text: string): number {
  const words = countWords(text);
  return Math.max(1, Math.ceil(words / 200));
}

function computeStats(text: string): TextStats {
  return {
    words: countWords(text),
    characters: text.length,
    charactersNoSpaces: text.replace(/\s/g, '').length,
    sentences: countSentences(text),
    paragraphs: countParagraphs(text),
    readingTime: readingTime(text),
  };
}

export function WordCount({ text, className = "" }: WordCountProps) {
  const stats = useMemo(() => computeStats(text), [text]);

  if (!text.trim()) {
    return (
      <div className={`flex items-center gap-4 text-xs text-muted-foreground font-mono ${className}`}>
        <span>0 words</span>
        <span>0 chars</span>
        <span>0 sentences</span>
        <span>~1 min read</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 text-xs text-muted-foreground font-mono ${className}`}>
      <span>{stats.words} word{stats.words !== 1 ? "s" : ""}</span>
      <span>{stats.characters} chars</span>
      <span>{stats.sentences} sentence{stats.sentences !== 1 ? "s" : ""}</span>
      <span>~{stats.readingTime} min read</span>
    </div>
  );
}