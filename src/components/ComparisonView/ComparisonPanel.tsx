"use client";

import { ScrollArea } from '../ui/scroll-area';
import type { Finding } from '../../lib/types';
import { HighlightedText } from './HighlightedText';
import { Legend } from './Legend';

interface ComparisonPanelProps {
  originalText: string;
  rewrittenText: string | undefined;
  findings: Finding[];
  hasRewrite: boolean;
  onCopyRewrite: () => void;
  onExport: () => void;
}

export function ComparisonPanel({
  originalText,
  rewrittenText,
  findings,
  hasRewrite,
  onCopyRewrite,
  onExport,
}: ComparisonPanelProps) {
  // Empty state - no rewrite available
  if (!hasRewrite || !rewrittenText) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-12 text-center animate-fade-in" role="status" aria-live="polite">
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
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="text-lg font-medium text-foreground mb-1">No rewrite available</h3>
        <p className="text-muted-foreground mb-6 max-w-xs">
          Connect your Pollinations account and run an analysis to generate a rewritten version.
        </p>
        <Legend />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Legend at top */}
      <div className="mb-4">
        <Legend categories={findings.map(f => f.category)} />
      </div>

      {/* Side-by-side comparison panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 min-h-0">
        {/* Original Panel */}
        <div className="flex flex-col h-full min-h-0 animate-slide-in-left">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-foreground">Original</h3>
            <span className="text-xs text-muted-foreground font-mono">
              {originalText.trim() ? originalText.trim().split(/\s+/).length : 0} words
            </span>
          </div>
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4 bg-card border border-border rounded-xl min-h-[300px] font-serif text-base leading-relaxed">
              <HighlightedText text={originalText} findings={findings} />
            </div>
          </ScrollArea>
        </div>

        {/* Rewritten Panel */}
        <div className="flex flex-col h-full min-h-0 animate-slide-in-right">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-foreground">Rewritten</h3>
            <span className="text-xs text-muted-foreground font-mono">
              {rewrittenText.trim() ? rewrittenText.trim().split(/\s+/).length : 0} words
            </span>
          </div>
          <ScrollArea className="flex-1 min-h-0">
            <div className="p-4 bg-card border border-border rounded-xl min-h-[300px] font-serif text-base leading-relaxed border-primary/20">
              {/* Rewritten text shows without highlights - clean version */}
              <pre className="whitespace-pre-wrap break-words">{rewrittenText}</pre>
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={onCopyRewrite}
          className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          type="button"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 012-2h10a2 2 0 012 2v12a2 2 0 01-2 2h-2M8 5a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1" />
          </svg>
          Copy Rewrite
        </button>
        <button
          onClick={onExport}
          className="inline-flex items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          type="button"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>
        <div className="flex-1" />
        <span className="text-xs text-muted-foreground">
          Tip: Review the rewrite and adapt it to your voice
        </span>
      </div>
    </div>
  );
}