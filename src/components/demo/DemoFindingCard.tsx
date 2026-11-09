"use client";

import { ChevronDown } from "lucide-react";
import type { DemoFinding } from "../../lib/types";

interface DemoFindingCardProps {
  finding: DemoFinding;
  isSelected: boolean;
  onSelect: () => void;
}

export function DemoFindingCard({ finding, isSelected, onSelect }: DemoFindingCardProps) {
  const severityColors = {
    high: 'bg-destructive/25 text-destructive border-destructive/60',
    medium: 'bg-accent/25 text-accent border-accent/60',
    low: 'bg-primary/25 text-primary border-primary/60',
  };

  const categoryLabels = {
    formulaic: 'Formulaic',
    transition: 'Transition',
    repetition: 'Repetition',
    sentence: 'Sentence',
    vocabulary: 'Vocabulary',
  };

  return (
    <div className="group relative w-full">
      <button
        type="button"
        className={`
          p-3 sm:p-4 rounded-lg border transition-all duration-200 w-full text-left
          ${severityColors[finding.severity]}
          ${isSelected ? 'ring-2 ring-offset-2 ring-offset-surface' : ''}
          ${isSelected ? 'ring-primary' : 'hover:border-primary/30'}
        `}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelect();
          }
        }}
        aria-pressed={isSelected}
        aria-expanded={isSelected}
        aria-controls={`finding-details-${finding.id}`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center flex-col">
            <span
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor:
                  finding.severity === 'high' ? 'hsl(var(--destructive))' :
                  finding.severity === 'medium' ? 'hsl(var(--accent))' :
                  'hsl(var(--primary))',
              }}
              aria-hidden="true"
            />
            <span className="text-[10px] font-medium text-muted-foreground mt-0.5 uppercase tracking-wider">
              {finding.severity.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {categoryLabels[finding.category]}
              </span>
              <span className="text-xs text-muted-foreground/70">•</span>
              <span className="text-xs font-medium capitalize text-foreground">
                {finding.severity}
              </span>
            </div>

            <p className="text-sm text-foreground mb-2">{finding.message}</p>

            <div className="flex items-center gap-2 text-xs">
              <code className="bg-background/50 px-2 py-0.5 rounded font-mono text-primary/90 max-w-full truncate block">
                "{finding.evidence}"
              </code>
              <ChevronDown
                className={`h-3.5 w-3.5 text-muted-foreground/50 transition-transform duration-200 flex-shrink-0 ${isSelected ? 'rotate-180' : ''}`}
                aria-hidden="true"
              />
            </div>
          </div>
        </div>
      </button>

      {/* Expandable details - outside button for valid HTML */}
      <details
        id={`finding-details-${finding.id}`}
        className="mt-3 pt-3 border-t border-current/10"
        open={isSelected}
      >
        <summary className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer list-none">
          <ChevronDown className="h-4 w-4 transition-transform open:rotate-180 text-muted-foreground" aria-hidden="true" />
          Details
        </summary>
        <div className="mt-3 space-y-2 text-sm text-foreground/80">
          <div className="flex items-start gap-2">
            <span className="font-medium text-muted-foreground flex-shrink-0 w-24">Suggestion:</span>
            <span>{finding.suggestion}</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-medium text-muted-foreground flex-shrink-0 w-24">Position:</span>
            <span>Chars {finding.startOffset}–{finding.endOffset}</span>
          </div>
        </div>
      </details>
    </div>
  );
}