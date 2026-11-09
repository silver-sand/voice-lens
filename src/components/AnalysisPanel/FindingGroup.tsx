"use client";

import { cn } from '../../lib/utils';
import type { Finding } from '../../lib/types';
import { FindingCard } from './FindingCard';

interface FindingGroupProps {
  category: Finding['category'];
  findings: Finding[];
  baseIndex: number;
}

const CATEGORY_LABELS: Record<Finding['category'], string> = {
  repetition: 'Repetition',
  formulaic: 'Formulaic Phrases',
  sentence: 'Sentence Structure',
  transition: 'Transitions',
  vocabulary: 'Vocabulary',
  passive: 'Passive Voice',
  hedging: 'Hedging Language',
};

const CATEGORY_ICONS: Record<Finding['category'], React.ReactNode> = {
  repetition: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  formulaic: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  sentence: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  transition: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  vocabulary: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  passive: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9" />
    </svg>
  ),
  hedging: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
};

export function FindingGroup({ category, findings, baseIndex }: FindingGroupProps) {
  if (findings.length === 0) return null;

  const icon = CATEGORY_ICONS[category];
  const label = CATEGORY_LABELS[category];

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground uppercase tracking-wider pb-2 border-b border-border">
        <div className="flex-shrink-0 text-primary">{icon}</div>
        <span>{label}</span>
        <span className={cn('px-2 py-0.5 text-xs font-mono rounded-full bg-primary/10 text-primary')}>
          {findings.length}
        </span>
      </div>
      <div className="space-y-3" role="list" aria-label={`${label} findings`}>
        {findings.map((finding, index) => (
          <FindingCard key={finding.id} finding={finding} index={baseIndex + index} />
        ))}
      </div>
    </div>
  );
}