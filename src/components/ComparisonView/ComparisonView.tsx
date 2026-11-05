"use client";

import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import type { Finding } from '../../lib/types';

interface ComparisonViewProps {
  originalText: string;
  rewrittenText: string | undefined;
  findings: Finding[];
  onCopyRewrite: () => void;
  onExport: () => void;
  hasRewrite: boolean;
}

const CATEGORY_COLORS: Record<Finding['category'], string> = {
  repetition: 'bg-yellow-500/20 border-yellow-500/30',
  formulaic: 'bg-red-500/20 border-red-500/30',
  sentence: 'bg-indigo-500/20 border-indigo-500/30',
  transition: 'bg-purple-500/20 border-purple-500/30',
  vocabulary: 'bg-teal-500/20 border-teal-500/30',
};

function HighlightedText({ text, findings }: { text: string; findings: Finding[] }) {
  if (!text || findings.length === 0) {
    return (
      <pre className="whitespace-pre-wrap break-words font-serif text-base leading-relaxed text-foreground">
        {text}
      </pre>
    );
  }

  // Build highlighted segments
  const segments: { text: string; className: string }[] = [];
  let lastIndex = 0;
  const sortedFindings = [...findings].sort((a, b) => {
    const aPos = text.toLowerCase().indexOf(a.evidence[0]?.toLowerCase() || '');
    const bPos = text.toLowerCase().indexOf(b.evidence[0]?.toLowerCase() || '');
    return aPos - bPos;
  });

  for (const finding of sortedFindings) {
    for (const evidence of finding.evidence) {
      const cleanEvidence = evidence.replace(/^\.\.\./, '').replace(/\.\.\.$/, '').trim();
      const index = text.toLowerCase().indexOf(cleanEvidence.toLowerCase(), lastIndex);
      if (index >= 0 && index >= lastIndex) {
        if (index > lastIndex) {
          segments.push({ text: text.slice(lastIndex, index), className: '' });
        }
        segments.push({
          text: text.slice(index, index + cleanEvidence.length),
          className: CATEGORY_COLORS[finding.category] || '',
        });
        lastIndex = index + cleanEvidence.length;
      }
    }
  }

  if (lastIndex < text.length) {
    segments.push({ text: text.slice(lastIndex), className: '' });
  }

  return (
    <div className="whitespace-pre-wrap break-words font-serif text-base leading-relaxed">
      {segments.map((segment, i) => (
        <span
          key={i}
          className={cn(
            segment.className,
            'rounded-[2px] px-[1px] -ml-[1px] border-b-2',
            segment.className ? 'border-current' : 'border-transparent'
          )}
        >
          {segment.text}
        </span>
      ))}
    </div>
  );
}

function Legend() {
  const categories: { key: Finding['category']; label: string }[] = [
    { key: 'repetition', label: 'Repetition' },
    { key: 'formulaic', label: 'Formulaic' },
    { key: 'sentence', label: 'Structure' },
    { key: 'transition', label: 'Transitions' },
    { key: 'vocabulary', label: 'Vocabulary' },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3 text-xs">
      {categories.map(({ key, label }) => (
        <span
          key={key}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1 rounded-full border',
            CATEGORY_COLORS[key]
          )}
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getCategoryColor(key) }} />
          {label}
        </span>
      ))}
    </div>
  );
}

function getCategoryColor(category: Finding['category']): string {
  const colors: Record<Finding['category'], string> = {
    repetition: '#eab308',
    formulaic: '#ef4444',
    sentence: '#6366f1',
    transition: '#a855f7',
    vocabulary: '#14b8a6',
  };
  return colors[category];
}

export function ComparisonView({
  originalText,
  rewrittenText,
  findings,
  onCopyRewrite,
  onExport,
  hasRewrite,
}: ComparisonViewProps) {
  if (!hasRewrite || !rewrittenText) {
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
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="text-lg font-medium text-foreground mb-1">No rewrite available</h3>
        <p className="text-muted-foreground mb-4">
          Connect your Pollen account and run an analysis to generate a rewritten version.
        </p>
        <Legend />
      </motion.div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <Legend />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col h-full"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-foreground">Original</h3>
            <span className="text-xs text-muted-foreground">
              {originalText.split(/\s+/).length} words
            </span>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 bg-card border border-border rounded-xl min-h-[300px]">
              <HighlightedText text={originalText} findings={findings} />
            </div>
          </ScrollArea>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex flex-col h-full"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-foreground">Rewritten</h3>
            <span className="text-xs text-muted-foreground">
              {rewrittenText.split(/\s+/).length} words
            </span>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-4 bg-card border border-border rounded-xl min-h-[300px] border-primary/20">
              <HighlightedText text={rewrittenText} findings={[]} />
            </div>
          </ScrollArea>
        </motion.div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key="actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="mt-4 flex items-center gap-3"
        >
          <Button onClick={onCopyRewrite} variant="secondary" className="gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-2M8 5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1" />
            </svg>
            Copy Rewrite
          </Button>
          <Button onClick={onExport} variant="outline" className="gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </Button>
          <div className="flex-1" />
          <span className="text-xs text-muted-foreground">
            Tip: Review the rewrite and adapt it to your voice
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}