"use client";

import { ChevronRight } from "lucide-react";
import type { DemoFinding } from "../../lib/sampleText";

interface DemoAnalysisProps {
  findings: DemoFinding[];
  selectedFindingId: string | null;
  onFindingSelect: (findingId: string | null) => void;
  interpretation?: {
    explanation: string;
    keyInsights: string[];
    rewrite: string;
    confidence: number;
  };
}

export function DemoAnalysis({
  findings,
  selectedFindingId,
  onFindingSelect,
  interpretation,
}: DemoAnalysisProps) {
  // Group findings by category
  const categoryOrder = ['formulaic', 'transition', 'repetition', 'sentence', 'vocabulary'] as const;
  const groupedFindings = categoryOrder.map(category => ({
    category,
    findings: findings.filter(f => f.category === category),
  })).filter(g => g.findings.length > 0);

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
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="bg-surface border border-border rounded-xl p-4 sm:p-5">
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">Analysis Summary</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 bg-surface-elevated rounded-lg">
            <p className="font-display text-2xl font-semibold text-foreground">{findings.length}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Total Findings</p>
          </div>
          <div className="p-3 bg-surface-elevated rounded-lg">
            <p className="font-display text-2xl font-semibold text-destructive">
              {findings.filter(f => f.severity === 'high').length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">High</p>
          </div>
          <div className="p-3 bg-surface-elevated rounded-lg">
            <p className="font-display text-2xl font-semibold text-accent">
              {findings.filter(f => f.severity === 'medium').length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Medium</p>
          </div>
          <div className="p-3 bg-surface-elevated rounded-lg">
            <p className="font-display text-2xl font-semibold text-primary">
              {findings.filter(f => f.severity === 'low').length}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Low</p>
          </div>
        </div>
      </div>

      {/* Findings List */}
      <div
        className="bg-surface border border-border rounded-xl overflow-hidden"
        data-testid="demo-analysis-findings-panel"
      >
        <div className="p-4 sm:p-5 border-b border-border">
          <h2 className="font-display text-lg font-semibold text-foreground">Findings</h2>
        </div>
        <div className="p-4 sm:p-5 space-y-4 max-h-[500px] overflow-y-auto">
          {groupedFindings.map(({ category, findings: categoryFindings }) => (
            <div key={category} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground flex items-center gap-2">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      category === 'formulaic' ? 'hsl(var(--destructive))' :
                      category === 'transition' ? 'hsl(270 50% 50%)' :
                      category === 'repetition' ? 'hsl(var(--accent))' :
                      category === 'sentence' ? 'hsl(var(--primary))' :
                      'hsl(160 60% 45%)',
                  }}
                  aria-hidden="true"
                />
                {categoryLabels[category]} ({categoryFindings.length})
              </h3>
              {categoryFindings.map(finding => (
                <button
                  type="button"
                  key={finding.id}
                  className={`
                    group p-3 sm:p-4 rounded-lg border transition-all duration-200 cursor-pointer text-left w-full
                    ${severityColors[finding.severity]}
                    ${selectedFindingId === finding.id ? 'ring-2 ring-offset-2 ring-offset-surface ring-primary' : 'hover:border-primary/30'}
                  `}
                  onClick={() => onFindingSelect(finding.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onFindingSelect(finding.id);
                    }
                  }}
                  aria-pressed={selectedFindingId === finding.id}
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
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 group-hover:text-primary transition-colors flex-shrink-0" aria-hidden="true" />
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Interpretation Preview */}
      {interpretation && (
        <div className="bg-primary/5 border border-primary/10 rounded-xl p-5">
          <h2 className="font-display text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            AI Interpretation (Preview)
          </h2>
          <p className="text-sm text-foreground/80 leading-relaxed mb-4">
            {interpretation.explanation}
          </p>
          <details className="group mb-4">
            <summary className="text-sm font-medium text-primary cursor-pointer flex items-center gap-1.5" tabIndex={0}>
              Key Insights
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" aria-hidden="true" />
            </summary>
            <ul className="mt-3 space-y-2 text-sm text-foreground/70">
              {interpretation.keyInsights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 flex-shrink-0" aria-hidden="true" />
                  {insight}
                </li>
              ))}
            </ul>
          </details>
          <details className="group">
            <summary className="text-sm font-medium text-primary cursor-pointer flex items-center gap-1.5" tabIndex={0}>
              Suggested Rewrite
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" aria-hidden="true" />
            </summary>
            <div className="mt-3 p-4 bg-surface-elevated border border-border rounded-lg font-mono text-sm leading-relaxed max-h-48 overflow-y-auto" tabIndex={0}>
              {interpretation.rewrite}
            </div>
          </details>
        </div>
      )}
    </div>
  );
}