"use client";

import { cn } from '../../lib/utils';
import type { Finding } from '../../lib/types';

interface SummaryBarProps {
  findings: Finding[];
}

const SEVERITY_ORDER: Finding['severity'][] = ['high', 'medium', 'low'];

const SEVERITY_LABELS: Record<Finding['severity'], string> = {
  high: 'Critical',
  medium: 'Major',
  low: 'Minor',
};

const SEVERITY_COLORS: Record<Finding['severity'], { bg: string; text: string; border: string }> = {
  high: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800' },
  medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-800' },
  low: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800' },
};

const SEVERITY_ICONS: Record<Finding['severity'], React.ReactNode> = {
  high: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  medium: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  low: (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export function SummaryBar({ findings }: SummaryBarProps) {
  if (findings.length === 0) {
    return null;
  }

  const counts = SEVERITY_ORDER.reduce((acc, severity) => {
    acc[severity] = findings.filter(f => f.severity === severity).length;
    return acc;
  }, {} as Record<Finding['severity'], number>);

  const total = findings.length;

  return (
    <div className="mb-4 p-4 rounded-xl bg-card border border-border" role="region" aria-label="Analysis summary">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-foreground">Summary</h3>
        <span className={cn('px-3 py-1 text-sm font-medium rounded-full', total > 0 ? 'bg-primary/10 text-primary' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400')}>
          {total} finding{total !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        {SEVERITY_ORDER.map(severity => {
          const count = counts[severity];
          if (count === 0) return null;

          const colors = SEVERITY_COLORS[severity];
          const icon = SEVERITY_ICONS[severity];
          const label = SEVERITY_LABELS[severity];

          return (
            <span
              key={severity}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium',
                colors.bg,
                colors.text,
                colors.border
              )}
            >
              {icon}
              <span>{label}</span>
              <span className={cn('px-2 py-0.5 text-xs font-mono rounded-full bg-background/50')}>{count}</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}