"use client";

import { useState, useRef } from "react";
import { useReducedMotion } from "../../hooks";
import { DEMO_CONFIG } from "../../lib/sampleText";
import { DemoEditor } from "./DemoEditor";
import { DemoFindingCard } from "./DemoFindingCard";
import { ChevronDown, ChevronUp, Search } from "lucide-react";

export function DemoWorkspace() {
  const reducedMotion = useReducedMotion();
  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(null);
  const [isAnalysisOpen, setIsAnalysisOpen] = useState(true);
  const editorRef = useRef<{ scrollToFinding: (findingId: string) => void }>(null);
  const findingsRef = useRef<HTMLDivElement>(null);

  // Handle finding selection - scroll to evidence in editor
  const handleFindingSelect = (findingId: string | null) => {
    setSelectedFindingId(findingId);
    if (findingId && editorRef.current) {
      editorRef.current.scrollToFinding(findingId);
    }
  };

  // Group findings by category
  const groupedFindings = DEMO_CONFIG.categoryOrder.map(category => ({
    category,
    findings: DEMO_CONFIG.findings.filter(f => f.category === category),
  })).filter(g => g.findings.length > 0);

  return (
    <div className="grid lg:grid-cols-[1fr_380px] gap-8 lg:gap-12">
      {/* Editor Panel */}
      <div className="lg:col-span-1">
        <DemoEditor
          ref={editorRef}
          text={DEMO_CONFIG.text}
          findings={DEMO_CONFIG.findings}
          selectedFindingId={selectedFindingId}
          reducedMotion={reducedMotion}
        />
      </div>

      {/* Analysis Panel */}
      <div className="lg:col-span-1">
        <div className="sticky top-20 space-y-6">
          {/* Summary Bar */}
          <div className="bg-surface border border-border rounded-xl p-4 sm:p-5">
            <h2 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
              Analysis Summary
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div className="p-3 bg-surface-elevated rounded-lg">
                <p className="font-display text-2xl font-semibold text-foreground">{DEMO_CONFIG.findings.length}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total Findings</p>
              </div>
              <div className="p-3 bg-surface-elevated rounded-lg">
                <p className="font-display text-2xl font-semibold text-destructive">
                  {DEMO_CONFIG.findings.filter(f => f.severity === 'high').length}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">High Severity</p>
              </div>
              <div className="p-3 bg-surface-elevated rounded-lg">
                <p className="font-display text-2xl font-semibold text-accent">
                  {DEMO_CONFIG.findings.filter(f => f.severity === 'medium').length}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Medium</p>
              </div>
              <div className="p-3 bg-surface-elevated rounded-lg">
                <p className="font-display text-2xl font-semibold text-primary">
                  {DEMO_CONFIG.findings.filter(f => f.severity === 'low').length}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">Low</p>
              </div>
            </div>
          </div>

          {/* Findings Groups */}
          <div
            ref={findingsRef}
            className={`
              bg-surface border border-border rounded-xl overflow-hidden transition-all duration-300
              ${!isAnalysisOpen ? 'max-h-0 opacity-0 pointer-events-none' : 'max-h-[600px] opacity-100'}
            `}
            data-testid="demo-findings-panel"
          >
            <div className="p-4 sm:p-5 border-b border-border flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <Search className="h-5 w-5 text-muted-foreground" aria-hidden="true" />
                Findings
              </h2>
              <button
                type="button"
                onClick={() => setIsAnalysisOpen(!isAnalysisOpen)}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label={isAnalysisOpen ? 'Collapse findings' : 'Expand findings'}
                aria-expanded={isAnalysisOpen}
              >
                {isAnalysisOpen ? (
                  <ChevronUp className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <ChevronDown className="h-5 w-5" aria-hidden="true" />
                )}
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 max-h-[500px] overflow-y-auto">
              {groupedFindings.map(({ category, findings }) => (
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
                    {category.charAt(0).toUpperCase() + category.slice(1)} ({findings.length})
                  </h3>
                  {findings.map(finding => (
                    <DemoFindingCard
                      key={finding.id}
                      finding={finding}
                      isSelected={selectedFindingId === finding.id}
                      onSelect={() => handleFindingSelect(finding.id)}
                    />
                  ))}
                </div>
              ))}

              {/* Interpretation Preview */}
              <div className="mt-6 pt-6 border-t border-border">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  AI Interpretation (Preview)
                </h3>
                <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
                  <p className="text-sm text-foreground/80 leading-relaxed mb-3">
                    {DEMO_CONFIG.interpretation.explanation}
                  </p>
                  <details className="group">
                    <summary className="text-sm font-medium text-primary cursor-pointer flex items-center gap-1.5" tabIndex={0}>
                      Key Insights
                      <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" aria-hidden="true" />
                    </summary>
                    <ul className="mt-3 space-y-2 text-sm text-foreground/70">
                      {DEMO_CONFIG.interpretation.keyInsights.map((insight, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/50 mt-1.5 flex-shrink-0" aria-hidden="true" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              </div>

              {/* Rewrite Preview */}
              <div className="mt-4">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Suggested Rewrite
                </h3>
                <div className="bg-surface-elevated border border-border rounded-lg p-4 font-mono text-sm leading-relaxed max-h-40 overflow-y-auto" tabIndex={0}>
                  {DEMO_CONFIG.interpretation.rewrite}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}