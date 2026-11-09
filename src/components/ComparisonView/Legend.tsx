"use client";

import type { Finding } from '../../lib/types';

const CATEGORY_COLORS_HEX: Record<Finding['category'], string> = {
  repetition: '#eab308',
  formulaic: '#ef4444',
  sentence: '#6366f1',
  transition: '#a855f7',
  vocabulary: '#14b8a6',
  passive: '#f97316',
  hedging: '#06b6d4',
};

const CATEGORY_LABELS: Record<Finding['category'], string> = {
  repetition: 'Repetition',
  formulaic: 'Formulaic',
  sentence: 'Structure',
  transition: 'Transitions',
  vocabulary: 'Vocabulary',
  passive: 'Passive',
  hedging: 'Hedging',
};

interface LegendProps {
  categories?: Finding['category'][];
}

export function Legend({ categories }: LegendProps = {}) {
  const defaultCategories: Finding['category'][] = [
    'repetition',
    'formulaic',
    'sentence',
    'transition',
    'vocabulary',
    'passive',
    'hedging',
  ];

  const displayCategories = categories ?? defaultCategories;

  return (
    <div className="flex flex-wrap items-center gap-2.5 text-xs" role="list" aria-label="Highlight categories">
      {displayCategories.map((key) => (
        <span
          key={key}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-[${CATEGORY_COLORS_HEX[key]}]/15 border-[${CATEGORY_COLORS_HEX[key]}]/30`}
          role="listitem"
        >
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: CATEGORY_COLORS_HEX[key] }}
            aria-hidden="true"
          />
          {CATEGORY_LABELS[key]}
        </span>
      ))}
    </div>
  );
}