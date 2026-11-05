"use client";

import { motion, AnimatePresence } from 'motion/react';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '../../lib/utils';
import type { Finding, InterpretationResponse } from '../../lib/types';

interface FindingCardProps {
  finding: Finding;
  index: number;
}

const CATEGORY_ICONS: Record<Finding['category'], React.ReactNode> = {
  repetition: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
  formulaic: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  sentence: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  transition: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  vocabulary: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
};

const SEVERITY_COLORS: Record<Finding['severity'], string> = {
  high: 'border-l-red-500 bg-red-50 dark:bg-red-950/20',
  medium: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950/20',
  low: 'border-l-blue-500 bg-blue-50 dark:bg-blue-950/20',
};

function FindingCard({ finding, index }: FindingCardProps) {
  const icon = CATEGORY_ICONS[finding.category];
  const severityClass = SEVERITY_COLORS[finding.severity];

  return (
    <motion.div
      key={finding.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'p-4 rounded-xl border-l-4 transition-all',
        severityClass,
        'hover:shadow-md'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-medium text-foreground">
              {finding.title}
            </h4>
            <span
              className={cn(
                'px-2 py-0.5 text-xs font-medium rounded-full',
                finding.severity === 'high' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                finding.severity === 'medium' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                finding.severity === 'low' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
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
            <AnimatePresence mode="wait">
              <motion.div
                key="evidence"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-3"
              >
                <div className="space-y-1.5">
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
              </motion.div>
            </AnimatePresence>
          )}

          {finding.suggestion && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 p-3 rounded-lg bg-primary/5 border border-primary/10"
            >
              <div className="flex items-center gap-1.5 text-sm font-medium text-primary mb-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Suggestion
              </div>
              <p className="text-sm text-muted-foreground">{finding.suggestion}</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface AnalysisPanelProps {
  findings: Finding[];
  interpretation?: InterpretationResponse;
  isAnalyzing: boolean;
}

export function AnalysisPanel({ findings, interpretation, isAnalyzing }: AnalysisPanelProps) {
  if (!findings.length && !interpretation && !isAnalyzing) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-full py-12 text-center"
      >
        <svg
          className="w-16 h-16 text-muted-foreground/30 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
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
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {interpretation && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 rounded-xl bg-primary/5 border border-primary/10"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-primary mb-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-1 space-y-3">
          {isAnalyzing ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-center h-64"
              role="status"
              aria-live="polite"
            >
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <motion.div
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="w-8 h-8 border-3 border-current border-t-transparent rounded-full"
                />
                <span className="text-sm">Analyzing with Pollinations...</span>
              </div>
            </motion.div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={findings.length}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {findings.map((finding, index) => (
                  <FindingCard key={finding.id} finding={finding} index={index} />
                ))}
                {findings.length === 0 && !isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-8 text-muted-foreground"
                    data-testid="no-issues-state"
                  >
                    <svg
                      className="w-12 h-12 mx-auto mb-3 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
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
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}