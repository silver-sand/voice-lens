"use client";

import { useState } from 'react';
import { cn } from '../../lib/utils';
import type { Finding } from '../../lib/types';

interface FindingCardProps {
  finding: Finding;
  index: number;
}

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

const SEVERITY_COLORS: Record<Finding['severity'], string> = {
  high: 'border-l-red-500 bg-red-50 dark:bg-red-950/20',
  medium: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
  low: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20',
};

const SEVERITY_BADGE_COLORS: Record<Finding['severity'], string> = {
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
};

const SUGGESTION_ICON = (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
  </svg>
);

export function FindingCard({ finding, index }: FindingCardProps) {
  const icon = CATEGORY_ICONS[finding.category];
  const severityClass = SEVERITY_COLORS[finding.severity];
  const badgeClass = SEVERITY_BADGE_COLORS[finding.severity];
  const [showEvidence, setShowEvidence] = useState(true);

  // Stagger delay via inline style
  const staggerDelay = index * 50;

  return (
    <article
      key={finding.id}
      className={cn(
        'p-4 rounded-xl border-l-4 transition-all animate-slide-up',
        severityClass,
        'hover:shadow-md'
      )}
      role="listitem"
      style={{ animationDelay: `${staggerDelay}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5 text-muted-foreground" aria-hidden="true">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-foreground">
              {finding.title}
            </h4>
            <span
              className={cn(
                'px-2 py-0.5 text-xs font-medium rounded-full',
                badgeClass
              )}
            >
              {finding.severity}
            </span>
            <span className="text-xs text-muted-foreground uppercase">
              {finding.category}
            </span>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{finding.description}</p>

          {finding.evidence.length > 0 && (
            <div className="mt-3">
              <button
                type="button"
                onClick={() => setShowEvidence(!showEvidence)}
                className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-2"
                aria-expanded={showEvidence}
              >
                <svg
                  className={cn('w-4 h-4 transition-transform', showEvidence ? 'rotate-180' : '')}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
                <span>Evidence ({finding.evidence.length})</span>
              </button>
              <div
                className={cn(
                  'space-y-1.5 overflow-hidden transition-all duration-300 ease-out',
                  showEvidence ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                )}
                style={{ transitionDelay: '50ms' }}
              >
                {finding.evidence.slice(0, 3).map((evidence, i) => (
                  <div
                    key={i}
                    className="text-sm font-mono text-muted-foreground/80 bg-muted/50 p-2 rounded-md border border-border/50"
                  >
                    {evidence}
                  </div>
                ))}
                {finding.evidence.length > 3 && (
                  <div className="text-xs text-muted-foreground italic">
                    +{finding.evidence.length - 3} more occurrence{finding.evidence.length - 3 !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          )}

          {finding.suggestion && (
            <div className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10 animate-fade-in" style={{ animationDelay: `${staggerDelay + 100}ms` }}>
              <div className="flex items-center gap-1.5 text-sm font-medium text-primary mb-1">
                {SUGGESTION_ICON}
                <span>Suggestion</span>
              </div>
              <p className="text-sm text-muted-foreground">{finding.suggestion}</p>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}