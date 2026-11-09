"use client";

import { useState, useEffect } from 'react';
import { ScrollArea } from '../ui/scroll-area';
import type { Finding, InterpretationResponse } from '../../lib/types';
import { SummaryBar } from './SummaryBar';
import { FindingGroup } from './FindingGroup';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { cn } from '../../lib/utils';

const CATEGORY_ORDER: Finding['category'][] = [
  'repetition',
  'formulaic',
  'sentence',
  'transition',
  'vocabulary',
  'passive',
  'hedging',
];

interface AnalysisPanelProps {
  findings: Finding[];
  interpretation?: InterpretationResponse;
  isAnalyzing: boolean;
}

export function AnalysisPanel({ findings, interpretation, isAnalyzing }: AnalysisPanelProps) {
  const reducedMotion = useReducedMotion();
  const [showFindings, setShowFindings] = useState(true);

  // Group findings by category
  const findingsByCategory = CATEGORY_ORDER.reduce((acc, category) => {
    const categoryFindings = findings.filter(f => f.category === category);
    if (categoryFindings.length > 0) {
      acc[category] = categoryFindings;
    }
    return acc;
  }, {} as Record<Finding['category'], Finding[]>);

  const categoriesWithFindings = CATEGORY_ORDER.filter(cat => findingsByCategory[cat]?.length > 0);

  // Sync showFindings with findings.length changes for exit animation
  useEffect(() => {
    setShowFindings(true);
  }, [findings.length]);

  if (!findings.length && !interpretation && !isAnalyzing) {
    return (
      <div className={cn('flex flex-col items-center justify-center h-full py-12 text-center', !reducedMotion && 'animate-fade-in')}>
        <svg
          className="w-16 h-16 text-muted-foreground/30 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="text-lg font-medium text-foreground mb-1">No analysis yet</h3>
        <p className="text-muted-foreground">
          Write some text and click "Analyze Style" to see findings here.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {interpretation && (
        <div className={cn(
          'mb-4 p-4 rounded-xl bg-primary/5 border border-primary/10',
          !reducedMotion && 'animate-slide-down'
        )}>
          <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>AI Interpretation</span>
          </div>
          <p className="text-sm text-muted-foreground mb-3">{interpretation.explanation}</p>

          {interpretation.keyInsights.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Key Insights</p>
              <ul className="space-y-1">
                {interpretation.keyInsights.map((insight, i) => (
                  <li
                    key={i}
                    className="text-sm text-muted-foreground flex items-start gap-2"
                  >
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-1.5" aria-hidden="true" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-1 space-y-3">
          {isAnalyzing ? (
            <div
              className={cn(
                'flex items-center justify-center h-64',
                !reducedMotion && 'animate-fade-in'
              )}
              role="status"
              aria-live="polite"
            >
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <div
                  className={cn(
                    'w-8 h-8 border-3 border-current border-t-transparent rounded-full',
                    !reducedMotion && 'animate-spin'
                  )}
                  aria-hidden="true"
                />
                <span className="text-sm">Analyzing with Pollinations...</span>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                'overflow-hidden transition-all duration-300 ease-out',
                showFindings
                  ? 'animate-height-expand opacity-100'
                  : 'animate-height-collapse opacity-0'
              )}
              style={{ transitionDelay: '0ms' }}
            >
              <SummaryBar findings={findings} />

              {categoriesWithFindings.length > 0 ? (
                <div className="space-y-4" role="list" aria-label="Findings by category">
                  {categoriesWithFindings.map((category) => {
                    const categoryFindings = findingsByCategory[category];
                    // Calculate base index for animation staggering
                    const baseIndex = CATEGORY_ORDER
                      .slice(0, CATEGORY_ORDER.indexOf(category))
                      .reduce((sum, cat) => sum + (findingsByCategory[cat]?.length || 0), 0);

                    return (
                      <FindingGroup
                        key={category}
                        category={category}
                        findings={categoryFindings}
                        baseIndex={baseIndex}
                      />
                    );
                  })}
                </div>
              ) : (
                findings.length === 0 && !isAnalyzing && (
                  <div
                    className={cn(
                      'text-center py-8 text-muted-foreground',
                      !reducedMotion && 'animate-slide-up'
                    )}
                    data-testid="no-issues-state"
                  >
                    <svg
                      className="w-12 h-12 mx-auto mb-3 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="font-medium">No style issues detected</p>
                    <p className="text-sm mt-1">Your writing looks clean and varied.</p>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}