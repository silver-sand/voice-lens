"use client";

import { cn } from '../../lib/utils';
import type { Finding } from '../../lib/types';
import { buildHighlightedSegments } from '../../lib/highlighting';

interface HighlightedTextProps {
  text: string;
  findings: Finding[];
}

const CATEGORY_COLORS_HEX: Record<Finding['category'], string> = {
  repetition: '#eab308',
  formulaic: '#ef4444',
  sentence: '#6366f1',
  transition: '#a855f7',
  vocabulary: '#14b8a6',
  passive: '#f97316',
  hedging: '#06b6d4',
};

export function HighlightedText({ text, findings }: HighlightedTextProps) {
  if (!text || findings.length === 0) {
    return (
      <pre className="whitespace-pre-wrap break-words font-serif text-base leading-relaxed text-foreground">
        {text}
      </pre>
    );
  }

  // Use shared highlighting logic
  const segments = buildHighlightedSegments(text, findings);

  return (
    <div className="whitespace-pre-wrap break-words font-serif text-base leading-relaxed">
      {segments.map((segment, i) => {
        // Extract category from className (e.g., "highlight-repetition" -> "repetition")
        const category = segment.className.replace('highlight-', '') as Finding['category'];
        const hexColor = CATEGORY_COLORS_HEX[category];
        const colorClass = segment.className
          ? `bg-[${hexColor}]/20 border-b-2 border-[${hexColor}]/30`
          : '';
        return (
          <span
            key={i}
            className={cn(
              colorClass,
              'rounded-[2px] px-[1px] -ml-[1px]',
              segment.className ? 'border-current' : 'border-transparent'
            )}
          >
            {segment.text}
          </span>
        );
      })}
    </div>
  );
}